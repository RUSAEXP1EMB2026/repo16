/**
 * 谷口担当（スプレッドシート管理用プログラム）
 * ---------------------------------------------------------------
 * 元の sensordata.txt (recordSensorData) は、
 *  ・不快指数の計算式を calculate.gs と重複して自前で持っていた
 *  ・センサー記録とLINE通知判定が1つの関数に混在していた
 * ため、責務を分離しました。
 *  ・ログ書き込みだけを行う logSensorData() をここに用意
 *  ・危険判定やLINE通知・状態管理は mainCheck.gs（hourlyCheck）に集約
 *
 * sensorシートの列構成（setsensordata.txtから変更なし）:
 *   A: 記録日時, B: 気温, C: 湿度, D: 人感(経過秒数), E: 不快指数
 */

/**
 * センサーデータ1件をsensorシートに追記する。
 * @param {Object} data - getData()の戻り値 {temperature, humidity, lastMotionSeconds}
 * @param {number} di - calculateDiscomfortIndex()の戻り値
 */
function logSensorData(data, di) {
  const sheet = getSheet(SENSOR_SHEET_NAME);
  const row = sheet.getLastRow() + 1;

  sheet.getRange(row, 1, 1, 5).setValues([[
    new Date(),
    data.temperature,
    data.humidity,
    data.lastMotionSeconds,
    di,
  ]]);
}
