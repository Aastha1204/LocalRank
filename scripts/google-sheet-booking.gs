// Paste this into Google Sheet > Extensions > Apps Script, then Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Change SECRET to any long random text and use the same value
// as GOOGLE_SHEET_TOKEN in Vercel.
const SECRET = "CHANGE-ME-to-a-long-random-text";
const HEADERS = ["Received", "Name", "Phone", "Test", "Date", "Slot", "Home collection", "Address", "Status"];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.token !== SECRET) return out({ ok: false, error: "forbidden" });
    const sh = SpreadsheetApp.getActiveSheet();
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
    sh.appendRow([new Date(), d.name, "'" + d.phone, d.service, d.date, d.slot, d.home ? "Yes" : "No", d.address || "", "new"]);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
