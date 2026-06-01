// // app/Office/Advanceform/page.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   Save,
//   RotateCcw,
//   Loader2,
//   CheckCircle,
//   AlertCircle,
//   IndianRupee,
//   Building2,
//   CreditCard,
//   Calendar,
//   FileText,
//   RefreshCw,
//   Hash,
// } from 'lucide-react';

// const OFFICE_OPTIONS = [
//   'JEEWAN MARG',
//   'LAXMI NAGAR',
//   'MOTI NAGAR',

// ];

// const PAYMENT_MODE_OPTIONS = [
//   'CHEQUE',
//   'NEFT',
//   'RTGS',
//   'IMPS',
//   'CASH',
  
// ];

// const INITIAL_FORM = {
//   officeName: '',
//   vendorFirmName: '',
//   paidAmount: '',
//   bankDetails: '',
//   paymentMode: '',
//   paymentDetails: '',
//   paymentDate: '',
// };

// export default function AdvanceForm({ user }) {
//   const [formData, setFormData] = useState(INITIAL_FORM);
//   const [submitting, setSubmitting] = useState(false);
//   const [status, setStatus] = useState({ type: '', message: '' });
//   const [recentEntries, setRecentEntries] = useState([]);

//   // Bank names from sheet
//   const [bankNames, setBankNames] = useState([]);
//   const [loadingBanks, setLoadingBanks] = useState(true);

//   useEffect(() => {
//     fetchBankNames();
//   }, []);

//   const fetchBankNames = async () => {
//     setLoadingBanks(true);
//     try {
//       const res = await fetch('/api/OfficeExpenses/advanceform');
//       const data = await res.json();

//       if (data.data && Array.isArray(data.data)) {
//         setBankNames(data.data);
//         console.log(`✅ ${data.data.length} bank names loaded`);
//       }
//     } catch (err) {
//       console.error('❌ Failed to load bank names:', err);
//     } finally {
//       setLoadingBanks(false);
//     }
//   };

//   useEffect(() => {
//     if (status.message) {
//       const timer = setTimeout(
//         () => setStatus({ type: '', message: '' }),
//         6000
//       );
//       return () => clearTimeout(timer);
//     }
//   }, [status]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!formData.officeName.trim()) return 'Office Name is required';
//     if (!formData.vendorFirmName.trim()) return 'Vendor Firm Name is required';
//     if (!formData.paidAmount || Number(formData.paidAmount) <= 0)
//       return 'Paid Amount must be greater than 0';
//     if (!formData.bankDetails.trim()) return 'Bank Details are required';
//     if (!formData.paymentMode.trim()) return 'Payment Mode is required';
//     if (!formData.paymentDate) return 'Payment Date is required';
//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const error = validateForm();
//     if (error) {
//       setStatus({ type: 'error', message: error });
//       return;
//     }

//     setSubmitting(true);
//     setStatus({ type: '', message: '' });

//     try {
//       const res = await fetch('/api/OfficeExpenses/advanceform', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setStatus({
//           type: 'success',
//           message: `✅ Submitted! UID: ${data.data?.uid || 'Generated'}`,
//         });

//         setRecentEntries((prev) => [
//           {
//             ...formData,
//             uid: data.data?.uid || '',
//             timestamp: data.data?.timestamp || new Date().toLocaleString(),
//             id: Date.now(),
//           },
//           ...prev.slice(0, 4),
//         ]);

//         setFormData(INITIAL_FORM);
//       } else {
//         throw new Error(data.error || 'Failed to submit');
//       }
//     } catch (err) {
//       console.error(err);
//       setStatus({ type: 'error', message: `❌ Error: ${err.message}` });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleReset = () => {
//     setFormData(INITIAL_FORM);
//     setStatus({ type: '', message: '' });
//   };

//   const formatCurrency = (val) => {
//     if (!val) return '';
//     return Number(val).toLocaleString('en-IN');
//   };

