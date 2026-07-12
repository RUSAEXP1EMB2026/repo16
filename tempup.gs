function tempUp() {

  const appliance = getNatureRemoData("appliances")[0];

  const temp = Number(appliance.settings.temp) + 1;

  UrlFetchApp.fetch(
    "https://api.nature.global/1/appliances/" +
      appliance.id +
      "/aircon_settings",
    {
      method: "post",
      headers: {
        Authorization: "Bearer " + REMO_ACCESS_TOKEN
      },
      payload: {
        temperature: String(temp)
      }
    }
  );
}
