/**
 * 谷口担当（スプレッドシート管理用プログラム）
 * ---------------------------------------------------------------
 * getSheet.txt の内容はそのまま維持しつつ、
 * ・スプレッドシートIDをConfig.gsから参照するように変更
 * ・存在しなければ自動作成する getOrCreateSheet() を追加（state.gs用）
 */
function getSheet(name) {
  const spreadsheet = SpreadsheetApp.openById(SENSOR_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);

  if (sheet == null) {
    throw new Error('シートが見つかりません: ' + name);
  }

  return sheet;
}

function getLastData(name) {
  return getSheet(name).getLastRow();
}

/**
 * 指定した名前のシートを取得する。存在しない場合は新規作成して返す。
 * @param {string} name
 * @return {Sheet}
 */
function getOrCreateSheet(name) {
  const spreadsheet = SpreadsheetApp.openById(SENSOR_SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(name);

  if (sheet == null) {
    sheet = spreadsheet.insertSheet(name);
  }

  return sheet;
}
