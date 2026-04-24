

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
      range: "Client_Payment_In_FMS!A7:N",
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
      .filter((row) => row[12] && !row[13])
      .map((row) => ({
        UID: (row[1] || "").toString().trim(),
        Timestap: (row[0] || "").toString().trim(),
        Project_Name: (row[2] || "").toString().trim(),
        Amount: (row[3] || "").toString().trim(),
        CGST: (row[4] || "").toString().trim(),
        SGST: (row[5] || "").toString().trim(),
        Net_Amount: (row[6] || "").toString().trim(),
        Credit_Account_Name: (row[7] || "").toString().trim(),
        Payment_Mode: (row[8] || "").toString().trim(),
        Cheque_No: (row[9] || "").toString().trim(),
        Cheque_Date: (row[10] || "").toString().trim(),
        Cheque_Photo: (row[11] || "").toString().trim(),
        PLANNED_2: (row[12] || "").toString().trim(),
        ACTUAL_2: (row[13] || "").toString().trim(),
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
        error: "Failed to fetch ",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, STATUS_2,  REMARK_2 } = body;

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
      range: "Client_Payment_In_FMS!B8:B",
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
            range: `Client_Payment_In_FMS!O${sheetRowNumber}`,
            values: [[STATUS_2 || ""]],
          },
         
          {
            range: `Client_Payment_In_FMS!Q${sheetRowNumber}`,
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
    console.error(" POST Error:", error);
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