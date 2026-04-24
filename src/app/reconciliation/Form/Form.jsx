'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  useAddPaymentMutation,
  useAddCapitalMovementMutation,
  useAddBankTransferMutation,
  useGetFormDropdownsQuery,
} from '../../../features/reconciliation/formSlice';
import Swal from 'sweetalert2';

// ✅ MOVED OUTSIDE - Input Styles
const inputCls = "w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 text-sm sm:text-base transition-all placeholder:text-gray-400";
const selectCls = "w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 text-sm sm:text-base transition-all appearance-none cursor-pointer";

// ✅ MOVED OUTSIDE - Field Component
const Field = ({ label, required, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-xs sm:text-sm font-semibold text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// ✅ Tab configurations
const tabs = [
  { key: 'client-in', label: 'Client Receipt', shortLabel: 'Receipt', icon: '₹', color: 'emerald' },
  { key: 'transfer', label: 'Bank Transfer', shortLabel: 'Transfer', icon: '⇄', color: 'violet' },
  { key: 'capital', label: 'Capital A/C', shortLabel: 'Capital', icon: '◈', color: 'amber' },
];

const getTabStyles = (tab, isActive) => {
  const colors = {
    emerald: isActive ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50',
    violet: isActive ? 'bg-violet-500 text-white shadow-violet-200' : 'bg-white text-violet-600 border-violet-200 hover:bg-violet-50',
    amber: isActive ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50',
  };
  return colors[tab.color];
};

const getBtnStyles = (color) => {
  const styles = {
    emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-200',
    violet: 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-violet-200',
    amber: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-200',
  };
  return styles[color];
};

const Form = () => {
  const [activeTab, setActiveTab] = useState('client-in');

  const [addPayment, { isLoading: isSubmittingClient }] = useAddPaymentMutation();
  const [addCapitalMovement, { isLoading: isSubmittingCapital }] = useAddCapitalMovementMutation();
  const [addBankTransfer, { isLoading: isSubmittingTransfer }] = useAddBankTransferMutation();

  const { data: dropdownData, isLoading: isDropdownLoading, isError: isDropdownError } = useGetFormDropdownsQuery();
  const projects = dropdownData?.projects || [];
  const accounts = dropdownData?.accounts || [];
  const capitalMovements = dropdownData?.capitalMovements || [];

  const [clientFormData, setClientFormData] = useState({
    SiteName: '', Amount: '', GST: '', CGST: '', SGST: '', NetAmount: '',
    RccCreditAccountName: '', PaymentMode: '', TransactionNo: '', TransactionDate: '', ChequePhoto: null,
  });

  const [capitalFormData, setCapitalFormData] = useState({
    Capital_Movment: '', Received_Account: '', Amount: '',
    PAYMENT_MODE: '', PAYMENT_DETAILS: '', PAYMENT_DATE: '', Remark: '',
  });

  const [transferFormData, setTransferFormData] = useState({
    Transfer_A_C_Name: '', Transfer_Received_A_C_Name: '', Amount: '',
    PAYMENT_MODE: '', PAYMENT_DETAILS: '', PAYMENT_DATE: '', Remark: '',
  });

  const showClientTxFields = ['Cheque', 'NEFT', 'RTGS'].includes(clientFormData.PaymentMode);
  const showChequePhoto = clientFormData.PaymentMode === 'Cheque';
  const showCapitalTxFields = ['Cheque', 'NEFT', 'RTGS'].includes(capitalFormData.PAYMENT_MODE);
  const showTransferTxFields = ['Cheque', 'NEFT', 'RTGS'].includes(transferFormData.PAYMENT_MODE);

  // ✅ FIXED: GST calculation with proper dependency
  useEffect(() => {
    const amount = Number(clientFormData.Amount) || 0;
    
    if (amount > 0 && clientFormData.GST === '18') {
      const gst = (amount * 18) / 100;
      const half = gst / 2;
      setClientFormData(prev => ({
        ...prev,
        CGST: half.toFixed(2),
        SGST: half.toFixed(2),
        NetAmount: (amount + gst).toFixed(2)
      }));
    } else if (clientFormData.GST !== '18') {
      setClientFormData(prev => ({
        ...prev,
        CGST: '',
        SGST: '',
        NetAmount: prev.Amount || ''
      }));
    }
  }, [clientFormData.Amount, clientFormData.GST]);

  // ✅ FIXED: useCallback for handlers to prevent re-creation
  const handleClientChange = useCallback((e) => {
    const { name, value } = e.target;
    setClientFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCapitalChange = useCallback((e) => {
    const { name, value } = e.target;
    setCapitalFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleTransferChange = useCallback((e) => {
    const { name, value } = e.target;
    setTransferFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setClientFormData(prev => ({ ...prev, ChequePhoto: reader.result }));
      reader.readAsDataURL(file);
    }
  }, []);

  const removePhoto = useCallback(() => {
    setClientFormData(prev => ({ ...prev, ChequePhoto: null }));
  }, []);

  const handleClientSubmit = async () => {
    if (!clientFormData.SiteName) return Swal.fire({ icon: 'warning', title: 'Site Name Required' });
    if (!clientFormData.Amount || Number(clientFormData.Amount) <= 0) return Swal.fire({ icon: 'warning', title: 'Invalid Amount' });
    if (!clientFormData.RccCreditAccountName) return Swal.fire({ icon: 'warning', title: 'Account Required' });
    if (showClientTxFields && (!clientFormData.TransactionNo.trim() || !clientFormData.TransactionDate.trim())) {
      return Swal.fire({ icon: 'warning', title: 'Transaction Details Required' });
    }
    try {
      const result = await addPayment({
        SiteName: clientFormData.SiteName.trim(),
        Amount: Number(clientFormData.Amount),
        CGST: clientFormData.CGST ? Number(clientFormData.CGST) : 0,
        SGST: clientFormData.SGST ? Number(clientFormData.SGST) : 0,
        NetAmount: clientFormData.NetAmount ? Number(clientFormData.NetAmount) : 0,
        RccCreditAccountName: clientFormData.RccCreditAccountName,
        PaymentMode: clientFormData.PaymentMode,
        ChequeNo: clientFormData.TransactionNo,
        ChequeDate: clientFormData.TransactionDate,
        ChequePhoto: clientFormData.ChequePhoto,
      }).unwrap();
      Swal.fire({ icon: 'success', title: 'Payment Added!', text: `UID: ${result.UID || result.uid || 'N/A'}`, timer: 2500, showConfirmButton: false });
      setClientFormData({ SiteName: '', Amount: '', GST: '', CGST: '', SGST: '', NetAmount: '', RccCreditAccountName: '', PaymentMode: '', TransactionNo: '', TransactionDate: '', ChequePhoto: null });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err?.data?.message || 'Failed to add payment.' });
    }
  };

  const handleCapitalSubmit = async () => {
    if (!capitalFormData.Capital_Movment) return Swal.fire({ icon: 'warning', title: 'Capital Movement Required' });
    if (!capitalFormData.Received_Account) return Swal.fire({ icon: 'warning', title: 'Received Account Required' });
    if (!capitalFormData.Amount || Number(capitalFormData.Amount) <= 0) return Swal.fire({ icon: 'warning', title: 'Invalid Amount' });
    if (!capitalFormData.PAYMENT_MODE) return Swal.fire({ icon: 'warning', title: 'Payment Mode Required' });
    if (showCapitalTxFields && (!capitalFormData.PAYMENT_DETAILS?.trim() || !capitalFormData.PAYMENT_DATE?.trim())) {
      return Swal.fire({ icon: 'warning', title: 'Payment Details & Date Required' });
    }
    try {
      const result = await addCapitalMovement(capitalFormData).unwrap();
      Swal.fire({ icon: 'success', title: 'Capital Entry Saved!', text: `UID: ${result?.UID || result?.data?.UID || 'Generated'}`, timer: 2800, showConfirmButton: false });
      setCapitalFormData({ Capital_Movment: '', Received_Account: '', Amount: '', PAYMENT_MODE: '', PAYMENT_DETAILS: '', PAYMENT_DATE: '', Remark: '' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err?.data?.message || 'Failed to save capital movement.' });
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferFormData.Transfer_A_C_Name) return Swal.fire({ icon: 'warning', title: 'From Account Required' });
    if (!transferFormData.Transfer_Received_A_C_Name) return Swal.fire({ icon: 'warning', title: 'To Account Required' });
    if (transferFormData.Transfer_A_C_Name === transferFormData.Transfer_Received_A_C_Name) return Swal.fire({ icon: 'warning', title: 'From and To accounts cannot be same' });
    if (!transferFormData.Amount || Number(transferFormData.Amount) <= 0) return Swal.fire({ icon: 'warning', title: 'Invalid Amount' });
    if (!transferFormData.PAYMENT_MODE) return Swal.fire({ icon: 'warning', title: 'Payment Mode Required' });
    if (showTransferTxFields && (!transferFormData.PAYMENT_DETAILS?.trim() || !transferFormData.PAYMENT_DATE?.trim())) {
      return Swal.fire({ icon: 'warning', title: 'Payment Details & Date Required' });
    }
    try {
      const result = await addBankTransfer({
        Transfer_A_C_Name: transferFormData.Transfer_A_C_Name,
        Transfer_Received_A_C_Name: transferFormData.Transfer_Received_A_C_Name,
        Amount: Number(transferFormData.Amount),
        PAYMENT_MODE: transferFormData.PAYMENT_MODE,
        PAYMENT_DETAILS: transferFormData.PAYMENT_DETAILS || '',
        PAYMENT_DATE: transferFormData.PAYMENT_DATE || '',
        Remark: transferFormData.Remark || '',
      }).unwrap();
      Swal.fire({ icon: 'success', title: 'Bank Transfer Saved!', text: `UID: ${result?.UID || result?.uid || 'Generated'}`, timer: 2800, showConfirmButton: false });
      setTransferFormData({ Transfer_A_C_Name: '', Transfer_Received_A_C_Name: '', Amount: '', PAYMENT_MODE: '', PAYMENT_DETAILS: '', PAYMENT_DATE: '', Remark: '' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err?.data?.message || 'Failed to submit bank transfer.' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-none">
        
        {/* Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-100/50 border border-white/50 overflow-hidden">
          
          {/* Top Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <span className="text-xl sm:text-2xl lg:text-3xl">💰</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Payment Management</h1>
                  <p className="text-xs sm:text-sm text-blue-100 mt-0.5 hidden sm:block">
                    Record client receipts, bank transfers & capital movements
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-100">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Live</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold border-2 transition-all duration-300 whitespace-nowrap ${getTabStyles(tab, activeTab === tab.key)} ${activeTab === tab.key ? 'shadow-lg scale-105' : 'shadow-sm'}`}
                >
                  <span className="text-sm sm:text-base">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-3 sm:p-6 lg:p-8">
            
            {/* ════════════════ CLIENT RECEIPT ════════════════ */}
            {activeTab === 'client-in' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                
                {/* Info Banner */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm sm:text-lg">₹</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-emerald-800">Receive Payment from Client</h3>
                    <p className="text-xs sm:text-sm text-emerald-600">Record incoming payments with GST calculations</p>
                  </div>
                </div>

                {/* Site Name */}
                <Field label="Site Name / Project" required>
                  {isDropdownLoading ? (
                    <div className="flex items-center gap-2 py-3 text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading projects...</span>
                    </div>
                  ) : isDropdownError ? (
                    <p className="text-sm text-red-500 py-2">Failed to load projects</p>
                  ) : (
                    <select name="SiteName" value={clientFormData.SiteName} onChange={handleClientChange} className={selectCls}>
                      <option value="">— Select Project —</option>
                      {projects.map((p, i) => <option key={i} value={p}>{p}</option>)}
                    </select>
                  )}
                </Field>

                {/* Amount & Payment Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Field label="Amount" required>
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm sm:text-base">₹</span>
                      <input
                        type="number"
                        name="Amount"
                        value={clientFormData.Amount}
                        onChange={handleClientChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        autoComplete="off"
                        className={`${inputCls} pl-8 sm:pl-10`}
                      />
                    </div>
                  </Field>
                  <Field label="Payment Mode">
                    <select name="PaymentMode" value={clientFormData.PaymentMode} onChange={handleClientChange} className={selectCls}>
                      <option value="">— Select Mode —</option>
                      <option value="Cash">💵 Cash</option>
                      <option value="Cheque">📄 Cheque</option>
                      <option value="NEFT">🏦 NEFT</option>
                      <option value="RTGS">🏦 RTGS</option>
                    </select>
                  </Field>
                </div>

                {/* GST Selection */}
                <Field label="Apply GST">
                  <select name="GST" value={clientFormData.GST} onChange={handleClientChange} className={selectCls}>
                    <option value="">No GST</option>
                    <option value="18">GST @ 18%</option>
                  </select>
                </Field>

                {/* GST Breakdown */}
                {clientFormData.GST === '18' && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl sm:rounded-2xl">
                    {[
                      { label: 'CGST (9%)', val: clientFormData.CGST, icon: '📊' },
                      { label: 'SGST (9%)', val: clientFormData.SGST, icon: '📊' },
                      { label: 'Net Amount', val: clientFormData.NetAmount, bold: true, icon: '💰' },
                    ].map(g => (
                      <div key={g.label} className="text-center sm:text-left">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center justify-center sm:justify-start gap-1">
                          <span className="hidden sm:inline">{g.icon}</span> {g.label}
                        </p>
                        <p className={`text-sm sm:text-lg ${g.bold ? 'font-bold text-emerald-700' : 'font-semibold text-gray-700'}`}>
                          {g.val ? `₹${Number(g.val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Credit Account */}
                <Field label="RCC Credit Account Name" required>
                  {isDropdownLoading ? (
                    <div className="flex items-center gap-2 py-3 text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading accounts...</span>
                    </div>
                  ) : (
                    <select name="RccCreditAccountName" value={clientFormData.RccCreditAccountName} onChange={handleClientChange} className={selectCls}>
                      <option value="">— Select Account —</option>
                      {accounts.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
                    </select>
                  )}
                </Field>

                {/* Transaction Details */}
                {showClientTxFields && (
                  <div className="border-2 border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl">{clientFormData.PaymentMode === 'Cheque' ? '📄' : '🔁'}</span>
                      <p className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wide">
                        {clientFormData.PaymentMode === 'Cheque' ? 'Cheque Details' : 'Transaction Details'}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Field label={clientFormData.PaymentMode === 'Cheque' ? 'Cheque No' : 'UTR / Transaction No'} required>
                        <input 
                          type="text" 
                          name="TransactionNo" 
                          value={clientFormData.TransactionNo} 
                          onChange={handleClientChange} 
                          placeholder="Enter number..." 
                          autoComplete="off"
                          className={inputCls} 
                        />
                      </Field>
                      <Field label={clientFormData.PaymentMode === 'Cheque' ? 'Cheque Date' : 'Transaction Date'} required>
                        <input 
                          type="date" 
                          name="TransactionDate" 
                          value={clientFormData.TransactionDate} 
                          onChange={handleClientChange} 
                          className={inputCls} 
                        />
                      </Field>
                    </div>

                    {/* Cheque Photo Upload */}
                    {showChequePhoto && (
                      <Field label="Cheque Photo">
                        {!clientFormData.ChequePhoto ? (
                          <label className="flex flex-col items-center justify-center w-full h-28 sm:h-36 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-100/50 transition-all">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-xs sm:text-sm text-blue-500 font-medium">Tap to upload cheque photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                          </label>
                        ) : (
                          <div className="relative inline-block">
                            <img src={clientFormData.ChequePhoto} alt="Cheque" className="max-h-32 sm:max-h-44 rounded-xl border-2 border-blue-200 shadow-lg" />
                            <button onClick={removePhoto} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm shadow-lg transition-transform hover:scale-110">✕</button>
                          </div>
                        )}
                      </Field>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleClientSubmit}
                  disabled={isSubmittingClient}
                  className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-base shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98] ${getBtnStyles('emerald')}`}
                >
                  {isSubmittingClient ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving Payment...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✓</span> Add Payment
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* ════════════════ BANK TRANSFER ════════════════ */}
            {activeTab === 'transfer' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                
                {/* Info Banner */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-violet-50 border border-violet-200 rounded-xl sm:rounded-2xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm sm:text-lg">⇄</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-violet-800">Bank to Bank Transfer</h3>
                    <p className="text-xs sm:text-sm text-violet-600">Transfer funds between accounts</p>
                  </div>
                </div>

                {/* From & To Accounts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Field label="From Account" required>
                    {isDropdownLoading ? (
                      <div className="flex items-center gap-2 py-3 text-gray-400">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin"></div>
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : (
                      <select name="Transfer_A_C_Name" value={transferFormData.Transfer_A_C_Name} onChange={handleTransferChange} className={selectCls}>
                        <option value="">— Select Account —</option>
                        {accounts.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
                      </select>
                    )}
                  </Field>
                  <Field label="To Account" required>
                    {isDropdownLoading ? (
                      <div className="flex items-center gap-2 py-3 text-gray-400">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin"></div>
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : (
                      <select name="Transfer_Received_A_C_Name" value={transferFormData.Transfer_Received_A_C_Name} onChange={handleTransferChange} className={selectCls}>
                        <option value="">— Select Account —</option>
                        {accounts.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
                      </select>
                    )}
                  </Field>
                </div>

                {/* Amount & Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Field label="Amount" required>
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                      <input 
                        type="number" 
                        name="Amount" 
                        value={transferFormData.Amount} 
                        onChange={handleTransferChange} 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00" 
                        autoComplete="off"
                        className={`${inputCls} pl-8 sm:pl-10`} 
                      />
                    </div>
                  </Field>
                  <Field label="Payment Mode" required>
                    <select name="PAYMENT_MODE" value={transferFormData.PAYMENT_MODE} onChange={handleTransferChange} className={selectCls}>
                      <option value="">— Select Mode —</option>
                      <option value="Cheque">📄 Cheque</option>
                      <option value="NEFT">🏦 NEFT</option>
                      <option value="RTGS">🏦 RTGS</option>
                    </select>
                  </Field>
                </div>

                {/* Transaction Details */}
                {showTransferTxFields && (
                  <div className="border-2 border-violet-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-gradient-to-br from-violet-50 to-purple-50 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl">🔁</span>
                      <p className="text-xs sm:text-sm font-bold text-violet-700 uppercase tracking-wide">Transaction Details</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Field label={transferFormData.PAYMENT_MODE === 'Cheque' ? 'Cheque No' : 'UTR / Ref No'} required>
                        <input 
                          type="text" 
                          name="PAYMENT_DETAILS" 
                          value={transferFormData.PAYMENT_DETAILS} 
                          onChange={handleTransferChange} 
                          placeholder="Enter reference..." 
                          autoComplete="off"
                          className={inputCls} 
                        />
                      </Field>
                      <Field label="Payment Date" required>
                        <input 
                          type="date" 
                          name="PAYMENT_DATE" 
                          value={transferFormData.PAYMENT_DATE} 
                          onChange={handleTransferChange} 
                          className={inputCls} 
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Remark */}
                <Field label="Remark">
                  <textarea 
                    name="Remark" 
                    value={transferFormData.Remark} 
                    onChange={handleTransferChange} 
                    rows="3" 
                    placeholder="Additional notes..." 
                    className={`${inputCls} resize-none`} 
                  />
                </Field>

                {/* Submit Button */}
                <button
                  onClick={handleTransferSubmit}
                  disabled={isSubmittingTransfer}
                  className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-base shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98] ${getBtnStyles('violet')}`}
                >
                  {isSubmittingTransfer ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing Transfer...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>⇄</span> Submit Bank Transfer
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* ════════════════ CAPITAL A/C ════════════════ */}
            {activeTab === 'capital' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                
                {/* Info Banner */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm sm:text-lg">◈</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-amber-800">Capital Account Entry</h3>
                    <p className="text-xs sm:text-sm text-amber-600">Record capital movements and investments</p>
                  </div>
                </div>

                {/* Capital Movement */}
                <Field label="Capital Movement" required>
                  {isDropdownLoading ? (
                    <div className="flex items-center gap-2 py-3 text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : capitalMovements.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">No options available</p>
                  ) : (
                    <select name="Capital_Movment" value={capitalFormData.Capital_Movment} onChange={handleCapitalChange} className={selectCls}>
                      <option value="">— Select Movement —</option>
                      {capitalMovements.map((item, i) => <option key={i} value={item}>{item}</option>)}
                    </select>
                  )}
                </Field>

                {/* Received Account */}
                <Field label="Received Account" required>
                  {isDropdownLoading ? (
                    <div className="flex items-center gap-2 py-3 text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : (
                    <select name="Received_Account" value={capitalFormData.Received_Account} onChange={handleCapitalChange} className={selectCls}>
                      <option value="">— Select Account —</option>
                      {accounts.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
                    </select>
                  )}
                </Field>

                {/* Amount & Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Field label="Amount" required>
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                      <input 
                        type="number" 
                        name="Amount" 
                        value={capitalFormData.Amount} 
                        onChange={handleCapitalChange} 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00" 
                        autoComplete="off"
                        className={`${inputCls} pl-8 sm:pl-10`} 
                      />
                    </div>
                  </Field>
                  <Field label="Payment Mode" required>
                    <select name="PAYMENT_MODE" value={capitalFormData.PAYMENT_MODE} onChange={handleCapitalChange} className={selectCls}>
                      <option value="">— Select Mode —</option>
                      <option value="Cash">💵 Cash</option>
                      <option value="Cheque">📄 Cheque</option>
                      <option value="NEFT">🏦 NEFT</option>
                      <option value="RTGS">🏦 RTGS</option>
                      <option value="UPI">📱 UPI</option>
                    </select>
                  </Field>
                </div>

                {/* Payment Details */}
                {showCapitalTxFields && (
                  <div className="border-2 border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-gradient-to-br from-amber-50 to-yellow-50 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl">📋</span>
                      <p className="text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-wide">Payment Details</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Field label={capitalFormData.PAYMENT_MODE === 'Cheque' ? 'Cheque No' : 'UTR / Payment Details'} required>
                        <input 
                          type="text" 
                          name="PAYMENT_DETAILS" 
                          value={capitalFormData.PAYMENT_DETAILS} 
                          onChange={handleCapitalChange} 
                          placeholder="Enter details..." 
                          autoComplete="off"
                          className={inputCls} 
                        />
                      </Field>
                      <Field label="Payment Date" required>
                        <input 
                          type="date" 
                          name="PAYMENT_DATE" 
                          value={capitalFormData.PAYMENT_DATE} 
                          onChange={handleCapitalChange} 
                          className={inputCls} 
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Remark */}
                <Field label="Remark">
                  <textarea 
                    name="Remark" 
                    value={capitalFormData.Remark} 
                    onChange={handleCapitalChange} 
                    rows="3" 
                    placeholder="Additional notes..." 
                    className={`${inputCls} resize-none`} 
                  />
                </Field>

                {/* Submit Button */}
                <button
                  onClick={handleCapitalSubmit}
                  disabled={isSubmittingCapital}
                  className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-base shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98] ${getBtnStyles('amber')}`}
                >
                  {isSubmittingCapital ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving Entry...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>◈</span> Save Capital Movement
                    </span>
                  )}
                </button>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
              <span>💡 All fields marked with * are required</span>
              <span className="hidden sm:inline">Secure Payment Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Form;