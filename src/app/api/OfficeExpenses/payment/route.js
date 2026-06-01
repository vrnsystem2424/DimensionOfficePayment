

// import { NextResponse } from 'next/server';
// import { sheets, spreadsheetId } from '../../config/googleSheet';

// // ─── Helpers ─────────────────────────────────────────────────────────────────
// const getTimestamp = () => {
//   const now = new Date();
//   return now.toLocaleString('en-IN', {
//     timeZone: 'Asia/Kolkata',
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: true,
//   });
// };

// const parseAmount = (v) =>
//   Number((v || '0').toString().replace(/,/g, '').trim()) || 0;

// // ════════════════════════════════════════════════════════════════════════════
// // GET /api/dim-payment
// // ════════════════════════════════════════════════════════════════════════════
// export async function GET(request) {
//   try {
//     if (!spreadsheetId) {
//       return NextResponse.json(
//         { success: false, error: 'spreadsheetId is not configured' },
//         { status: 500 }
//       );
//     }

//     // ── 1. Main sheet fetch ──────────────────────────────────────────────
//     const mainResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Dimension_Office_Payment!A8:BM',
//     });
//     const rows = mainResponse.data.values || [];

//     // ── 2. Payment_Sheet history fetch ───────────────────────────────────
//     let paymentHistory = [];
//     try {
//       const paymentSheetResponse = await sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: 'Payment_Sheet!A2:P',
//       });
//       const paymentRows = paymentSheetResponse.data.values || [];

//       paymentHistory = paymentRows
//         .map((row) => ({
//           timestamp:       (row[0]  || '').toString().trim(),
//           actual_5:        (row[1]  || '').toString().trim(),
//           offBillUid:      (row[2]  || '').toString().trim(),
//           vendorName:      (row[3]  || '').toString().trim(),
//           billNo:          (row[4]  || '').toString().trim(),
//           billDate:        (row[5]  || '').toString().trim(),
//           netAmount:       parseAmount(row[6]),
//           paidAmount:      parseAmount(row[7]),
//           tdsAmount:       parseAmount(row[8]),
//           professionalTax: parseAmount(row[9]),
//           balanceAmount:   parseAmount(row[10]),
//           bankDetails:     (row[11] || '').toString().trim(),
//           paymentMode:     (row[12] || '').toString().trim(),
//           paymentDetails:  (row[13] || '').toString().trim(),
//           paymentDate:     (row[14] || '').toString().trim(),
//           grandTotal:      parseAmount(row[15]),
//         }));
//     } catch (err) {
//       console.warn('Payment_Sheet fetch failed:', err.message);
//     }

//     // ── 3. Group history by OFFBILLUID ───────────────────────────────────
//     const historyByOffBillUid = {};
//     paymentHistory.forEach((record) => {
//       const key = record.offBillUid;
//       if (!key) return;
//       if (!historyByOffBillUid[key]) historyByOffBillUid[key] = [];
//       historyByOffBillUid[key].push(record);
//     });

//     if (rows.length === 0) {
//       return NextResponse.json({
//         success: true,
//         message: 'No data found',
//         data: [],
//       });
//     }

