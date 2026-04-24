

// //////


// import { NextResponse } from 'next/server';
// import { sheets, spreadsheetId, drive } from '../../config/googleSheet';
// const { Readable } = require('stream');

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const action = searchParams.get('action');
//     const subhead = searchParams.get('subhead');
//     const itemName = searchParams.get('itemName');
//     const getFormRaised = searchParams.get('getFormRaised');

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Project_Data!D4:J',
//     });

//     const rows = response.data.values;

//     if (!rows || rows.length === 0) {
//       return NextResponse.json({ error: 'No data found' }, { status: 404 });
//     }

//     let headerRowIndex = 0;
//     let headers = [];

//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];
//       if (row && row.length > 0 && (row[0] === 'Dimension_Subhead_Name' || row[1] === 'ITEM_NAME')) {
//         headerRowIndex = i;
//         headers = row;
//         break;
//       }
//     }

//     if (headers.length === 0) {
//       headerRowIndex = 0;
//       headers = ['Dimension_Subhead_Name', 'ITEM_NAME', 'Unit', 'SKU CODE', '', '', 'Form_Raised_Form'];
//     }

//     const dataRows = rows.slice(headerRowIndex + 1).filter(row => row && row.length > 0 && row[0]);

//     const subheadIndex = 0;
//     const itemNameIndex = 1;
//     const unitIndex = 2;
//     const skuCodeIndex = 3;
//     const formRaisedIndex = 6;

//     if (getFormRaised === 'true' && subhead) {
//       const uniqueFormRaised = [...new Set(
//         dataRows
//           .filter(row => row[subheadIndex] === subhead)
//           .map(row => row[formRaisedIndex])
//           .filter(Boolean)
//       )];
//       return NextResponse.json({ type: 'formRaised', data: uniqueFormRaised });
//     }

//     if (action === 'all-data') {
//       const subheadMap = new Map();

//       dataRows.forEach(row => {
//         const subhead = row[subheadIndex];
//         if (!subhead) return;

//         if (!subheadMap.has(subhead)) {
//           subheadMap.set(subhead, { subhead, items: [], formRaised: new Set() });
//         }

//         const subheadData = subheadMap.get(subhead);
//         const itemName = row[itemNameIndex];
//         if (itemName) {
//           subheadData.items.push({
//             itemName,
//             unit: row[unitIndex] || '',
//             skuCode: row[skuCodeIndex] || '',
//             formRaised: row[formRaisedIndex] || ''
//           });
//         }
//         if (row[formRaisedIndex]) {
//           subheadData.formRaised.add(row[formRaisedIndex]);
//         }
//       });

//       const allData = Array.from(subheadMap.values()).map(s => ({
//         subhead: s.subhead,
//         items: s.items,
//         formRaised: Array.from(s.formRaised)
//       }));

//       console.log('All data loaded, total subheads:', allData.length);
//       return NextResponse.json({ type: 'all-data', data: allData });
//     }

//     if (!subhead && !itemName) {
//       const uniqueSubheads = [...new Set(dataRows.map(row => row[subheadIndex]))].filter(Boolean);
//       return NextResponse.json({ type: 'subheads', data: uniqueSubheads });
//     }

//     if (subhead && !itemName) {
//       const filteredItems = dataRows
//         .filter(row => row[subheadIndex] === subhead)
//         .map(row => ({
//           itemName: row[itemNameIndex],
//           unit: row[unitIndex] || '',
//           skuCode: row[skuCodeIndex] || '',
//           formRaised: row[formRaisedIndex] || ''
//         }))
//         .filter(item => item.itemName);
//       return NextResponse.json({ type: 'items', data: filteredItems });
//     }

