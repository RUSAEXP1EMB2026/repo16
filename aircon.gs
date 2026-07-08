/**
 * 平野担当（エアコン操作プログラム）
 * ---------------------------------------------------------------
 * turnOnAircon.txt / turnOnAirconDryMode.txt を、
 *  ・REMO_ACCESS_TOKEN の重複宣言を解消（Config.gsを参照）
 *  ・冷房温度を設計書・スライドの「26℃」に統一（元は25℃だった）
 *  ・OFFにする機能／温度を±1℃するリッチメニュー用の機能を追加
 * のかたちに整理したもの。
 */

/**
 * エアコンを冷房で起動する。
 * @param {number} [temperature=DEFAULT_COOL_TEMP] - 設定温度(℃)
 */
function turnOnAircon(temperature) {
  const targetTemp = temperature || DEFAULT_COOL_TEMP;
  const AIRCON_ID = getAirconId();

  const headers = {
    'Authorization': 'Bearer ' + REMO_ACCESS_TOKEN,
  };

  const options = {
    'method': 'post',
    'headers': headers,
    'muteHttpExceptions': true,
    'payload': {
      'operation_mode': 'cool',
      'temperature': String(targetTemp),
    },
  };

  UrlFetchApp.fetch(
    'https://api.nature.global/1/appliances/' + AIRCON_ID + '/aircon_settings',
    options
  );

  Logger.log('エアコンを冷房' + targetTemp + '℃で起動しました。');
  return targetTemp;
}

/**
 * エアコンを除湿(dry)モードで起動する。
 */
function turnOnAirconDryMode() {
  const AIRCON_ID = getAirconId();

  const headers = {
    'Authorization': 'Bearer ' + REMO_ACCESS_TOKEN,
  };

  const options = {
    'method': 'post',
    'headers': headers,
    'muteHttpExceptions': true,
    'payload': {
      'operation_mode': 'dry',
    },
  };

  UrlFetchApp.fetch(
    'https://api.nature.global/1/appliances/' + AIRCON_ID + '/aircon_settings',
    options
  );

  Logger.log('エアコンを除湿モードで起動しました。');
}

/**
 * エアコンの電源を切る（リッチメニュー「エアコンOFF」用に新規追加）。
 * Nature Remo API 仕様上、payload に button: "power-off" を渡すことで
 * 電源をOFFにできる。
 */
function turnOffAircon() {
  const AIRCON_ID = getAirconId();

  const headers = {
    'Authorization': 'Bearer ' + REMO_ACCESS_TOKEN,
  };

  const options = {
    'method': 'post',
    'headers': headers,
    'muteHttpExceptions': true,
    'payload': {
      'button': 'power-off',
    },
  };

  UrlFetchApp.fetch(
    'https://api.nature.global/1/appliances/' + AIRCON_ID + '/aircon_settings',
    options
  );

  Logger.log('エアコンの電源をOFFにしました。');
}

/**
 * リッチメニュー「さげる」「あげる」用：現在の設定温度から ±1℃ する。
 * エアコンがOFFの場合は DEFAULT_COOL_TEMP を基準に起動する。
 *
 * @param {number} delta - +1 または -1
 * @return {number} 変更後の設定温度(℃)
 */
function adjustAirconTemperature(delta) {
  const aircon = findAirconAppliance_();

  let baseTemp = DEFAULT_COOL_TEMP;

  if (aircon && aircon.settings && aircon.settings.button !== 'power-off') {
    const currentTemp = parseInt(aircon.settings.temp, 10);
    if (!isNaN(currentTemp)) {
      baseTemp = currentTemp;
    }
  }

  let newTemp = baseTemp + delta;
  newTemp = Math.max(MIN_AIRCON_TEMP, Math.min(MAX_AIRCON_TEMP, newTemp));

  return turnOnAircon(newTemp);
}