//     // ── 4. Build response ────────────────────────────────────────────────
//     /*
//      * Column mapping (0-indexed from A):
//      *  1  = OFFBILLUID (B)
//      *  2  = uid (C)
//      *  3  = OFFICE_NAME_1 (D)
//      *  4  = PAYEE_NAME_1 (E)
//      *  5  = EXPENSES_HEAD_1 (F)
//      *  6  = EXPENSES_SUBHEAD_1 (G)
//      *  7  = ITEM_NAME_1 (H)
//      *  8  = UNIT_1 (I)
//      *  9  = SKU_CODE_1 (J)
//      * 10  = Qty_1 (K)
//      * 12  = DEPARTMENT_1 (M)
//      * 13  = APPROVAL_DOER (N)
//      * 14  = RAISED_BY_1 (O)
//      * 15  = Bill_Photo (P)
//      * 16  = PAYMENT_MODE_3 (Q)
//      * 24  = Amount (Y)
//      * 28  = BILL_NO_4 (AC) ← ✅ your correct column
//      * 38  = Vendor_Name_4 (AM)
//      * 40  = BILL_DATE_4 (AO)
//      * 41  = BASIC_AMOUNT (AP)
//      * 42  = CGST_4 (AQ)
//      * 43  = SGST_4 (AR)
//      * 44  = IGST_4 (AS)
//      * 45  = TOTAL_AMOUNT_4 (AT)
//      * 46  = TRASNPORT_CHARGES_4 (AU)
//      * 47  = Transport_Gst_4 (AV)
//      * 48  = NET_AMOUNT_4 (AW)
//      * 49  = REMARK_4 (AX)
//      * 51  = PLANNED_5 (AZ)
//      * 52  = ACTUAL_5 (BA)
//      *
//      * Stage 5 fields (BD–BM = 55–64):
//      * 55 = Net_Amount_5 (BD)
//      * 56 = PAID_AMOUNT_5 (BE)
//      * 57 = TDS_Amount (BF)
//      * 58 = Profestionl_Tax_5 (BG)
//      * 59 = BALANCE_AMOUNT_5 (BH)
//      * 60 = BANK_DETAILS_5 (BI)
//      * 61 = PAYMENT_MODE_5 (BJ)
//      * 62 = PAYMENT_DETAILS_5 (BK)
//      * 63 = PAYMENT_DATE_5 (BL)
//      * 64 = Remark_5 (BM)
//      */

//     const filteredData = rows
//       .map((row) => {
//         const offBillUid = (row[1] || '').toString().trim();
//         const uid        = (row[2] || '').toString().trim();
//         const planned5   = (row[51] || '').toString().trim();
//         const totalAmt4  = parseAmount(row[45]);
//         const mainBalance = parseAmount(row[59]); // BH

//         const billHistory = historyByOffBillUid[offBillUid] || [];

//         const totalAlreadyPaid = billHistory.reduce(
//           (sum, h) => sum + h.paidAmount, 0
//         );

//         // ✅ Latest balance from Payment_Sheet
//         const latestBalance = billHistory.length > 0
//           ? billHistory[billHistory.length - 1].balanceAmount
//           : null;

//         // ✅ Current outstanding logic
//         const currentOutstanding =
//           latestBalance !== null
//             ? latestBalance
//             : mainBalance > 0
//               ? mainBalance
//               : totalAmt4;

//         return {
//           OFFBILLUID:          offBillUid,
//           uid,
//           OFFICE_NAME_1:       (row[3]  || '').toString().trim(),
//           PAYEE_NAME_1:        (row[4]  || '').toString().trim(),
//           EXPENSES_HEAD_1:     (row[5]  || '').toString().trim(),
//           EXPENSES_SUBHEAD_1:  (row[6]  || '').toString().trim(),
//           ITEM_NAME_1:         (row[7]  || '').toString().trim(),
//           UNIT_1:              (row[8]  || '').toString().trim(),
//           SKU_CODE_1:          (row[9]  || '').toString().trim(),
//           Qty_1:               (row[10] || '').toString().trim(),
//           Amount:              (row[24] || '').toString().trim(),
//           DEPARTMENT_1:        (row[12] || '').toString().trim(),
//           APPROVAL_DOER:       (row[13] || '').toString().trim(),
//           RAISED_BY_1:         (row[14] || '').toString().trim(),
//           Bill_Photo:          (row[15] || '').toString().trim(),
//           PAYMENT_MODE_3:      (row[16] || '').toString().trim(),

//           Vendor_Name_4:       (row[38] || '').toString().trim(),
//           BILL_NO_4:           (row[28] || '').toString().trim(), // ✅ row[28]
//           BILL_DATE_4:         (row[40] || '').toString().trim(),
//           BASIC_AMOUNT:        (row[41] || '').toString().trim(),
//           CGST_4:              (row[42] || '').toString().trim(),
//           SGST_4:              (row[43] || '').toString().trim(),
//           IGST_4:              (row[44] || '').toString().trim(),
//           TOTAL_AMOUNT_4:      (row[45] || '').toString().trim(),
//           TRASNPORT_CHARGES_4: (row[46] || '').toString().trim(),
//           Transport_Gst_4:     (row[47] || '').toString().trim(),
//           NET_AMOUNT_4:        (row[48] || '').toString().trim(),
//           REMARK_4:            (row[49] || '').toString().trim(),
//           PLANNED_5:           planned5,
//           ACTUAL_5:            (row[52] || '').toString().trim(),