//     if (subhead && itemName) {
//       const selectedItem = dataRows.find(
//         row => row[subheadIndex] === subhead && row[itemNameIndex] === itemName
//       );
//       if (!selectedItem) {
//         return NextResponse.json({ error: 'Item not found' }, { status: 404 });
//       }
//       return NextResponse.json({
//         type: 'details',
//         data: {
//           unit: selectedItem[unitIndex] || '',
//           skuCode: selectedItem[skuCodeIndex] || '',
//           formRaised: selectedItem[formRaisedIndex] || ''
//         }
//       });
//     }

//     return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
//   }
// }


// // Helper: Upload photo to Google Drive
// async function uploadToGoogleDrive(base64Data, fileName) {
//   if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) return '';

//   const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
//   if (!match) return '';

//   const mimeType = match[1] || 'image/jpeg';
//   const buffer = Buffer.from(match[2], 'base64');

//   try {
//     const fileStream = new Readable();
//     fileStream.push(buffer);
//     fileStream.push(null);

//     const res = await drive.files.create({
//       resource: {
//         name: fileName,
//         parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'],
//       },
//       media: { mimeType, body: fileStream },
//       fields: 'id',
//       supportsAllDrives: true,
//     });

//     const fileId = res.data.id;
//     await drive.permissions.create({
//       fileId,
//       requestBody: { role: 'reader', type: 'anyone' },
//       supportsAllDrives: true,
//     });

//     return `https://drive.google.com/uc?export=view&id=${fileId}`;
//   } catch (error) {
//     console.error(`Drive upload failed for ${fileName}:`, error.message);
//     return '';
//   }
// }

// // Helper: Get IST Timestamp
// function getISTTimestamp() {
//   const now = new Date();
//   const istOffset = 5.5 * 60 * 60 * 1000;
//   const istDate = new Date(now.getTime() + istOffset);
//   const dd = String(istDate.getUTCDate()).padStart(2, '0');
//   const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
//   const yyyy = istDate.getUTCFullYear();
//   const hh = String(istDate.getUTCHours()).padStart(2, '0');
//   const min = String(istDate.getUTCMinutes()).padStart(2, '0');
//   const ss = String(istDate.getUTCSeconds()).padStart(2, '0');
//   return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
// }

// // Helper: Generate Bill Number — column B mein max Dim number + 1
// async function generateBillNumber() {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Dimension_Office_Payment!B:B',
//     });

//     const rows = response.data.values || [];
//     let maxNumber = 0;

//     for (let i = 7; i < rows.length; i++) {
//       const billNo = rows[i]?.[0];
//       if (billNo && billNo.startsWith('Dim')) {
//         const num = parseInt(billNo.replace('Dim', ''));
//         if (!isNaN(num) && num > maxNumber) maxNumber = num;
//       }
//     }
//     return `Dim${(maxNumber + 1).toString().padStart(4, '0')}`;
//   } catch (error) {
//     console.error('Error generating bill number:', error);
//     return 'Dim0001';
//   }
// }

// // Helper: Column C mein abhi tak ka sabse bada UID
// async function getLastUID() {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Dimension_Office_Payment!C:C',
//     });

//     const rows = response.data.values || [];
//     let maxUID = 0;

//     for (let i = 7; i < rows.length; i++) {
//       const uid = parseInt(rows[i]?.[0]);
//       if (!isNaN(uid) && uid > maxUID) maxUID = uid;
//     }
//     return maxUID;
//   } catch (error) {
//     console.error('Error getting last UID:', error);
//     return 0;
//   }
// }

// // Helper: Sheet mein data ki last row number nikalo (row 8 se start)
// async function getLastDataRow() {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Dimension_Office_Payment!A:A',
//     });

//     const rows = response.data.values || [];
//     let lastRow = 7; // minimum row 8 (0-indexed: 7)

//     for (let i = 7; i < rows.length; i++) {
//       if (rows[i] && rows[i][0] && rows[i][0].trim() !== '') {
//         lastRow = i;
//       }
//     }

//     return lastRow + 1; // 0-indexed to 1-indexed, +1 = next empty row
//   } catch (error) {
//     console.error('Error getting last data row:', error);
//     return 8; // fallback: row 8
//   }
// }

