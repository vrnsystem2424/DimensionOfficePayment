

// import { NextResponse } from 'next/server';
// import { sheets, spreadsheetId } from '../../config/googleSheet';

// // GET: /api/dim-payment
// export async function GET(request) {
//   try {
//     if (!spreadsheetId) {
//       return NextResponse.json(
//         { success: false, error: 'spreadsheetId is not configured' },
//         { status: 500 }
//       );
//     }

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetId,
//       range: 'Dimension_Office_Payment!A8:BL',
//     });

//     const rows = response.data.values || [];

//     if (rows.length === 0) {
//       return NextResponse.json({
//         success: true,
//         message: 'No data found',
//         data: [],
//       });
//     }

//     const filteredData = rows
//       .filter((row) => row[51] && !row[52])
//       .map((row) => ({
//         OFFBILLUID:          (row[1]  || '').toString().trim(),
//         uid:                 (row[2]  || '').toString().trim(),
//         OFFICE_NAME_1:       (row[3]  || '').toString().trim(),
//         PAYEE_NAME_1:        (row[4]  || '').toString().trim(),
//         EXPENSES_HEAD_1:     (row[5]  || '').toString().trim(),
//         EXPENSES_SUBHEAD_1:  (row[6]  || '').toString().trim(),
//         ITEM_NAME_1:         (row[7]  || '').toString().trim(),
//         UNIT_1:              (row[8]  || '').toString().trim(),
//         SKU_CODE_1:          (row[9]  || '').toString().trim(),
//         Qty_1:               (row[10] || '').toString().trim(),
//         Amount:              (row[24] || '').toString().trim(),
//         DEPARTMENT_1:        (row[12] || '').toString().trim(),
//         APPROVAL_DOER:       (row[13] || '').toString().trim(),
//         RAISED_BY_1:         (row[14] || '').toString().trim(),
//         Bill_Photo:          (row[15] || '').toString().trim(),
//         PAYMENT_MODE_3:      (row[16] || '').toString().trim(),
//         Vendor_Name_4:       (row[38] || '').toString().trim(),
//         BILL_NO_4:           (row[39] || '').toString().trim(),
//         BILL_DATE_4:         (row[40] || '').toString().trim(),
//         BASIC_AMOUNT:        (row[41] || '').toString().trim(),
//         CGST_4:              (row[42] || '').toString().trim(),
//         SGST_4:              (row[43] || '').toString().trim(),
//         IGST_4:              (row[44] || '').toString().trim(),
//         TOTAL_AMOUNT_4:      (row[45] || '').toString().trim(),
//         TRASNPORT_CHARGES_4: (row[46] || '').toString().trim(),
//         Transport_Gst_4:     (row[47] || '').toString().trim(),
//         NET_AMOUNT_4:        (row[48] || '').toString().trim(),
//         REMARK_4:            (row[49] || '').toString().trim(),
//         PLANNED_5:           (row[51] || '').toString().trim(),
//         ACTUAL_5:            (row[52] || '').toString().trim(),
//       }));

//     return NextResponse.json({
//       success: true,
//       totalRecords: filteredData.length,
//       data: filteredData,
//     });
//   } catch (error) {
//     console.error('Error in Get-DIM-Payment:', error.message);
//     return NextResponse.json(
//       {
//         success: false,
//         error: 'Failed to fetch payment data',
//         details: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// // POST: /api/dim-payment
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     console.log('Received body:', body);

//     const {
//       uid,
//       STATUS_5,
//       NET_AMOUNT_5,
//       TDS_5,            // ✅ TDS — optional, BE column
//       BALANCE_AMOUNT_5,
//       BANK_DETAILS_5,
//       PAYMENT_MODE_5,
//       PAYMENT_DETAILS_5,
//       PAYMENT_DATE_5,
//       Remark_5,
//     } = body;

//     if (!uid) {
//       return NextResponse.json(
//         { success: false, message: 'UID is required' },
//         { status: 400 }
//       );
//     }