//           // Stage 5 main sheet fields
//           NET_AMOUNT_5:        (row[55] || '').toString().trim(),
//           PAID_AMOUNT_5:       (row[56] || '').toString().trim(),
//           TDS_Amount:          (row[57] || '').toString().trim(),
//           Profestionl_Tax_5:   (row[58] || '').toString().trim(),
//           BALANCE_AMOUNT_5:    (row[59] || '').toString().trim(),
//           BANK_DETAILS_5:      (row[60] || '').toString().trim(),
//           PAYMENT_MODE_5:      (row[61] || '').toString().trim(),
//           PAYMENT_DETAILS_5:   (row[62] || '').toString().trim(),
//           PAYMENT_DATE_5:      (row[63] || '').toString().trim(),
//           Remark_5:            (row[64] || '').toString().trim(),

//           // Payment history
//           paymentHistory:      billHistory,
//           totalAlreadyPaid,
//           latestBalance,
//           hasPartialPayment:   billHistory.length > 0,
//           currentOutstanding,
//         };
//       })
//       .filter((bill) => {
//         // ✅ Show only if PLANNED_5 exists AND currentOutstanding > 0
//         return bill.PLANNED_5 !== '' && bill.currentOutstanding > 0;
//       });

//     return NextResponse.json({
//       success: true,
//       totalRecords: filteredData.length,
//       data: filteredData,
//     });
//   } catch (error) {
//     console.error('GET Error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch', details: error.message },
//       { status: 500 }
//     );
//   }
// }

// // ════════════════════════════════════════════════════════════════════════════
// // POST /api/dim-payment
// // ════════════════════════════════════════════════════════════════════════════
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     console.log('Received body:', body);

//     const {
//       uid,
//       OFFBILLUID,
//       NET_AMOUNT_5,
//       PAID_AMOUNT_5,
//       TDS_5,
//       PROFESSIONAL_TAX_5,
//       BALANCE_AMOUNT_5,
//       BANK_DETAILS_5,
//       PAYMENT_MODE_5,
//       PAYMENT_DETAILS_5,
//       PAYMENT_DATE_5,
//       ACTUAL_5,
//       GRAND_TOTAL,
//       Remark_5,
//       Vendor_Name_4,
//       BILL_NO_4,
//       BILL_DATE_4,
//     } = body;

//     if (!uid) {
//       return NextResponse.json(
//         { success: false, message: 'UID is required' },
//         { status: 400 }
//       );
//     }

//     const trimmedUid = String(uid).trim();

//     // ── Find row by UID ──────────────────────────────────────────────────
//     const getResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Dimension_Office_Payment!C8:C',
//     });

//     const values = getResponse.data.values || [];
//     const rowIndex = values.findIndex(
//       (row) => (row?.[0] ? String(row[0]).trim() : '') === trimmedUid
//     );

//     if (rowIndex === -1) {
//       return NextResponse.json(
//         { success: false, message: 'Row not found with this UID', searchedFor: trimmedUid },
//         { status: 404 }
//       );
//     }

//     const sheetRowNumber = 8 + rowIndex;
//     console.log(`Match found → Row: ${sheetRowNumber}`);

