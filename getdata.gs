const REMO_ACCESS_TOKEN = 'ここに_Nature_Remo_のアクセストークンを貼り付ける';

/**
 * 【モジュール①：データ取得コア関数】
 * Nature Remo 3 から生のセンサーデータ（温度・湿度・人感）を安全に取得するプログラム
 * * 要求仕様を満たすポイント:
 * 1. te(温度)、hu(湿度)、mo(人感秒数)の3つの生データを欠かさず取得。
 * 2. try-catch構造とステータスコード検証により、通信エラー発生時もシステムをクラッシュさせずにnullを返却（非機能要求のクリア）。
 * 3. 他の担当者が「data.temperature」のように直感的に扱えるオブジェクト構造でデータを引き渡す（returnする）。
 * * @return {Object|null} 取得成功時はデータオブジェクト、通信失敗時はnull
 */
function getData() {
  const url = 'https://api.nature.global/1/devices';
  const options = {
    'method': 'get',
    'headers': {
      'Authorization': 'Bearer ' + REMO_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    'muteHttpExceptions': true // エラー時にGAS側でスクリプトが強制終了するのを防ぐ
  };
  
  try {
    // 1. Nature Remo API へのリクエスト送信
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    // 2. 非機能要求：ステータスコードの検証（200 OK 以外はエラーとして安全に処理）
    if (responseCode !== 200) {
      Logger.log(`【通信エラー】Nature Remo API が異常応答を返しました。Status: ${responseCode}`);
      return null;
    }
    
    // 3. レンスポンスJSONの解析
    const deviceList = JSON.parse(response.getContentText());
    if (!deviceList || deviceList.length === 0) {
      Logger.log('【データエラー】アカウントに登録されているデバイスが見つかりません。');
      return null;
    }
    
    const remo3 = deviceList[0]; // 1台目のデバイス（Nature Remo 3）を指定
    const newestEvents = remo3.newest_events;
    
    // 4. 各種センサーデータの存在チェックと抽出（データ欠損によるエラーを防止）
    const temperature = newestEvents.te ? newestEvents.te.val : null;
    const humidity = newestEvents.hu ? newestEvents.hu.val : null;
    const lastMotionSeconds = newestEvents.mo ? newestEvents.mo.val : null;
    
    // 5. 要求仕様に準拠したデータ構造での引き渡し（return）
    return {
      temperature: temperature,       // 温度 (℃)
      humidity: humidity,             // 湿度 (%)
      lastMotionSeconds: lastMotionSeconds // 最終人感検知からの経過時間 (秒)
    };
    
  } catch (e) {
    // ネットワーク遮断などの例外発生時、システムを巻き込んでクラッシュするのを防ぐ
    Logger.log('【システム例外発生】通信処理中にエラーが発生しました: ' + e.toString());
    return null;
  }
}
