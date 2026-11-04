/**
 * Receives contact form leads into a Google Sheet.
 *
 * Setup:
 * 1. Create a Google Sheet. Open Extensions > Apps Script and paste in this file.
 * 2. Change SECRET below to a long random value.
 * 3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 * 4. In the site's environment variables, set:
 *      SHEETS_WEBHOOK_URL    = the web app URL from step 3
 *      SHEETS_WEBHOOK_SECRET = the same value as SECRET
 */
const SECRET = 'CHANGE-ME';
const HEADERS = ['Received', 'Name', 'Business', 'Phone', 'Email', 'Needs help with', 'Trade', 'Area'];

function reply(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(event) {
  let lead;
  try {
    lead = JSON.parse(event.postData.contents);
  } catch (error) {
    return reply({ ok: false, error: 'invalid' });
  }
  if (lead.secret !== SECRET) return reply({ ok: false, error: 'unauthorised' });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow([new Date(), lead.name, lead.business, lead.phone, lead.email, lead.need, lead.trade, lead.area]);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}
