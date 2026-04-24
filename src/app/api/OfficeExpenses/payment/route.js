import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../config/googleSheet'; // Path adjust karna

// GET: /api/dim-payment
export async function GET(request) {
  try {
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
      range: 'Dimension_Office_Payment!A8:BA',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data found',
        data: [],
      });
    }

    const filteredData = rows
      .filter((row) => row[51] && !row[52]) // PLANNED_5 exists, ACTUAL_5 empty
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
        Vendor_Name_4: (row[38] || '').toString().trim(),
        BILL_NO_4: (row[39] || '').toString().trim(),
        BILL_DATE_4: (row[40] || '').toString().trim(),
        BASIC_AMOUNT: (row[41] || '').toString().trim(),
        CGST_4: (row[42] || '').toString().trim(),
        SGST_4: (row[43] || '').toString().trim(),
        IGST_4: (row[44] || '').toString().trim(),
        TOTAL_AMOUNT_4: (row[45] || '').toString().trim(),
        TRASNPORT_CHARGES_4: (row[46] || '').toString().trim(),
        Transport_Gst_4: (row[47] || '').toString().trim(),
        NET_AMOUNT_4: (row[48] || '').toString().trim(),
        REMARK_4: (row[49] || '').toString().trim(),
        PLANNED_5: (row[51] || '').toString().trim(),
        ACTUAL_5: (row[52] || '').toString().trim(),
      }));

    return NextResponse.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error('Error in Get-DIM-Payment:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment data',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: /api/dim-payment
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received body:', body);

    const {
      uid,
      STATUS_5,
      NET_AMOUNT_5,
      PAID_AMOUNT_5,
      BALANCE_AMOUNT_5,
      BANK_DETAILS_5,
      PAYMENT_MODE_5,
      PAYMENT_DETAILS_5,
      PAYMENT_DATE_5,
      Remark_5,
    } = body;

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          message: 'UID is required',
        },
        { status: 400 }
      );
    }

    const trimmedUid = String(uid).trim();
    console.log('Trimmed UID being searched:', trimmedUid);

    // ✅ FIXED: Use spreadsheetId consistently (not SPREADSHEET_ID_OFFICE_EXPENSES)
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId, // ✅ Fixed: was SPREADSHEET_ID_OFFICE_EXPENSES
      range: 'Dimension_Office_Payment!C7:C',
    });

    const values = getResponse.data.values || [];
    console.log(`Total rows found in column B: ${values.length}`);

    // Find matching row
    const rowIndex = values.findIndex((row) => {
      const cell = row && row[0] ? String(row[0]).trim() : '';
      return cell === trimmedUid;
    });

    if (rowIndex === -1) {
      // Debug helper
      console.log('No match. First 10 UIDs in sheet:');
      const sample = values.slice(0, 10).map((row, i) => ({
        row: 7 + i,
        uid: row?.[0] ? String(row[0]).trim() : 'EMPTY',
      }));
      console.log(sample);

      return NextResponse.json(
        {
          success: false,
          message: 'Row not found with this UID',
          searchedFor: trimmedUid,
          rowsChecked: values.length,
        },
        { status: 404 }
      );
    }

    const sheetRowNumber = 7 + rowIndex;
    console.log(`Match found → Updating row: ${sheetRowNumber}`);

    // Prepare updates for Stage 5 (BB-BK columns)
    const updates = [
      { range: `Dimension_Office_Payment!BB${sheetRowNumber}`, values: [[STATUS_5 || '']] },
      { range: `Dimension_Office_Payment!BD${sheetRowNumber}`, values: [[NET_AMOUNT_5 || '']] },
      { range: `Dimension_Office_Payment!BE${sheetRowNumber}`, values: [[PAID_AMOUNT_5 || '']] },
      { range: `Dimension_Office_Payment!BF${sheetRowNumber}`, values: [[BALANCE_AMOUNT_5 || '']] },
      { range: `Dimension_Office_Payment!BG${sheetRowNumber}`, values: [[BANK_DETAILS_5 || '']] },
      { range: `Dimension_Office_Payment!BH${sheetRowNumber}`, values: [[PAYMENT_MODE_5 || '']] },
      { range: `Dimension_Office_Payment!BI${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5 || '']] },
      { range: `Dimension_Office_Payment!BJ${sheetRowNumber}`, values: [[PAYMENT_DATE_5 || '']] },
      { range: `Dimension_Office_Payment!BK${sheetRowNumber}`, values: [[Remark_5 || '']] },
    ];

    // Only send non-empty updates
    const validUpdates = updates.filter((update) => update.values[0][0] !== '');

    if (validUpdates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid fields to update',
        },
        { status: 400 }
      );
    }

    // ✅ FIXED: Use spreadsheetId consistently
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetId, // ✅ Fixed
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: validUpdates,
      },
    });

    console.log(`Update successful for row ${sheetRowNumber} — ${validUpdates.length} fields updated`);

    return NextResponse.json({
      success: true,
      message: 'Payment data updated successfully',
      updatedRow: sheetRowNumber,
      updatedFields: validUpdates.map((u) => u.range.split('!')[1]),
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error while updating sheet',
        error: error.message,
      },
      { status: 500 }
    );
  }
}