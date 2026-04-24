'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  useGetPendingDimExpensesQuery,
  useUpdateDimExpenseEntryMutation,
} from '../../../features/BillEntry'; // adjust path

import { RefreshCw, Search, X, FileText } from 'lucide-react';

export default function BillEntry() {
  const { data: apiResponse, isLoading, isError, refetch } = useGetPendingDimExpensesQuery();
  const [updateEntry, { isLoading: isSubmitting }] = useUpdateDimExpenseEntryMutation();

  const [selectedBillId, setSelectedBillId] = useState(''); // this is OFFBILLUID
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form states
  const [status, setStatus] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState('');
  const [items, setItems] = useState([]);           // one object per SHEET ROW (per uid)
  const [transportWOGST, setTransportWOGST] = useState(0);
  const [transportGSTPercent, setTransportGSTPercent] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const [remark, setRemark] = useState('');

  // ─── Data Preparation ────────────────────────────────────────
  const rawData = useMemo(() => apiResponse?.data || [], [apiResponse]);

  const parsedItems = useMemo(() => {
    return rawData.map(item => ({
      offBillUID: item.OFFBILLUID?.trim() || '',
      itemUid: item.uid?.trim() || '',                    // ← this is column C – per row
      office: item.OFFICE_NAME_1?.trim() || '',
      payee: item.PAYEE_NAME_1?.trim() || '',
      itemName: item.ITEM_NAME_1?.trim() || '',
      plannedAmount: Number(item.Amount?.replace(/,/g, '') || 0),
      photo: item.Bill_Photo?.trim() || 'No file uploaded',
    })).filter(i => i.offBillUID && i.itemUid);
  }, [rawData]);

  const billGroups = useMemo(() => {
    const groups = {};
    parsedItems.forEach(item => {
      const key = item.offBillUID;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [parsedItems]);

  const filteredBills = useMemo(() => {
    let bills = Object.keys(billGroups).map(id => ({
      id,
      label: `${id} • ${billGroups[id].length} items • ₹${billGroups[id].reduce((s, i) => s + i.plannedAmount, 0).toLocaleString('en-IN')}`,
      total: billGroups[id].reduce((s, i) => s + i.plannedAmount, 0),
    })).sort((a, b) => a.id.localeCompare(b.id));

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      bills = bills.filter(b => b.id.toLowerCase().includes(term));
    }
    return bills;
  }, [billGroups, searchTerm]);

  const currentGroup = billGroups[selectedBillId] || [];

  // When bill selected → init form with per-item data
  useEffect(() => {
    if (!selectedBillId || !currentGroup.length) return;

    const first = currentGroup[0];
    setVendorName(first.payee || '');
    setItems(currentGroup.map(it => ({
      itemUid: it.itemUid,                      // ← key for update
      itemName: it.itemName,
      amount: it.plannedAmount,
      gstType: 'CGST+SGST',
      gstPercent: 18,
      cgstAmt: 0,
      sgstAmt: 0,
      igstAmt: 0,
      rowTotal: it.plannedAmount,
    })));

    setStatus('');
    setBillNo('');
    setBillDate('');
    setTransportWOGST(0);
    setTransportGSTPercent(0);
    setAdjustment(0);
    setRemark('');
  }, [selectedBillId, currentGroup]);

  // Live GST & total calculation per row
  useEffect(() => {
    setItems(prev => prev.map(item => {
      const base = Number(item.amount) || 0;
      const rate = Number(item.gstPercent) / 100;
      let cgstAmt = 0, sgstAmt = 0, igstAmt = 0;

      if (item.gstType === 'CGST+SGST') {
        cgstAmt = base * rate / 2;
        sgstAmt = base * rate / 2;
      } else if (item.gstType === 'IGST') {
        igstAmt = base * rate;
      }

      const rowTotal = base + cgstAmt + sgstAmt + igstAmt;
      return { ...item, cgstAmt, sgstAmt, igstAmt, rowTotal };
    }));
  }, [items.map(i => `${i.amount}|${i.gstType}|${i.gstPercent}`).join(';')]);

  const itemsTotal = items.reduce((sum, i) => sum + (i.rowTotal || 0), 0);
  const transportGSTAmt = transportWOGST * (transportGSTPercent / 100);
  const grandTotal = itemsTotal + transportWOGST + transportGSTAmt + adjustment;

  // const handleSubmit = async () => {
  //   if (!billNo.trim() || !billDate || !status) {
  //     alert('Status, Bill No. और Bill Date अनिवार्य हैं');
  //     return;
  //   }

  //   try {
  //     // Update EACH ITEM ROW separately (different uid = different sheet row)
  //     const updatePromises = items.map(async (item) => {
  //       const payload = {
  //         uid: item.offBillUID,                      // ← send per-item uid (column C)
  //         STATUS_4: status,
  //         Vendor_Name_4: vendorName.trim(),
  //         BILL_NO_4: billNo.trim(),
  //         BILL_DATE_4: billDate,
  //         BASIC_AMOUNT_4: Number(item.amount).toFixed(2),
  //         CGST_4: item.cgstAmt.toFixed(2),
  //         SGST_4: item.sgstAmt.toFixed(2),
  //         IGST_4: item.igstAmt.toFixed(2),
  //         TOTAL_AMOUNT_4: item.rowTotal.toFixed(2),
  //         TRASNPORT_CHARGES_4: transportWOGST,
  //         Transport_Gst_4: transportGSTAmt.toFixed(2),
  //         NET_AMOUNT_4: grandTotal.toFixed(2),
  //         Remark_4: remark.trim(),
  //       };

  //       return updateEntry(payload).unwrap();
  //     });

  //     await Promise.all(updatePromises);

  //     alert(`Bill  के ${items.length} आइटम सफलतापूर्वक अपडेट हो गए`);
  //     setSelectedBillId('');
  //     refetch();
  //   } catch (err) {
  //     console.error(err);
  //     alert('Update failed: ' + (err?.data?.message || 'Unknown error'));
  //   }
  // };



  const handleSubmit = async () => {
  if (!billNo.trim() || !billDate || !status) {
    alert('Status, Bill No. और Bill Date अनिवार्य हैं');
    return;
  }

  try {
    // सभी items से totals calculate कर लो (backend को detailed breakdown न देना हो तो)
    const totalBasic = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const totalCGST  = items.reduce((sum, i) => sum + (i.cgstAmt || 0), 0);
    const totalSGST  = items.reduce((sum, i) => sum + (i.sgstAmt || 0), 0);
    const totalIGST  = items.reduce((sum, i) => sum + (i.igstAmt || 0), 0);
    const totalRow   = items.reduce((sum, i) => sum + (i.rowTotal || 0), 0);

    const transportGSTAmt = transportWOGST * (transportGSTPercent / 100);
    const netAmount = totalRow + transportWOGST + transportGSTAmt + adjustment;

    const payload = {
      uid: selectedBillId,               // ← यही भेजना है (OFFBILLUID)

      STATUS_4: status,
      Vendor_Name_4: vendorName.trim(),
      BILL_NO_4: billNo.trim(),
      BILL_DATE_4: billDate,

      // Aggregated / summarized values (अगर backend per-item नहीं चाहता)
      BASIC_AMOUNT_4: totalBasic.toFixed(2),
      CGST_4: totalCGST.toFixed(2),
      SGST_4: totalSGST.toFixed(2),
      IGST_4: totalIGST.toFixed(2),
      TOTAL_AMOUNT_4: totalRow.toFixed(2),

      TRASNPORT_CHARGES_4: transportWOGST.toFixed(2),
      Transport_Gst_4: transportGSTAmt.toFixed(2),
      NET_AMOUNT_4: netAmount.toFixed(2),

      Remark_4: remark.trim(),

      // अगर backend को items की list भी चाहिए (JSON string में) तो optional:
      // items_json: JSON.stringify(items.map(i => ({
      //   itemUid: i.itemUid,
      //   amount: i.amount,
      //   gstType: i.gstType,
      //   gstPercent: i.gstPercent,
      //   // etc.
      // }))),
    };

    // सिर्फ ONE API call
    await updateEntry(payload).unwrap();

    alert(`Bill ${selectedBillId} सफलतापूर्वक अपडेट हो गया (${items.length} items के साथ)`);
    
    setSelectedBillId('');
    refetch();
  } catch (err) {
    console.error("Update error:", err);
    const msg = err?.data?.message || err?.message || "कुछ गलत हुआ";
    alert(`Update failed: ${msg}`);
  }
};

  // ─── UI ──────────────────────────────────────────────────────
    if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading final approvals...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header + Refresh */}
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-indigo-900">Bill Entry</h1>
          <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Search / Select Bill */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <label className="font-medium block mb-2">Select Bill (OFFBILLUID)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search bill..."
              className="w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />
            {isDropdownOpen && filteredBills.length > 0 && (
              <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-auto z-50">
                {filteredBills.map(bill => (
                  <div
                    key={bill.id}
                    className="p-3 hover:bg-indigo-50 cursor-pointer"
                    onClick={() => {
                      setSelectedBillId(bill.id);
                      setSearchTerm('');
                      setIsDropdownOpen(false);
                    }}
                  >
                    {bill.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bill Entry Form (appears after selection) */}
        {selectedBillId && currentGroup.length > 0 && (
          <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
            <div className="p-5 bg-indigo-50 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">Bill Entry – {selectedBillId}</h2>
              <button onClick={() => setSelectedBillId('')} className="text-gray-600 hover:text-red-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Common fields */}
              <div className="grid md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status *</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2.5 border rounded-lg">
                    <option value="">-- Select --</option>
                    <option value="Done">Done</option>
                    {/* <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option> */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Vendor / Payee *</label>
                  <input value={vendorName} onChange={e => setVendorName(e.target.value)} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Bill No. *</label>
                  <input value={billNo} onChange={e => setBillNo(e.target.value)} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Bill Date *</label>
                  <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>

              {/* Items – per row (per uid) */}
              <div>
                <h3 className="font-semibold mb-3">Item Details</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">UID</th>
                        <th className="p-3 text-left">Item</th>
                        <th className="p-3 text-right">Amt</th>
                        <th className="p-3">GST Type</th>
                        <th className="p-3">GST %</th>
                        <th className="p-3 text-right">CGST</th>
                        <th className="p-3 text-right">SGST</th>
                        <th className="p-3 text-right">IGST</th>
                        <th className="p-3 text-right">Row Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={item.itemUid} className="border-t">
                          <td className="p-3">{item.itemUid}</td>
                          <td className="p-3">{item.itemName}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.amount}
                              onChange={e => {
                                const newItems = [...items];
                                newItems[i].amount = e.target.value;
                                setItems(newItems);
                              }}
                              className="w-24 p-1.5 border rounded text-right"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={item.gstType}
                              onChange={e => {
                                const newItems = [...items];
                                newItems[i].gstType = e.target.value;
                                setItems(newItems);
                              }}
                              className="w-full p-1.5 border rounded"
                            >
                              <option>CGST+SGST</option>
                              <option>IGST</option>
                              <option>No GST</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={item.gstPercent}
                              onChange={e => {
                                const newItems = [...items];
                                newItems[i].gstPercent = Number(e.target.value);
                                setItems(newItems);
                              }}
                              className="w-full p-1.5 border rounded"
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                              <option value={28}>28%</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">{item.cgstAmt.toFixed(2)}</td>
                          <td className="p-3 text-right">{item.sgstAmt.toFixed(2)}</td>
                          <td className="p-3 text-right">{item.igstAmt.toFixed(2)}</td>
                          <td className="p-3 text-right font-medium">{item.rowTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-right font-semibold">
                  Items Total: ₹{itemsTotal.toFixed(2)}
                </div>
              </div>

              {/* Transport + Adjustment + Grand Total */}
              <div className="grid md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-xl">
                <div>
                  <label className="block text-sm mb-1.5">Transport (w/o GST)</label>
                  <input type="number" value={transportWOGST} onChange={e => setTransportWOGST(Number(e.target.value))} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5">GST on Transport %</label>
                  <select value={transportGSTPercent} onChange={e => setTransportGSTPercent(Number(e.target.value))} className="w-full p-2.5 border rounded-lg">
                    <option>0</option><option>5</option><option>12</option><option>18</option><option>28</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Grand Total</label>
                  <div className="p-3 bg-indigo-100 text-indigo-900 font-bold rounded-lg text-lg">
                    ₹{grandTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Remark</label>
                <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3} className="w-full p-3 border rounded-lg" placeholder="Optional..." />
              </div>

              <div className="flex justify-end gap-4">
                <button onClick={() => setSelectedBillId('')} className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !billNo || !billDate || !status}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : <><FileText size={18} /> Submit Bill</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}