//   return (
//     <div className="max-w-3xl mx-auto">
//       {/* Status Alert */}
//       {status.message && (
//         <div
//           className={`mb-6 p-4 rounded-xl flex items-start space-x-3 shadow-sm ${
//             status.type === 'success'
//               ? 'bg-green-50 border border-green-200 text-green-800'
//               : 'bg-red-50 border border-red-200 text-red-800'
//           }`}
//         >
//           {status.type === 'success' ? (
//             <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
//           ) : (
//             <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
//           )}
//           <span className="text-sm font-medium">{status.message}</span>
//         </div>
//       )}

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Row 1: Office Name + Vendor */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//           {/* Office Name */}
//           <div>
//             <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
//               <Building2 className="w-4 h-4 text-blue-500" />
//               <span>
//                 Office Name <span className="text-red-500">*</span>
//               </span>
//             </label>
//             <select
//               name="officeName"
//               value={formData.officeName}
//               onChange={handleChange}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
//               required
//             >
//               <option value="">-- Select Office --</option>
//               {OFFICE_OPTIONS.map((o) => (
//                 <option key={o} value={o}>
//                   {o}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Vendor Firm Name */}
//           <div>
//             <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
//               <FileText className="w-4 h-4 text-purple-500" />
//               <span>
//                 Vendor Firm Name <span className="text-red-500">*</span>
//               </span>
//             </label>
//             <input
//               type="text"
//               name="vendorFirmName"
//               value={formData.vendorFirmName}
//               onChange={handleChange}
//               placeholder="Enter vendor / firm name"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               required
//             />
//           </div>
//         </div>

//         {/* Row 2: Paid Amount + Payment Date */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//           {/* Paid Amount */}
//           <div>
//             <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
//               <IndianRupee className="w-4 h-4 text-green-500" />
//               <span>
//                 Paid Amount <span className="text-red-500">*</span>
//               </span>
//             </label>
//             <div className="relative">
//               {/* <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
//                 ₹
//               </span> */}
//               <input
//                 type="number"
//                 name="paidAmount"
//                 value={formData.paidAmount}
//                 onChange={handleChange}
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//                 className="w-full px-4 py-3 pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               />
//             </div>
//             {formData.paidAmount && Number(formData.paidAmount) > 0 && (
//               <p className="text-xs text-green-600 mt-1 font-medium">
//                 ₹ {formatCurrency(formData.paidAmount)}
//               </p>
//             )}
//           </div>

//           {/* Payment Date */}
//           <div>
//             <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
//               <Calendar className="w-4 h-4 text-orange-500" />
//               <span>
//                 Payment Date <span className="text-red-500">*</span>
//               </span>
//             </label>
//             <input
//               type="date"
//               name="paymentDate"
//               value={formData.paymentDate}
//               onChange={handleChange}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               required
//             />
//           </div>
//         </div>

//         {/* Row 3: Bank Details + Payment Mode */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//           {/* Bank Details - from Project_Data!B4:B */}
//           <div>
//             <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
//               <CreditCard className="w-4 h-4 text-indigo-500" />
//               <span>
//                 Bank Details <span className="text-red-500">*</span>
//               </span>
//               <button
//                 type="button"
//                 onClick={fetchBankNames}
//                 className="ml-auto text-gray-400 hover:text-blue-500"
//                 title="Refresh bank list"
//               >
//                 <RefreshCw
//                   className={`w-3.5 h-3.5 ${loadingBanks ? 'animate-spin' : ''}`}
//                 />
//               </button>
//             </label>

//             {loadingBanks ? (
//               <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center space-x-2">
//                 <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
//                 <span className="text-sm text-gray-400">Loading banks...</span>
//               </div>
//             ) : (
//               <select
//                 name="bankDetails"
//                 value={formData.bankDetails}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
//                 required
//               >
//                 <option value="">-- Select Bank --</option>
//                 {bankNames.map((b) => (
//                   <option key={b} value={b}>
//                     {b}
//                   </option>
//                 ))}
//               </select>
//             )}
//             <p className="text-xs text-gray-400 mt-1">
//               {loadingBanks
//                 ? 'Fetching...'
//                 : `${bankNames.length} banks from Project_Data`}
//             </p>
//           </div>

