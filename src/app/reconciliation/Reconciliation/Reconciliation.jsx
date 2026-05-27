
'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  useGetPendingApprovalsQuery, 
  useUpdateApprovalMutation,
  useLazyGetBankBalanceQuery 
} from '../../../features/reconciliation/reconciliationSlice';
import { X, Building, Search, FileText, CheckCircle, AlertCircle, RefreshCw, Calendar } from "lucide-react";
import Swal from 'sweetalert2';

const Reconciliation = () => {
  const { data, isLoading, isError, refetch } = useGetPendingApprovalsQuery();
  const [updateApproval, { isLoading: isUpdating }] = useUpdateApprovalMutation();
  
  const [
    fetchBankBalance, 
    { data: bankBalanceData, isLoading: isLoadingBalance, isError: isBalanceError }
  ] = useLazyGetBankBalanceQuery();
  
  const isDarkMode = localStorage.getItem("isDarkMode") === "true";

  // Filter states
  const [selectedBank, setSelectedBank] = useState('all');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    STATUS_2: '',
    BANK_CLOSING_BALANCE_2: '',
    REMARK_2: ''
  });

  // Data ko array mein convert karo
  const approvalsList = Array.isArray(data) 
    ? data 
    : data?.data || data?.result || data?.items || data?.records || [];

  // Unique banks & payment modes
  const uniqueBanks = useMemo(() => {
    const banks = approvalsList
      .map(item => item.BANK_DETAILS)
      .filter(bank => bank && bank.trim() !== '');
    return [...new Set(banks)];
  }, [approvalsList]);

  const uniquePaymentModes = useMemo(() => {
    const modes = approvalsList
      .map(item => item.PAYMENT_MODE)
      .filter(mode => mode && mode.trim() !== '');
    return [...new Set(modes)];
  }, [approvalsList]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch bank balance jab bank select ho
  useEffect(() => {
    if (selectedBank && selectedBank !== 'all') {
      fetchBankBalance(selectedBank);
    }
  }, [selectedBank, fetchBankBalance]);

  // Filtered data
  const filteredData = useMemo(() => {
    return approvalsList.filter(item => {
      const bankMatch = selectedBank === 'all' || item.BANK_DETAILS === selectedBank;
      const modeMatch = selectedPaymentMode === 'all' || item.PAYMENT_MODE === selectedPaymentMode;
      const searchMatch = debouncedSearchTerm === '' || 
        item.Contractor_Vendor_Firm_Name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.UID?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      return bankMatch && modeMatch && searchMatch;
    });
  }, [approvalsList, selectedBank, selectedPaymentMode, debouncedSearchTerm]);

  // Total pending amount
  const totalPendingAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => {
      const amount = Number(item.PAID_AMOUNT?.replace(/[₹,]/g, "") || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [filteredData]);

  // Projected balance
  const projectedBalance = useMemo(() => {
    if (selectedBank === 'all' || !bankBalanceData?.balance) return 0;
    const currentBalance = Number(bankBalanceData.balance.replace(/[₹,]/g, "") || 0);
    return currentBalance - totalPendingAmount;
  }, [selectedBank, bankBalanceData, totalPendingAmount]);

  const clearFilters = () => {
    setSelectedBank('all');
    setSelectedPaymentMode('all');
    setSearchTerm('');
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setFormData({
      STATUS_2: '',
      BANK_CLOSING_BALANCE_2: '',
      REMARK_2: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({
      STATUS_2: '',
      BANK_CLOSING_BALANCE_2: '',
      REMARK_2: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Auto calculate closing balance
  useEffect(() => {
    if (isModalOpen && selectedItem && bankBalanceData?.balance) {
      const originalBalance = Number(bankBalanceData.balance.replace(/[₹,]/g, ""));
      const paidAmount = Number(selectedItem.PAID_AMOUNT?.replace(/[₹,]/g, "") || 0);
      const remaining = (originalBalance - paidAmount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      });
      setFormData(prev => ({ ...prev, BANK_CLOSING_BALANCE_2: `₹${remaining}` }));
    }
  }, [bankBalanceData, isModalOpen, selectedItem]);






const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.STATUS_2) {
    Swal.fire({
      icon: "warning",
      title: "Status Required",
      text: "Please select a valid Status!",
      confirmButtonColor: "#6366f1",
    });
    return;
  }

  Swal.fire({
    title: "Saving Reconciliation...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  // ✅ Same payload jo pehle Express mein ja raha tha
  const payload = {
    particulars:                    String(selectedItem.Contractor_Vendor_Firm_Name || '').trim(),
    paidAmount:                     String(selectedItem.PAID_AMOUNT || '').trim(),
    paymentDetails:                 String(selectedItem.PAYMENT_DETAILS || '').trim(),
    bankDetails:                    String(selectedItem.BANK_DETAILS || '').trim(),
    bankClosingBalanceAfterPayment: formData.BANK_CLOSING_BALANCE_2.replace("₹", "").trim(),
    status:                         formData.STATUS_2,
    remark:                         formData.REMARK_2.trim(),
  };

  console.log('📤 Payload:', payload);

  try {
    await updateApproval(payload).unwrap();

    // Bank balance refresh karo
    if (selectedBank && selectedBank !== 'all') {
      await fetchBankBalance(selectedBank);
    }

    await Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Reconciliation saved successfully!",
      confirmButtonColor: "#10b981",
      timer: 2200,
      showConfirmButton: false,
    });

    handleCloseModal();
    refetch(); // List refresh karo
    
  } catch (err) {
    console.error('Failed to save:', err);
    const errorMessage = 
      err?.data?.message || 
      err?.error || 
      "Something went wrong! Please try again.";

    Swal.fire({
      icon: "error",
      title: "Save Failed",
      text: errorMessage,
      confirmButtonColor: "#ef4444",
    });
  }
};
  


  const formatBalance = (balance) => {
    if (!balance) return '₹0';
    const num = parseFloat(balance.toString().replace(/[₹,]/g, ''));
    if (isNaN(num)) return balance;
    return '₹' + num.toLocaleString('en-IN');
  };

  // Loading & Error States
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gradient-to-br from-black via-indigo-950 to-purple-950" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>Loading reconciliation data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gradient-to-br from-black via-indigo-950 to-purple-950" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"}`}>
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>Error Loading Data</h2>
          <p className={`mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Something went wrong while fetching data</p>
          <button 
            onClick={() => refetch()}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${isDarkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8 xl:px-10 w-full
      ${isDarkMode ? "bg-gradient-to-br from-black via-indigo-950 to-purple-950" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"}`}>
      
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow ${isDarkMode ? "bg-purple-700" : "bg-purple-300/40"}`}></div>
        <div className={`absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse-slow ${isDarkMode ? "bg-blue-700" : "bg-blue-300/40"}`} style={{ animationDelay: "3s" }}></div>
        <div className={`absolute -bottom-32 left-1/3 w-[450px] h-[450px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow ${isDarkMode ? "bg-indigo-800" : "bg-indigo-300/40"}`} style={{ animationDelay: "6s" }}></div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className={`rounded-2xl border shadow-2xl w-full p-6 sm:p-8 lg:p-10 xl:p-12
          ${isDarkMode ? "bg-black/70 border-indigo-700/60 backdrop-blur-xl" : "bg-white/90 border-indigo-200/80 backdrop-blur-sm"}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent flex items-center gap-3
                ${isDarkMode ? "from-indigo-200 via-purple-200 to-indigo-200" : "from-indigo-700 via-purple-700 to-indigo-700"}`}>
                <Building className={`w-10 h-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                Payment Reconciliation
              </h1>
              <p className={`mt-2 text-lg ${isDarkMode ? "text-indigo-300/80" : "text-indigo-700/80"}`}>
                Manage pending approvals & reconciliation
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className={`px-5 py-2.5 rounded-full font-semibold text-sm shadow-md
                ${isDarkMode ? "bg-gradient-to-r from-emerald-700 to-teal-700 text-white" : "bg-emerald-100 text-emerald-800"}`}>
                {approvalsList.length} Total
              </div>
              <div className={`px-6 py-2.5 rounded-full font-semibold text-base shadow-lg
                ${isDarkMode ? "bg-gradient-to-r from-amber-700 to-yellow-700 text-white" : "bg-amber-100 text-amber-900 border border-amber-300"}`}>
                Pending: ₹{totalPendingAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Bank Selection */}
        <div className={`rounded-xl border p-6 shadow-lg
          ${isDarkMode ? "bg-black/50 border-indigo-700/50 backdrop-blur-xl" : "bg-white/80 border-indigo-200/70 backdrop-blur-sm"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              <Building className="w-5 h-5" />
              Select Bank Account
            </h2>
            {selectedBank !== 'all' && (
              <button onClick={clearFilters} className={`text-sm font-medium flex items-center gap-1 transition ${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-500"}`}>
                <X className="w-4 h-4" /> Clear Selection
              </button>
            )}
          </div>
          
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className={`w-full md:w-96 rounded-lg px-4 py-3 border focus:ring-2 transition-all 
              ${isDarkMode ? "bg-gray-900/70 text-white border-gray-700 hover:border-indigo-500 focus:ring-indigo-500" : "bg-white text-gray-900 border-gray-300 hover:border-indigo-400 focus:ring-indigo-400"}`}
          >
            <option value="all">🏦 All Banks</option>
            {uniqueBanks.map((bank, index) => (
              <option key={index} value={bank}>{bank}</option>
            ))}
          </select>

          {/*  */}
        </div>

        {/* Bank Specific Content */}
        {selectedBank && selectedBank !== 'all' && (
          <div className="space-y-8">
            {/* Bank Balance Card */}
            <div className={`rounded-2xl border shadow-2xl overflow-hidden
              ${isDarkMode ? "bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-700/40 backdrop-blur-xl" : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/60"}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${isDarkMode ? "bg-white/10" : "bg-white/50"}`}>
                      <Building className={`w-10 h-10 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
                    </div>
                    <div>
                      <p className={`text-sm uppercase tracking-wide ${isDarkMode ? "text-emerald-300/80" : "text-emerald-700/80"}`}>Current Balance</p>
                      <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {isLoadingBalance ? "Loading..." : isBalanceError ? "Error" : formatBalance(bankBalanceData?.balance)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${isDarkMode ? "text-emerald-300/80" : "text-emerald-700/80"}`}>Selected Bank</p>
                    <p className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedBank}</p>
                  </div>
                </div>

                {bankBalanceData?.balance && !isLoadingBalance && (
                  <div className={`pt-4 border-t flex items-center justify-between ${isDarkMode ? "border-emerald-700/30" : "border-emerald-200/40"}`}>
                    <div className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-emerald-300/80" : "text-emerald-700/80"}`}>
                      <Calendar className="w-4 h-4" />
                      Last updated: Just now
                    </div>
                    <button 
                      onClick={() => fetchBankBalance(selectedBank)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white/60 hover:bg-white/80 text-emerald-800"}`}
                    >
                      <RefreshCw className="w-4 h-4" /> Refresh Balance
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-2xl border shadow-2xl ${isDarkMode ? "bg-black/40 border-indigo-700/40 backdrop-blur-xl" : "bg-white/80 border-indigo-200/60 backdrop-blur-sm"}`}>
                <p className={`text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-indigo-300" : "text-indigo-600"}`}>Current Balance</p>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{formatBalance(bankBalanceData?.balance)}</p>
              </div>
              <div className={`p-6 rounded-2xl border shadow-2xl ${isDarkMode ? "bg-black/40 border-indigo-700/40 backdrop-blur-xl" : "bg-white/80 border-indigo-200/60 backdrop-blur-sm"}`}>
                <p className={`text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-indigo-300" : "text-indigo-600"}`}>Pending Entries</p>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-amber-400" : "text-amber-700"}`}>{filteredData.length}</p>
              </div>
              <div className={`p-6 rounded-2xl border shadow-2xl ${isDarkMode ? "bg-black/40 border-indigo-700/40 backdrop-blur-xl" : "bg-white/80 border-indigo-200/60 backdrop-blur-sm"}`}>
                <p className={`text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-indigo-300" : "text-indigo-600"}`}>Total Pending</p>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-rose-400" : "text-rose-700"}`}>₹{totalPendingAmount.toLocaleString("en-IN")}</p>
              </div>
              <div className={`p-6 rounded-2xl border shadow-2xl ${isDarkMode ? "bg-emerald-900/30 border-emerald-700/40 backdrop-blur-xl" : "bg-emerald-100/60 border-emerald-300/60 backdrop-blur-sm"}`}>
                <p className={`text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-emerald-200" : "text-emerald-700"}`}>Projected Balance</p>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-emerald-300" : "text-emerald-800"}`}>₹{projectedBalance.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Filters Section */}
            

            {/* Table Section */}
            <div className={`rounded-2xl border overflow-hidden shadow-2xl
              ${isDarkMode ? "bg-black/30 border-indigo-700/40 backdrop-blur-xl" : "bg-white/70 border-indigo-200/60 backdrop-blur-sm"}`}>
              
              <div className={`p-6 md:p-8 lg:p-10 border-b ${isDarkMode ? "bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-indigo-700/40" : "bg-gradient-to-r from-indigo-100/70 to-purple-100/70 border-indigo-200/40"}`}>
                <h3 className={`text-2xl lg:text-3xl font-bold flex items-center gap-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  <FileText className={`w-7 h-7 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                  Pending Approvals - {selectedBank}
                </h3>
                <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {filteredData.length} transaction(s) • Total: ₹{totalPendingAmount.toLocaleString('en-IN')}
                </p>
              </div>

              {filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>No Records Found</h3>
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>No pending records for the selected filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className={`bg-opacity-50 ${isDarkMode ? "bg-black/50" : "bg-gray-200/80"}`}>
                      <tr>
                        {["S.No", "Timestamp", "UID", "Vendor Name", "Amount", "Bank", "Mode", "Payment Detail","Payment Date", "Exp Head", "Action"].map((h, i) => (
                          <th key={i} className={`px-6 py-4 text-left text-sm lg:text-base font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? "divide-gray-800/50" : "divide-gray-200/50"}`}>
                      {filteredData.map((item, index) => (
                        <tr key={item.UID || index} className={`hover:bg-opacity-30 transition-colors ${isDarkMode ? "hover:bg-indigo-950/30" : "hover:bg-blue-50"}`}>
                          <td className={`px-6 py-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{index + 1}</td>
                          <td className={`px-6 py-5 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{item.Timestap}</td>
                          <td className={`px-6 py-5 font-medium ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}>{item.UID}</td>
                          <td className={`px-6 py-5 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{item.Contractor_Vendor_Firm_Name}</td>
                          <td className={`px-6 py-5 font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>₹{item.PAID_AMOUNT}</td>
                          <td className={`px-6 py-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isDarkMode ? "bg-purple-900/40 text-purple-300" : "bg-purple-100 text-purple-800"}`}>
                              {item.BANK_DETAILS}
                            </span>
                          </td>
                          <td className={`px-6 py-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isDarkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
                              {item.PAYMENT_MODE}
                            </span>
                          </td>
                          <td className={`px-6 py-5 font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>₹{item.PAYMENT_DETAILS}</td>
                          <td className={`px-6 py-5 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{item.PAYMENT_DATE}</td>
                          <td className={`px-6 py-5 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{item.EXP_HEAD}</td>
                          <td className="px-6 py-5 text-center">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className={`px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 mx-auto
                                ${isDarkMode ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white" 
                                            : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"}`}
                            >
                              <FileText className="w-4 h-4" /> Reconcile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredData.length > 0 && (
                <div className={`px-6 py-4 border-t ${isDarkMode ? "bg-gray-900/30 border-gray-800/50" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Showing <span className="font-semibold">{filteredData.length}</span> of <span className="font-semibold">{approvalsList.length}</span> records
                    </p>
                    {bankBalanceData?.balance && (
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Current Balance: <span className={`font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>{formatBalance(bankBalanceData?.balance)}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl shadow-2xl w-full max-w-2xl border overflow-hidden ${isDarkMode ? "bg-black/90 border-indigo-700/50" : "bg-white/95 border-indigo-200/70"}`}>
              <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? "bg-gradient-to-r from-indigo-950 to-purple-950 border-indigo-700/50" : "bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-200/40"}`}>
                <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Reconcile Transaction</h3>
                <button onClick={handleCloseModal} className={`${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Transaction Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className={`p-5 rounded-xl border ${isDarkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                    <p className={`text-sm uppercase mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>UID</p>
                    <p className={`text-xl font-medium ${isDarkMode ? "text-indigo-400" : "text-indigo-700"}`}>{selectedItem.UID}</p>
                  </div>
                  <div className={`p-5 rounded-xl border ${isDarkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                    <p className={`text-sm uppercase mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Current Balance</p>
                    <p className={`text-xl font-bold ${isDarkMode ? "text-cyan-400" : "text-cyan-700"}`}>{formatBalance(bankBalanceData?.balance)}</p>
                  </div>
                  <div className={`p-5 rounded-xl border ${isDarkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                    <p className={`text-sm uppercase mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Paid Amount</p>
                    <p className={`text-xl font-bold ${isDarkMode ? "text-rose-400" : "text-rose-700"}`}>₹{selectedItem.PAID_AMOUNT}</p>
                  </div>
                </div>

                <div className={`p-5 rounded-xl border ${isDarkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-sm uppercase mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Vendor</p>
                  <p className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedItem.Contractor_Vendor_Firm_Name}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Auto-calculated Closing Balance</label>
                    <input
                      type="text"
                      name="BANK_CLOSING_BALANCE_2"
                      readOnly
                      value={formData.BANK_CLOSING_BALANCE_2}
                      className={`w-full px-5 py-4 rounded-xl font-bold text-xl ${isDarkMode ? "bg-gray-900/70 border-gray-700 text-emerald-300" : "bg-gray-50 border-gray-300 text-emerald-700"}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Remark</label>
                      <textarea
                        name="REMARK_2"
                        value={formData.REMARK_2}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-5 py-4 rounded-xl resize-none focus:outline-none focus:ring-2 ${isDarkMode ? "bg-gray-900/70 border-gray-700 text-white focus:ring-indigo-500" : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-400"}`}
                        placeholder="Add remark if needed..."
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Status <span className="text-red-500">*</span></label>
                      <select
                        name="STATUS_2"
                        value={formData.STATUS_2}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 ${isDarkMode ? "bg-gray-900/70 border-gray-700 text-white focus:ring-indigo-500" : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-400"}`}
                      >
                        <option value="">──── Select Status ────</option>
                        <option value="Done">✅ Done</option>
                        <option value="Cancel">❌ Cancel</option>
                      </select>
                    </div>
                  </div>

                  <div className={`flex justify-end gap-4 pt-6 border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className={`px-8 py-3 rounded-xl font-medium transition ${isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 min-w-[180px] justify-center transition-all shadow-md ${isUpdating ? "bg-indigo-800/70 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"}`}
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : "Save Reconciliation"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -60px); }
        }
        .animate-pulse-slow { animation: pulse 18s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default Reconciliation;