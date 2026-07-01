function turnOnAirconDryMode() {

  const AIRCON_ID = getAirconId();

  const headers = {
    "Authorization" : "Bearer " + REMO_ACCESS_TOKEN,
  };

  const options = {
    "method" : "post",
    "headers" : headers,
    "payload" : {
      "operation_mode" : "dry"
    }
  };

  UrlFetchApp.fetch(
    "https://api.nature.global/1/appliances/" +
    AIRCON_ID +
    "/aircon_settings",
    options
  );
}
