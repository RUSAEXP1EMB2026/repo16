function sendAutoOnMessage() {

  const CHANNEL_ACCESS_TOKEN = "p1OIUP0pph+Gfcoqif/Igc/qkhSjRpzqMGSeD9BEA7IIAVvXYmInxL0sfpBhXGaoHiIgv2nBSwq85kvV0LS4SZ6XemSVTMBhbw1NIHIzw0FCZk8CrhXpObb58acV+ikiKNVAQ49RwVOEy6XRfhjREgdB04t89/1O/w1cDnyilFU=";

  const userSheet = SpreadsheetApp
    .openById("1Sl5-_3H-KCJ1HwLBiCbdPTc-bNKOk28phRehsCeEC1s")
    .getSheetByName("シート1");

  const users = userSheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) {

    const userId = users[i][1];

    if (!userId) continue;

    const payload = {
      to: userId,
      messages: [{
        type: "text",
        text: "30分以内に反応がなかったため、自動でエアコンをONにしました。"
      }]
    };

    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", {
      method: "post",
      headers: {
        Authorization: "Bearer " + CHANNEL_ACCESS_TOKEN
      },
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });
  }
}