//     // ── Update Dimension_Office_Payment ──────────────────────────────────
//     /*
//      * BD (55) = Net_Amount_5
//      * BE (56) = PAID_AMOUNT_5
//      * BF (57) = TDS_Amount
//      * BG (58) = Profestionl_Tax_5
//      * BH (59) = BALANCE_AMOUNT_5
//      * BI (60) = BANK_DETAILS_5
//      * BJ (61) = PAYMENT_MODE_5
//      * BK (62) = PAYMENT_DETAILS_5
//      * BL (63) = PAYMENT DATE_5
//      * BM (64) = Remark_5
//      */
//     const updates = [
//       { range: `Dimension_Office_Payment!BD${sheetRowNumber}`, values: [[NET_AMOUNT_5 ?? '']] },
//       { range: `Dimension_Office_Payment!BE${sheetRowNumber}`, values: [[PAID_AMOUNT_5 ?? '']] },
//       { range: `Dimension_Office_Payment!BF${sheetRowNumber}`, values: [[TDS_5 ?? '']] },
//       { range: `Dimension_Office_Payment!BG${sheetRowNumber}`, values: [[PROFESSIONAL_TAX_5 ?? '']] },
//       { range: `Dimension_Office_Payment!BH${sheetRowNumber}`, values: [[BALANCE_AMOUNT_5 ?? '']] },
//       { range: `Dimension_Office_Payment!BI${sheetRowNumber}`, values: [[BANK_DETAILS_5 ?? '']] },
//       { range: `Dimension_Office_Payment!BJ${sheetRowNumber}`, values: [[PAYMENT_MODE_5 ?? '']] },
//       { range: `Dimension_Office_Payment!BK${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5 ?? '']] },
//       { range: `Dimension_Office_Payment!BL${sheetRowNumber}`, values: [[PAYMENT_DATE_5 ?? '']] },
//       { range: `Dimension_Office_Payment!BM${sheetRowNumber}`, values: [[Remark_5 ?? '']] },
//     ];

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId,
//       resource: {
//         valueInputOption: 'USER_ENTERED',
//         data: updates,
//       },
//     });

//     // ── Append to Payment_Sheet ──────────────────────────────────────────
//     /*
//      * A = Timestamp
//      * B = Acutual_5
//      * C = Office_Bill_No. (OFFBILLUID)
//      * D = Vendor_Name_4
//      * E = BILL_NO_4
//      * F = BILL_DATE_4
//      * G = Net_Amount_5
//      * H = PAID_AMOUNT_5
//      * I = TDS_Amount
//      * J = Profestionl_Tax_5
//      * K = BALANCE_AMOUNT_5
//      * L = BANK_DETAILS_5
//      * M = PAYMENT_MODE_5
//      * N = PAYMENT_DETAILS_5
//      * O = PAYMENT DATE_5
//      * P = GRAND_TOTAL
//      */
//     const timestamp = getTimestamp();

//     const finalGrandTotal =
//       GRAND_TOTAL !== undefined && GRAND_TOTAL !== null && GRAND_TOTAL !== ''
//         ? GRAND_TOTAL
//         : parseAmount(PAID_AMOUNT_5) - parseAmount(TDS_5) - parseAmount(PROFESSIONAL_TAX_5);

//     const paymentRow = [
//       timestamp,                          // A
//       ACTUAL_5 || PAYMENT_DATE_5 || '',   // B
//       OFFBILLUID || '',                   // C ✅ OFFBILLUID
//       Vendor_Name_4 || '',                // D
//       BILL_NO_4 || '',                    // E ✅ row[28] value
//       BILL_DATE_4 || '',                  // F
//       NET_AMOUNT_5 || '',                 // G
//       PAID_AMOUNT_5 || '',                // H
//       TDS_5 || '',                        // I
//       PROFESSIONAL_TAX_5 || '',           // J
//       BALANCE_AMOUNT_5 || '',             // K
//       BANK_DETAILS_5 || '',               // L
//       PAYMENT_MODE_5 || '',               // M
//       PAYMENT_DETAILS_5 || '',            // N
//       PAYMENT_DATE_5 || '',               // O
//       finalGrandTotal || '',              // P
//     ];

//     await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: 'Payment_Sheet!A:P',
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       resource: { values: [paymentRow] },
//     });

//     console.log(`✅ Row ${sheetRowNumber} updated + Payment_Sheet appended`);

//     return NextResponse.json({
//       success: true,
//       message: 'Payment data updated successfully',
//       updatedRow: sheetRowNumber,
//       paymentSheetAppended: true,
//       balanceRemaining: BALANCE_AMOUNT_5,
//     });
//   } catch (error) {
//     console.error('POST Error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Server error', error: error.message },
//       { status: 500 }
//     );
//   }
// }







import { NextResponse } from 'next/server';
import { sheets, spreadsheetId } from '../../config/googleSheet';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ✅ Format: DD/MM/YYYY HH:MM:SS
const getFormattedDateTime = () => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return `${d}/${m}/${y} ${h}:${min}:${sec}`;
};

