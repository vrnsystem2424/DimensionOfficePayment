


'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  useGetFinalApprovalsQuery,
  useUpdateFinalApprovalMutation,
} from '../../../features/approve2Slice';
import { RefreshCw, Search, AlertCircle, ChevronDown, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function FinalApproval({ user }) {
  const { data: apiResponse, isLoading, isError, error, refetch } =
    useGetFinalApprovalsQuery();

  const [updateFinalApproval, { isLoading: isSubmitting }] = useUpdateFinalApprovalMutation();

  const [selectedBillId, setSelectedBillId] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [overallRemark, setOverallRemark] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // ────────────────────────────────────────────────
  //  Your original data parsing & grouping logic
  // ────────────────────────────────────────────────
  const rawData = useMemo(() => {
    let data = [];
    if (apiResponse?.data && Array.isArray(apiResponse.data)) data = apiResponse.data;
    else if (Array.isArray(apiResponse)) data = apiResponse;
    return data;
  }, [apiResponse]);

  const parsedItems = useMemo(() => {
    if (!rawData.length) return [];

    return rawData.map((item, index) => {
      const rawAmount = String(
        item.Amount || item.amount || item.total_amount || item.TotalAmount ||
        item.ApprovedAmount || item.approved_amount || item.grand_total || '0'
      ).replace(/,/g, '').replace(/\s/g, '');

      const parsedAmount = Number(rawAmount) || 0;

      const billNo = String(
        item.bill_no ||
        item.BillNo ||
        item.Bill_No ||
        item['Bill No'] ||
        item.OFFBILLUID ||
        item.OffBillUID ||
        item.bill_id ||
        item.BillID ||
        item.billgroupuid ||
        item.group_id ||
        ''
      ).trim();

      const uid = String(
        item.uid || item.UID || item.item_uid || item.ItemUID ||
        item.ItemId || item.item_id || item.id || ''
      ).trim();

      return {
        bill_no: billNo || `AUTO_${index + 1}`,
        uid: uid || `ITEM_${index + 1}`,
        office: String(item.office || item.OFFICE_NAME_1 || item.office_name || '').trim(),
        payee: String(item.payee || item.PAYEE_NAME_1 || item.payee_name || '').trim(),
        head: String(item.head || item.EXPENSES_HEAD_1 || item.expense_head || '').trim(),
        itemName: String(item.ITEM_NAME_1 || item.item_name || item.Description || '').trim(),
        amount: parsedAmount,
        raisedBy: String(item.RAISED_BY_1 || item.raised_by || '').trim(),
        photo: String(item.Bill_Photo || item.bill_photo || item.photo || 'No file uploaded').trim(),
        originalRemark: String(item.REMARK_2 || item.REMARK_1 || item.remark || '').trim(),
        approvalDoer: String(item.APPROVAL_DOER || item.approval_doer || '').trim(),
      };
    }).filter(item => item.bill_no && item.bill_no.trim() !== '');
  }, [rawData]);

  const billGroups = useMemo(() => {
    const groups = {};
    parsedItems.forEach((item) => {
      const key = item.bill_no;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [parsedItems]);

  const filteredBills = useMemo(() => {
    let bills = Object.keys(billGroups)
      .map((id) => ({
        id,
        label: `${id} • ${billGroups[id].length} items • ₹${billGroups[id]
          .reduce((sum, i) => sum + i.amount, 0)
          .toLocaleString('en-IN')}`,
        totalAmount: billGroups[id].reduce((sum, i) => sum + i.amount, 0),
        itemCount: billGroups[id].length,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      bills = bills.filter((bill) => bill.id.toLowerCase().includes(term));
    }

    return bills;
  }, [billGroups, searchTerm]);

  const currentItems = billGroups[selectedBillId] || [];

  useEffect(() => {
    if (!selectedBillId || !currentItems.length) return;
    setApprovalStatus('');
    setPaymentMode('');
    setOverallRemark('');
  }, [selectedBillId, currentItems.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        searchInputRef.current && !searchInputRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBillSelect = (billId) => {
    setSelectedBillId(billId);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedBillId) return alert('Select a bill first');
    if (!approvalStatus) return alert('Select approval status');

    const billNoToSend = selectedBillId.trim();

    try {
      const promises = currentItems.map(async (item) => {
        const approverToUse = item.approvalDoer || user?.name || 'Final Approver';

        return updateFinalApproval({
          uid: billNoToSend,           // ← your logic (bill_no as uid)
          STATUS_3: approvalStatus,
          PAYMENT_MODE_3: paymentMode || 'BANK',
          APPROVAL_DOER_3: approverToUse,
          REMARK_3: overallRemark.trim(),
        }).unwrap();
      });

      await Promise.all(promises);

      alert(`Final approval submitted for ${currentItems.length} items!`);
      setSelectedBillId('');
      setSearchTerm('');
      setApprovalStatus('');
      setPaymentMode('');
      setOverallRemark('');
      refetch();
    } catch (err) {
      alert('Error: ' + (err?.data?.message || err?.message || 'Failed'));
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      default: return null;
    }
  };

  // ────────────────────────────────────────────────
  //               UI — same style as first code
  // ────────────────────────────────────────────────
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

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xl p-6 max-w-md">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-sm text-slate-600">
                {error?.data?.error || error?.message || 'Failed to load final approvals'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-800 bg-clip-text text-transparent mb-2">
              Final Approval (Level 2)
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
              <p className="text-slate-600 font-medium">{parsedItems.length} items awaiting final approval</p>
            </div>
          </div>
          <button
            onClick={refetch}
            disabled={isSubmitting}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Select */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Search & Select Bill
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Enter Bill No to search..."
                  className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 placeholder:text-slate-500 transition-all duration-200"
                />
                {filteredBills.length > 0 && (
                  <ChevronDown
                    className={`absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none transition-transform duration-300 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}

                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
                  >
                    {filteredBills.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {filteredBills.map((bill, idx) => (
                          <div
                            key={bill.id}
                            onClick={() => handleBillSelect(bill.id)}
                            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-indigo-50 ${
                              selectedBillId === bill.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                            } ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === filteredBills.length - 1 ? 'rounded-b-lg' : ''}`}
                          >
                            <div className="font-semibold text-slate-900">{bill.id}</div>
                            <div className="text-sm text-slate-500 mt-1">
                              {bill.itemCount} items • <span className="font-medium text-indigo-600">₹{bill.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        {searchTerm.trim() ? 'No bills found' : 'No pending bills available'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Bill Details + Approval Form */}
        {selectedBillId && currentItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Bill #{selectedBillId}</h2>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-slate-600">Items</p>
                      <p className="font-semibold text-slate-900">{currentItems.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Total</p>
                      <p className="font-bold text-emerald-600">
                        ₹{currentItems.reduce((sum, i) => sum + i.amount, 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">UID</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Item</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Office</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Payee</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Head</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-900 uppercase text-xs tracking-wide">Amount</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Raised By</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-900 uppercase text-xs tracking-wide">Bill Photo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentItems.map((item, idx) => (
                    <tr key={item.uid || idx} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4 text-slate-700">{item.uid}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{item.itemName || '-'}</td>
                      <td className="px-6 py-4 text-slate-700">{item.office || '-'}</td>
                      <td className="px-6 py-4 text-slate-700">{item.payee || '-'}</td>
                      <td className="px-6 py-4 text-slate-700">{item.head || '-'}</td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{item.raisedBy || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        {item.photo && item.photo !== 'No file uploaded' ? (
                          <a
                            href={item.photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Approval Form */}
            <div className="p-6 md:p-8 border-t border-slate-200 space-y-6 bg-gradient-to-b from-white to-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Status <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={approvalStatus}
                      onChange={(e) => setApprovalStatus(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white"
                    >
                      <option value="">----- Select -----</option>
                      <option value="Done">Done</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {approvalStatus && getStatusIcon(approvalStatus)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="">Select mode</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Remarks / Comments</label>
                <textarea
                  value={overallRemark}
                  onChange={(e) => setOverallRemark(e.target.value)}
                  rows={4}
                  placeholder="Add notes, reason for rejection/hold, payment instructions, etc..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => {
                    setSelectedBillId('');
                    setSearchTerm('');
                    setApprovalStatus('');
                    setPaymentMode('');
                    setOverallRemark('');
                  }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !approvalStatus}
                  className={`px-8 py-3 rounded-xl font-semibold text-white min-w-[180px] flex items-center justify-center gap-2 ${
                    isSubmitting || !approvalStatus
                      ? 'bg-indigo-400 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Submit Final Approval</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}