//           {/* Payment Mode */}
//           <div>
//             <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
//               <CreditCard className="w-4 h-4 text-teal-500" />
//               <span>
//                 Payment Mode <span className="text-red-500">*</span>
//               </span>
//             </label>
//             <select
//               name="paymentMode"
//               value={formData.paymentMode}
//               onChange={handleChange}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
//               required
//             >
//               <option value="">-- Select Mode --</option>
//               {PAYMENT_MODE_OPTIONS.map((m) => (
//                 <option key={m} value={m}>
//                   {m}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Row 4: Payment Details */}
//         <div>
//           <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
//             <FileText className="w-4 h-4 text-gray-500" />
//             <span>Payment Details / Reference</span>
//           </label>
//           <textarea
//             name="paymentDetails"
//             value={formData.paymentDetails}
//             onChange={handleChange}
//             placeholder="UTR number, cheque number, transaction ID, remarks etc."
//             rows={3}
//             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
//           />
//         </div>

//         {/* Preview */}
//         {formData.officeName &&
//           formData.vendorFirmName &&
//           formData.paidAmount && (
//             <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//               <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
//                 Preview
//               </p>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
//                 <div>
//                   <p className="text-gray-500 text-xs">Office</p>
//                   <p className="font-medium text-gray-800">
//                     {formData.officeName}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 text-xs">Vendor</p>
//                   <p className="font-medium text-gray-800">
//                     {formData.vendorFirmName}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 text-xs">Amount</p>
//                   <p className="font-bold text-green-700">
//                     ₹ {formatCurrency(formData.paidAmount)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 text-xs">Bank</p>
//                   <p className="font-medium text-gray-800">
//                     {formData.bankDetails || '—'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-3 pt-2">
//           <button
//             type="submit"
//             disabled={submitting}
//             className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-200"
//           >
//             {submitting ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 <span>Submitting...</span>
//               </>
//             ) : (
//               <>
//                 <Save className="w-4 h-4" />
//                 <span>Submit Advance Payment</span>
//               </>
//             )}
//           </button>

//           <button
//             type="button"
//             onClick={handleReset}
//             className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 flex items-center justify-center space-x-2"
//           >
//             <RotateCcw className="w-4 h-4" />
//             <span>Reset</span>
//           </button>
//         </div>
//       </form>

//       {/* Recent Entries with UID */}
//       {recentEntries.length > 0 && (
//         <div className="mt-10">
//           <h3 className="text-sm font-bold text-gray-700 mb-3">
//             Recent Submissions (this session)
//           </h3>
//           <div className="space-y-3">
//             {recentEntries.map((entry) => (
//               <div
//                 key={entry.id}
//                 className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"
//               >
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center space-x-2 mb-1">
//                     <Hash className="w-3.5 h-3.5 text-blue-500" />
//                     <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
//                       {entry.uid}
//                     </span>
//                   </div>
//                   <p className="text-sm font-semibold text-gray-800 truncate">
//                     {entry.vendorFirmName}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {entry.officeName} • {entry.bankDetails} •{' '}
//                     {entry.paymentMode} • {entry.paymentDate}
//                   </p>
//                 </div>
//                 <p className="text-sm font-bold text-green-700 ml-4 whitespace-nowrap">
//                   ₹ {formatCurrency(entry.paidAmount)}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }







// app/Office/Advanceform/page.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Building2,
  CreditCard,
  Calendar,
  FileText,
  RefreshCw,
  Hash,
} from 'lucide-react';

const PAYMENT_MODE_OPTIONS = [
  'NEFT',
  'RTGS',
  'IMPS',
  'CHEQUE',
  'CASH',
  
];

const INITIAL_FORM = {
  officeName: '',
  vendorFirmName: '',
  paidAmount: '',
  bankDetails: '',
  paymentMode: '',
  paymentDetails: '',
  paymentDate: '',
};

