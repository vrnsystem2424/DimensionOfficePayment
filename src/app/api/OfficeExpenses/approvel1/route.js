

import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../config/googleSheet';  // path sahi rakho (@ alias ya relative)

export async function GET(request) {
  try {
    if (!spreadsheetId) {
      return NextResponse.json(
        {
          success: false,
          error: "spreadsheetId is not configured",
        },
        { status: 500 }
      );
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Dimension_Office_Payment!A8:V",
    });

    let rows = response.data.values || [];

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No data found",
        data: [],
      });
    }

    // Filter pending approval (column U index 20: PLANNED_2 exists, V index 21: ACTUAL_2 empty)
    const filteredData = rows
      .filter((row) => row[20] && !row[21])
      .map((row) => ({
        OFFBILLUID: (row[1] || "").toString().trim(),
        uid: (row[2] || "").toString().trim(),
        OFFICE_NAME_1: (row[3] || "").toString().trim(),
        PAYEE_NAME_1: (row[4] || "").toString().trim(),
        EXPENSES_HEAD_1: (row[5] || "").toString().trim(),
        EXPENSES_SUBHEAD_1: (row[6] || "").toString().trim(),
        ITEM_NAME_1: (row[7] || "").toString().trim(),
        UNIT_1: (row[8] || "").toString().trim(),
        SKU_CODE_1: (row[9] || "").toString().trim(),
        Qty_1: (row[10] || "").toString().trim(),
        Amount: (row[11] || "").toString().trim(),
        DEPARTMENT_1: (row[12] || "").toString().trim(),
        APPROVAL_DOER: (row[13] || "").toString().trim(),
        RAISED_BY_1: (row[14] || "").toString().trim(),
        Bill_Photo: (row[15] || "").toString().trim(),
        REMARK_1: (row[16] || "").toString().trim(),
        PLANNED_2: (row[20] || "").toString().trim(),
        ACTUAL_2: (row[21] || "").toString().trim(),
      }));

    return NextResponse.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error("DIM Approve1 GET Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch office expenses data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, STATUS_2, REVISED_AMOUNT_3, APPROVAL_DOER_2, REMARK_2 } = body;

    console.log("Received update body:", body); // Debug

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          message: "UID is required",
        },
        { status: 400 }
      );
    }

    const trimmedUid = uid.toString().trim();

    // Find row by UID (column C index 2, from row 7)
    const findResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Dimension_Office_Payment!C7:C",
    });

    const values = findResponse.data.values || [];

    const rowIndex = values.findIndex((row) => {
      if (row.length === 0) return false;
      const sheetValue = row[0] ? row[0].toString().trim() : "";
      return sheetValue === trimmedUid;
    });

    if (rowIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Row not found with this UID",
          searchedFor: uid,
        },
        { status: 404 }
      );
    }

    const sheetRowNumber = 7 + rowIndex;

    // Batch update (W: STATUS_2, Y: REVISED_AMOUNT_3, Z: APPROVAL_DOER_2, AA: REMARK_2)
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: `Dimension_Office_Payment!W${sheetRowNumber}`,
            values: [[STATUS_2 || ""]],
          },
          {
            range: `Dimension_Office_Payment!Y${sheetRowNumber}`,
            values: [[REVISED_AMOUNT_3 || ""]],
          },
          {
            range: `Dimension_Office_Payment!Z${sheetRowNumber}`,
            values: [[APPROVAL_DOER_2 || ""]],
          },
          {
            range: `Dimension_Office_Payment!AA${sheetRowNumber}`,
            values: [[REMARK_2 || ""]],
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data updated successfully",
    });
  } catch (error) {
    console.error("DIM Approve1 POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}