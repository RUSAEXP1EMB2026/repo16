
function turnOnAircon() {

  const AIRCON_ID = getAirconId();
  

  const headers = {
    "Authorization": "Bearer " + REMO_ACCESS_TOKEN,
  };

  const options = {
    "method": "post",
    "headers": headers,
    "payload": {
      "operation_mode": "cool",
      "temperature": "25"
    }
  };

  UrlFetchApp.fetch(
    "https://api.nature.global/1/appliances/" +
    AIRCON_ID +
    "/aircon_settings",
    options
  );

const userSheet = SpreadsheetApp
    .openById("1Sl5-_3H-KCJ1HwLBiCbdPTc-bNKOk28phRehsCeEC1s")
    .getSheetByName("シート1");   // ←実際のシート名

const users = userSheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) { // G列：返信
userSheet.getRange(i + 1, 7).setValue(1);
  }

}