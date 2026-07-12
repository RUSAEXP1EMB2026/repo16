function sendLineMessage(data) {

  // 不快指数80未満なら通知しない
  if (data.di < 80) {
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
          "熱中症に注意してください。" +
          "水分補給をお願いします" +
          "30分間、応答を待機しています。" +
          "30分以内に「冷房」「除湿」「エアコンOFF」などの操作がない場合は、条件を満たしていれば自動でエアコンを起動します。"
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

  // G列：返信なし
userSheet.getRange(i + 1, 7).setValue(0);

// H列：通知時刻
userSheet.getRange(i + 1, 8).setValue(new Date());
}



}
