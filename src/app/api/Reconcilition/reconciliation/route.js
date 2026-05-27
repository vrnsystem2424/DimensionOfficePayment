

import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../config/googleSheet';

// ─── GET - Pending Approvals ──────────────────────────────────────────────────
export async function GET(request) {
  try {
    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'spreadsheetId is not configured' },
        { status: 500 }
      );
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Out_FMS!A7:M',
    });

    let rows = response.data.values || [];

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data found',
        data: [],
      });
    }

    const filteredData = rows
      .filter(row => row[11] && !row[12])
      .map(row => ({
        UID:                          (row[0]  || '').toString().trim(),
        Timestap:                     (row[1]  || '').toString().trim(),
        Contractor_Vendor_Firm_Name:  (row[2]  || '').toString().trim(),
        PAID_AMOUNT:                  (row[3]  || '').toString().trim(),
        BANK_DETAILS:                 (row[4]  || '').toString().trim(),
        PAYMENT_MODE:                 (row[5]  || '').toString().trim(),
        PAYMENT_DETAILS:              (row[6]  || '').toString().trim(),
        PAYMENT_DATE:                 (row[7]  || '').toString().trim(),
        EXP_HEAD:                     (row[8]  || '').toString().trim(),
        PLANNED_2:                    (row[11] || '').toString().trim(),
        ACTUAL_2:                     (row[12] || '').toString().trim(),
      }));

    return NextResponse.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });

  } catch (error) {
    console.error('GET Error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch', details: error.message },
      { status: 500 }
    );
  }
}


// ─── Helper: Find First Empty Row From TOP ────────────────────────────────────
async function findNextEmptyRow(sheetName, startRow) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A${startRow}:A`,
    });

    const rows = response.data.values || [];

    console.log(`📊 Total rows fetched from row ${startRow}:`, rows.length);

    // ─── Scan from TOP to find FIRST empty cell ───
    for (let i = 0; i < rows.length; i++) {
      const cellValue = rows[i]?.[0]?.toString().trim();
      
      if (!cellValue) {
        const emptyRowNumber = startRow + i;
        console.log(`✅ First empty row found at: ${emptyRowNumber}`);
        return emptyRowNumber;
      }
    }

    // ─── Agar saari rows filled hain toh next row ─
    const nextRow = startRow + rows.length;
    console.log(`📍 All rows filled, next row: ${nextRow}`);
    return nextRow;

  } catch (error) {
    console.error('❌ Error finding empty row:', error.message);
    return startRow;
  }
}

// ─── POST - Update Reconciliation ────────────────────────────────────────────
// export async function POST(request) {
//   console.log('═══════════════════════════════════');

//   try {
//     const body = await request.json();
//     console.log('📥 FULL body:', JSON.stringify(body, null, 2));

//     const {
//       particulars,                      // contractorName → B
//       paidAmount,                       // paid amount   → G
//       paymentDetails,                   // payment ref   → D
//       bankDetails,                      // bank name     → C
//       bankClosingBalanceAfterPayment,   // closing bal   → F
//       status,                           // status        → E
//       remark,                           // remark        → H
//     } = body;

//     // ─── Validation ─────────────────────────────────
//     if (!paymentDetails?.toString().trim() || !bankDetails?.toString().trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'paymentDetails and bankDetails are required',
//         },
//         { status: 400 }
//       );
//     }

//     // ─── Timestamp ──────────────────────────────────
//     const now       = new Date();
//     const dd        = String(now.getDate()).padStart(2, '0');
//     const mm        = String(now.getMonth() + 1).padStart(2, '0');
//     const yyyy      = now.getFullYear();
//     const hh        = String(now.getHours()).padStart(2, '0');
//     const min       = String(now.getMinutes()).padStart(2, '0');
//     const ss        = String(now.getSeconds()).padStart(2, '0');
//     const timeStamp = `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;

//     // ─── Find Next Empty Row ─────────────────────────
//     const sheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Actual Out!A5:H',
//     });

//     const existingRows  = sheetResponse.data.values || [];
//     const nextRowNumber = 5 + existingRows.length;

//     // ─── Build Row Data (A to H) ─────────────────────
//     const rowData = [
//       timeStamp,                                            // A → Timestamp
//       String(particulars || '').trim(),                     // B → Particulars
//       String(bankDetails || '').trim(),                     // C → Bank Details
//       String(paymentDetails || '').trim(),                  // D → Payment Details
//       String(status || '').trim(),                          // E → Status
//       String(bankClosingBalanceAfterPayment || '').trim(),  // F → Closing Balance
//       String(paidAmount || '').trim(),                      // G → Paid Amount
//       String(remark || '').trim(),                          // H → Remark
//     ];

//     console.log('📝 Writing row:', rowData);
//     console.log('📍 At row number:', nextRowNumber);

//     // ─── Write to Sheet ──────────────────────────────
//     await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range: `Actual Out!A${nextRowNumber}:H${nextRowNumber}`,
//       valueInputOption: 'USER_ENTERED',
//       resource: { values: [rowData] },
//     });

