// // app/api/advanceform/route.js
// import { NextResponse } from 'next/server';
// import { sheets, spreadsheetId } from '@/app/api/config/googleSheet';

// const SHEET_NAME = 'Advance_Payment';

// // ===================== HELPERS =====================
// function getISTTimestamp() {
//   const now = new Date();
//   const istOffset = 5.5 * 60 * 60 * 1000;
//   const istDate = new Date(now.getTime() + istOffset);
//   const dd = String(istDate.getUTCDate()).padStart(2, '0');
//   const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
//   const yyyy = istDate.getUTCFullYear();
//   const hh = String(istDate.getUTCHours()).padStart(2, '0');
//   const min = String(istDate.getUTCMinutes()).padStart(2, '0');
//   const ss = String(istDate.getUTCSeconds()).padStart(2, '0');
//   return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
// }
// // ✅ UID Generator - DIM-ADVS-0001 format
// async function generateUID() {
//   try {
//     // Sheet ke B column se saari existing UIDs fetch karo
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: `${SHEET_NAME}!B:B`,
//     });

//     const rows = response.data.values || [];
//     let maxNumber = 0;

//     // Har row check karo - highest UID number nikalo
//     for (let i = 0; i < rows.length; i++) {
//       const uid = rows[i]?.[0];
//       if (uid && typeof uid === 'string' && uid.startsWith('DIM-ADVS-')) {
//         // DIM-ADVS-0001 se number extract karo
//         const numPart = uid.replace('DIM-ADVS-', '');
//         const num = parseInt(numPart, 10);
//         if (!isNaN(num) && num > maxNumber) {
//           maxNumber = num;
//         }
//       }
//     }

//     // Next UID generate karo
//     const nextNumber = maxNumber + 1;
//     const newUID = `DIM-ADVS-${nextNumber.toString().padStart(4, '0')}`;

//     // ✅ Double check - ye UID pehle se exist to nahi karti
//     const allUIDs = rows
//       .map((row) => row[0])
//       .filter(Boolean)
//       .map((uid) => uid.toString().trim());

//     if (allUIDs.includes(newUID)) {
//       // Agar somehow exist karti hai to next wali do
//       const safeNumber = nextNumber + 1;
//       const safeUID = `DIM-ADVS-${safeNumber.toString().padStart(4, '0')}`;
//       console.log(`⚠️ UID ${newUID} already exists, using ${safeUID}`);
//       return safeUID;
//     }

//     console.log(`✅ Generated UID: ${newUID}`);
//     return newUID;

//   } catch (error) {
//     console.error('❌ Error generating UID:', error);
//     // Fallback - timestamp based unique UID
//     const fallback = `DIM-ADVS-${Date.now().toString().slice(-4)}`;
//     return fallback;
//   }
// }

// // ===================== GET =====================
// // Bank names fetch from Project_Data!B4:B
// export async function GET() {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Project_Data!B4:B',
//     });

//     const rows = response.data.values || [];

//     const bankNames = [
//       ...new Set(
//         rows
//           .map((row) => row[0])
//           .filter(Boolean)
//           .map((name) => name.toString().trim())
//       ),
//     ];

//     console.log(`✅ Bank names fetched: ${bankNames.length}`);

//     return NextResponse.json({
//       type: 'bankNames',
//       data: bankNames,
//     });

//   } catch (error) {
//     console.error('GET Error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error', details: error.message },
//       { status: 500 }
//     );
//   }
// }

