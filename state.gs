/**
 * 藤田担当（コアロジック・状態管理モジュール）
 * ---------------------------------------------------------------
 * 設計書2節「ステート（状態）管理機能」の実装。
 * 「通常時」「応答待ち（30分タイマー稼働中）」の2状態を、
 * Googleスプレッドシート上の "state" シートに保持する。
 *
 * シート構成（1行目はヘッダー、実データは2行目固定）：
 *   A2: 状態 ("通常時" | "応答待ち")
 *   B2: 通知日時（アラート送信時刻）
 *   C2: タイマートリガーのuniqueId（応答猶予タイマー解除に使用）
 */

const STATE_DATA_ROW = 2;

/**
 * state シートを取得する。まだ無ければヘッダー付きで新規作成し、
 * 初期状態（通常時）をセットする。
 */
function ensureStateSheet_() {
  const sheet = getOrCreateSheet(STATE_SHEET_NAME);

  if (sheet.getLastRow() < STATE_DATA_ROW) {
    sheet.getRange(1, 1, 1, 3).setValues([['状態', '通知日時', 'タイマーID']]);
    sheet.getRange(STATE_DATA_ROW, 1, 1, 3).setValues([[STATE_NORMAL, '', '']]);
  }

  return sheet;
}

/**
 * 現在の状態を取得する。
 * @return {{status:string, alertAt:*, timerTriggerId:string}}
 */
function getState() {
  const sheet = ensureStateSheet_();
  const values = sheet.getRange(STATE_DATA_ROW, 1, 1, 3).getValues()[0];

  return {
    status: values[0] || STATE_NORMAL,
    alertAt: values[1],
    timerTriggerId: values[2],
  };
}

/**
 * 状態を更新する。STATE_WAITING にするときは通知日時も同時に記録する。
 * @param {string} status - STATE_NORMAL または STATE_WAITING
 */
function setState(status) {
  const sheet = ensureStateSheet_();
  sheet.getRange(STATE_DATA_ROW, 1).setValue(status);

  if (status === STATE_WAITING) {
    sheet.getRange(STATE_DATA_ROW, 2).setValue(new Date());
  } else {
    sheet.getRange(STATE_DATA_ROW, 2).setValue('');
  }
}

/**
 * 応答猶予タイマーのuniqueIdを記録する。
 * @param {string} triggerId
 */
function setTimerTriggerId(triggerId) {
  const sheet = ensureStateSheet_();
  sheet.getRange(STATE_DATA_ROW, 3).setValue(triggerId || '');
}

/**
 * 記録されている応答猶予タイマーを実際に削除し、シート上の記録もクリアする。
 * ユーザーがリッチメニューに応答した際（応答待ち解除時）に呼び出す。
 */
function clearTimerTrigger() {
  const state = getState();
  const triggerId = state.timerTriggerId;

  if (triggerId) {
    const triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getUniqueId() === triggerId) {
        ScriptApp.deleteTrigger(triggers[i]);
        break;
      }
    }
  }

  setTimerTriggerId('');
}

/**
 * 状態を通常時にリセットし、残っている応答猶予タイマーがあれば削除する。
 * 自動介入フェーズ完了時／ユーザー応答時の両方から呼ばれる共通処理。
 */
function resetToNormal_() {
  clearTimerTrigger();
  setState(STATE_NORMAL);
}
