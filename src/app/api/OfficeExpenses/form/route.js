
import { NextResponse } from 'next/server';
import { sheets, spreadsheetId, drive } from '@/app/api/config/googleSheet';
const { Readable } = require('stream');

// ===================== GET HANDLER =====================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const subhead = searchParams.get('subhead');
    const itemName = searchParams.get('itemName');
    const getFormRaised = searchParams.get('getFormRaised');
    const getProjects = searchParams.get('getProjects');

    // ✅ Projects fetch
    if (getProjects === 'true') {
      const projectResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Project_Data!D4:L',
      });

      const projectRows = projectResponse.data.values;

      if (!projectRows || projectRows.length === 0) {
        return NextResponse.json(
          { error: 'No project data found' },
          { status: 404 }
        );
      }

      let projectHeaderIndex = 0;

      for (let i = 0; i < projectRows.length; i++) {
        const row = projectRows[i];
        if (
          row &&
          row.length > 0 &&
          (row[0] === 'Dimension_Subhead_Name' || row[1] === 'ITEM_NAME')
        ) {
          projectHeaderIndex = i;
          break;
        }
      }

      const projectDataRows = projectRows
        .slice(projectHeaderIndex + 1)
        .filter((row) => row && row.length > 0 && row[0]);

      const projectNameIndex = 8;

      const uniqueProjects = [
        ...new Set(
          projectDataRows.map((row) => row[projectNameIndex]).filter(Boolean)
        ),
      ];

      console.log('Total unique projects found:', uniqueProjects.length);

      return NextResponse.json({
        type: 'projects',
        data: uniqueProjects,
      });
    }

    // ✅ Main data fetch
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!D4:L',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let headerRowIndex = 0;
    let headers = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (
        row &&
        row.length > 0 &&
        (row[0] === 'Dimension_Subhead_Name' || row[1] === 'ITEM_NAME')
      ) {
        headerRowIndex = i;
        headers = row;
        break;
      }
    }

    if (headers.length === 0) {
      headerRowIndex = 0;
      headers = [
        'Dimension_Subhead_Name',
        'ITEM_NAME',
        'Unit',
        'SKU CODE',
        '',
        '',
        'Form_Raised_Form',
        '',
        'Project_Name',
      ];
    }

    const dataRows = rows
      .slice(headerRowIndex + 1)
      .filter((row) => row && row.length > 0 && row[0]);

    const subheadIndex = 0;
    const itemNameIdx = 1;
    const unitIndex = 2;
    const skuCodeIndex = 3;
    const formRaisedIndex = 6;
    const projectNameIndex = 8;

    // getFormRaised
    if (getFormRaised === 'true' && subhead) {
      const uniqueFormRaised = [
        ...new Set(
          dataRows
            .filter((row) => row[subheadIndex] === subhead)
            .map((row) => row[formRaisedIndex])
            .filter(Boolean)
        ),
      ];
      return NextResponse.json({
        type: 'formRaised',
        data: uniqueFormRaised,
      });
    }

    // all-data
    if (action === 'all-data') {
      const subheadMap = new Map();

      dataRows.forEach((row) => {
        const sh = row[subheadIndex];
        if (!sh) return;

        if (!subheadMap.has(sh)) {
          subheadMap.set(sh, {
            subhead: sh,
            items: [],
            formRaised: new Set(),
          });
        }

        const subheadData = subheadMap.get(sh);
        const iName = row[itemNameIdx];

        if (iName) {
          subheadData.items.push({
            itemName: iName,
            unit: row[unitIndex] || '',
            skuCode: row[skuCodeIndex] || '',
            formRaised: row[formRaisedIndex] || '',
            projectName: row[projectNameIndex] || '',
          });
        }

        if (row[formRaisedIndex]) {
          subheadData.formRaised.add(row[formRaisedIndex]);
        }
      });

      const allData = Array.from(subheadMap.values()).map((s) => ({
        subhead: s.subhead,
        items: s.items,
        formRaised: Array.from(s.formRaised),
      }));

      console.log('All data loaded, total subheads:', allData.length);
      return NextResponse.json({ type: 'all-data', data: allData });
    }

    // Subheads only
    if (!subhead && !itemName) {
      const uniqueSubheads = [
        ...new Set(dataRows.map((row) => row[subheadIndex])),
      ].filter(Boolean);
      return NextResponse.json({ type: 'subheads', data: uniqueSubheads });
    }

    // Items by subhead
    if (subhead && !itemName) {
      const filteredItems = dataRows
        .filter((row) => row[subheadIndex] === subhead)
        .map((row) => ({
          itemName: row[itemNameIdx],
          unit: row[unitIndex] || '',
          skuCode: row[skuCodeIndex] || '',
          formRaised: row[formRaisedIndex] || '',
          projectName: row[projectNameIndex] || '',
        }))
        .filter((item) => item.itemName);
      return NextResponse.json({ type: 'items', data: filteredItems });
    }

    // Single item details
    if (subhead && itemName) {
      const selectedItem = dataRows.find(
        (row) =>
          row[subheadIndex] === subhead && row[itemNameIdx] === itemName
      );
      if (!selectedItem) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        type: 'details',
        data: {
          unit: selectedItem[unitIndex] || '',
          skuCode: selectedItem[skuCodeIndex] || '',
          formRaised: selectedItem[formRaisedIndex] || '',
          projectName: selectedItem[projectNameIndex] || '',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ===================== HELPERS =====================

// Helper: Upload photo to Google Drive
async function uploadToGoogleDrive(base64Data, fileName) {
  if (
    !base64Data ||
    typeof base64Data !== 'string' ||
    !base64Data.startsWith('data:')
  )
    return '';

  const match = base64Data.match(
    /^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/
  );
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

// Helper: IST Timestamp
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

// Helper: Generate Bill Number
async function generateBillNumber() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Dimension_Office_Payment!B:B',
    });

    const rows = response.data.values || [];
    let maxNumber = 0;

    for (let i = 7; i < rows.length; i++) {
      const billNo = rows[i]?.[0];
      if (billNo && billNo.startsWith('Dim')) {
        const num = parseInt(billNo.replace('Dim', ''));
        if (!isNaN(num) && num > maxNumber) maxNumber = num;
      }
    }

    return `Dim${(maxNumber + 1).toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating bill number:', error);
    return 'Dim0001';
  }
}

// Helper: Last UID
async function getLastUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Dimension_Office_Payment!C:C',
    });

    const rows = response.data.values || [];
    let maxUID = 0;

    for (let i = 7; i < rows.length; i++) {
      const uid = parseInt(rows[i]?.[0]);
      if (!isNaN(uid) && uid > maxUID) maxUID = uid;
    }

    return maxUID;
  } catch (error) {
    console.error('Error getting last UID:', error);
    return 0;
  }
}

// Helper: Available Rows
async function getAvailableRows(needed) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Dimension_Office_Payment!A:A',
    });

    const rows = response.data.values || [];
    const emptyRows = [];

    for (let i = 7; i < rows.length; i++) {
      const cellValue = rows[i]?.[0];
      const isEmpty = !cellValue || cellValue.toString().trim() === '';
      if (isEmpty) emptyRows.push(i + 1);
      if (emptyRows.length === needed) break;
    }

    if (emptyRows.length < needed) {
      const totalRows = Math.max(rows.length, 7);
      const startAppend = totalRows + 1;
      const stillNeeded = needed - emptyRows.length;

      for (let i = 0; i < stillNeeded; i++) {
        emptyRows.push(startAppend + i);
      }
    }

    return emptyRows;
  } catch (error) {
    console.error('Error getting available rows:', error);
    return Array.from({ length: needed }, (_, i) => 8 + i);
  }
}

// ===================== POST HANDLER =====================
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      officeName,
      payeeName,
      expensesHead,
      items,
      remarks,
      paymentMode,   // ✅ NEW - Global Payment Mode (Bank/Cash)
    } = body;

    if (
      !officeName ||
      !payeeName ||
      !expensesHead ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ Payment Mode validation
    if (!paymentMode || !['Bank', 'Cash'].includes(paymentMode)) {
      return NextResponse.json(
        { error: 'Payment Mode required - Bank ya Cash select karo' },
        { status: 400 }
      );
    }

    const timestamp = getISTTimestamp();
    const billNumber = await generateBillNumber();
    const lastUID = await getLastUID();
    const availableRows = await getAvailableRows(items.length);

    console.log(
      `billNumber: ${billNumber} | lastUID: ${lastUID} | paymentMode: ${paymentMode} | rows: ${availableRows}`
    );

    const batchData = [];
    const uploadedPhotos = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = availableRows[i];
      const uid = lastUID + (i + 1);

      // ✅ Bill Photo Upload
      let billPhotoUrl = '';
      if (item.billPhoto && item.billPhoto.startsWith('data:')) {
        const uniqueId = `${billNumber}_uid${uid}_${Date.now()}`;
        billPhotoUrl = await uploadToGoogleDrive(
          item.billPhoto,
          `bill_${uniqueId}.jpg`
        );
        uploadedPhotos.push(billPhotoUrl);
      }

      // ✅ UPDATED: 19 columns (A to S)
      const rowData = new Array(19).fill('');

      rowData[0] = timestamp;              // A: Timestamp
      rowData[1] = billNumber;             // B: Office_Bill_No
      rowData[2] = uid;                    // C: UID
      rowData[3] = officeName;             // D: OFFICE_NAME
      rowData[4] = payeeName;             // E: PAYEE_NAME
      rowData[5] = item.subhead;           // G: EXPENSES_SUBHEAD
      rowData[6] = item.itemName;          // H: ITEM_NAME
      rowData[7] = item.description || ''; // I: DESCRIPTION ✅ NEW
      rowData[8] = item.unit;              // J: UNIT
      rowData[9] = item.skuCode;          // K: SKU_CODE
      rowData[10] = item.quantity;         // L: QTY
      rowData[11] = item.amount;           // M: AMOUNT
      rowData[12] = '';                    // N: (empty)
      rowData[13] = '';                    // O: (empty)
      rowData[14] = item.formRaisedBy;     // P: RAISED_BY
      rowData[15] = billPhotoUrl;          // Q: Bill_Photo
      rowData[16] = paymentMode;           // R: PAYMENT_MODE ✅ NEW
      rowData[17] = remarks || '';         // S: REMARKS

      batchData.push({
        range: `Dimension_Office_Payment!A${rowNum}:S${rowNum}`,
        values: [rowData],
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${items.length} item(s) submitted successfully`,
        data: {
          billNumber,
          timestamp,
          paymentMode,
          totalItems: items.length,
          totalAmount: items.reduce(
            (sum, item) => sum + (parseFloat(item.amount) || 0),
            0
          ),
          billPhotos: uploadedPhotos,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}