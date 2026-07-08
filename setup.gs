/**
 * 藤田担当（コアロジック・状態管理モジュール）
 * ---------------------------------------------------------------
 * 1時間ごとの定期監視トリガーの設置/解除を、スプレッドシートのメニューから
 * ワンクリックでできるようにするための設定用スクリプト。
 * （GASのトリガーは通常「トリガー」画面から手動設定するが、チームメンバー
 * 　全員が迷わないよう、スプレッドシートのカスタムメニューからも
 * 　実行できるようにしている）
 *
 * 使い方:
 *   1. センサーログ用スプレッドシート（Config.gsのSENSOR_SPREADSHEET_ID）を開く
 *   2. メニューの「熱中症見守りシステム」→「① 監視トリガーを設置」を実行
 *      （初回のみ、Googleアカウントの権限承認が必要）
 *   3. 停止したいときは「② 監視トリガーを解除」を実行
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('熱中症見守りシステム')
    .addItem('① 監視トリガーを設置（1時間ごと）', 'installHourlyTrigger')
    .addItem('② 監視トリガーを解除', 'uninstallAllTriggers')
    .addSeparator()
    .addItem('③ 今すぐ1回だけ監視を実行（動作確認用）', 'hourlyCheck')
    .addToUi();
}

/**
 * hourlyCheck() を1時間ごとに実行するトリガーを設置する。
 * 既に設置済みの場合は重複させない。
 */
function installHourlyTrigger() {
  const alreadyExists = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'hourlyCheck';
  });

  if (alreadyExists) {
    Logger.log('hourlyCheckのトリガーは既に設置済みです。');
    return;
  }

  ScriptApp.newTrigger('hourlyCheck')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('1時間ごとの監視トリガーを設置しました。');
}

/**
 * このプロジェクトに設置されている全トリガー（定期監視・応答猶予タイマー
 * の両方）を解除する。開発中の後片付けや、システムを一時停止したいときに使う。
 */
function uninstallAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (t) {
    ScriptApp.deleteTrigger(t);
  });

  resetToNormal_();
  Logger.log('全てのトリガーを解除し、状態を通常時にリセットしました。');
}