// // Main POST Handler
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { officeName, payeeName, expensesHead, items, remarks } = body;

//     if (!officeName || !payeeName || !expensesHead || !items || items.length === 0) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     const timestamp = getISTTimestamp();

//     // ✅ BillNumber — poori submission mein EK hi — Dim0001
//     const billNumber = await generateBillNumber();

//     // ✅ lastUID — sheet ka abhi tak ka max UID
//     // 3 items bheje, lastUID=10 → items ko milega: 11, 12, 13
//     const lastUID = await getLastUID();

//     // ✅ nextRow — data ki last row ke baad se likhna shuru karo
//     // Har item ALAG row mein jayega: nextRow, nextRow+1, nextRow+2 ...
//     const nextRow = await getLastDataRow();

//     console.log(`billNumber: ${billNumber}, lastUID: ${lastUID}, nextRow: ${nextRow}`);

//     const batchData = [];
//     const uploadedPhotos = [];

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       // Har item ki alag row
//       const rowNum = nextRow + i;         // Row 15, 16, 17 ...

//       // Har item ka alag UID, sequentially badhta hua
//       const uid = lastUID + (i + 1);      // UID 11, 12, 13 ...

//       let billPhotoUrl = '';
//       if (item.billPhoto && item.billPhoto.startsWith('data:')) {
//         const uniqueId = `${billNumber}_uid${uid}_${Date.now()}`;
//         billPhotoUrl = await uploadToGoogleDrive(item.billPhoto, `bill_${uniqueId}.jpg`);
//         uploadedPhotos.push(billPhotoUrl);
//       }

//       const rowData = new Array(17).fill('');

//       rowData[0] = timestamp;           // A: Timestamp
//       rowData[1] = billNumber;          // B: Office_Bill_No  ✅ SAME (Dim0001, Dim0001, Dim0001)
//       rowData[2] = uid;                 // C: UID             ✅ ALAG (11, 12, 13)
//       rowData[3] = officeName;          // D: OFFICE_NAME
//       rowData[4] = payeeName;           // E: PAYEE_NAME
//       rowData[6] = item.subhead;        // G: EXPENSES_SUBHEAD
//       rowData[7] = item.itemName;       // H: ITEM_NAME
//       rowData[8] = item.unit;           // I: UNIT
//       rowData[9] = item.skuCode;        // J: SKU_CODE
//       rowData[10] = item.quantity;      // K: QTY
//       rowData[11] = item.amount;        // L: AMOUNT
//       rowData[14] = item.formRaisedBy;  // O: RAISED_BY
//       rowData[15] = billPhotoUrl;       // P: Bill_Photo
//       rowData[16] = remarks || '';      // Q: Remarks

//       batchData.push({
//         range: `Dimension_Office_Payment!A${rowNum}:Q${rowNum}`,
//         values: [rowData]
//       });
//     }

//     // Saare items ek saath sheet mein likhte hain
//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId,
//       requestBody: {
//         valueInputOption: 'USER_ENTERED',
//         data: batchData
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       message: `${items.length} item(s) submitted successfully`,
//       data: {
//         billNumber,
//         timestamp,
//         totalItems: items.length,
//         totalAmount: items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0),
//         billPhotos: uploadedPhotos
//       }
//     }, { status: 201 });

//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
//   }
// }






