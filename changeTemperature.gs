function changeTemperature(diff) {

  const AIRCON_ID = getAirconId();
  const headers = {
    "Authorization": "Bearer " + REMO_ACCESS_TOKEN,
  };

  // 現在の設定を取得
  const acData = getNatureRemoData("appliances");

  let currentTemp = 25; // デフォルト
  for (let i = 0; i < acData.length; i++) {
    if (acData[i].type === "AC") {
      currentTemp = Number(acData[i].settings.temp);
      break;
    }
  }

  const newTemp = currentTemp + diff;

  const options = {
    "method": "post",
    "headers": headers,
    "payload": {
      "operation_mode": "cool",
      "temperature": String(newTemp)
    }
  };

  UrlFetchApp.fetch(
    "https://api.nature.global/1/appliances/" +
    AIRCON_ID +
    "/aircon_settings",
    options
  );
}
