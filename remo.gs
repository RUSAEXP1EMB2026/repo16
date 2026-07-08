/**
 * 二杉担当（Remo3データ取得プログラム）＋ 藤田による堅牢化
 * ---------------------------------------------------------------
 * Nature Remo API への共通アクセス関数。
 * 元の remo.txt は UrlFetchApp の結果をそのまま JSON.parse するだけで、
 * 通信エラー時に例外が飛んで呼び出し元（doPost やトリガー関数）ごと
 * 落ちてしまう問題がありました。ここで muteHttpExceptions とステータス
 * コードチェックを行い、失敗時は例外を投げず null を返すようにしています。
 *
 * @param {string} endpoint - 例: "devices", "appliances"
 * @return {Object|Array|null} 成功時はパース済みJSON、失敗時はnull
 */
function getNatureRemoData(endpoint) {
  const headers = {
    'Content-Type': 'application/json;',
    'Authorization': 'Bearer ' + REMO_ACCESS_TOKEN,
  };

  const options = {
    'method': 'get',
    'headers': headers,
    'muteHttpExceptions': true,
  };

  try {
    const response = UrlFetchApp.fetch('https://api.nature.global/1/' + endpoint, options);
    const responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      Logger.log('【通信エラー】Nature Remo API(' + endpoint + ') Status: ' + responseCode);
      return null;
    }

    return JSON.parse(response.getContentText());
  } catch (e) {
    Logger.log('【例外発生】Nature Remo API(' + endpoint + ') 呼び出し中にエラー: ' + e.toString());
    return null;
  }
}

/**
 * appliances 一覧から、type が "AC" の最初のエアコンオブジェクトを取得する共通処理。
 * getAirconId.gs / aircon.gs の両方から利用する。
 * @return {Object|null} エアコンのappliancesオブジェクト。取得失敗時はnull
 */
function findAirconAppliance_() {
  const appliances = getNatureRemoData('appliances');

  if (!appliances) {
    Logger.log('【警告】appliances一覧の取得に失敗したため、エアコンを特定できません。');
    return null;
  }

  for (let i = 0; i < appliances.length; i++) {
    if (appliances[i].type === 'AC') {
      return appliances[i];
    }
  }

  Logger.log('【警告】登録されている家電の中にエアコン(AC)が見つかりません。');
  return null;
}
