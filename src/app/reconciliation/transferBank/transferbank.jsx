'use client';

import React, { useState } from "react";
import {
  useGetTransferBankDataQuery,
  useUpdateTransferBankMutation,
} from '../../../features/reconciliation/transferBankSlice';
import { 
  X, 
  Loader2, 
  RefreshCw, 
  ArrowRightLeft, 
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  MessageSquare,
  Pencil  // Pencil icon add kiya
} from "lucide-react";
import Swal from 'sweetalert2';

const TransferBank = () => {
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetTransferBankDataQuery();

  // Transform response data
  const pendingTransfers = React.useMemo(() => {
    if (!responseData) return [];

    if (Array.isArray(responseData)) {
      if (responseData.length > 0 && Array.isArray(responseData[0])) {
        return responseData.map((row, index) => ({
          id: index,
          Timestap: row[0] || "",
          UID: row[1] || "",
          Transfer_AC_Name: row[2] || "",
          Transfer_Received_AC_Name: row[3] || "",
          Amount: row[4] || "",
          Payment_Mode: row[5] || "",
          PAYMENT_DETAILS: row[6] || "",
          PAYMENT_DATE: row[7] || "",
          Remark: row[8] || "",
          PLANNED_2: row[11] || "",
          ACTUAL_2: row[12] || "",
        }));
      }
      return responseData;
    }

    if (responseData?.data && Array.isArray(responseData.data)) {
      if (responseData.data.length > 0 && Array.isArray(responseData.data[0])) {
        return responseData.data.map((row, index) => ({
          id: index,
          Timestap: row[0] || "",
          UID: row[1] || "",
          Transfer_AC_Name: row[2] || "",
          Transfer_Received_AC_Name: row[3] || "",
          Amount: row[4] || "",
          Payment_Mode: row[5] || "",
          PAYMENT_DETAILS: row[6] || "",
          PAYMENT_DATE: row[7] || "",
          Remark: row[8] || "",
          PLANNED_2: row[11] || "",
          ACTUAL_2: row[12] || "",
        }));
      }
      return responseData.data;
    }

    return [];
  }, [responseData]);

  const [updateTransferBank, { isLoading: isUpdating }] = useUpdateTransferBankMutation();

  // Modal states
  const [selectedRow, setSelectedRow] = useState(null);
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");

  // Open modal
  const openUpdateModal = (row) => {
    setSelectedRow(row);
    setStatus("");
    setRemark("");
  };

  // Close modal
  const closeModal = () => {
    setSelectedRow(null);
    setStatus("");
    setRemark("");
  };

  // Handle Update
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

    if (status === 'Rejected' && !remark.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Remark Required',
        text: 'Please provide a remark for rejection',
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
      await updateTransferBank({
        uid: selectedRow.UID,
        STATUS_2: status.trim(),
        REMARK_2: remark.trim(),
      }).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Transfer updated successfully!',
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

  // Calculate total amount
  const totalAmount = React.useMemo(() => {
    if (!Array.isArray(pendingTransfers)) return 0;

    return pendingTransfers.reduce((sum, item) => {
      const amount = item?.Amount || "0";
      const numAmount = typeof amount === 'string'
        ? Number(amount.replace(/[₹,]/g, ""))
        : Number(amount);
      return sum + (isNaN(numAmount) ? 0 : numAmount);
    }, 0);
  }, [pendingTransfers]);

  // Loading State
  if (isLoading) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 flex flex-col items-center space-y-6 max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Loading Transfers</h2>
            <p className="text-gray-500 text-sm sm:text-base">Fetching pending A/C to A/C transfers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Error Loading Data</h2>
          <p className="text-gray-500 mb-8 text-sm sm:text-base">Unable to fetch transfer entries.</p>
          <button
            onClick={refetch}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (!pendingTransfers || pendingTransfers.length === 0) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ArrowRightLeft className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">No Pending Transfers</h2>
          <p className="text-gray-500 mb-8 text-sm sm:text-base">All A/C to A/C transfers have been processed.</p>
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
    <div className="w-screen min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-purple-100/50 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                    <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">A/C to A/C Transfer</h1>
                    <p className="text-xs sm:text-sm text-purple-100 mt-0.5">
                      Pending Approvals • {pendingTransfers.length} records
                    </p>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-purple-100 font-semibold mb-1">
                    Total Pending Amount
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                    ₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

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

          {/* Table Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-purple-100/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] md:min-w-[1400px] lg:min-w-[1600px] divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    {[
                      "S.No",
                      "Planned",
                      "UID",
                      "From Account",
                      "To Account",
                      "Amount",
                      "Mode",
                      "Payment Date",
                      "Details",
                      "Remark",
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
                  {pendingTransfers.map((row, idx) => (
                    <tr
                      key={row.UID || row.id || idx}
                      className="hover:bg-purple-50/50 transition-colors duration-150"
                    >
                      <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-600 font-medium">
                        {idx + 1}
                      </td>

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

                      <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-800 text-sm max-w-[150px] truncate" title={row.Transfer_AC_Name}>
                            {row.Transfer_AC_Name || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-800 text-sm max-w-[150px] truncate" title={row.Transfer_Received_AC_Name}>
                            {row.Transfer_Received_AC_Name || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 text-sm sm:text-base font-bold bg-emerald-100 text-emerald-700 rounded-lg">
                          ₹{Number(row.Amount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-violet-100 text-violet-700 rounded-lg font-medium">
                            {row.Payment_Mode || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            {row.PAYMENT_DATE || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-600 text-sm max-w-[120px] truncate" title={row.PAYMENT_DETAILS}>
                        {row.PAYMENT_DETAILS || "-"}
                      </td>

                      <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        {row.Remark ? (
                          <div className="flex items-center gap-2" title={row.Remark}>
                            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 text-sm max-w-[100px] truncate">
                              {row.Remark}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Action - Only Pencil Icon */}
                      <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-center">
                        <button
                          onClick={() => openUpdateModal(row)}
                          className="p-2.5 sm:p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                          title="Update Transfer"
                        >
                          <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Showing {pendingTransfers.length} pending transfer{pendingTransfers.length !== 1 ? 's' : ''}
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
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Update Transfer</h3>
              </div>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white transition p-1.5 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Transfer Info Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold mb-1">UID</p>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-indigo-600 break-all">
                    {selectedRow.UID}
                  </p>
                </div>
                <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl border border-emerald-100">
                  <p className="text-[10px] sm:text-xs text-emerald-600 uppercase font-semibold mb-1">Amount</p>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-emerald-700">
                    ₹{Number(selectedRow.Amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* From & To Accounts */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] sm:text-xs text-purple-600 uppercase font-semibold mb-1">From Account</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800">
                      {selectedRow.Transfer_AC_Name}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRightLeft className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] sm:text-xs text-indigo-600 uppercase font-semibold mb-1">To Account</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800">
                      {selectedRow.Transfer_Received_AC_Name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold mb-1">Payment Mode</p>
                  <p className="text-sm font-medium text-gray-800">{selectedRow.Payment_Mode || "-"}</p>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold mb-1">Payment Date</p>
                  <p className="text-sm font-medium text-gray-800">{selectedRow.PAYMENT_DATE || "-"}</p>
                </div>
                <div className="col-span-2 bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold mb-1">Payment Details</p>
                  <p className="text-sm font-medium text-gray-800">{selectedRow.PAYMENT_DETAILS || "-"}</p>
                </div>
                {selectedRow.Remark && (
                  <div className="col-span-2 bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">
                    <p className="text-[10px] sm:text-xs text-amber-600 uppercase font-semibold mb-1">Original Remark</p>
                    <p className="text-sm font-medium text-gray-800">{selectedRow.Remark}</p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Update Status</h4>
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-semibold text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base transition-all"
                >
                  <option value="">— Select Status —</option>
                
                  <option value="Done">✓ Done</option>
                 
                  <option value="Rejected">❌ Rejected</option>
                
                </select>
              </div>

              {/* Remark */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-semibold text-gray-700">
                  Remark {status === 'Rejected' && <span className="text-red-500">*</span>}
                  {status !== 'Rejected' && <span className="text-gray-400 font-normal">(optional)</span>}
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={3}
                  placeholder={status === 'Rejected' ? 'Enter rejection reason...' : 'Add any notes or comments...'}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm sm:text-base transition-all"
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
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
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
                      Update Transfer
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

export default TransferBank;