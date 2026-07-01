function doPost(e) {

  const token = "p1OIUP0pph+Gfcoqif/Igc/qkhSjRpzqMGSeD9BEA7IIAVvXYmInxL0sfpBhXGaoHiIgv2nBSwq85kvV0LS4SZ6XemSVTMBhbw1NIHIzw0FCZk8CrhXpObb58acV+ikiKNVAQ49RwVOEy6XRfhjREgdB04t89/1O/w1cDnyilFU=";

  const body = JSON.parse(e.postData.contents);

  // イベントがない場合は終了
  if (!body.events || body.events.length === 0) {
    return;
  }

  const eventData = body.events[0];

  // メッセージ以外は無視
  if (eventData.type !== "message") {
    return;
  }

  const userId = eventData.source.userId;
  const userMessage = eventData.message.text;

  // 「登録」以外のメッセージは何もしない
  if (userMessage !== "とうろく") {
    return;
  }

  // スプレッドシート
  const sheet = SpreadsheetApp
    .openById("1Sl5-_3H-KCJ1HwLBiCbdPTc-bNKOk28phRehsCeEC1s")
    .getSheetByName("シート1");

  // UserIDが既に登録されているか確認
  const data = sheet.getDataRange().getValues();
  let exists = false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      exists = true;
      break;
    }
  }

  // 初回のみ登録
  if (!exists) {
    sheet.appendRow([
      new Date(),   // A列：日時
      userId,       // B列：UserID
      userMessage   // C列：メッセージ
    ]);
  }

  // 「登録しました」と返信
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
