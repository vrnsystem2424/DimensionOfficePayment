
import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../config/googleSheet'; // Path adjust karna

// GET: /api/dim-expenses-entry
export async function GET(request) {
  try {
    // Safety check
    if (!spreadsheetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'spreadsheetId is not configured',
        },
        { status: 500 }
      );
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Dimension_Office_Payment!A8:AJ',
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
      .filter((row) => row[34] && !row[35]) // Pending entry only (PLANNED_4 exists, ACTUAL_4 empty)
      .map((row) => ({
        OFFBILLUID: (row[1] || '').toString().trim(),
        uid: (row[2] || '').toString().trim(),
        OFFICE_NAME_1: (row[3] || '').toString().trim(),
        PAYEE_NAME_1: (row[4] || '').toString().trim(),
        EXPENSES_HEAD_1: (row[5] || '').toString().trim(),
        EXPENSES_SUBHEAD_1: (row[6] || '').toString().trim(),
        ITEM_NAME_1: (row[7] || '').toString().trim(),
        UNIT_1: (row[8] || '').toString().trim(),
        SKU_CODE_1: (row[9] || '').toString().trim(),
        Qty_1: (row[10] || '').toString().trim(),
        Amount: (row[24] || '').toString().trim(),
        DEPARTMENT_1: (row[12] || '').toString().trim(),
        APPROVAL_DOER: (row[13] || '').toString().trim(),
        RAISED_BY_1: (row[14] || '').toString().trim(),
        Bill_Photo: (row[15] || '').toString().trim(),
        PAYMENT_MODE_3: (row[31] || '').toString().trim(),
        REMARK_3: (row[32] || '').toString().trim(),
        PLANNED_4: (row[34] || '').toString().trim(),
        ACTUAL_4: (row[35] || '').toString().trim(),
      }));

    return NextResponse.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error('Error in /GET-DIM-Expenses-Data-Entry:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch office expenses data',
        details: error.message,
      },
      { status: 500 }
    );
  }
}


// POST: /api/dim-expenses-entry
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      uid,
      STATUS_4,
      Vendor_Name_4,
      BILL_NO_4,
      BILL_DATE_4,
      BASIC_AMOUNT_4,
      CGST_4,
      SGST_4,
      IGST_4,
      TOTAL_AMOUNT_4,
      TRASNPORT_CHARGES_4,
      Transport_Gst_4,
      NET_AMOUNT_4,
      Remark_4,
    } = body;

    console.log('Received body:', body);

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'uid (Bill No) is required' },
        { status: 400 }
      );
    }

    const trimmedBillNo = String(uid).trim();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Dimension_Office_Payment!B7:B',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'No data in sheet' }, { status: 404 });
    }

    // Sab matching rows collect karo
    const matchingRows = [];
    rows.forEach((row, index) => {
      if (row && row[0]) {
        const cellValue = String(row[0]).trim();
        if (cellValue === trimmedBillNo) {
          matchingRows.push({
            rowIndex: index,
            rowNumber: 7 + index,
          });
        }
      }
    });

    if (matchingRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No matching Bill No found', searchedFor: trimmedBillNo },
        { status: 404 }
      );
    }

    // Last row
    const lastRow = matchingRows[matchingRows.length - 1];
    const lastRowNumber = lastRow.rowNumber;

    console.log(`Found ${matchingRows.length} matches → last row: ${lastRowNumber}`);

    const requests = [];

    // ───────────────────────────────────────────────
    // 1. SABHI matching rows mein STATUS_4 update kar do
    // ───────────────────────────────────────────────
    if (STATUS_4 !== undefined && STATUS_4 !== null && STATUS_4 !== '') {
      matchingRows.forEach(({ rowNumber }) => {
        requests.push({
          range: `Dimension_Office_Payment!AK${rowNumber}`,
          values: [[STATUS_4]],
        });
      });
    }

    // ───────────────────────────────────────────────
    // 2. Sirf LAST row mein baaki fields update kar do
    // ───────────────────────────────────────────────
    const addLastOnly = (colLetter, value) => {
      if (value !== undefined && value !== null && value !== '') {
        requests.push({
          range: `Dimension_Office_Payment!${colLetter}${lastRowNumber}`,
          values: [[value]],
        });
      }
    };

    addLastOnly('AM', Vendor_Name_4);
    addLastOnly('AN', BILL_NO_4);
    addLastOnly('AO', BILL_DATE_4);
    addLastOnly('AP', BASIC_AMOUNT_4);
    addLastOnly('AQ', CGST_4);
    addLastOnly('AR', SGST_4);
    addLastOnly('AS', IGST_4);
    addLastOnly('AT', TOTAL_AMOUNT_4);
    addLastOnly('AU', TRASNPORT_CHARGES_4);
    addLastOnly('AV', Transport_Gst_4);
    addLastOnly('AW', NET_AMOUNT_4);
    addLastOnly('AX', Remark_4);

    if (requests.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: requests,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data updated: STATUS_4 sabhi rows mein, baaki sirf last row mein',
      updatedRows: matchingRows.length,
      lastRow: lastRowNumber,
      statusValueUsed: STATUS_4 || '(not provided)',
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}