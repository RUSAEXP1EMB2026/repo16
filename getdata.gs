/**
 * 二杉担当（Remo3データ取得プログラム）
 * ---------------------------------------------------------------
 * 元の getdata.txt は remo.txt (getNatureRemoData) と別に、
 * 独自に REMO_ACCESS_TOKEN の宣言 & UrlFetchApp.fetch を行っていて、
 * 　1) REMO_ACCESS_TOKEN の重複宣言エラー
 * 　2) 通信処理が2箇所に重複している
 * という問題がありました。ここでは remo.gs の getNatureRemoData() を
 * 呼び出す形にリファクタリングし、返すデータ構造（temperature /
 * humidity / lastMotionSeconds）は元の設計のまま維持しています。
 *
 * 【重要な修正】元の実装では lastMotionSeconds に newestEvents.mo.val を
 * そのまま入れていましたが、Nature Remo API の mo(人感)イベントの val は
 * 「経過秒数」ではなく検知フラグ的な値で、実際に経過時間を知るには
 * created_at（最終検知時刻のタイムスタンプ）と現在時刻の差分を取る必要が
 * あります。設計書3.1の「直近30分以内に反応があったか」を正しく判定する
 * ため、ここで created_at から経過秒数を計算するように修正しています。
 *

 * @return {Object|null} 取得成功時はデータオブジェクト、失敗時はnull
 */
function getData() {
  try {
    const deviceList = getNatureRemoData('devices');

    if (!deviceList || deviceList.length === 0) {
      Logger.log('【データエラー】アカウントに登録されているデバイスが見つかりません。');
      return null;
    }

    const remo3 = deviceList[0]; // 1台目のデバイス（Nature Remo 3）を指定
    const newestEvents = remo3.newest_events;

    const temperature = newestEvents.te ? newestEvents.te.val : null;
    const humidity = newestEvents.hu ? newestEvents.hu.val : null;
    const lastMotionSeconds = newestEvents.mo
      ? Math.floor((Date.now() - new Date(newestEvents.mo.created_at).getTime()) / 1000)
      : null;

    return {
      temperature: temperature,             // 温度 (℃)
      humidity: humidity,                   // 湿度 (%)
      lastMotionSeconds: lastMotionSeconds, // 最終人感検知からの経過秒数
    };
  } catch (e) {
    Logger.log('【システム例外発生】getData()内でエラーが発生しました: ' + e.toString());
    return null;
  }
}
