function sendLineMessage(data) {

  // 不快指数80未満なら通知しない
  if (data.di < 69.1) {
    return;
  }

  const CHANNEL_ACCESS_TOKEN = "p1OIUP0pph+Gfcoqif/Igc/qkhSjRpzqMGSeD9BEA7IIAVvXYmInxL0sfpBhXGaoHiIgv2nBSwq85kvV0LS4SZ6XemSVTMBhbw1NIHIzw0FCZk8CrhXpObb58acV+ikiKNVAQ49RwVOEy6XRfhjREgdB04t89/1O/w1cDnyilFU=";

  // ユーザー管理スプレッドシート
  const userSheet = SpreadsheetApp
    .openById("1Sl5-_3H-KCJ1HwLBiCbdPTc-bNKOk28phRehsCeEC1s")
    .getSheetByName("シート1");   // ←実際のシート名

  const users = userSheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) {

    const userId = users[i][1]; // B列(UserID)

    if (!userId) continue;

    const payload = {
      to: userId,
      messages: [{
        type: "text",
        text:
          "⚠️ 不快指数が高くなっています。\n\n" +
          "温度：" + data.te + "℃\n" +
          "湿度：" + data.hu + "%\n" +
          "不快指数：" + data.di + "\n\n" +
          "熱中症に注意してください。"
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
