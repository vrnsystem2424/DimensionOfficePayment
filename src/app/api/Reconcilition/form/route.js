// pages/api/finance.js
import { NextResponse } from 'next/server';
import { sheets, spreadsheetId, drive } from '../../config/googleSheet'; // path adjust kar lo
const { Readable } = require('stream');

// ─────────────────────────────────────────────────────────────
// Helpers (same as your Express code)
// ─────────────────────────────────────────────────────────────
function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  const ddmmyyyy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) return trimmed;

  const ddmmyyyyDash = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyyDash) return `${ddmmyyyyDash[1]}/${ddmmyyyyDash[2]}/${ddmmyyyyDash[3]}`;

  const yyyymmdd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) return `${yyyymmdd[3]}/${yyyymmdd[2]}/${yyyymmdd[1]}`;

  const parsed = new Date(trimmed);
  if (!isNaN(parsed)) {
    return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()}`;
  }
  return trimmed;
}

function getISTTimestamp() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const dd = String(istDate.getUTCDate()).padStart(2, '0');
  const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = istDate.getUTCFullYear();
  const hh = String(istDate.getUTCHours()).padStart(2, '0');
  const min = String(istDate.getUTCMinutes()).padStart(2, '0');
  const ss = String(istDate.getUTCSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

async function uploadToGoogleDrive(base64Data, fileName) {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
    return '';
  }

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) return '';

  const mimeType = match[1] || 'image/jpeg';
  const buffer = Buffer.from(match[2], 'base64');

  try {
    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const res = await drive.files.create({
      resource: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'],
      },
      media: { mimeType, body: fileStream },
      fields: 'id',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (error) {
    console.error(`Drive upload failed for ${fileName}:`, error.message);
    return '';
  }
}

// UID Generators (same logic)
async function generateUniqueUIDINDATA() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Client_Payment_In_FMS!B8:B',
    });
    const values = response.data.values || [];
    if (values.length === 0) return 'IN-0001';

    let maxNumber = 0;
    values.forEach(row => {
      const uid = row[0]?.toString().trim();
      if (uid && uid.startsWith('IN-')) {
        const num = parseInt(uid.substring(3).replace(/^0+/, ''), 10);
        if (!isNaN(num) && num > maxNumber) maxNumber = num;
      }
    });
    return `IN-${String(maxNumber + 1).padStart(4, '0')}`;
  } catch (error) {
    console.error('UID gen error IN:', error);
    return 'IN-0001';
  }
}

async function generateUniqueUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A/C To A/C Transfer!B7:B',
    });
    const values = response.data.values || [];
    if (values.length === 0) return 'TRF001';

    const lastUID = values[values.length - 1]?.[0]?.toString().trim();
    if (!lastUID || !lastUID.startsWith('TRF')) return 'TRF001';

    const lastNumber = parseInt(lastUID.replace('TRF', ''), 10);
    return `TRF${String(lastNumber + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error('UID gen error TRF:', error);
    return 'TRF001';
  }
}

