/**
 * 藤田担当（LINE用プログラム）
 * ---------------------------------------------------------------
 * 元の user.txt (doPost) は「初回メッセージでユーザー登録して
 * "登録しました" と返すだけ」でしたが、リッチメニューを画像の通り
 * （今いる? / さげる / あげる / エアコンOFF / 冷房 / 除湿）に変更した
 * ことに伴い、各ボタンを押したときの処理を追加しています。
 *
 * 【リッチメニューの実装方針（藤田さんの指定に基づく）】
 * ・危険アラート送信後、ユーザーは
 *     「冷房」または「除湿」を押す　→ エアコンをつける
 *     「エアコンOFF」を押す        → つけない（応答したとみなす）
 *   のどちらかを選ぶ想定。押されたタイミングが応答待ち中であれば、
 *   30分の自動介入タイマーを解除し、状態を通常時に戻す。
 * ・「今いる?」は在室状況をいつでも確認できる常設ボタン（見守る家族が
 *   今の在室検知状況を知りたいときに使う想定）。
 * ・「さげる」「あげる」はいつでも使える手動の温度±1℃調整ボタン。
 *
 * 【LINE公式アカウント側の設定について】
 * リッチメニューの各エリアは「テキストメッセージを送信」アクションとして、
 * ラベルと同じ文字列（今いる? / さげる / あげる / エアコンOFF / 冷房 / 除湿）
 * を送るように設定してください（LINE Official Account Managerの
 * リッチメニュー編集画面で作成可能）。postbackアクションを使う場合に
 * 備えて handlePostback_() も残していますが、現状は未使用です。
 */

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const event = body.events && body.events[0];

  if (!event) {
    return;
  }

  if (event.type === 'message' && event.message && event.message.type === 'text') {
    handleTextMessage_(event);
    return;
  }

  if (event.type === 'postback') {
    handlePostback_(event);
    return;
  }
}

function handleTextMessage_(event) {
  const userId = event.source.userId;
  const replyToken = event.replyToken;
  const rawText = event.message.text || '';

  registerUserIfNew_(userId, rawText);

  const label = normalizeLabel_(rawText);

  switch (label) {
    case '今いる':
      replyPresenceStatus_(replyToken);
      break;
    case 'さげる':
      handleAdjustTemp_(replyToken, -1);
      break;
    case 'あげる':
      handleAdjustTemp_(replyToken, 1);
      break;
    case 'エアコンOFF':
      handleAirconOff_(replyToken);
      break;
    case '冷房':
      handleCooling_(replyToken);
      break;
    case '除湿':
      handleDry_(replyToken);
      break;
    default:
      replyMessage(replyToken, '登録しました');
  }
}

/**
 * postbackアクションを使う将来の拡張用（現状は未使用）。
 */
function handlePostback_(event) {
  Logger.log('postbackイベントを受信しましたが、現在の実装では未対応です: ' + JSON.stringify(event));
}

/**
 * リッチメニューのラベル表記ゆれ（全角/半角の「?」「？」、前後の空白など）
 * を吸収して比較しやすくする。
 */
function normalizeLabel_(text) {
  return text.trim().replace(/[?？]/g, '');
}

/**
 * ユーザー管理シートへの初回登録処理（user.txtのロジックを踏襲）。
 */
function registerUserIfNew_(userId, firstMessage) {
  const sheet = SpreadsheetApp
    .openById(USER_SPREADSHEET_ID)
    .getSheetByName(USER_SHEET_NAME);

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      return; // 登録済み
    }
  }

  sheet.appendRow([
    new Date(),   // A列：日時
    userId,       // B列：UserID
    firstMessage, // C列：最初のメッセージ
  ]);
}

/**
 * 「今いる?」：現在の在室検知状況を返信する。
 */
function replyPresenceStatus_(replyToken) {
  const data = getData();

  if (!data || data.lastMotionSeconds === null || data.lastMotionSeconds === undefined) {
    replyMessage(replyToken, '人感センサーの情報を取得できませんでした。');
    return;
  }

  const minutes = Math.floor(data.lastMotionSeconds / 60);

  if (isPresent(data.lastMotionSeconds)) {
    replyMessage(replyToken, '✅ 在室を検知しています（最終反応：' + minutes + '分前）。');
  } else {
    replyMessage(replyToken, '⚠️ 直近30分以内の反応がありません（最終反応：' + minutes + '分前）。不在の可能性があります。');
  }
}

/**
 * 「さげる」「あげる」：設定温度を±1℃する。
 */
function handleAdjustTemp_(replyToken, delta) {
  const newTemp = adjustAirconTemperature(delta);
  replyMessage(replyToken, '設定温度を' + newTemp + '℃に変更しました。');
}

/**
 * 「エアコンOFF」：電源を切る。応答待ち中なら「不要」という応答として扱う。
 */
function handleAirconOff_(replyToken) {
  turnOffAircon();

  const state = getState();
  if (state.status === STATE_WAITING) {
    resetToNormal_();
    replyMessage(replyToken, '承知しました。エアコンはつけません。水分補給・換気をして、こまめに様子を見てください。');
  } else {
    replyMessage(replyToken, 'エアコンを停止しました。');
  }
}

/**
 * 「冷房」：冷房26℃で起動。応答待ち中ならアラートへの応答として扱う。
 */
function handleCooling_(replyToken) {
  turnOnAircon(DEFAULT_COOL_TEMP);

  const state = getState();
  if (state.status === STATE_WAITING) {
    resetToNormal_();
    replyMessage(replyToken, 'エアコンの冷房（' + DEFAULT_COOL_TEMP + '℃）を起動しました。ご自愛ください。');
  } else {
    replyMessage(replyToken, 'エアコンの冷房（' + DEFAULT_COOL_TEMP + '℃）を起動しました。');
  }
}

/**
 * 「除湿」：除湿モードで起動。応答待ち中ならアラートへの応答として扱う。
 */
function handleDry_(replyToken) {
  turnOnAirconDryMode();

  const state = getState();
  if (state.status === STATE_WAITING) {
    resetToNormal_();
    replyMessage(replyToken, 'エアコンの除湿運転を起動しました。ご自愛ください。');
  } else {
    replyMessage(replyToken, 'エアコンの除湿運転を起動しました。');
  }
}
