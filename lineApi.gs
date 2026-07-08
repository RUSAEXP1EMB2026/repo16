/**
 * 藤田担当（LINE用プログラム）
 * ---------------------------------------------------------------
 * LINE Messaging API 呼び出しの共通処理。
 * 元々 sendLineMessage.txt と user.txt にそれぞれ別々に
 * UrlFetchApp.fetch(".../message/push" | "/reply", ...) のコードが
 * コピペで重複していたため、ここに一本化しました。
 */

/**
 * 特定の1ユーザーに reply API で返信する（Webhookのreply Tokenが必要）。
 * @param {string} replyToken
 * @param {string} text
 */
function replyMessage(replyToken, text) {
  const payload = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: text }],
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN },
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}

/**
 * 特定の1ユーザーに push API でメッセージを送る。
 * @param {string} userId
 * @param {string} text
 */
function pushMessageToUser(userId, text) {
  const payload = {
    to: userId,
    messages: [{ type: 'text', text: text }],
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN },
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}

/**
 * ユーザー管理シートに登録されている全員へ push メッセージを送る。
 * 熱中症アラート・自動介入通知など、見守り対象者と家族の全員に
 * 一斉送信したい場合に使う。
 * @param {string} text
 */
function pushMessageToAll(text) {
  const userSheet = SpreadsheetApp
    .openById(USER_SPREADSHEET_ID)
    .getSheetByName(USER_SHEET_NAME);

  const users = userSheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) {
    const userId = users[i][1]; // B列(UserID)
    if (!userId) continue;
    pushMessageToUser(userId, text);
  }
}

/**
 * 熱中症危険アラート（設計書3.1「一次アラートの送信」）を全員に送る。
 * 藤田さんの方針：
 *   「冷房 or 除湿をつけたければリッチメニューのそのボタンを、
 *    不要ならエアコンOFFを押してもらう」形の問いかけメッセージにする。
 * @param {Object} data - {temperature, humidity}
 * @param {number} di - 不快指数
 */
function sendDangerAlert(data, di) {
  const text =
    '🌡️ 室温が高くなっています。\n\n' +
    '温度：' + data.temperature + '℃\n' +
    '湿度：' + data.humidity + '%\n' +
    '不快指数：' + di + '\n\n' +
    '熱中症に注意してください。水分補給をお願いします。\n\n' +
    'エアコンをつける場合はメニューの「冷房」または「除湿」を、' +
    '不要な場合は「エアコンOFF」を押してください。\n' +
    '（' + RESPONSE_TIMEOUT_MINUTES + '分間応答がない場合は安全のため自動でエアコンが起動します）';

  pushMessageToAll(text);
}
