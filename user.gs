function doPost(e) {

  const token = "p1OIUP0pph+Gfcoqif/Igc/qkhSjRpzqMGSeD9BEA7IIAVvXYmInxL0sfpBhXGaoHiIgv2nBSwq85kvV0LS4SZ6XemSVTMBhbw1NIHIzw0FCZk8CrhXpObb58acV+ikiKNVAQ49RwVOEy6XRfhjREgdB04t89/1O/w1cDnyilFU=";

  const eventData = JSON.parse(e.postData.contents).events[0];

  // メッセージ以外は無視
  if (eventData.type !== "message") {
    return;
  }

  const userId = eventData.source.userId;
  const userMessage = eventData.message.text;

  // スプレッドシート
  const sheet = SpreadsheetApp
    .openById("1Sl5-_3H-KCJ1HwLBiCbdPTc-bNKOk28phRehsCeEC1s")
    .getSheetByName("シート1"); // ←実際のシート名

  // UserIDが既にあるか確認
  const data = sheet.getDataRange().getValues();
  let exists = false;

  for (let i = 1; i < data.length; i++) { // 1行目は見出し
    if (data[i][1] === userId) {
      exists = true;
      break;
    }
  }

  // 初回のみ登録
  if (!exists) {
    sheet.appendRow([
      new Date(),      // A列：日時
      userId,          // B列：UserID
      userMessage      // C列：最初のメッセージ
    ]);
  }

  // LINE返信
  const payload = {
    replyToken: eventData.replyToken,
    messages: [{
      type: "text",
      text: "登録しました"
    }]
  };

  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    method: "post",
    headers: {
      Authorization: "Bearer " + token
    },
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}