//     const trimmedUid = String(uid).trim();
//     console.log('Searching UID:', trimmedUid);

//     const getResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetId,
//       range: 'Dimension_Office_Payment!C7:C',
//     });

//     const values = getResponse.data.values || [];
//     console.log(`Total rows in C column: ${values.length}`);

//     const rowIndex = values.findIndex((row) => {
//       const cell = row && row[0] ? String(row[0]).trim() : '';
//       return cell === trimmedUid;
//     });

//     if (rowIndex === -1) {
//       console.log('No match found. Sample UIDs:');
//       values.slice(0, 10).forEach((row, i) => {
//         console.log(`Row ${7 + i}: "${row?.[0] || 'EMPTY'}"`);
//       });

//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Row not found with this UID',
//           searchedFor: trimmedUid,
//           rowsChecked: values.length,
//         },
//         { status: 404 }
//       );
//     }

//     const sheetRowNumber = 7 + rowIndex;
//     console.log(`Match found → Row: ${sheetRowNumber}`);

//     /*
//      * Column mapping (Stage 5):
//      * BB → STATUS_5
//      * BC → (reserved / skip)
//      * BD → NET_AMOUNT_5
//      * BE → TDS_5          ✅ NEW
//      * BF → PAID_AMOUNT_5
//      * BG → BALANCE_AMOUNT_5
//      * BH → BANK_DETAILS_5
//      * BI → PAYMENT_MODE_5
//      * BJ → PAYMENT_DETAILS_5
//      * BK → PAYMENT_DATE_5
//      * BL → Remark_5
//      */
//     const updates = [
//       {
//         range: `Dimension_Office_Payment!BB${sheetRowNumber}`,
//         values: [[STATUS_5 || '']],
//       },
//       {
//         range: `Dimension_Office_Payment!BD${sheetRowNumber}`,
//         values: [[NET_AMOUNT_5 || '']],
//       },
//       {
//         // ✅ TDS — optional, goes to BE
//         range: `Dimension_Office_Payment!BE${sheetRowNumber}`,
//         values: [[TDS_5 || '']],
//       },
//       // {
//       //   range: `Dimension_Office_Payment!BF${sheetRowNumber}`,
//       //   values: [[PAID_AMOUNT_5 || '']],
//       // },
//       {
//         range: `Dimension_Office_Payment!BF${sheetRowNumber}`,
//         values: [[BALANCE_AMOUNT_5 || '']],
//       },
//       {
//         range: `Dimension_Office_Payment!BG${sheetRowNumber}`,
//         values: [[BANK_DETAILS_5 || '']],
//       },
//       {
//         range: `Dimension_Office_Payment!BH${sheetRowNumber}`,
//         values: [[PAYMENT_MODE_5 || '']],
//       },
//       {
//         range: `Dimension_Office_Payment!BI${sheetRowNumber}`,
//         values: [[PAYMENT_DETAILS_5 || '']],
//       },
//       {
//         range: `Dimension_Office_Payment!BJ${sheetRowNumber}`,
//         values: [[PAYMENT_DATE_5 || '']],
//       },
//       {
//         range: `Dimension_Office_Payment!BK${sheetRowNumber}`,
//         values: [[Remark_5 || '']],
//       },
//     ];

//     // TDS optional hai — agar empty hai to skip karo
//     const validUpdates = updates.filter((u) => u.values[0][0] !== '');

//     if (validUpdates.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'No valid fields to update' },
//         { status: 400 }
//       );
//     }

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: spreadsheetId,
//       resource: {
//         valueInputOption: 'USER_ENTERED',
//         data: validUpdates,
//       },
//     });

//     console.log(`✅ Updated row ${sheetRowNumber} — ${validUpdates.length} fields`);

