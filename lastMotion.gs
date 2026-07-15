function getData() {

  const sheet = SpreadsheetApp
    .openById("1zuRlopN3QvJThPSgPxrRax0YRYrxhqzIj17qhlffxRc") // センサーデータのスプレッドシートID
    .getSheetByName("sensor");

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return null;
  }

  // D列（4列目）の値を取得
  const lastMotionSeconds = sheet.getRange(lastRow, 4).getValue();

  return {
    lastMotionSeconds: lastMotionSeconds
  };
}