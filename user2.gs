function doPost(e) {

  const token = "あなたのLINEチャネルアクセストークン";

  const eventData = JSON.parse(e.postData.contents).events[0];

  if (eventData.type !== "message") {
    return;
  }

  const userId = eventData.source.userId;
  const userMessage = eventData.message.text;

  // スプレッドシート
  const sheet = SpreadsheetApp
    .openById("1Sl5-_3H-KCJ1HwLBiCbdPTc-bNKOk28phRehsCeEC1s")
    .getSheetByName("シート1");

  // UserIDが既にあるか確認
  const data = sheet.getDataRange().getValues();
  let exists = false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      exists = true;
      break;
    }
  }

  // -----------------------------
  // ① 「とうろく」と送られた時だけ登録する
  // -----------------------------
  let replyText = "";

  if (userMessage === "とうろく") {

    if (!exists) {
      sheet.appendRow([
        new Date(),
        userId,
        userMessage
      ]);
    }

    replyText = "登録しました";

  } else {

    // -----------------------------
    // ② リッチメニューの操作
    // -----------------------------
    switch (userMessage) {

      case "エアコン ON/OFF":
        turnOnAircon();
        replyText = "エアコンを ON（冷房25℃）にしました。";
        break;

      case "さげる":
        changeTemperature(-1);
        replyText = "温度を 1℃ 下げました。";
        break;

      case "あげる":
        changeTemperature(1);
        replyText = "温度を 1℃ 上げました。";
        break;

      case "冷房":
        turnOnAircon();
        replyText = "冷房モードに設定しました。";
        break;

      case "除湿":
        turnOnAirconDryMode();
        replyText = "除湿モードに設定しました。";
        break;

      case "今いる？":
        const dataNow = getData();
        if (!dataNow || dataNow.lastMotionSeconds === null) {
          replyText = "人感センサのデータが取得できませんでした。";
        } else if (dataNow.lastMotionSeconds < 60) {
          replyText = "👤 1分以内に人を検知しました。今いる可能性が高いです。";
        } else {
          replyText = "👤 最終検知から " + dataNow.lastMotionSeconds + " 秒経過しています。";
        }
        break;

      default:
        replyText = "コマンドが認識できませんでした。";
        break;
    }
  }

  // LINE返信
  const payload = {
    replyToken: eventData.replyToken,
    messages: [{
      type: "text",
      text: replyText
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
