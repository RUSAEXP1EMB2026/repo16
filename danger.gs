/**
 * 二杉担当（データ活用）：不快指数から熱中症のリスク（基準値70以上か未満か）を判定する関数
 * * 【判定の定義】
 * ・戻り値 0（基準以下）: 不快指数 70未満 （比較的快適、または肌寒い環境）
 * ・戻り値 1（基準以上）: 不快指数 70以上 （暑さを感じ、熱中症への警戒が必要な環境）
 * * @param {number} di - 計算された不快指数の値
 * @return {number|null} 判定結果（0または1）、エラー時はnull
 */
function checkDangerThreshold(di) {
  // 安全対策：不快指数の値が正常に入っていない場合は処理をスキップ
  if (di === null || di === undefined) {
    Logger.log('【警告】危険度判定に必要な不快指数の値が空っぽです。');
    return null;
  }

  var riskStatus;

  // 基準値 70 を境にして2つの状態に分ける
  if (di < 70.0) {
    riskStatus = 0; // 基準以下（安全）
  } else {
    riskStatus = 1; // 基準以上（警戒・危険）
  }

  return riskStatus;
}