//     // ─── Success Response ────────────────────────────
//     return NextResponse.json({
//       success: true,
//       message: `Saved successfully at row ${nextRowNumber}`,
//       row: nextRowNumber,
//       savedData: {
//         A_TimeStamp:      timeStamp,
//         B_Particulars:    particulars,
//         C_BankDetails:    bankDetails,
//         D_PaymentDetails: paymentDetails,
//         E_Status:         status,
//         F_ClosingBalance: bankClosingBalanceAfterPayment,
//         G_PaidAmount:     paidAmount,
//         H_Remark:         remark,
//       },
//     });

//   } catch (error) {
//     console.error('❌ POST Error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to save data',
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }





export async function POST(request) {
  console.log('═══════════════════════════════════');

  try {
    const body = await request.json();
    console.log('📥 FULL body:', JSON.stringify(body, null, 2));

    const {
      particulars,
      paidAmount,
      paymentDetails,
      bankDetails,
      bankClosingBalanceAfterPayment,
      status,
      remark,
    } = body;

    // ─── Validation ──────────────────────────────────
    if (!paymentDetails?.toString().trim() || !bankDetails?.toString().trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'paymentDetails and bankDetails are required',
        },
        { status: 400 }
      );
    }

    // ─── Timestamp ───────────────────────────────────
    const now       = new Date();
    const dd        = String(now.getDate()).padStart(2, '0');
    const mm        = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy      = now.getFullYear();
    const hh        = String(now.getHours()).padStart(2, '0');
    const min       = String(now.getMinutes()).padStart(2, '0');
    const ss        = String(now.getSeconds()).padStart(2, '0');
    const timeStamp = `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;

    const START_ROW  = 5;           // ← jahan se data shuru hota hai
    const SHEET_NAME = 'Actual Out';

    // ─── Step 1: Fetch Column A from START_ROW ────────
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A${START_ROW}:A`,
    });

    const existingRows = sheetResponse.data.values || [];
    console.log('📊 Existing rows count:', existingRows.length);

    // ─── Step 2: Find FIRST Empty Row from TOP ────────
    let nextRowNumber = START_ROW; // default agar koi data hi nahi

    for (let i = 0; i < existingRows.length; i++) {
      const cellValue = existingRows[i]?.[0]?.toString().trim();

      if (!cellValue) {
        // ✅ Pehli empty row mil gayi
        nextRowNumber = START_ROW + i;
        console.log(`✅ First empty row found at: ${nextRowNumber}`);
        break;
      }

      // ─── Agar loop khatam ho aur sab filled hain ──
      if (i === existingRows.length - 1) {
        nextRowNumber = START_ROW + existingRows.length;
        console.log(`📍 All rows filled, using next row: ${nextRowNumber}`);
      }
    }

    console.log('📍 Writing at row number:', nextRowNumber);

    // ─── Step 3: Extend Sheet if Needed ──────────────
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = meta.data.sheets.find(
      s => s.properties.title === SHEET_NAME
    );

    if (sheet) {
      const currentRowCount = sheet.properties.gridProperties.rowCount;

      if (nextRowNumber >= currentRowCount) {
        const newRowCount = nextRowNumber + 200; // buffer
        console.log(`⚠️ Extending sheet to ${newRowCount} rows`);

        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [
              {
                updateSheetProperties: {
                  properties: {
                    sheetId: sheet.properties.sheetId,
                    gridProperties: { rowCount: newRowCount },
                  },
                  fields: 'gridProperties.rowCount',
                },
              },
            ],
          },
        });

        console.log(`✅ Sheet extended to ${newRowCount} rows`);
      }
    }

    // ─── Step 4: Build Row Data ───────────────────────
    const rowData = [
      timeStamp,
      String(particulars                    || '').trim(), // B
      String(bankDetails                    || '').trim(), // C
      String(paymentDetails                 || '').trim(), // D
      String(status                         || '').trim(), // E
      String(bankClosingBalanceAfterPayment || '').trim(), // F
      String(paidAmount                     || '').trim(), // G
      String(remark                         || '').trim(), // H
    ];

    console.log('📝 Row data to write:', rowData);

    // ─── Step 5: Write to Sheet ───────────────────────
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A${nextRowNumber}:H${nextRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [rowData] },
    });

    // ─── Success ──────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: `✅ Saved at row ${nextRowNumber}`,
      row: nextRowNumber,
      savedData: {
        A_TimeStamp:      timeStamp,
        B_Particulars:    particulars,
        C_BankDetails:    bankDetails,
        D_PaymentDetails: paymentDetails,
        E_Status:         status,
        F_ClosingBalance: bankClosingBalanceAfterPayment,
        G_PaidAmount:     paidAmount,
        H_Remark:         remark,
      },
    });

  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save data',
        error: error.message,
      },
      { status: 500 }
    );
  }
}