import { NextResponse } from 'next/server';
import { sheets, spreadsheetId, drive } from '../../config/googleSheet';
const { Readable } = require('stream');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const subhead = searchParams.get('subhead');
    const itemName = searchParams.get('itemName');
    const getFormRaised = searchParams.get('getFormRaised');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!D4:J',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let headerRowIndex = 0;
    let headers = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length > 0 && (row[0] === 'Dimension_Subhead_Name' || row[1] === 'ITEM_NAME')) {
        headerRowIndex = i;
        headers = row;
        break;
      }
    }

    if (headers.length === 0) {
      headerRowIndex = 0;
      headers = ['Dimension_Subhead_Name', 'ITEM_NAME', 'Unit', 'SKU CODE', '', '', 'Form_Raised_Form'];
    }

    const dataRows = rows.slice(headerRowIndex + 1).filter(row => row && row.length > 0 && row[0]);

    const subheadIndex = 0;
    const itemNameIndex = 1;
    const unitIndex = 2;
    const skuCodeIndex = 3;
    const formRaisedIndex = 6;

    if (getFormRaised === 'true' && subhead) {
      const uniqueFormRaised = [...new Set(
        dataRows
          .filter(row => row[subheadIndex] === subhead)
          .map(row => row[formRaisedIndex])
          .filter(Boolean)
      )];
      return NextResponse.json({ type: 'formRaised', data: uniqueFormRaised });
    }

    if (action === 'all-data') {
      const subheadMap = new Map();

      dataRows.forEach(row => {
        const subhead = row[subheadIndex];
        if (!subhead) return;

        if (!subheadMap.has(subhead)) {
          subheadMap.set(subhead, { subhead, items: [], formRaised: new Set() });
        }

        const subheadData = subheadMap.get(subhead);
        const itemName = row[itemNameIndex];
        if (itemName) {
          subheadData.items.push({
            itemName,
            unit: row[unitIndex] || '',
            skuCode: row[skuCodeIndex] || '',
            formRaised: row[formRaisedIndex] || ''
          });
        }
        if (row[formRaisedIndex]) {
          subheadData.formRaised.add(row[formRaisedIndex]);
        }
      });

      const allData = Array.from(subheadMap.values()).map(s => ({
        subhead: s.subhead,
        items: s.items,
        formRaised: Array.from(s.formRaised)
      }));

      console.log('All data loaded, total subheads:', allData.length);
      return NextResponse.json({ type: 'all-data', data: allData });
    }

    if (!subhead && !itemName) {
      const uniqueSubheads = [...new Set(dataRows.map(row => row[subheadIndex]))].filter(Boolean);
      return NextResponse.json({ type: 'subheads', data: uniqueSubheads });
    }

    if (subhead && !itemName) {
      const filteredItems = dataRows
        .filter(row => row[subheadIndex] === subhead)
        .map(row => ({
          itemName: row[itemNameIndex],
          unit: row[unitIndex] || '',
          skuCode: row[skuCodeIndex] || '',
          formRaised: row[formRaisedIndex] || ''
        }))
        .filter(item => item.itemName);
      return NextResponse.json({ type: 'items', data: filteredItems });
    }

    if (subhead && itemName) {
      const selectedItem = dataRows.find(
        row => row[subheadIndex] === subhead && row[itemNameIndex] === itemName
      );
      if (!selectedItem) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json({
        type: 'details',
        data: {
          unit: selectedItem[unitIndex] || '',
          skuCode: selectedItem[skuCodeIndex] || '',
          formRaised: selectedItem[formRaisedIndex] || ''
        }
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}


// Helper: Upload photo to Google Drive
async function uploadToGoogleDrive(base64Data, fileName) {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) return '';

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

// Helper: Get IST Timestamp
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

// Helper: Column C mein abhi tak ka sabse bada UID
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

// ✅ KEY FIX: Row 8 se scan karo
// Pehle saari empty rows collect karo (beech ki bhi)
// Agar enough empty rows nahi hain to end mein aur rows add karo
async function getAvailableRows(needed) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      // Sirf column A fetch karo — isse pata chalega kaunsi rows filled hain
      range: 'Dimension_Office_Payment!A:A',
    });

    const rows = response.data.values || [];

    // Row 8 (index 7) se empty rows collect karo
    const emptyRows = [];
    for (let i = 7; i < rows.length; i++) {
      const cellValue = rows[i]?.[0];
      const isEmpty = !cellValue || cellValue.toString().trim() === '';
      if (isEmpty) {
        emptyRows.push(i + 1); // 1-based row number
      }
      // Agar enough empty rows mil gayi to bas karo
      if (emptyRows.length === needed) break;
    }

    // Agar beech mein enough empty rows nahi mili
    // to data ke baad se nayi rows add karo
    if (emptyRows.length < needed) {
      // Last row ka index nikalo (filled ho ya na ho)
      const totalRows = Math.max(rows.length, 7);
      let startAppend = totalRows + 1; // next row after all existing rows

      // Already collected empty rows ko count karke baaki add karo
      const stillNeeded = needed - emptyRows.length;
      for (let i = 0; i < stillNeeded; i++) {
        emptyRows.push(startAppend + i);
      }
    }

    return emptyRows; // exactly `needed` rows return hogi
  } catch (error) {
    console.error('Error getting available rows:', error);
    // Fallback: row 8 se shuru karo
    return Array.from({ length: needed }, (_, i) => 8 + i);
  }
}

