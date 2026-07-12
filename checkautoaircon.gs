function checkAutoAircon() {

  // ユーザー管理シート
  const userSheet = SpreadsheetApp
    .openById("1Sl5-_3H-KCJ1HwLBiCbdPTc-bNKOk28phRehsCeEC1s")
    .getSheetByName("シート1");

  // 2行目のユーザーを対象（必要なら後で全ユーザー対応にできます）
  const reply = userSheet.getRange(2, 7).getValue();   // G列
  const notifyTime = userSheet.getRange(2, 8).getValue(); // H列

  // 通知していない
  if (!notifyTime) return;

  // 30分経過していない
  if (new Date() - new Date(notifyTime) < 30 * 60 * 1000) return;

  // 返信あり
  if (reply == 1) return;

  // 最新のセンサーデータ取得
  const sensorSheet = SpreadsheetApp
    .openById("1zuRlopN3QvJThPSgPxrRax0YRYrxhqzIj17qhlffxRc")
    .getSheetByName("sensor");

  const lastRow = sensorSheet.getLastRow();

  const discomfort = sensorSheet.getRange(lastRow, 5).getValue();

  // 不快指数が80以上ならエアコンON
  if (discomfort >= 80) {
    turnOnAircon();
    sendAutoOnMessage();
  }

  // 判定終了後はリセット
  userSheet.getRange(2, 7).setValue("");
  userSheet.getRange(2, 8).setValue("");
}
