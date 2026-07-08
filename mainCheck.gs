/**
 * 藤田担当（コアロジック・状態管理モジュール）
 * ---------------------------------------------------------------
 * 設計書3.1「定期監視フェーズ」の実装。
 * setup.gs で installHourlyTrigger() を実行すると、この hourlyCheck() が
 * 1時間ごとにGASのトリガーから自動実行される。
 *
 * 処理の流れ（設計書3.1に対応）:
 *   1. 環境データの収集   … getData()
 *   2. 在室・環境判定     … isPresent() / isRisk()（判定A/B/C）
 *   3. 一次アラートの送信 … sendDangerAlert() + 30分タイマー設置
 */
function hourlyCheck() {
  const data = getData();
  if (!data) {
    Logger.log('【監視スキップ】Nature Remoから環境データを取得できませんでした。');
    return;
  }

  const di = calculateDiscomfortIndex(data);
  if (di === null) {
    Logger.log('【監視スキップ】不快指数を計算できませんでした（温度・湿度データ不足）。');
    return;
  }

  // センサーログは判定結果に関わらず必ず記録する
  logSensorData(data, di);

  const state = getState();
  if (state.status === STATE_WAITING) {
    // 既にユーザーへ一次アラートを送信し応答待ち中の場合、
    // 1時間ごとの監視で重ねてアラートは出さない
    // （応答 or 30分タイマーのどちらかで解消されるのを待つ）
    Logger.log('【監視スキップ】既に応答待ち状態のため、新規アラートは送信しません。');
    return;
  }

  // 判定A（在室確認）
  const present = isPresent(data.lastMotionSeconds);

  // 判定B（在室時・通常基準）/ 判定C（不在時・厳しめの基準で誤作動防止）
  const dangerous = present
    ? isRisk(data.temperature, di, false)
    : isRisk(data.temperature, di, true);

  if (!dangerous) {
    Logger.log('【監視結果】現在の環境は安全域内です（在室:' + present + ', 気温:' + data.temperature + ', DI:' + di + '）。');
    return;
  }

  // ここまで来たら「一次アラートの送信」フェーズ
  Logger.log('【監視結果】危険域を検知。一次アラートを送信し応答待ち状態へ移行します。');

  setState(STATE_WAITING);
  sendDangerAlert(data, di);

  const trigger = ScriptApp.newTrigger('onResponseTimeout')
    .timeBased()
    .after(RESPONSE_TIMEOUT_MINUTES * 60 * 1000)
    .create();

  setTimerTriggerId(trigger.getUniqueId());
}