// Main POST Handler
export async function POST(request) {
  try {
    const body = await request.json();
    const { officeName, payeeName, expensesHead, items, remarks } = body;

    if (!officeName || !payeeName || !expensesHead || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const timestamp = getISTTimestamp();

    // ✅ BillNumber — poori submission mein EK hi (Dim0001)
    const billNumber = await generateBillNumber();

    // ✅ lastUID — sheet ka max UID, loop mein +1, +2, +3 hoga
    const lastUID = await getLastUID();

    // ✅ Available empty rows — exactly jitne items hain utni rows chahiye
    // Beech ki empty rows pehle fill hongi, phir end mein append hoga
    const availableRows = await getAvailableRows(items.length);

    console.log(`billNumber: ${billNumber} | lastUID: ${lastUID} | rows to fill: ${availableRows}`);

    const batchData = [];
    const uploadedPhotos = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = availableRows[i];       // Pehli available empty row
      const uid = lastUID + (i + 1);         // Sequential UID: lastUID+1, +2, +3...

      let billPhotoUrl = '';
      if (item.billPhoto && item.billPhoto.startsWith('data:')) {
        const uniqueId = `${billNumber}_uid${uid}_${Date.now()}`;
        billPhotoUrl = await uploadToGoogleDrive(item.billPhoto, `bill_${uniqueId}.jpg`);
        uploadedPhotos.push(billPhotoUrl);
      }

      const rowData = new Array(17).fill('');

      rowData[0] = timestamp;           // A: Timestamp
      rowData[1] = billNumber;          // B: Office_Bill_No  ✅ SAME   e.g. Dim0001
      rowData[2] = uid;                 // C: UID             ✅ ALAG   e.g. 11, 12, 13
      rowData[3] = officeName;          // D: OFFICE_NAME
      rowData[4] = payeeName;           // E: PAYEE_NAME
      rowData[6] = item.subhead;        // G: EXPENSES_SUBHEAD
      rowData[7] = item.itemName;       // H: ITEM_NAME
      rowData[8] = item.unit;           // I: UNIT
      rowData[9] = item.skuCode;        // J: SKU_CODE
      rowData[10] = item.quantity;      // K: QTY
      rowData[11] = item.amount;        // L: AMOUNT
      rowData[14] = item.formRaisedBy;  // O: RAISED_BY
      rowData[15] = billPhotoUrl;       // P: Bill_Photo
      rowData[16] = remarks || '';      // Q: Remarks

      batchData.push({
        range: `Dimension_Office_Payment!A${rowNum}:Q${rowNum}`,
        values: [rowData]
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: batchData
      }
    });

    return NextResponse.json({
      success: true,
      message: `${items.length} item(s) submitted successfully`,
      data: {
        billNumber,
        timestamp,
        totalItems: items.length,
        totalAmount: items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0),
        billPhotos: uploadedPhotos
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}