//     return NextResponse.json({
//       success: true,
//       message: 'Payment data updated successfully',
//       updatedRow: sheetRowNumber,
//       tdsApplied: TDS_5 ? Number(TDS_5) : 0,
//       updatedFields: validUpdates.map((u) => u.range.split('!')[1]),
//     });

//   } catch (error) {
//     console.error('POST Error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Server error while updating sheet',
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }






import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../config/googleSheet';

// GET: /api/dim-payment
export async function GET(request) {
  try {
    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'spreadsheetId is not configured' },
        { status: 500 }
      );
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Dimension_Office_Payment!A8:BM',  // ✅ BL → BM tak extend kiya
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
      .filter((row) => row[51] && !row[52])
      .map((row) => ({
        OFFBILLUID:          (row[1]  || '').toString().trim(),
        uid:                 (row[2]  || '').toString().trim(),
        OFFICE_NAME_1:       (row[3]  || '').toString().trim(),
        PAYEE_NAME_1:        (row[4]  || '').toString().trim(),
        EXPENSES_HEAD_1:     (row[5]  || '').toString().trim(),
        EXPENSES_SUBHEAD_1:  (row[6]  || '').toString().trim(),
        ITEM_NAME_1:         (row[7]  || '').toString().trim(),
        UNIT_1:              (row[8]  || '').toString().trim(),
        SKU_CODE_1:          (row[9]  || '').toString().trim(),
        Qty_1:               (row[10] || '').toString().trim(),
        Amount:              (row[24] || '').toString().trim(),
        DEPARTMENT_1:        (row[12] || '').toString().trim(),
        APPROVAL_DOER:       (row[13] || '').toString().trim(),
        RAISED_BY_1:         (row[14] || '').toString().trim(),
        Bill_Photo:          (row[15] || '').toString().trim(),
        PAYMENT_MODE_3:      (row[16] || '').toString().trim(),
        Vendor_Name_4:       (row[38] || '').toString().trim(),
        BILL_NO_4:           (row[39] || '').toString().trim(),
        BILL_DATE_4:         (row[40] || '').toString().trim(),
        BASIC_AMOUNT:        (row[41] || '').toString().trim(),
        CGST_4:              (row[42] || '').toString().trim(),
        SGST_4:              (row[43] || '').toString().trim(),
        IGST_4:              (row[44] || '').toString().trim(),
        TOTAL_AMOUNT_4:      (row[45] || '').toString().trim(),
        TRASNPORT_CHARGES_4: (row[46] || '').toString().trim(),
        Transport_Gst_4:     (row[47] || '').toString().trim(),
        NET_AMOUNT_4:        (row[48] || '').toString().trim(),
        REMARK_4:            (row[49] || '').toString().trim(),
        PLANNED_5:           (row[51] || '').toString().trim(),
        ACTUAL_5:            (row[52] || '').toString().trim(),
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
      TDS_5,               // BE column
      PROFESSIONAL_TAX_5,  // ✅ NEW — BF column
      PAID_AMOUNT_5,       // ✅ BG column (shifted)
      BALANCE_AMOUNT_5,    // ✅ BH column (net payable, shifted)
      BANK_DETAILS_5,      // ✅ BI column (shifted)
      PAYMENT_MODE_5,      // ✅ BJ column (shifted)
      PAYMENT_DETAILS_5,   // ✅ BK column (shifted)
      PAYMENT_DATE_5,      // ✅ BL column (shifted)
      Remark_5,            // ✅ BM column (shifted)
    } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'UID is required' },
        { status: 400 }
      );
    }

    const trimmedUid = String(uid).trim();
    console.log('Searching UID:', trimmedUid);

    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Dimension_Office_Payment!C7:C',
    });

    const values = getResponse.data.values || [];
    console.log(`Total rows in C column: ${values.length}`);

    const rowIndex = values.findIndex((row) => {
      const cell = row && row[0] ? String(row[0]).trim() : '';
      return cell === trimmedUid;
    });

    if (rowIndex === -1) {
      console.log('No match found. Sample UIDs:');
      values.slice(0, 10).forEach((row, i) => {
        console.log(`Row ${7 + i}: "${row?.[0] || 'EMPTY'}"`);
      });

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
    console.log(`Match found → Row: ${sheetRowNumber}`);

    /*
     * ✅ Updated Column Mapping (Stage 5):
     * BB → STATUS_5
     * BC → (reserved / skip)
     * BD → NET_AMOUNT_5        (bill total)
     * BE → TDS_5               (optional)
     * BF → PROFESSIONAL_TAX_5  ✅ NEW
     * BG → PAID_AMOUNT_5       (shifted)
     * BH → BALANCE_AMOUNT_5    (net payable, shifted)
     * BI → BANK_DETAILS_5      (shifted)
     * BJ → PAYMENT_MODE_5      (shifted)
     * BK → PAYMENT_DETAILS_5   (shifted)
     * BL → PAYMENT_DATE_5      (shifted)
     * BM → Remark_5            (shifted)
     */
    const updates = [
      {
        range: `Dimension_Office_Payment!BB${sheetRowNumber}`,
        values: [[STATUS_5 || '']],
      },
      {
        range: `Dimension_Office_Payment!BD${sheetRowNumber}`,
        values: [[NET_AMOUNT_5 || '']],
      },
      {
        // TDS — optional, BE column
        range: `Dimension_Office_Payment!BE${sheetRowNumber}`,
        values: [[TDS_5 || '']],
      },
      {
        // ✅ Professional Tax — optional, BF column (NEW)
        range: `Dimension_Office_Payment!BF${sheetRowNumber}`,
        values: [[PROFESSIONAL_TAX_5 || '']],
      },
      // {
      //   // ✅ Paid Amount — BG column (shifted from BF)
      //   range: `Dimension_Office_Payment!BG${sheetRowNumber}`,
      //   values: [[PAID_AMOUNT_5 || '']],
      // },
      {
        // ✅ Net Payable (Balance) — BH column (shifted from BG)
        range: `Dimension_Office_Payment!BG${sheetRowNumber}`,
        values: [[BALANCE_AMOUNT_5 || '']],
      },
      {
        // ✅ Bank Details — BI column (shifted)
        range: `Dimension_Office_Payment!BH${sheetRowNumber}`,
        values: [[BANK_DETAILS_5 || '']],
      },
      {
        // ✅ Payment Mode — BJ column (shifted)
        range: `Dimension_Office_Payment!BI${sheetRowNumber}`,
        values: [[PAYMENT_MODE_5 || '']],
      },
      {
        // ✅ Payment Details — BK column (shifted)
        range: `Dimension_Office_Payment!BJ${sheetRowNumber}`,
        values: [[PAYMENT_DETAILS_5 || '']],
      },
      {
        // ✅ Payment Date — BL column (shifted)
        range: `Dimension_Office_Payment!BK${sheetRowNumber}`,
        values: [[PAYMENT_DATE_5 || '']],
      },
      {
        // ✅ Remark — BM column (shifted)
        range: `Dimension_Office_Payment!BL${sheetRowNumber}`,
        values: [[Remark_5 || '']],
      },
    ];

    // Optional fields — empty hone par skip karo
    const validUpdates = updates.filter((u) => u.values[0][0] !== '');

    if (validUpdates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: validUpdates,
      },
    });

    console.log(`✅ Updated row ${sheetRowNumber} — ${validUpdates.length} fields`);

    return NextResponse.json({
      success: true,
      message: 'Payment data updated successfully',
      updatedRow: sheetRowNumber,
      tdsApplied: TDS_5 ? Number(TDS_5) : 0,
      professionalTaxApplied: PROFESSIONAL_TAX_5 ? Number(PROFESSIONAL_TAX_5) : 0,
      updatedFields: validUpdates.map((u) => u.range.split('!')[1]),
    });
  } catch (error) {
    console.error('POST Error:', error);
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