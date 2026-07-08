/**
 * 平野担当（エアコン操作プログラム）
 * ---------------------------------------------------------------
 * 登録されている家電の中からエアコンのIDを取得する。
 * 内部実装は remo.gs の findAirconAppliance_() に共通化した
 * （turnOnAircon.gs / aircon.gs の温度調整機能と重複ロジックを避けるため）。
 *
 * @return {string} エアコンのID
 */
function getAirconId() {
  const aircon = findAirconAppliance_();

  if (!aircon) {
    throw new Error('エアコンが見つかりません');
  }

  return aircon.id;
}