const parseAmount = (v) =>
  Number((v || '0').toString().replace(/,/g, '').trim()) || 0;

// ════════════════════════════════════════════════════════════════════════════
// GET /api/dim-payment
// ════════════════════════════════════════════════════════════════════════════
export async function GET(request) {
  try {
    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'spreadsheetId is not configured' },
        { status: 500 }
      );
    }

    // ── 1. Main sheet fetch ──
    const mainResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Dimension_Office_Payment!A8:BM',
    });
    const rows = mainResponse.data.values || [];

    // ── 2. Payment_Sheet history fetch ──
    let paymentHistory = [];
    try {
      const paymentSheetResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Payment_Sheet!A2:P',
      });
      const paymentRows = paymentSheetResponse.data.values || [];

      paymentHistory = paymentRows.map((row) => ({
        timestamp:       (row[0]  || '').toString().trim(),
        actual_5:        (row[1]  || '').toString().trim(),
        offBillUid:      (row[2]  || '').toString().trim(),
        vendorName:      (row[3]  || '').toString().trim(),
        billNo:          (row[4]  || '').toString().trim(),
        billDate:        (row[5]  || '').toString().trim(),
        netAmount:       parseAmount(row[6]),
        paidAmount:      parseAmount(row[7]),
        tdsAmount:       parseAmount(row[8]),
        professionalTax: parseAmount(row[9]),
        balanceAmount:   parseAmount(row[10]),
        bankDetails:     (row[11] || '').toString().trim(),
        paymentMode:     (row[12] || '').toString().trim(),
        paymentDetails:  (row[13] || '').toString().trim(),
        paymentDate:     (row[14] || '').toString().trim(),
        grandTotal:      parseAmount(row[15]),
      }));
    } catch (err) {
      console.warn('Payment_Sheet fetch failed:', err.message);
    }

    // ── 3. Group ALL history by OFFBILLUID ──
    const allHistoryByOffBillUid = {};
    paymentHistory.forEach((record) => {
      const key = record.offBillUid;
      if (!key) return;
      if (!allHistoryByOffBillUid[key]) allHistoryByOffBillUid[key] = [];
      allHistoryByOffBillUid[key].push(record);
    });

    if (rows.length === 0) {
      return NextResponse.json({ success: true, message: 'No data found', data: [] });
    }

    // ── 4. Build response ──
    const filteredData = rows
      .map((row) => {
        const offBillUid = (row[1] || '').toString().trim();
        const uid        = (row[2] || '').toString().trim();
        const planned5   = (row[51] || '').toString().trim();
        const totalAmt4  = parseAmount(row[45]);

        // All history (for display)
        const billHistory = allHistoryByOffBillUid[offBillUid] || [];

        // Total paid from ALL history entries
        const totalAlreadyPaid = billHistory.reduce(
          (sum, h) => sum + h.paidAmount, 0
        );

        // Total TDS from all history
        const totalHistoryTds = billHistory.reduce(
          (sum, h) => sum + h.tdsAmount, 0
        );

        // Total Prof Tax from all history
        const totalHistoryPT = billHistory.reduce(
          (sum, h) => sum + h.professionalTax, 0
        );

        // Latest balance from Payment_Sheet
        const latestBalance = billHistory.length > 0
          ? billHistory[billHistory.length - 1].balanceAmount
          : null;

        // Main sheet balance
        const mainBalance = parseAmount(row[59]); // BH

        // Current outstanding
        const currentOutstanding =
          latestBalance !== null
            ? latestBalance
            : mainBalance > 0
              ? mainBalance
              : totalAmt4;

        return {
          OFFBILLUID:          offBillUid,
          uid,
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
          PLANNED_5:           planned5,
          ACTUAL_5:            (row[52] || '').toString().trim(),

          // Stage 5 main sheet values
          NET_AMOUNT_5:        (row[55] || '').toString().trim(),
          PAID_AMOUNT_5:       (row[56] || '').toString().trim(),
          TDS_Amount:          (row[57] || '').toString().trim(),
          Profestionl_Tax_5:   (row[58] || '').toString().trim(),
          BALANCE_AMOUNT_5:    (row[59] || '').toString().trim(),
          STATUS_5:            (row[53] || '').toString().trim(),

          // Payment history
          paymentHistory:      billHistory,
          totalAlreadyPaid,
          totalHistoryTds,
          totalHistoryPT,
          latestBalance,
          hasPartialPayment:   billHistory.length > 0,
          currentOutstanding,
        };
      })
      .filter((bill) => {
        // ✅ Show only if PLANNED_5 exists AND outstanding > 0
        return bill.PLANNED_5 !== '' && bill.currentOutstanding > 0;
      });

    return NextResponse.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch', details: error.message },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// POST /api/dim-payment
