function getSheet(name) {
  const SPREADSHEET_ID = "1zuRlopN3QvJThPSgPxrRax0YRYrxhqzIj17qhlffxRc";

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);

  if (sheet == null) {
    throw new Error("シートが見つかりません: " + name);
  }

  return sheet;
}

function getLastData(name) {
  return getSheet(name).getLastRow();
}
