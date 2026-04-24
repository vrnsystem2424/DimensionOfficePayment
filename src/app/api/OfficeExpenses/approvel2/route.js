
import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../config/googleSheet'; // Path adjust karna

// GET: /api/dim-expenses-approved2
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
      range: 'Dimension_Office_Payment!A8:AC',
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
      .filter(row => row[27] && !row[28])   // Pending approval wale only (optional)
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
        REMARK_2: (row[26] || '').toString().trim(),
        PLANNED_3: (row[27] || '').toString().trim(),
        ACTUAL_3: (row[28] || '').toString().trim(),
      }));

    return NextResponse.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error('Error in /GET-DIM-Expenses-Data-Approved2:', error.message);
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




export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received body:', body);

    const { uid, STATUS_3, PAYMENT_MODE_3, REMARK_3, APPROVAL_DOER_3 } = body;

    if (!uid) {
      return NextResponse.json({ success: false, message: 'Bill No (uid) is required' }, { status: 400 });
    }

    const trimmedBillNo = String(uid).trim();

    // Get Bill No column from B8 downwards
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Dimension_Office_Payment!B8:B',
    });

    const values = response.data.values || [];

    // Find ALL matching rows (multiple items per bill)
    const matchingIndices = values
      .map((row, index) => {
        if (!row || row.length === 0) return -1;
        const sheetValue = String(row[0]).trim();
        return sheetValue === trimmedBillNo ? index : -1;
      })
      .filter(index => index !== -1);

    if (matchingIndices.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No matching Bill No found', searchedFor: trimmedBillNo },
        { status: 404 }
      );
    }

    const updates = [];
    matchingIndices.forEach(rowIndex => {
      const sheetRowNumber = 8 + rowIndex; // B8 = index 0 → row 8

      updates.push(
        { range: `Dimension_Office_Payment!AD${sheetRowNumber}`, values: [[STATUS_3 ?? '']] },
        { range: `Dimension_Office_Payment!AF${sheetRowNumber}`, values: [[PAYMENT_MODE_3 ?? '']] },
        { range: `Dimension_Office_Payment!AG${sheetRowNumber}`, values: [[REMARK_3 ?? '']] },
        // { range: `Dimension_Office_Payment!AE${sheetRowNumber}`, values: [[APPROVAL_DOER_3 ?? '']] } // optional
      );
    });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${matchingIndices.length} rows for Bill No ${trimmedBillNo}`,
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}