// ════════════════════════════════════════════════════════════════════════════
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received body:', body);

    const {
      uid,
      OFFBILLUID,
      NET_AMOUNT_5,
      PAID_AMOUNT_5,
      TDS_5,
      PROFESSIONAL_TAX_5,
      BALANCE_AMOUNT_5,
      BANK_DETAILS_5,
      PAYMENT_MODE_5,
      PAYMENT_DETAILS_5,
      PAYMENT_DATE_5,
      GRAND_TOTAL,
      Remark_5,
      Vendor_Name_4,
      BILL_DATE_4,
    } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'UID is required' },
        { status: 400 }
      );
    }

    const trimmedUid = String(uid).trim();

    // ── Find row by UID ─────────────────────────────────────────────
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Dimension_Office_Payment!C8:C',
    });

    const values = getResponse.data.values || [];
    const rowIndex = values.findIndex(
      (row) => (row?.[0] ? String(row[0]).trim() : '') === trimmedUid
    );

    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Row not found with this UID' },
        { status: 404 }
      );
    }

    const sheetRowNumber = 8 + rowIndex;

    // ── Read existing values from main sheet ────────────────────────
    const currentRowResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Dimension_Office_Payment!BB${sheetRowNumber}:BM${sheetRowNumber}`,
    });

    const currentRowData = currentRowResponse.data.values?.[0] || [];

    // BB to BM mapping (relative to BB:BM range):
    // index 0 = BB (STATUS_5)
    // index 2 = BD (NET_AMOUNT_5)
    // index 3 = BE (PAID_AMOUNT_5)
    // index 4 = BF (TDS_Amount)
    // index 5 = BG (ProfTax)
    // index 6 = BH (BALANCE)

    const existingPaidAmount = parseAmount(currentRowData[3]); // BE
    const existingTDS = parseAmount(currentRowData[4]);        // BF
    const existingProfTax = parseAmount(currentRowData[5]);    // BG

    const currentPaidNumber = parseAmount(PAID_AMOUNT_5);
    const newTDS = parseAmount(TDS_5);
    const newProfTax = parseAmount(PROFESSIONAL_TAX_5);
    const balanceNumber = parseAmount(BALANCE_AMOUNT_5);

    // ✅ NEW LOGIC: Paid Amount me se TDS aur Prof. Tax MINUS karo
    // Example: Paid=77,662 − TDS=331 − PT=500 = 76,831 (yahi PAID me jayega)
    const netPaidThisInstalment = currentPaidNumber - newTDS - newProfTax;

    // ✅ Accumulated PAID (with deductions)
    const accumulatedPaid = existingPaidAmount + netPaidThisInstalment;

    // ✅ TDS & Prof. Tax — accumulate, never overwrite with empty
    const finalTDS = newTDS > 0 ? existingTDS + newTDS : existingTDS;
    const finalProfTax = newProfTax > 0 ? existingProfTax + newProfTax : existingProfTax;

    // ✅ STATUS: Done / Partial
    const status = balanceNumber <= 0 ? 'Done' : 'Partial';

    // ── Read BILL_NO_4 from AN column ───────────────────────────────
    const billNoResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Dimension_Office_Payment!AN${sheetRowNumber}`,
    });

    const mainSheetBillNo =
      billNoResponse.data.values?.[0]?.[0]
        ? String(billNoResponse.data.values[0][0]).trim()
        : '';

    console.log('═════════════════════════════════════════');
    console.log('Paid entered:', currentPaidNumber);
    console.log('TDS:', newTDS);
    console.log('Prof. Tax:', newProfTax);
    console.log('✅ Net Paid (after deductions):', netPaidThisInstalment);
    console.log('Accumulated Paid:', accumulatedPaid);
    console.log('Final TDS:', finalTDS);
    console.log('Final Prof. Tax:', finalProfTax);
    console.log('Balance:', balanceNumber);
    console.log('Status:', status);
    console.log('═════════════════════════════════════════');

    // ── Update main sheet ───────────────────────────────────────────
    const updates = [
      {
        range: `Dimension_Office_Payment!BB${sheetRowNumber}`, // STATUS_5
        values: [[status]],
      },
      {
        range: `Dimension_Office_Payment!BD${sheetRowNumber}`, // NET_AMOUNT_5
        values: [[NET_AMOUNT_5 || '']],
      },
      {
        range: `Dimension_Office_Payment!BE${sheetRowNumber}`, // ✅ PAID after deductions
        values: [[accumulatedPaid]],
      },
      {
        range: `Dimension_Office_Payment!BF${sheetRowNumber}`, // TDS
        values: [[finalTDS > 0 ? finalTDS : '']],
      },
      {
        range: `Dimension_Office_Payment!BG${sheetRowNumber}`, // ProfTax
        values: [[finalProfTax > 0 ? finalProfTax : '']],
      },
      {
        range: `Dimension_Office_Payment!BH${sheetRowNumber}`, // BALANCE
        values: [[balanceNumber]],
      },
      {
        range: `Dimension_Office_Payment!BI${sheetRowNumber}`,
        values: [[BANK_DETAILS_5 || '']],
      },
      {
        range: `Dimension_Office_Payment!BJ${sheetRowNumber}`,
        values: [[PAYMENT_MODE_5 || '']],
      },
      {
        range: `Dimension_Office_Payment!BK${sheetRowNumber}`,
        values: [[PAYMENT_DETAILS_5 || '']],
      },
      {
        range: `Dimension_Office_Payment!BL${sheetRowNumber}`,
        values: [[PAYMENT_DATE_5 || '']],
      },
      {
        range: `Dimension_Office_Payment!BM${sheetRowNumber}`,
        values: [[Remark_5 || '']],
      },
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });

    // ── Append to Payment_Sheet ─────────────────────────────────────
    const formattedDateTime = getFormattedDateTime();

    const finalGrandTotal =
      GRAND_TOTAL !== undefined && GRAND_TOTAL !== null && GRAND_TOTAL !== ''
        ? GRAND_TOTAL
        : netPaidThisInstalment;

    const paymentRow = [
      formattedDateTime,              // A - Timestamp
      formattedDateTime,              // B - Acutual_5
      OFFBILLUID || '',               // C - Office_Bill_No.
      Vendor_Name_4 || '',            // D - Vendor_Name_4
      mainSheetBillNo || '',          // E - BILL_NO_4 from AN
      BILL_DATE_4 || '',              // F - BILL_DATE_4
      NET_AMOUNT_5 || '',             // G - Net_Amount_5
      netPaidThisInstalment || '',    // H - ✅ PAID (after TDS & PT deduction)
      newTDS || '',                   // I - TDS_Amount
      newProfTax || '',               // J - Profestionl_Tax_5
      balanceNumber,                  // K - BALANCE_AMOUNT_5
      BANK_DETAILS_5 || '',           // L - BANK_DETAILS_5
      PAYMENT_MODE_5 || '',           // M - PAYMENT_MODE_5
      PAYMENT_DETAILS_5 || '',        // N - PAYMENT_DETAILS_5
      PAYMENT_DATE_5 || '',           // O - PAYMENT DATE_5
      finalGrandTotal || '',          // P - GRAND_TOTAL
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Payment_Sheet!A:P',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [paymentRow] },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment data updated successfully',
      updatedRow: sheetRowNumber,
      billNoUsed: mainSheetBillNo,
      status,
      paidEntered: currentPaidNumber,
      netPaidAfterDeductions: netPaidThisInstalment,
      accumulatedPaid,
      finalTDS,
      finalProfTax,
      balanceRemaining: balanceNumber,
    });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}