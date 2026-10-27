// ═══════════════════════════════════════════════════════════════
// CareToIndia — Google Apps Script Form Handler
// Deploy as: Web App → Execute as: Me → Who has access: Anyone
// ═══════════════════════════════════════════════════════════════

const SHEET_NAME = 'Leads'; // Name of the sheet tab

// ── Email Settings ────────────────────────────────────────────
// IMPORTANT: Put your exact email address where you want to receive alerts:
// (You can also add multiple emails separated by commas: 'email1@domain.com, email2@domain.com')
const NOTIFICATION_EMAIL = 'nandha@nectarit.com'; 

// Set to false so emails are only sent to you, not to the person filling the form:
const SEND_USER_CONFIRMATION = false;

// ── TEST FUNCTION ─────────────────────────────────────────────
// Run this directly in the Apps Script editor to grant permissions & test:
function testEmail() {
  const testData = {
    name: 'Test Lead',
    email: 'test@example.com',
    phone: '+91 93637 17887',
    treatmentType: 'Cardiology',
    message: 'Testing email notification from CareToIndia.'
  };
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  sendAdminNotification(testData, timestamp);
  Logger.log('Success! Check your inbox (' + NOTIFICATION_EMAIL + ')');
}

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data  = JSON.parse(e.postData.contents);
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    // Format phone with leading quote so Google Sheets treats '+91...' as plain text (not a formula)
    const rawPhone = data.phone ? String(data.phone).trim() : '';
    const sheetPhone = (rawPhone && (rawPhone.startsWith('+') || rawPhone.startsWith('='))) 
      ? "'" + rawPhone 
      : rawPhone;

    // Build row: Timestamp | Name | Email | Phone | Treatment Type | Message
    const row = [
      timestamp,
      data.name          || '',
      data.email         || '',
      sheetPhone,
      data.treatmentType || '',
      data.message       || '',
    ];

    sheet.appendRow(row);

    // ── 1. Send Alert to You (Form Owner) ──────────────────────
    try {
      sendAdminNotification(data, timestamp);
    } catch (mailErr) {
      console.error('Failed to send notification to owner:', mailErr);
    }

    // ── 2. (Optional) Auto-reply to customer ───────────────────
    if (SEND_USER_CONFIRMATION && data.email) {
      try {
        sendUserConfirmation(data);
      } catch (confirmErr) {
        console.error('Failed to send user confirmation:', confirmErr);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Notification Email to YOU ─────────────────────────────────
function sendAdminNotification(data, timestamp) {
  const recipient = NOTIFICATION_EMAIL.trim();

  if (!recipient) {
    console.error('NOTIFICATION_EMAIL is empty. Please set your email address in line 10.');
    return;
  }

  const name          = data.name || 'Not provided';
  const email         = data.email || 'Not provided';
  const phone         = data.phone || 'Not provided';
  const treatmentType = data.treatmentType || 'General Inquiry';
  const message       = data.message || 'No additional details provided.';
  
  // Direct link to open your Google Sheet
  const sheetUrl      = SpreadsheetApp.getActiveSpreadsheet().getUrl();

  const subject = `🔔 New Form Submission: ${name} (${treatmentType})`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="background-color: #0B1F3A; color: #ffffff; padding: 16px 20px; border-radius: 6px; margin: -24px -24px 20px -24px;">
        <h2 style="margin: 0; font-size: 18px; color: #ffffff;">🔔 Someone just filled your form!</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">A new lead has been saved to your Google Sheet.</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; font-weight: bold; width: 32%; border: 1px solid #e2e8f0; color: #475569;">Name</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Email</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="mailto:${escapeHtml(email)}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${escapeHtml(email)}</a></td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Phone</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">
            <strong>${escapeHtml(phone)}</strong>
            ${phone !== 'Not provided' ? ` &nbsp;•&nbsp; <a href="tel:${escapeHtml(phone)}" style="color: #0284c7;">Call</a> &nbsp;|&nbsp; <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="color: #16a34a; font-weight: 600;">WhatsApp</a>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Treatment</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${escapeHtml(treatmentType)}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569; vertical-align: top;">Message</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; color: #334155; white-space: pre-wrap;">${escapeHtml(message)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Time</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b;">${timestamp} (IST)</td>
        </tr>
      </table>

      <!-- Action Button to open Sheet -->
      <div style="text-align: center; margin: 25px 0 15px 0;">
        <a href="${sheetUrl}" target="_blank" style="display: inline-block; background-color: #008080; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 6px; font-size: 14px;">
          📊 Open Leads Google Sheet
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 15px;">
        💡 You can also reply directly to this email to contact <strong>${escapeHtml(name)}</strong>.
      </p>
    </div>
  `;

  const plainText = `
Someone has filled your form! Check the details below:
------------------------------------------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Treatment: ${treatmentType}
Message: ${message}
Time: ${timestamp} (IST)

Open Sheet: ${sheetUrl}
  `.trim();

  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    body: plainText,
    htmlBody: htmlBody,
    replyTo: email !== 'Not provided' ? email : undefined
  });
}

// ── Customer Auto-Confirmation Email ──────────────────────────
function sendUserConfirmation(data) {
  const name          = data.name || 'there';
  const treatmentType = data.treatmentType || 'medical treatment';

  const subject = `We have received your inquiry — CareToIndia`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0B1F3A; margin-top: 0;">Hello ${escapeHtml(name)},</h2>
      <p style="color: #4a5568; line-height: 1.6;">
        Thank you for contacting <strong>CareToIndia</strong> regarding your inquiry for <strong>${escapeHtml(treatmentType)}</strong>.
      </p>
      <p style="color: #4a5568; line-height: 1.6;">
        Our medical coordination team has received your details and is reviewing your request. One of our patient care specialists will reach out to you within <strong>24 hours</strong> via email or phone.
      </p>
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #008080;">
        <p style="margin: 0; color: #2d3748; font-weight: bold;">Need immediate assistance?</p>
        <p style="margin: 5px 0 0; color: #4a5568; font-size: 14px;">
          WhatsApp us directly at <a href="https://wa.me/919363717887" style="color: #008080; font-weight: bold;">+91 93637 17887</a> or reply directly to this email.
        </p>
      </div>
      <p style="color: #718096; font-size: 13px; margin-top: 25px;">
        Warm regards,<br>
        <strong>Patient Care Team</strong><br>
        CareToIndia | World-Class Medical Care in India
      </p>
    </div>
  `;

  const plainText = `
Hello ${name},

Thank you for reaching out to CareToIndia regarding ${treatmentType}.

Our patient care team has received your details and will be in touch within 24 hours.

If you have urgent questions, you can reply directly to this email or contact us via WhatsApp.

Warm regards,
Patient Care Team
CareToIndia
  `.trim();

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: plainText,
    htmlBody: htmlBody,
    replyTo: NOTIFICATION_EMAIL
  });
}

// ── Helper: escape HTML entities to prevent injection ─────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Treatment Type', 'Message']);
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