async function generateUniqueCapitalUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Capital_Movement_Form!B6:B',
    });
    const values = response.data.values || [];
    if (values.length === 0) return 'CAP001';

    const lastUID = values[values.length - 1]?.[0]?.toString().trim();
    if (!lastUID || !lastUID.startsWith('CAP')) return 'CAP001';

    const lastNumber = parseInt(lastUID.replace('CAP', ''), 10);
    return `CAP${String(lastNumber + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error('UID gen error CAP:', error);
    return 'CAP001';
  }
}

// ─────────────────────────────────────────────────────────────
// GET handler → Dropdown data (same as /Dropdown-Data)
// ─────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'dropdown-data') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Project_Data!N4:P',
      });

      const rows = response.data.values || [];

      const projectSet = new Set();
      const accountSet = new Set();
      const movementSet = new Set();

      rows.forEach(row => {
        const [proj, acc, mov] = row.map(v => v?.toString().trim() || '');
        if (proj) projectSet.add(proj);
        if (acc) accountSet.add(acc);
        if (mov) movementSet.add(mov);
      });

      return NextResponse.json({
        success: true,
        projects: [...projectSet].sort(),
        accounts: [...accountSet].sort(),
        capitalMovements: [...movementSet].sort(),
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid GET action' }, { status: 400 });
  } catch (error) {
    console.error('GET error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// POST handler → Multiple actions using ?action= or body.action
// ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const action = body.action || body.endpoint; // flexible

    if (!action) {
      return NextResponse.json({ success: false, message: 'action / endpoint required' }, { status: 400 });
    }

    // 1. add-payment
    if (action === 'add-payment') {
      const {
        SiteName,
        Amount,
        CGST = 0,
        SGST = 0,
        NetAmount = 0,
        CreditAccountName = '',
        PaymentMode = '',
        ChequeNo = '',
        ChequeDate = '',
        ChequePhoto = '',
      } = body;

      if (!SiteName || Amount === undefined) {
        return NextResponse.json({ success: false, message: 'SiteName and Amount required' }, { status: 400 });
      }

      let chequePhotoUrl = '';
      if (ChequePhoto?.startsWith('data:')) {
        const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        chequePhotoUrl = await uploadToGoogleDrive(ChequePhoto, `cheque_${uniqueId}.jpg`);
      }

      const UID = await generateUniqueUIDINDATA();
      const timestamp = getISTTimestamp();

      const row = [
        timestamp,
        UID,
        SiteName,
        Amount || 0,
        CGST || 0,
        SGST || 0,
        NetAmount || 0,
        CreditAccountName || '',
        PaymentMode || '',
        ChequeNo || '',
        formatDateToDDMMYYYY(ChequeDate),
        chequePhotoUrl,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Client_Payment_In_FMS!A:L',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment added successfully',
        UID,
        timestamp,
        chequePhotoUrl,
      });
    }

    // 2. Bank_Transfer_form
    if (action === 'Bank_Transfer_form') {
      const {
        Transfer_A_C_Name,
        Transfer_Received_A_C_Name,
        Amount,
        PAYMENT_MODE,
        PAYMENT_DETAILS = '',
        PAYMENT_DATE,
        Remark = '',
      } = body;

      if (!Transfer_A_C_Name || !Transfer_Received_A_C_Name || !Amount || !PAYMENT_MODE || !PAYMENT_DATE) {
        return NextResponse.json({ success: false, message: 'Required fields missing' }, { status: 400 });
      }

      const UID = await generateUniqueUID();
      const timestamp = getISTTimestamp();

      const row = [
        timestamp,
        UID,
        Transfer_A_C_Name,
        Transfer_Received_A_C_Name,
        Amount,
        PAYMENT_MODE,
        PAYMENT_DETAILS,
        formatDateToDDMMYYYY(PAYMENT_DATE),
        Remark,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'A/C To A/C Transfer!A:I',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
      });

      return NextResponse.json({
        success: true,
        message: 'Bank transfer saved',
        UID,
        timestamp,
      });
    }

    // 3. Captial-A/C
    if (action === 'Captial-A/C') {
      const {
        Capital_Movment,
        Received_Account,
        Amount,
        PAYMENT_MODE,
        PAYMENT_DETAILS = '',
        PAYMENT_DATE = '',
        Remark = '',
      } = body;

      if (!Capital_Movment || !Received_Account || !Amount || !PAYMENT_MODE) {
        return NextResponse.json({ success: false, message: 'Required fields missing' }, { status: 400 });
      }

      const needsDate = ['Cheque', 'NEFT', 'RTGS', 'UPI'].includes(PAYMENT_MODE);
      if (needsDate && !PAYMENT_DATE?.trim()) {
        return NextResponse.json({ success: false, message: 'Payment Date required for non-cash' }, { status: 400 });
      }

      const UID = await generateUniqueCapitalUID();
      const timestamp = getISTTimestamp();

      const row = [
        timestamp,
        UID,
        Capital_Movment,
        Received_Account,
        Amount,
        PAYMENT_MODE,
        PAYMENT_DETAILS,
        formatDateToDDMMYYYY(PAYMENT_DATE),
        Remark,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Capital_Movement_Form!A:I',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
      });

      return NextResponse.json({
        success: true,
        message: 'Capital movement saved',
        UID,
        timestamp,
      });
    }

    return NextResponse.json({ success: false, message: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, message: 'Server error', details: error.message }, { status: 500 });
  }
}