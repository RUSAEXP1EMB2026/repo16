const REMO_ACCESS_TOKEN = 'アクセストークン'

function turnOnAircon() {

  const AIRCON_ID = getAirconId();
  const headers = {
    "Authorization" : "Bearer " + REMO_ACCESS_TOKEN,
  };

  const options = {
    "method" : "post",
    "headers" : headers,
    "payload" : {
      "operation_mode" : "cool",
      "temperature" : "25"
    }
  };

  UrlFetchApp.fetch(
    "https://api.nature.global/1/appliances/" +
    AIRCON_ID +
    "/aircon_settings",
    options
  );
}