// // ===================== POST =====================
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const {
//       officeName,
//       vendorFirmName,
//       paidAmount,
//       bankDetails,
//       paymentMode,
//       paymentDetails,
//       paymentDate,
//     } = body;

//     // ✅ Validation
//     if (!officeName?.trim()) {
//       return NextResponse.json(
//         { error: 'Office Name is required' },
//         { status: 400 }
//       );
//     }
//     if (!vendorFirmName?.trim()) {
//       return NextResponse.json(
//         { error: 'Vendor Firm Name is required' },
//         { status: 400 }
//       );
//     }
//     if (!paidAmount || Number(paidAmount) <= 0) {
//       return NextResponse.json(
//         { error: 'Paid Amount must be greater than 0' },
//         { status: 400 }
//       );
//     }
//     if (!bankDetails?.trim()) {
//       return NextResponse.json(
//         { error: 'Bank Details is required' },
//         { status: 400 }
//       );
//     }
//     if (!paymentMode?.trim()) {
//       return NextResponse.json(
//         { error: 'Payment Mode is required' },
//         { status: 400 }
//       );
//     }
//     if (!paymentDate) {
//       return NextResponse.json(
//         { error: 'Payment Date is required' },
//         { status: 400 }
//       );
//     }

//     const timestamp = getISTTimestamp();

//     // ✅ UID generate karo - unique check ke sath
//     const uid = await generateUID();

//     // ✅ Row: A=Timestamp, B=UID, C=OfficeName, D=VendorFirmName, 
//     //         E=PaidAmount, F=BankDetails, G=PaymentMode, H=PaymentDetails, I=PaymentDate
//     const row = [
//       timestamp,                        // A: Timestamp
//       uid,                              // B: UID (DIM-ADVS-0001)
//       officeName.trim(),                // C: Office Name
//       vendorFirmName.trim(),            // D: VENDOR FIRM NAME 16
//       Number(paidAmount),               // E: PAID_AMOUNT_17
//       bankDetails.trim(),               // F: BANK_DETAILS_17
//       paymentMode.trim(),               // G: PAYMENT_MODE_17
//       (paymentDetails || '').trim(),    // H: PAYMENT_DETAILS_17
//       paymentDate,                      // I: PAYMENT DATE_18
//     ];

//     await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: `${SHEET_NAME}!A:I`,
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       requestBody: { values: [row] },
//     });

//     console.log(`✅ Advance Payment | UID: ${uid} | ${officeName} | ₹${paidAmount}`);

//     return NextResponse.json(
//       {
//         success: true,
//         message: 'Advance payment submitted successfully',
//         data: {
//           uid,
//           timestamp,
//           officeName,
//           vendorFirmName,
//           paidAmount: Number(paidAmount),
//           bankDetails,
//           paymentMode,
//           paymentDate,
//         },
//       },
//       { status: 201 }
//     );

//   } catch (error) {
//     console.error('POST Error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error', details: error.message },
//       { status: 500 }
//     );
//   }
// }





// app/api/advanceform/route.js
import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '@/app/api/config/googleSheet';

const SHEET_NAME = 'Advance_Payment';

// ===================== HELPERS =====================

function getISTTimestamp() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const dd = String(istDate.getUTCDate()).padStart(2, '0');
  const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = istDate.getUTCFullYear();
  const hh = String(istDate.getUTCHours()).padStart(2, '0');
  const min = String(istDate.getUTCMinutes()).padStart(2, '0');
  const ss = String(istDate.getUTCSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

// ✅ UID Generator - DIM-ADVS-0001 format
async function generateUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!B:B`,
    });

    const rows = response.data.values || [];
    let maxNumber = 0;

    for (let i = 0; i < rows.length; i++) {
      const uid = rows[i]?.[0];
      if (uid && typeof uid === 'string' && uid.startsWith('DIM-ADVS-')) {
        const numPart = uid.replace('DIM-ADVS-', '');
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    const newUID = `DIM-ADVS-${nextNumber.toString().padStart(4, '0')}`;

    const allUIDs = rows
      .map((row) => row[0])
      .filter(Boolean)
      .map((uid) => uid.toString().trim());

    if (allUIDs.includes(newUID)) {
      const safeNumber = nextNumber + 1;
      const safeUID = `DIM-ADVS-${safeNumber.toString().padStart(4, '0')}`;
      console.log(`⚠️ UID ${newUID} already exists, using ${safeUID}`);
      return safeUID;
    }

    console.log(`✅ Generated UID: ${newUID}`);
    return newUID;

  } catch (error) {
    console.error('❌ Error generating UID:', error);
    const fallback = `DIM-ADVS-${Date.now().toString().slice(-4)}`;
    return fallback;
  }
}

// ===================== GET =====================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // ✅ Bank names from Project_Data!B4:B
    if (action === 'getBankNames') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Project_Data!B4:B',
      });

      const rows = response.data.values || [];
      const bankNames = [
        ...new Set(
          rows
            .map((row) => row[0])
            .filter(Boolean)
            .map((name) => name.toString().trim())
        ),
      ];

      console.log(`✅ Bank names fetched: ${bankNames.length}`);
      return NextResponse.json({ type: 'bankNames', data: bankNames });
    }

    // ✅ Office names from Project_Data!L4:L
    if (action === 'getOfficeNames') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Project_Data!L4:L',
      });

      const rows = response.data.values || [];
      const officeNames = [
        ...new Set(
          rows
            .map((row) => row[0])
            .filter(Boolean)
            .map((name) => name.toString().trim())
        ),
      ];

      console.log(`✅ Office names fetched: ${officeNames.length}`);
      return NextResponse.json({ type: 'officeNames', data: officeNames });
    }

    // ✅ Default - dono ek sath fetch (page load pe)
    const [bankRes, officeRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Project_Data!B4:B',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Project_Data!L4:L',
      }),
    ]);

    const bankRows = bankRes.data.values || [];
    const officeRows = officeRes.data.values || [];

    const bankNames = [
      ...new Set(
        bankRows
          .map((row) => row[0])
          .filter(Boolean)
          .map((name) => name.toString().trim())
      ),
    ];

    const officeNames = [
      ...new Set(
        officeRows
          .map((row) => row[0])
          .filter(Boolean)
          .map((name) => name.toString().trim())
      ),
    ];

    console.log(`✅ Loaded: ${bankNames.length} banks, ${officeNames.length} offices`);

    return NextResponse.json({
      type: 'dropdownData',
      data: {
        bankNames,
        officeNames,
      },
    });

  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ===================== POST =====================
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      officeName,
      vendorFirmName,
      paidAmount,
      bankDetails,
      paymentMode,
      paymentDetails,
      paymentDate,
    } = body;

    if (!officeName?.trim()) {
      return NextResponse.json({ error: 'Office Name is required' }, { status: 400 });
    }
    if (!vendorFirmName?.trim()) {
      return NextResponse.json({ error: 'Vendor Firm Name is required' }, { status: 400 });
    }
    if (!paidAmount || Number(paidAmount) <= 0) {
      return NextResponse.json({ error: 'Paid Amount must be greater than 0' }, { status: 400 });
    }
    if (!bankDetails?.trim()) {
      return NextResponse.json({ error: 'Bank Details is required' }, { status: 400 });
    }
    if (!paymentMode?.trim()) {
      return NextResponse.json({ error: 'Payment Mode is required' }, { status: 400 });
    }
    if (!paymentDate) {
      return NextResponse.json({ error: 'Payment Date is required' }, { status: 400 });
    }

    const timestamp = getISTTimestamp();
    const uid = await generateUID();

    const row = [
      timestamp,
      uid,
      officeName.trim(),
      vendorFirmName.trim(),
      Number(paidAmount),
      bankDetails.trim(),
      paymentMode.trim(),
      (paymentDetails || '').trim(),
      paymentDate,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    console.log(`✅ Advance Payment | UID: ${uid} | ${officeName} | ₹${paidAmount}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Advance payment submitted successfully',
        data: {
          uid,
          timestamp,
          officeName,
          vendorFirmName,
          paidAmount: Number(paidAmount),
          bankDetails,
          paymentMode,
          paymentDate,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}