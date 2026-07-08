/**
 * 二杉担当（データ活用）＋ 藤田による設計書3.1準拠の判定ロジック統合
 * ---------------------------------------------------------------
 * 元の danger.txt は「不快指数が70以上か」だけを見る checkDangerThreshold(di)
 * でしたが、設計書3.1では
 *   判定B（在室時）: 室温28℃以上 「または」 不快指数75以上
 *   判定C（不在判定時の誤作動防止）: 判定Bより一段階厳しい基準
 * という「温度 or DI」「在室/不在で基準を変える」複合判定が必要でした。
 * また sendLineMessage.txt では別途 69.1 という閾値が使われているなど、
 * ファイルごとに閾値がバラバラだったため、Config.gs の定数に統一しています。
 *
 * checkDangerThreshold(di) は元のシグネチャのまま残し（後方互換）、
 * 新しく isRisk() / isPresent() を設計書準拠のメイン判定として追加しました。
 */

/**
 * 【後方互換用】不快指数のみで簡易判定する。
 * @param {number} di
 * @return {number|null} 0=安全, 1=警戒, null=データ不正
 */
function checkDangerThreshold(di) {
  if (di === null || di === undefined) {
    Logger.log('【警告】危険度判定に必要な不快指数の値が空っぽです。');
    return null;
  }

  return di >= DI_THRESHOLD_NORMAL ? 1 : 0;
}

/**
 * 設計書3.1 判定B・判定C の複合判定（室温 or 不快指数）。
 * @param {number} tempC - 室温(℃)
 * @param {number} di - 不快指数
 * @param {boolean} strict - trueなら判定C（一段階厳しい基準）を使う
 * @return {boolean} true=危険（アラート対象）
 */
function isRisk(tempC, di, strict) {
  if (tempC === null || tempC === undefined || di === null || di === undefined) {
    Logger.log('【警告】危険判定に必要な温度または不快指数がありません。');
    return false;
  }

  const tempThreshold = strict ? TEMP_THRESHOLD_STRICT : TEMP_THRESHOLD_NORMAL;
  const diThreshold = strict ? DI_THRESHOLD_STRICT : DI_THRESHOLD_NORMAL;

  return tempC >= tempThreshold || di >= diThreshold;
}

/**
 * 設計書3.1 判定A（在室確認）。
 * 「直近30分以内」に人感センサーの反応があったかを判定する。
 * @param {number|null} lastMotionSeconds - 最終人感検知からの経過秒数
 * @return {boolean} true=在室（直近に反応あり）
 */
function isPresent(lastMotionSeconds) {
  if (lastMotionSeconds === null || lastMotionSeconds === undefined) {
    // 人感データが取得できない場合は「不在」扱いにして、
    // 判定C（厳しい基準）側で安全側にフォールバックする。
    return false;
  }

  return lastMotionSeconds <= PRESENCE_WINDOW_SECONDS;
}
