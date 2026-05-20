/**
 * IELTS Hub — Student Result Tracker (Google Apps Script)
 *
 * Receives POST requests from js/tracker.js and appends rows to a Google Sheet.
 *
 * Deploy:
 *   1. Bind to a Google Sheet (Extensions → Apps Script from that sheet).
 *   2. Paste this file.
 *   3. Deploy → New deployment → Type: Web app.
 *   4. Execute as: Me.   Who has access: Anyone.
 *   5. Copy the Web app URL into js/tracker.js (WEB_APP_URL).
 *
 * Sheet schema (auto-created on first write):
 *   Timestamp | Name | Test | Score
 */

const SHEET_NAME = 'Results';
const HEADERS    = ['Timestamp', 'Name', 'Test', 'Score'];

/** POST endpoint: appends a row from the JSON body. */
function doPost(e) {
  try {
    const raw  = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    const data = raw ? JSON.parse(raw) : {};

    const sheet = getOrCreateSheet_();
    const ts    = data.date ? new Date(data.date) : new Date();

    sheet.appendRow([
      ts,
      String(data.name  || '').slice(0, 80),
      String(data.test  || '').slice(0, 120),
      (data.score === undefined || data.score === null || data.score === '') ? '' : data.score
    ]);

    return jsonOut_({ success: true });
  } catch (err) {
    return jsonOut_({ success: false, error: String(err && err.message || err) });
  }
}

/** GET endpoint: lets you sanity-check the URL in a browser. */
function doGet() {
  return jsonOut_({ status: 'ok', service: 'IELTS Hub Tracker' });
}

/** Returns the Results sheet (creates + adds headers if missing). */
function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    // A bit of polish: bold the header row, autosize.
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

/** JSON response helper. */
function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
