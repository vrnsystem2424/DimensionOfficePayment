'use client';

import React, { useState } from "react";
import {
  useGetPendingPaymentsQuery,
  useUpdatePaymentMutation,
} from '../../../features/reconciliation/ActualPaymentSlice';
import { X, FileText, Eye, Loader2, RefreshCw, DollarSign, AlertCircle } from "lucide-react";
import Swal from 'sweetalert2';

const ActualPaymentIn = () => {
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetPendingPaymentsQuery();

  const pendingPayments = React.useMemo(() => {
    if (!responseData) return [];

    if (Array.isArray(responseData)) {
      if (responseData.length > 0 && Array.isArray(responseData[0])) {
        return responseData.map((row, index) => ({
          id: index,
          UID: row[1] || "",
          Timestap: row[0] || "",
          Project_Name: row[2] || "",
          Amount: row[3] || "",
          CGST: row[4] || "",
          SGST: row[5] || "",
          Net_Amount: row[6] || "",
          Credit_Account_Name: row[7] || "",
          Payment_Mode: row[8] || "",
          Cheque_No: row[9] || "",
          Cheque_Date: row[10] || "",
          Cheque_Photo: row[11] || "",
          PLANNED_2: row[12] || "",
          ACTUAL_2: row[13] || "",
        }));
      }
      return responseData;
    }

    if (responseData?.data && Array.isArray(responseData.data)) {
      if (responseData.data.length > 0 && Array.isArray(responseData.data[0])) {
        return responseData.data.map((row, index) => ({
          id: index,
          UID: row[1] || "",
          Timestap: row[0] || "",
          Project_Name: row[2] || "",
          Amount: row[3] || "",
          CGST: row[4] || "",
          SGST: row[5] || "",
          Net_Amount: row[6] || "",
          Credit_Account_Name: row[7] || "",
          Payment_Mode: row[8] || "",
          Cheque_No: row[9] || "",
          Cheque_Date: row[10] || "",
          Cheque_Photo: row[11] || "",
          PLANNED_2: row[12] || "",
          ACTUAL_2: row[13] || "",
        }));
      }
      return responseData.data;
    }

    return [];
  }, [responseData]);

  const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentMutation();

  const [selectedRow, setSelectedRow] = useState(null);
  const [status, setStatus] = useState("");
  const [bankClosingBalance, setBankClosingBalance] = useState("");
  const [remark, setRemark] = useState("");

  const openUpdateModal = (row) => {
    setSelectedRow(row);
    setStatus("");
    setBankClosingBalance("");
    setRemark("");
  };

  const closeModal = () => {
    setSelectedRow(null);
    setStatus("");
    setBankClosingBalance("");
    setRemark("");
  };

  const handleUpdate = async () => {
    if (!status.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Status Required',
        text: 'Please select a status',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    Swal.fire({
      title: 'Updating...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await updatePayment({
        uid: selectedRow.UID,
        STATUS_2: status.trim(),
        BANK_CLOSING_BALANCE_2: bankClosingBalance ? Number(bankClosingBalance) : null,
        REMARK_2: remark.trim(),
      }).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Payment updated successfully!',
        confirmButtonColor: '#10b981',
        timer: 2200,
        showConfirmButton: false,
      });

      closeModal();
      refetch();
    } catch (err) {
      console.error('Update failed:', err);
      let errorMessage = 'Something went wrong. Please try again.';
      if (err?.data?.message) errorMessage = err.data.message;
      else if (err?.error) errorMessage = err.error;

      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errorMessage,
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const totalNetAmount = React.useMemo(() => {
    if (!Array.isArray(pendingPayments)) return 0;

    return pendingPayments.reduce((sum, item) => {
      const amount = item?.Net_Amount || item?.Amount || "0";
      const numAmount = typeof amount === 'string'
        ? Number(amount.replace(/[₹,]/g, ""))
        : Number(amount);
      return sum + (isNaN(numAmount) ? 0 : numAmount);
    }, 0);
  }, [pendingPayments]);

  // Loading, Error, Empty states को भी full-width बनाया
  if (isLoading) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 flex flex-col items-center space-y-6 max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Loading Payments</h2>
            <p className="text-gray-500 text-sm sm:text-base">Fetching pending entries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Error Loading Data</h2>
          <p className="text-gray-500 mb-8 text-sm sm:text-base">Unable to fetch pending payment entries.</p>
          <button
            onClick={refetch}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!pendingPayments || pendingPayments.length === 0) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">No Pending Entries</h2>
          <p className="text-gray-500 mb-8 text-sm sm:text-base">All payments have been processed.</p>
          <button
            onClick={refetch}
            className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="w-screen min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    {/* left-right gap के लिए padding, table scroll के लिए overflow */}
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 lg:py-8">
      <div className="space-y-6 lg:space-y-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
          {/* Top Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl lg:text-3xl">💳</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Actual Payment In</h1>
                  <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                    Pending Entries • {pendingPayments.length} records
                  </p>
                </div>
              </div>

              {/* Total Amount Card */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-100 font-semibold mb-1">
                  Total Pending
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                  ₹{totalNetAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 flex justify-end">
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Card - scrolling enable */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {/* table को ज्यादा min-width दी ताकि scroll आए */}
            <table className="min-w-[1400px] md:min-w-[1600px] lg:min-w-[1800px] divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  {[
                    "Planned",
                    "UID",
                    "Project Name",
                    "Amount",
                    "CGST",
                    "SGST",
                    "Net Amount",
                    "Credit A/c",
                    "Mode",
                    "Chq No",
                    "Chq Date",
                    "Photo",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pendingPayments.map((row) => (
                  <tr
                    key={row.UID || row.id}
                    className="hover:bg-blue-50/50 transition-colors duration-150"
                  >
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-center">
                      <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-amber-100 text-amber-700 rounded-lg font-medium">
                        {row.PLANNED_2 || "-"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                      <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-indigo-100 text-indigo-700 rounded-lg font-medium">
                        {row.UID}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-800 max-w-[180px] truncate text-sm" title={row.Project_Name}>
                      {row.Project_Name || "-"}
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-emerald-600 font-semibold text-sm sm:text-base">
                      {row.Amount ? `₹${Number(row.Amount).toLocaleString('en-IN')}` : "-"}
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-600 text-sm">
                      {row.CGST || "-"}
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-600 text-sm">
                      {row.SGST || "-"}
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                      <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold bg-emerald-100 text-emerald-700 rounded-lg">
                        {row.Net_Amount }
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-700 max-w-[150px] truncate text-sm" title={row.Credit_Account_Name}>
                      {row.Credit_Account_Name || "-"}
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                      <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-violet-100 text-violet-700 rounded-lg font-medium">
                        {row.Payment_Mode || "-"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-600 font-mono text-sm">
                      {row.Cheque_No || "-"}
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-600 text-sm">
                      {row.Cheque_Date || "-"}
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-center">
                      {row.Cheque_Photo ? (
                        <a
                          href={row.Cheque_Photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 sm:p-2.5 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition hover:scale-105"
                          title="View Photo"
                        >
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    
                    <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-center">
                      <button
                        onClick={() => openUpdateModal(row)}
                        className="p-2 sm:p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-md hover:shadow-lg hover:scale-105"
                        title="Update Status"
                      >
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              Showing {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Modal */}
    {selectedRow && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-4 overflow-hidden animate-fadeIn">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Update Payment</h3>
            </div>
            <button
              onClick={closeModal}
              className="text-white/80 hover:text-white transition p-1.5 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold mb-1">UID</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-indigo-600 break-all">
                  {selectedRow.UID}
                </p>
              </div>
              <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl border border-emerald-100">
                <p className="text-[10px] sm:text-xs text-emerald-600 uppercase font-semibold mb-1">Net Amount</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-emerald-700">
                  ₹{Number(selectedRow.Net_Amount || selectedRow.Amount || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Status Select */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-semibold text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
              >
                <option value="">— Select Status —</option>
                <option value="Done">✅ Done</option>
                <option value="Cleared">✓ Cleared</option>
                <option value="Pending">⏳ Pending</option>
                <option value="Cancel">❌ Cancel</option>
                <option value="Rejected">🚫 Rejected</option>
              </select>
            </div>

            {/* Bank Closing Balance */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-semibold text-gray-700">
                Bank Closing Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
                <input
                  type="number"
                  value={bankClosingBalance}
                  onChange={(e) => setBankClosingBalance(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
                />
              </div>
            </div>

            {/* Remark */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-semibold text-gray-700">
                Remark <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                placeholder="Add any notes or comments..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-semibold text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className={`w-full sm:w-auto px-8 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm sm:text-base order-1 sm:order-2 ${
                  isUpdating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Custom Styles */}
    <style jsx>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
    `}</style>
  </div>
);
};

export default ActualPaymentIn;



