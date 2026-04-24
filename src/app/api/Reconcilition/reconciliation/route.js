import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../config/googleSheet';

// GET - Pending Approvals Fetch
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
      range: "Out_FMS!A7:M",
    });

    let rows = response.data.values || [];

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No data found",
        data: [],
      });
    }

    // Filter pending approval
    const filteredData = rows
      .filter((row) => row[11] && !row[12])
      .map((row) => ({
        UID: (row[0] || "").toString().trim(),
        Timestap: (row[1] || "").toString().trim(),
        Contractor_Vendor_Firm_Name: (row[2] || "").toString().trim(),
        PAID_AMOUNT: (row[3] || "").toString().trim(),
        BANK_DETAILS: (row[4] || "").toString().trim(),
        PAYMENT_MODE: (row[5] || "").toString().trim(),
        PAYMENT_DETAILS: (row[6] || "").toString().trim(),
        PAYMENT_DATE: (row[7] || "").toString().trim(),
        EXP_HEAD: (row[8] || "").toString().trim(),
        PLANNED_2: (row[11] || "").toString().trim(),
        ACTUAL_2: (row[12] || "").toString().trim(),
      }));

    return NextResponse.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Update Approval
export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, STATUS_2, BANK_CLOSING_BALANCE_2, REMARK_2 } = body;

    console.log("Received update body:", body);

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

    // Find row by UID
    const findResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Out_FMS!A7:A",
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

    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: `Out_FMS!N${sheetRowNumber}`,
            values: [[STATUS_2 || ""]],
          },
          {
            range: `Out_FMS!P${sheetRowNumber}`,
            values: [[BANK_CLOSING_BALANCE_2 || ""]],
          },
          {
            range: `Out_FMS!Q${sheetRowNumber}`,
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
    console.error("POST Error:", error);
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