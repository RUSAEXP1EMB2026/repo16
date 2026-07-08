/**
 * ===================================================================
 * 全体共通設定ファイル（Config.gs）
 * ---------------------------------------------------------------
 * 【重要】GASのプロジェクトは、全ての .gs ファイルが同じグローバルスコープを
 * 共有します。そのため、これまでのように複数のファイル（getdata.txt /
 * turnOnAircon.txt など）でそれぞれ `const REMO_ACCESS_TOKEN = ...` を
 * 宣言すると、"Identifier 'REMO_ACCESS_TOKEN' has already been declared"
 * という実行時エラーになり、システム全体が動かなくなります。
 *
 * このファイルで定数を一箇所にまとめることで、上記のバグを解消しています。
 * 他のファイルではこのファイルの定数をそのまま参照してください
 * （再宣言しないこと）。
 * ===================================================================
 */

// ------------------------- Nature Remo -------------------------
// TODO: 二杉さん/平野さんが取得済みの実際の Nature Remo アクセストークンに
// 差し替えてください（元の各ファイルではダミー文字列やプレースホルダーが
// バラバラに入っていたため、ここに一本化しました）。
const REMO_ACCESS_TOKEN = 'ここに_Nature_Remo_のアクセストークンを貼り付ける';

// ------------------------- LINE -------------------------
// 既存の sendLineMessage.txt / user.txt に実際に使われていたチャネル
// アクセストークンをそのまま引き継いでいます。
const LINE_CHANNEL_ACCESS_TOKEN =
  'p1OIUP0pph+Gfcoqif/Igc/qkhSjRpzqMGSeD9BEA7IIAVvXYmInxL0sfpBhXGaoHiIgv2nBSwq85kvV0LS4SZ6XemSVTMBhbw1NIHIzw0FCZk8CrhXpObb58acV+ikiKNVAQ49RwVOEy6XRfhjREgdB04t89/1O/w1cDnyilFU=';

// ------------------------- Google スプレッドシート -------------------------
// センサーログ・状態管理用のスプレッドシート（getSheet.txt に既存）
const SENSOR_SPREADSHEET_ID = '1zuRlopN3QvJThPSgPxrRax0YRYrxhqzIj17qhlffxRc';
const SENSOR_SHEET_NAME = 'sensor';
const STATE_SHEET_NAME = 'state';

// LINEユーザー管理用のスプレッドシート（sendLineMessage.txt / user.txt に既存）
const USER_SPREADSHEET_ID = '1Sl5-_3H-KCJ1HwLBiCbdPTc-bNKOk28phRehsCeEC1s';
const USER_SHEET_NAME = 'シート1';

// ------------------------- 判定閾値（設計書 3.1 準拠） -------------------------
// 判定B（在室時・通常の危険判定）: 室温28℃以上 または 不快指数75以上
const TEMP_THRESHOLD_NORMAL = 28;
const DI_THRESHOLD_NORMAL = 75;

// 判定C（人感センサーが不在判定でも、誤検知に備えて一段階厳しい基準で再チェック）
// ※設計書には具体的な数値の指定がないため、チームで要相談の暫定値です。
const TEMP_THRESHOLD_STRICT = 30;
const DI_THRESHOLD_STRICT = 80;

// 在室判定: 直近何秒以内の人感反応を「在室中」とみなすか（設計書=30分）
const PRESENCE_WINDOW_SECONDS = 30 * 60;

// 応答猶予タイマー: 何分応答がなければ自動介入するか（設計書=30分）
const RESPONSE_TIMEOUT_MINUTES = 30;

// ------------------------- エアコン設定 -------------------------
const DEFAULT_COOL_TEMP = 26; // 設計書・スライドともに「冷房26℃」で統一
const MIN_AIRCON_TEMP = 20;
const MAX_AIRCON_TEMP = 30;

// ------------------------- 状態管理で使う文字列 -------------------------
const STATE_NORMAL = '通常時';
const STATE_WAITING = '応答待ち';
