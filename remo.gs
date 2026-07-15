const REMO_ACCESS_TOKEN = 'ory_at_TBghtTXig79PEzL8xA0oXFR3J2gp5rcj5oD1qOkiy4g.wlP_4UnCQLT0eClNtDI9vhffLnWjz6rT90eN0tfDWe4'

function getNatureRemoData(endpoint) {
  const headers = {
    "Content-Type" : "application/json;",
    'Authorization': 'Bearer ' + REMO_ACCESS_TOKEN,
  };

  const options = {
    "method" : "get",
    "headers" : headers,
  };

  return JSON.parse(UrlFetchApp.fetch("https://api.nature.global/1/" + endpoint, options));
}