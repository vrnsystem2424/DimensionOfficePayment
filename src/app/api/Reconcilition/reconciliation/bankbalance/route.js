import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../../config/googleSheet';

// GET - Bank Balance Fetch
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bankName = searchParams.get('bank');

    // Validation
    if (!bankName) {
      return NextResponse.json(
        { success: false, error: "Bank name is required" },
        { status: 400 }
      );
    }

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: "spreadsheetId is not configured" },
        { status: 500 }
      );
    }

    console.log("Fetching balance for bank:", bankName);

    // Bank tab se H3 cell fetch karo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${bankName}'!H3`,
    });

    const balance = response.data.values?.[0]?.[0] || "0";

    console.log("Balance found:", balance);

    return NextResponse.json({
      success: true,
      bank: bankName,
      balance: balance,
    });

  } catch (error) {
    console.error("Bank Balance Error:", error.message);
    
    if (error.message.includes('Unable to parse range') || 
        error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank sheet not found",
          details: `Sheet '${new URL(request.url).searchParams.get('bank')}' not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank balance",
        details: error.message,
      },
      { status: 500 }
    );
  }
}