
import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../config/googleSheet';

export async function GET() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!A4:B',
    });

    const rows = response.data.values || [];

    const projectNames = rows
      .map(row => row[0]?.toString().trim())
      .filter(val => val);

    const accounts = rows
      .map(row => row[1]?.toString().trim())
      .filter(val => val);

    return NextResponse.json({
      success: true,
      projectNames,
      accounts,
    });

  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch dropdown data',
        error: error.message,
      },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const body = await request.json();

    const {
      projectName,
      bankPayment,
      chargesInterestDetails,
      bankName,
      amount,
      paymentMode,
      paymentDate,
      remark,
    } = body;

    // Validation
    if (
      !projectName ||
      !bankPayment ||
      !chargesInterestDetails ||
      !bankName ||
      !amount ||
      !paymentMode ||
      !paymentDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Required fields: projectName, bankPayment, chargesInterestDetails, bankName, amount, paymentMode, paymentDate',
        },
        { status: 400 }
      );
    }

    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bank_Intrest_&_Charges!A2:K1000',
    });

    const rows = existingData.data.values || [];

    // UID generation (Column B = index 1)
    let maxUID = 0;
    rows.forEach(row => {
      const uid = row[1]?.toString().trim();
      if (uid) {
        const num = parseInt(uid, 10);
        if (!isNaN(num) && num > maxUID) {
          maxUID = num;
        }
      }
    });

    const newUID = String(maxUID + 1).padStart(4, '0');

    const uidExists = rows.some(row => row[1]?.toString().trim() === newUID);
    if (uidExists) {
      return NextResponse.json(
        {
          success: false,
          message: `UID ${newUID} already exists in sheet`,
        },
        { status: 400 }
      );
    }

    // PAYMENT_DETAILS generation (Column I = index 8)
    let maxPaymentNum = 0;
    rows.forEach(row => {
      const paymentDetails = row[8]?.toString().trim();
      if (paymentDetails && paymentDetails.startsWith('IC')) {
        const num = parseInt(paymentDetails.replace('IC', ''), 10);
        if (!isNaN(num) && num > maxPaymentNum) {
          maxPaymentNum = num;
        }
      }
    });

    const newPaymentDetails = 'IC' + String(maxPaymentNum + 1).padStart(4, '0');

    const paymentDetailsExists = rows.some(
      row => row[8]?.toString().trim() === newPaymentDetails
    );

    if (paymentDetailsExists) {
      return NextResponse.json(
        {
          success: false,
          message: `PAYMENT_DETAILS ${newPaymentDetails} already exists in sheet`,
        },
        { status: 400 }
      );
    }

    // India timestamp
    const indiaTime = new Date()
      .toLocaleString('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(',', '');

    const newRow = [
      indiaTime,              // A
      newUID,                 // B
      projectName,            // C
      bankPayment,            // D
      chargesInterestDetails, // E
      bankName,               // F
      amount,                 // G
      paymentMode,            // H
      newPaymentDetails,      // I
      paymentDate,            // J
      remark || '',           // K
    ];

    // Pehli empty row dhundho jahan Column A empty ho
    let targetRowNumber = null;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isEmptyRow = !row || row.length === 0 || !row[0]?.toString().trim();
      if (isEmptyRow) {
        targetRowNumber = i + 2;
        break;
      }
    }

    // Agar koi empty row nahi mili to last filled row ke baad likho
    if (!targetRowNumber) {
      targetRowNumber = rows.length + 2;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Bank_Intrest_&_Charges!A${targetRowNumber}:K${targetRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Data added successfully',
        data: {
          timestamp: indiaTime,
          uid: newUID,
          projectName,
          bankPayment,
          chargesInterestDetails,
          bankName,
          amount,
          paymentMode,
          paymentDetails: newPaymentDetails,
          paymentDate,
          remark: remark || '',
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error adding bank interest data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to add data',
        error: error.message,
      },
      { status: 500 }
    );
  }
}