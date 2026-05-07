'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Landmark,
  CalendarDays,
  IndianRupee,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
  FolderOpen,
  Sparkles,
  Info,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const BankChargesInterestForm = () => {
  const [projectNames, setProjectNames] = useState([]);
  const [bankNames, setBankNames] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const [formData, setFormData] = useState({
    projectName: '',
    bankPayment: '',
    chargesInterestDetails: '',
    bankName: '',
    amount: '',
    paymentMode: '',
    paymentDate: '',
    remark: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const bankPaymentOptions = ['Interest', 'Charges'];
  const paymentModeOptions = ['Bank'];

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const res = await axios.get(`${API_URL}/api/Reconcilition/InterestChargesForm`);
      if (res.data.success) {
        setProjectNames(res.data.projectNames || []);
        setBankNames(res.data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      showToast('error', 'Failed to load dropdown data');
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.projectName ||
      !formData.bankPayment ||
      !formData.chargesInterestDetails ||
      !formData.bankName ||
      !formData.amount ||
      !formData.paymentMode ||
      !formData.paymentDate
    ) {
      showToast('error', 'Please fill all required fields');
      return;
    }
    if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      showToast('error', 'Please enter a valid amount');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/api/Reconcilition/InterestChargesForm`, formData);
      if (res.data.success) {
        showToast(
          'success',
          `Data added! UID: ${res.data.data.uid} | Payment: ${res.data.data.paymentDetails}`
        );
        setFormData({
          projectName: '',
          bankPayment: '',
          chargesInterestDetails: '',
          bankName: '',
          amount: '',
          paymentMode: '',
          paymentDate: '',
          remark: '',
        });
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit data';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress calculation
  const filledFields = Object.entries(formData).filter(
    ([key, val]) => val && key !== 'remark'
  ).length;
  const totalRequired = 7;
  const progress = Math.round((filledFields / totalRequired) * 100);

  // Focus style helper
  const getInputClass = (fieldName) => {
    const base =
      'w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 bg-white text-gray-900';
    const focused =
      focusedField === fieldName
        ? 'border-indigo-500 ring-indigo-500/15 shadow-sm'
        : 'border-gray-300 hover:border-gray-400';
    return `${base} ${focused}`;
  };

  const getSelectClass = (fieldName) => {
    const base =
      'w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 bg-white text-gray-900 appearance-none cursor-pointer';
    const focused =
      focusedField === fieldName
        ? 'border-indigo-500 ring-indigo-500/15 shadow-sm'
        : 'border-gray-300 hover:border-gray-400';
    return `${base} ${focused}`;
  };

  const getLabelClass = (fieldName) => {
    return `block text-sm font-bold mb-2.5 transition-colors ${
      focusedField === fieldName ? 'text-indigo-700' : 'text-gray-800'
    }`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100/50'
                : 'bg-red-50 border-red-200 text-red-800 shadow-red-100/50'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="p-1.5 rounded-full bg-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            ) : (
              <div className="p-1.5 rounded-full bg-red-100">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <span className="text-sm font-semibold flex-1 leading-snug">
              {toast.message}
            </span>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 shadow-md shadow-indigo-100/50">
            <Landmark className="w-7 h-7 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent">
          Bank Charges & Interest
        </h2>
        <p className="mt-2 text-sm font-medium text-gray-500">
          Enter bank interest and charges details below
        </p>

        {/* Progress Bar */}
        <div className="mt-5 max-w-xs mx-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">Form Progress</span>
            <span
              className={`text-xs font-bold ${
                progress === 100 ? 'text-emerald-600' : 'text-indigo-600'
              }`}
            >
              {progress}%
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                progress === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border-2 border-gray-200 bg-white p-6 sm:p-8 shadow-xl shadow-gray-100/50">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Project Name - Full Width */}
          <div>
            <label className={getLabelClass('projectName')}>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-600" />
                Project Name <span className="text-red-500">*</span>
              </div>
            </label>
            <div className="relative">
              <select
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                onFocus={() => setFocusedField('projectName')}
                onBlur={() => setFocusedField(null)}
                className={getSelectClass('projectName')}
                required
                disabled={loadingDropdowns}
              >
                <option value="">
                  {loadingDropdowns ? '⏳ Loading projects...' : '📂 Select Project'}
                </option>
                {projectNames.map((project, index) => (
                  <option key={index} value={project}>
                    {project}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {loadingDropdowns && (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span className="text-xs font-medium text-gray-500">Fetching project names...</span>
              </div>
            )}
          </div>

          {/* Row 1: Bank Payment & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={getLabelClass('bankPayment')}>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Bank Payment <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="relative">
                <select
                  name="bankPayment"
                  value={formData.bankPayment}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('bankPayment')}
                  onBlur={() => setFocusedField(null)}
                  className={getSelectClass('bankPayment')}
                  required
                >
                  <option value="">💳 Select Type</option>
                  {bankPaymentOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className={getLabelClass('chargesInterestDetails')}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Charges & Interest Details <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                name="chargesInterestDetails"
                value={formData.chargesInterestDetails}
                onChange={handleChange}
                onFocus={() => setFocusedField('chargesInterestDetails')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. Monthly Interest, Service Charge"
                className={`${getInputClass('chargesInterestDetails')} placeholder-gray-400`}
                required
              />
            </div>
          </div>

          {/* Row 2: Bank Name & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={getLabelClass('bankName')}>
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-600" />
                  Bank Name <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="relative">
                <select
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('bankName')}
                  onBlur={() => setFocusedField(null)}
                  className={getSelectClass('bankName')}
                  required
                  disabled={loadingDropdowns}
                >
                  <option value="">
                    {loadingDropdowns ? '⏳ Loading banks...' : '🏦 Select Bank'}
                  </option>
                  {bankNames.map((bank, index) => (
                    <option key={index} value={bank}>{bank}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {loadingDropdowns && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span className="text-xs font-medium text-gray-500">Fetching bank names...</span>
                </div>
              )}
            </div>

            <div>
              <label className={getLabelClass('amount')}>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-indigo-600" />
                  Amount <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('amount')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`${getInputClass('amount')} pl-10 placeholder-gray-400`}
                  required
                />
              </div>
              {formData.amount && Number(formData.amount) > 0 && (
                <p className="text-xs mt-1.5 font-bold text-emerald-600">
                  ₹ {Number(formData.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Payment Mode & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={getLabelClass('paymentMode')}>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-indigo-600" />
                  Payment Mode <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="relative">
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('paymentMode')}
                  onBlur={() => setFocusedField(null)}
                  className={getSelectClass('paymentMode')}
                  required
                >
                  <option value="">💰 Select Mode</option>
                  {paymentModeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className={getLabelClass('paymentDate')}>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  Payment Date <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                onFocus={() => setFocusedField('paymentDate')}
                onBlur={() => setFocusedField(null)}
                className={getInputClass('paymentDate')}
                required
              />
            </div>
          </div>

          {/* Remark */}
          <div>
            <label className={getLabelClass('remark')}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Remark
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                  Optional
                </span>
              </div>
            </label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              onFocus={() => setFocusedField('remark')}
              onBlur={() => setFocusedField(null)}
              placeholder="Any additional notes or comments..."
              rows={3}
              className={`${getInputClass('remark')} resize-none placeholder-gray-400`}
            />
          </div>

          {/* Info Box */}
          <div className="rounded-2xl p-5 border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 flex-shrink-0">
                <Info className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-800">Auto-Generated Fields</p>
                <p className="text-xs mt-1.5 leading-relaxed text-indigo-600/80">
                  <span className="font-bold text-indigo-800">UID</span> (e.g., 0001) and{' '}
                  <span className="font-bold text-indigo-800">Payment Details</span> (e.g., IC0001) will be auto-generated.{' '}
                  <span className="font-bold text-indigo-800">Timestamp</span> is recorded automatically in India time.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 ${
                isSubmitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:shadow-indigo-300/40 active:scale-[0.98] border-2 border-transparent'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Entry
                  <Sparkles className="w-4 h-4 opacity-70" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.12);
          border-radius: 3px;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default BankChargesInterestForm;