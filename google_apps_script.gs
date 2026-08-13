// ═══════════════════════════════════════════════════════════════
// CareToIndia — Google Apps Script Form Handler
// Deploy as: Web App → Execute as: Me → Who has access: Anyone
// ═══════════════════════════════════════════════════════════════

const SHEET_NAME = 'Leads'; // Name of the sheet tab

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data  = JSON.parse(e.postData.contents);

    // Build row: Timestamp | Name | Email | Phone | Cancer Type | Message
    const row = [
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      data.name        || '',
      data.email       || '',
      data.phone       || '',
      data.cancerType  || '',
      data.message     || '',
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── CORS preflight (GET used as health check) ─────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok', message: 'CareToIndia sheet endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Helper: get or create the Leads sheet with headers ────────
function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add header row
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Cancer Type', 'Message']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#0B1F3A').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 140);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(4, 140);
    sheet.setColumnWidth(5, 160);
    sheet.setColumnWidth(6, 400);
  }

  return sheet;
}
