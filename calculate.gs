/**
 * 二杉担当（データ活用）：取得した生データから不快指数（DI）を計算する関数
 * * 【計算式】
 * DI = 0.81 * T + 0.01 * H * (0.99 * T - 14.3) + 46.3
 * （※ T: 温度 [℃], H: 相対湿度 [%]）
 * * @param {Object} rawData - getNatureRemo3RawData() から返されるオブジェクト
 * @return {number|null} 計算された不快指数（小数点第1位に丸めた数値）、データ不足時はnull
 */
function calculateDiscomfortIndex(rawData) {
  // 1. 安全対策：データが正常に渡されてきているか、温度・湿度が存在するかをチェック
  if (!rawData || rawData.temperature === null || rawData.humidity === null) {
    Logger.log('【警告】不快指数の計算に必要な温度または湿度のデータが不足しています。');
    return null;
  }
  
  const T = rawData.temperature; // 温度
  const H = rawData.humidity;    // 湿度
  
  // 2. 要求仕様書の計算式に則って不快指数(DI)を算出
  const di = 0.81 * T + 0.01 * H * (0.99 * T - 14.3) + 46.3;
  
  // 3. 他のメンバーやメイン処理で扱いやすいよう、小数点第1位に丸めて数値を返却（return）
  return parseFloat(di.toFixed(1));
}