export default function AdvanceForm({ user }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [recentEntries, setRecentEntries] = useState([]);

  // ✅ Dropdown data from sheet
  const [bankNames, setBankNames] = useState([]);
  const [officeNames, setOfficeNames] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ✅ Fetch both dropdowns on mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/OfficeExpenses/advanceform');
      const result = await res.json();

      if (result.data) {
        if (result.data.bankNames) {
          setBankNames(result.data.bankNames);
        }
        if (result.data.officeNames) {
          setOfficeNames(result.data.officeNames);
        }
        console.log(
          `✅ Loaded: ${result.data.bankNames?.length || 0} banks, ${result.data.officeNames?.length || 0} offices`
        );
      }
    } catch (err) {
      console.error('❌ Failed to load dropdown data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(
        () => setStatus({ type: '', message: '' }),
        6000
      );
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.officeName.trim()) return 'Office Name is required';
    if (!formData.vendorFirmName.trim()) return 'Vendor Firm Name is required';
    if (!formData.paidAmount || Number(formData.paidAmount) <= 0)
      return 'Paid Amount must be greater than 0';
    if (!formData.bankDetails.trim()) return 'Bank Details are required';
    if (!formData.paymentMode.trim()) return 'Payment Mode is required';
    if (!formData.paymentDate) return 'Payment Date is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/OfficeExpenses/advanceform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: 'success',
          message: `✅ Submitted! UID: ${data.data?.uid || 'Generated'}`,
        });

        setRecentEntries((prev) => [
          {
            ...formData,
            uid: data.data?.uid || '',
            timestamp: data.data?.timestamp || new Date().toLocaleString(),
            id: Date.now(),
          },
          ...prev.slice(0, 4),
        ]);

        setFormData(INITIAL_FORM);
      } else {
        throw new Error(data.error || 'Failed to submit');
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: `❌ Error: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setStatus({ type: '', message: '' });
  };

  const formatCurrency = (val) => {
    if (!val) return '';
    return Number(val).toLocaleString('en-IN');
  };

  // ✅ Loading state
  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 text-sm">Loading form data from sheet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchDropdownData}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Status Alert */}
      {status.message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start space-x-3 shadow-sm ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Office Name + Vendor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ✅ Office Name - from Project_Data!L4:L */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>
                Office Name <span className="text-red-500">*</span>
              </span>
            </label>
            <select
              name="officeName"
              value={formData.officeName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              required
            >
              <option value="">-- Select Office --</option>
              {officeNames.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {officeNames.length} offices from Project_Data
            </p>
          </div>

          {/* Vendor Firm Name */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>
                Vendor Firm Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              name="vendorFirmName"
              value={formData.vendorFirmName}
              onChange={handleChange}
              placeholder="Enter vendor / firm name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        {/* Row 2: Paid Amount + Payment Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Paid Amount */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <IndianRupee className="w-4 h-4 text-green-500" />
              <span>
                Paid Amount <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="relative">
              {/* <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                ₹
              </span> */}
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
            {formData.paidAmount && Number(formData.paidAmount) > 0 && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                ₹ {formatCurrency(formData.paidAmount)}
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>
                Payment Date <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        {/* Row 3: Bank Details + Payment Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ✅ Bank Details - from Project_Data!B4:B */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              <span>
                Bank Details <span className="text-red-500">*</span>
              </span>
            </label>
            <select
              name="bankDetails"
              value={formData.bankDetails}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              required
            >
              <option value="">-- Select Bank --</option>
              {bankNames.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {bankNames.length} banks from Project_Data
            </p>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 text-teal-500" />
              <span>
                Payment Mode <span className="text-red-500">*</span>
              </span>
            </label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              required
            >
              <option value="">-- Select Mode --</option>
              {PAYMENT_MODE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Payment Details */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span>Payment Details / Reference</span>
          </label>
          <textarea
            name="paymentDetails"
            value={formData.paymentDetails}
            onChange={handleChange}
            placeholder="UTR number, cheque number, transaction ID, remarks etc."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
          />
        </div>

        {/* Preview */}
        {formData.officeName &&
          formData.vendorFirmName &&
          formData.paidAmount && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                Preview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Office</p>
                  <p className="font-medium text-gray-800">
                    {formData.officeName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Vendor</p>
                  <p className="font-medium text-gray-800">
                    {formData.vendorFirmName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Amount</p>
                  <p className="font-bold text-green-700">
                    ₹ {formatCurrency(formData.paidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Bank</p>
                  <p className="font-medium text-gray-800">
                    {formData.bankDetails || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-200"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Submit Advance Payment</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </form>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-bold text-gray-700 mb-3">
            Recent Submissions (this session)
          </h3>
          <div className="space-y-3">
            {/* {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Hash className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {entry.uid}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {entry.vendorFirmName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.officeName} • {entry.bankDetails} •{' '}
                    {entry.paymentMode} • {entry.paymentDate}
                  </p>
                </div>
                <p className="text-sm font-bold text-green-700 ml-4 whitespace-nowrap">
                  ₹ {formatCurrency(entry.paidAmount)}
                </p>
              </div>
            ))} */}
          </div>
        </div>
      )}
    </div>
  );
}