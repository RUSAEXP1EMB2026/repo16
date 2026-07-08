/**
 * 藤田担当（コアロジック・状態管理モジュール）
 * ---------------------------------------------------------------
 * 設計書3.3「自動介入フェーズ」の実装。
 * mainCheck.gs の hourlyCheck() がアラート送信時にセットする
 * 30分後の一回限りトリガーから、この onResponseTimeout() が呼ばれる。
 *
 * 処理の流れ:
 *   1. 最終環境再確認 … 再度 getData() で最新の室温・不快指数を取得
 *   2. 自動介入の実行判定
 *      - まだ危険なまま → エアコン自動起動 + LINE通知 + 状態リセット
 *      - 安全圏に戻っている → 起動スキップ + ログ通知 + 状態リセット
 */
function onResponseTimeout() {
  const state = getState();

  if (state.status !== STATE_WAITING) {
    // 既にユーザーがリッチメニューで応答済み（応答待ちが解除済み）の場合、
    // このトリガーは実行不要なので何もしない。
    Logger.log('【自動介入スキップ】既に応答待ち状態が解除されています。');
    return;
  }

  const data = getData();

  if (!data) {
    Logger.log('【自動介入】環境データの再取得に失敗したため、自動起動は見送ります。');
    pushMessageToAll('環境データの取得に失敗したため、エアコンの自動起動を見送りました。念のため室内をご確認ください。');
    resetToNormal_();
    return;
  }

  const di = calculateDiscomfortIndex(data);
  const stillDangerous = di !== null && isRisk(data.temperature, di, false);

  if (stillDangerous) {
    turnOnAircon(DEFAULT_COOL_TEMP);
    pushMessageToAll(
      '⏰ ' + RESPONSE_TIMEOUT_MINUTES + '分間応答がなかったため、安全のためエアコンを自動で起動しました（冷房' +
      DEFAULT_COOL_TEMP + '℃）。\n現在の室温：' + data.temperature + '℃'
    );
    Logger.log('【自動介入実行】室温が下がっていないためエアコンを自動起動しました。');
  } else {
    pushMessageToAll('応答がありませんでしたが、室温の低下を確認したため自動起動を見合わせました。');
    Logger.log('【自動介入見送り】応答なしだが室温が安全圏内のため起動をスキップしました。');
  }

  resetToNormal_();
}
