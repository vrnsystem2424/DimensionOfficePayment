

// 'use client';

// import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
// import { useGetAllFormDataQuery, useSubmitPaymentMutation } from '../../features/expensesForm';

// // ─── Reusable Searchable Dropdown ─────────────────────────────────────────────
// function SearchableDropdown({ value, onChange, onSelect, options, placeholder, disabled, renderOption }) {
//   const [open, setOpen] = useState(false);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     const handler = (e) => {
//       if (containerRef.current && !containerRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   return (
//     <div ref={containerRef} style={{ position: 'relative' }}>
//       <div style={{ position: 'relative' }}>
//         <input
//           type="text"
//           value={value}
//           onChange={(e) => { onChange(e.target.value); setOpen(true); }}
//           onFocus={e => { if (!disabled) { e.target.style.borderColor = '#6366f1'; setOpen(true); } }}
//           onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
//           disabled={disabled}
//           placeholder={placeholder}
//           style={{
//             width: '100%', padding: '10px 36px 10px 12px',
//             border: '1.5px solid #e2e8f0', borderRadius: '10px',
//             fontSize: '14px', background: disabled ? '#f8fafc' : '#fff',
//             color: disabled ? '#94a3b8' : '#1e293b',
//             outline: 'none', transition: 'border-color 0.2s',
//             boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text',
//           }}
//         />
//         <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: '11px' }}>▼</span>
//       </div>

//       {open && options.length > 0 && (
//         <div style={{
//           position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
//           background: '#fff', border: '1.5px solid #e0e7ff',
//           borderRadius: '10px', boxShadow: '0 8px 24px rgba(99,102,241,0.12)',
//           maxHeight: '220px', overflowY: 'auto', zIndex: 9999,
//         }}>
//           {options.map((opt, idx) => (
//             <div
//               key={idx}
//               onMouseDown={(e) => {
//                 e.preventDefault();
//                 onSelect(opt);
//                 setOpen(false);
//               }}
//               style={{
//                 padding: '10px 14px', cursor: 'pointer', fontSize: '14px',
//                 color: '#1e293b', borderBottom: idx < options.length - 1 ? '1px solid #f1f5f9' : 'none',
//                 transition: 'background 0.12s',
//               }}
//               onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
//               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//             >
//               {renderOption ? renderOption(opt) : opt}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function Label({ children, required }) {
//   return (
//     <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px', letterSpacing: '0.01em' }}>
//       {children}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
//     </label>
//   );
// }

// function Input({ value, onChange, placeholder, type = 'text', disabled, readOnly, required, min, step }) {
//   return (
//     <input
//       type={type} value={value} onChange={onChange} placeholder={placeholder}
//       disabled={disabled} readOnly={readOnly} required={required} min={min} step={step}
//       style={{
//         width: '100%', padding: '10px 12px',
//         border: '1.5px solid #e2e8f0', borderRadius: '10px',
//         fontSize: '14px', background: (disabled || readOnly) ? '#f8fafc' : '#fff',
//         color: (disabled || readOnly) ? '#94a3b8' : '#1e293b',
//         outline: 'none', transition: 'border-color 0.2s',
//         boxSizing: 'border-box', cursor: (disabled || readOnly) ? 'not-allowed' : 'text',
//       }}
//       onFocus={e => { if (!disabled && !readOnly) e.target.style.borderColor = '#6366f1'; }}
//       onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
//     />
//   );
// }

// const EMPTY_ITEM = () => ({
//   id: Date.now() + Math.random(),
//   subhead: '', subheadSearch: '',
//   itemName: '', itemNameSearch: '',
//   unit: '', skuCode: '',
//   quantity: '', amount: '', remarks: ''
// });

// // ─── Main Component ────────────────────────────────────────────────────────────
// export default function ExpensesFormComponent() {
//   const [officeName] = useState('Dimension Office');
//   const [payeeName, setPayeeName] = useState('');
//   const [selectedFormRaised, setSelectedFormRaised] = useState('');
//   const [formRaisedSearch, setFormRaisedSearch] = useState('');
//   const [billPhoto, setBillPhoto] = useState('');
//   const [billPhotoPreview, setBillPhotoPreview] = useState('');
//   // ✅ File input reset ke liye — key change hone par input re-mount hota hai
//   const [fileInputKey, setFileInputKey] = useState(0);

//   const [items, setItems] = useState([EMPTY_ITEM()]);

//   const { data: allData, isLoading } = useGetAllFormDataQuery();
//   const [submitPayment, { isLoading: submitting }] = useSubmitPaymentMutation();

//   const allFormRaisedOptions = useMemo(() => {
//     if (!allData?.formRaised) return [];
//     const all = new Set();
//     Object.values(allData.formRaised).forEach(vals => vals.forEach(v => all.add(v)));
//     return Array.from(all);
//   }, [allData?.formRaised]);

//   const filteredFormRaised = useMemo(() => {
//     if (!formRaisedSearch) return allFormRaisedOptions;
//     return allFormRaisedOptions.filter(p => p.toLowerCase().includes(formRaisedSearch.toLowerCase()));
//   }, [formRaisedSearch, allFormRaisedOptions]);

//   const subheadsList = allData?.subheads || [];

//   const getFilteredSubheads = (search) => {
//     if (!search) return subheadsList;
//     return subheadsList.filter(s => s.toLowerCase().includes(search.toLowerCase()));
//   };

//   const getFilteredItems = (subhead, search) => {
//     const list = (allData?.items?.[subhead]) || [];
//     if (!search) return list;
//     return list.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()));
//   };

//   // ✅ Item ke baad naya item insert karo (us item ke theek neeche)
//   const addItemAfter = (afterIndex) => {
//     setItems(prev => {
//       const newItems = [...prev];
//       newItems.splice(afterIndex + 1, 0, EMPTY_ITEM());
//       return newItems;
//     });
//   };

//   const removeItem = (id) => {
//     if (items.length === 1) return alert('At least one item is required');
//     setItems(prev => prev.filter(i => i.id !== id));
//   };

//   const updateItem = useCallback((id, fields) => {
//     setItems(prev => prev.map(item => item.id === id ? { ...item, ...fields } : item));
//   }, []);

//   const handleSubheadSelect = (id, subhead) => {
//     updateItem(id, { subhead, subheadSearch: subhead, itemName: '', itemNameSearch: '', unit: '', skuCode: '' });
//   };

//   const handleItemSelect = (id, opt) => {
//     updateItem(id, { itemName: opt.itemName, itemNameSearch: opt.itemName, unit: opt.unit, skuCode: opt.skuCode });
//   };

//   const handleBillPhoto = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => { setBillPhoto(reader.result); setBillPhotoPreview(URL.createObjectURL(file)); };
//     reader.readAsDataURL(file);
//   };

//   const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

//   // ✅ Poora form reset karo
//   const resetForm = () => {
//     setPayeeName('');
//     setSelectedFormRaised('');
//     setFormRaisedSearch('');
//     setBillPhoto('');
//     setBillPhotoPreview('');
//     setFileInputKey(prev => prev + 1); // file input blank ho jaata hai
//     setItems([EMPTY_ITEM()]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!payeeName) return alert('Please enter Payee Name');
//     if (!selectedFormRaised) return alert('Please select Form Raised By');
//     for (const item of items) {
//       if (!item.subhead) return alert('Please select subhead for all items');
//       if (!item.itemName) return alert('Please select item name for all items');
//       if (!item.quantity) return alert('Please enter quantity for all items');
//       if (!item.amount) return alert('Please enter amount for all items');
//     }

//     const payload = {
//       officeName, payeeName, expensesHead: 'Office Expenses',
//       items: items.map(i => ({
//         subhead: i.subhead, itemName: i.itemName, unit: i.unit,
//         skuCode: i.skuCode, quantity: i.quantity, amount: i.amount,
//         formRaisedBy: selectedFormRaised,
//         billPhoto: billPhoto || '',
//         remarks: i.remarks || ''
//       })),
//       remarks: ''
//     };

//     try {
//       const result = await submitPayment(payload).unwrap();
//       alert(`✅ Success!\nBill No: ${result.data.billNumber}\nTotal: ₹${result.data.totalAmount}`);
//       resetForm();
//     } catch (err) {
//       alert('Submission failed: ' + (err.data?.error || err.message));
//     }
//   };

//   if (isLoading) {
//     return (
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px', fontFamily: 'DM Sans, sans-serif' }}>
//         <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
//         <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Loading form data...</p>
//         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//       </div>
//     );
//   }

//   return (
//     <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef2ff 0%, #fafafa 55%, #ecfdf5 100%)', padding: '32px 16px', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
//       <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>

//       <div style={{ maxWidth: '780px', margin: '0 auto', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 32px rgba(99,102,241,0.10)', overflow: 'visible' }}>

//         {/* Header */}
//         <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '20px 20px 0 0', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '14px' }}>
//           <div style={{ width: '46px', height: '46px', background: 'rgba(255,255,255,0.18)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🧾</div>
//           <div>
//             <h1 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.01em' }}>Office Expenses Form</h1>
//             <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.72)', fontSize: '13px' }}>Dimension Office · Submit expense claims</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} style={{ padding: '32px' }}>

//           {/* Section: Basic Info */}
//           <div style={{ fontSize: '12px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
//             <span>📋</span> Basic Information
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

//             {/* Office Name */}
//             <div>
//               <Label>Office Name</Label>
//               <div style={{ background: '#f0f4ff', border: '1.5px solid #c7d2fe', borderRadius: '10px', padding: '9px 12px', fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>
//                 🏢 {officeName}
//               </div>
//             </div>

//             {/* Payee Name */}
//             <div>
//               <Label required>Payee Name</Label>
//               <Input value={payeeName} onChange={e => setPayeeName(e.target.value)} placeholder="Enter payee name" required />
//             </div>

//             {/* Form Raised By */}
//             <div style={{ gridColumn: '1 / -1' }}>
//               <Label required>Form Raised By</Label>
//               <SearchableDropdown
//                 value={formRaisedSearch}
//                 onChange={(val) => { setFormRaisedSearch(val); setSelectedFormRaised(''); }}
//                 onSelect={(person) => { setSelectedFormRaised(person); setFormRaisedSearch(person); }}
//                 options={filteredFormRaised}
//                 placeholder="Type to search or select person..."
//               />
//             </div>

//             {/* Bill Photo */}
//             <div style={{ gridColumn: '1 / -1' }}>
//               <Label>Bill Photo (Optional)</Label>
//               {/* ✅ key prop: submit ke baad fileInputKey badha do — input re-mount hoga, file clear */}
//               <input
//               required
//                 key={fileInputKey}
//                 type="file"
//                 accept="image/*"
//                 onChange={handleBillPhoto}
//                 style={{ width: '100%', padding: '9px 12px', border: '1.5px dashed #c7d2fe', borderRadius: '10px', fontSize: '13px', color: '#64748b', cursor: 'pointer', background: '#fafbff' }}
//               />
//               {billPhotoPreview && (
//                 <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                   <img src={billPhotoPreview} alt="Bill" style={{ height: '60px', borderRadius: '8px', border: '1.5px solid #e0e7ff' }} />
//                   <button type="button"
//                     onClick={() => { setBillPhoto(''); setBillPhotoPreview(''); setFileInputKey(prev => prev + 1); }}
//                     style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
//                     ✕ Remove
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Divider */}
//           <div style={{ height: '1px', background: '#f1f5f9', margin: '28px 0' }} />

//           {/* Section: Items */}
//           <div style={{ fontSize: '12px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
//             <span>📦</span> Items Details
//           </div>

//           {items.map((item, index) => (
//             <div key={item.id}>

//               {/* Item Card */}
//               <div style={{ border: '1.5px solid #e0e7ff', borderRadius: '14px', padding: '20px', background: '#fafbff' }}>

//                 {/* Item Header */}
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//                   <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>
//                     Item #{index + 1}
//                   </span>
//                   {items.length > 1 && (
//                     <button type="button" onClick={() => removeItem(item.id)}
//                       style={{ background: '#fff0f0', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
//                       onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
//                       onMouseLeave={e => e.currentTarget.style.background = '#fff0f0'}>
//                       ✕ Remove
//                     </button>
//                   )}
//                 </div>

//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

//                   {/* Subhead */}
//                   <div>
//                     <Label required>Subhead</Label>
//                     <SearchableDropdown
//                       value={item.subheadSearch}
//                       onChange={(val) => updateItem(item.id, { subheadSearch: val, ...(val === '' ? { subhead: '' } : {}) })}
//                       onSelect={(subhead) => handleSubheadSelect(item.id, subhead)}
//                       options={getFilteredSubheads(item.subheadSearch)}
//                       placeholder="Search subhead..."
//                     />
//                   </div>

//                   {/* Item Name */}
//                   <div>
//                     <Label required>Item Name</Label>
//                     <SearchableDropdown
//                       value={item.itemNameSearch}
//                       onChange={(val) => {
//                         if (!item.subhead) { alert('Please select subhead first'); return; }
//                         updateItem(item.id, { itemNameSearch: val, ...(val === '' ? { itemName: '', unit: '', skuCode: '' } : {}) });
//                       }}
//                       onSelect={(opt) => handleItemSelect(item.id, opt)}
//                       options={getFilteredItems(item.subhead, item.itemNameSearch)}
//                       placeholder={item.subhead ? 'Search item...' : 'Select subhead first'}
//                       disabled={!item.subhead}
//                       renderOption={(opt) => (
//                         <div>
//                           <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{opt.itemName}</div>
//                           <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Unit: {opt.unit} · SKU: {opt.skuCode}</div>
//                         </div>
//                       )}
//                     />
//                   </div>

//                   {/* Unit */}
//                   <div>
//                     <Label>Unit</Label>
//                     <Input value={item.unit} readOnly placeholder="Auto-filled" />
//                   </div>

//                   {/* SKU Code */}
//                   <div>
//                     <Label>SKU Code</Label>
//                     <Input value={item.skuCode} readOnly placeholder="Auto-filled" />
//                   </div>

//                   {/* Quantity */}
//                   <div>
//                     <Label required>Quantity</Label>
//                     <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, { quantity: e.target.value })} placeholder="0" min="0" step="1" required />
//                   </div>

//                   {/* Amount */}
//                   <div>
//                     <Label required>Amount (₹)</Label>
//                     <Input type="number" value={item.amount} onChange={e => updateItem(item.id, { amount: e.target.value })} placeholder="0.00" min="0" step="0.01" required />
//                   </div>

//                   {/* Remarks */}
//                   <div style={{ gridColumn: '1 / -1' }}>
//                     <Label>Remarks (Optional)</Label>
//                     <textarea
//                       value={item.remarks}
//                       onChange={e => updateItem(item.id, { remarks: e.target.value })}
//                       placeholder="Any notes for this item..."
//                       rows={2}
//                       style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', resize: 'vertical', fontFamily: 'inherit', background: '#fff', outline: 'none' }}
//                       onFocus={e => e.target.style.borderColor = '#6366f1'}
//                       onBlur={e => e.target.style.borderColor = '#e2e8f0'}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* ✅ Add Item Below button — har card ke neeche */}
//               <div style={{ margin: '10px 0' }}>
//                 <button
//                   type="button"
//                   onClick={() => addItemAfter(index)}
//                   style={{
//                     width: '100%', padding: '9px',
//                     background: '#fff', color: '#6366f1',
//                     border: '1.5px dashed #a5b4fc', borderRadius: '10px',
//                     fontSize: '13px', fontWeight: '700', cursor: 'pointer',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
//                     transition: 'all 0.15s',
//                   }}
//                   onMouseEnter={e => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.borderColor = '#6366f1'; }}
//                   onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#a5b4fc'; }}
//                 >
//                   + Add Item Below
//                 </button>
//               </div>

//             </div>
//           ))}

//           {/* Total */}
//           <div style={{ background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)', border: '1.5px solid #e0e7ff', borderRadius: '12px', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '8px' }}>
//             <div>
//               <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Amount</div>
//               <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>{items.length} item{items.length !== 1 ? 's' : ''}</div>
//             </div>
//             <div style={{ fontSize: '30px', fontWeight: '800', color: '#6366f1', letterSpacing: '-0.02em' }}>
//               ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//             </div>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={submitting}
//             style={{
//               width: '100%',
//               background: submitting ? '#c7d2fe' : 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
//               color: '#fff', border: 'none', borderRadius: '12px',
//               padding: '14px', fontSize: '16px', fontWeight: '700',
//               cursor: submitting ? 'not-allowed' : 'pointer',
//               boxShadow: submitting ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
//               letterSpacing: '0.01em', transition: 'all 0.2s',
//             }}
//             onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.92'; }}
//             onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
//           >
//             {submitting ? '⏳ Submitting...' : `🚀 Submit ${items.length} Item${items.length !== 1 ? 's' : ''}`}
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// }






'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  useGetAllFormDataQuery,
  useGetProjectNamesQuery,   // ✅ NEW
  useSubmitPaymentMutation
} from '../../features/expensesForm';

// ─── Reusable Searchable Dropdown ─────────────────────────────────────────────
function SearchableDropdown({
  value, onChange, onSelect, options, placeholder,
  disabled, renderOption
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={e => {
            if (!disabled) {
              e.target.style.borderColor = '#6366f1';
              setOpen(true);
            }
          }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 36px 10px 12px',
            border: '1.5px solid #e2e8f0', borderRadius: '10px',
            fontSize: '14px',
            background: disabled ? '#f8fafc' : '#fff',
            color: disabled ? '#94a3b8' : '#1e293b',
            outline: 'none', transition: 'border-color 0.2s',
            boxSizing: 'border-box',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        <span style={{
          position: 'absolute', right: '10px', top: '50%',
          transform: 'translateY(-50%)', color: '#94a3b8',
          pointerEvents: 'none', fontSize: '11px'
        }}>▼</span>
      </div>

      {open && options.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)',
          left: 0, right: 0,
          background: '#fff', border: '1.5px solid #e0e7ff',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(99,102,241,0.12)',
          maxHeight: '220px', overflowY: 'auto', zIndex: 9999,
        }}>
          {options.map((opt, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(opt);
                setOpen(false);
              }}
              style={{
                padding: '10px 14px', cursor: 'pointer',
                fontSize: '14px', color: '#1e293b',
                borderBottom: idx < options.length - 1
                  ? '1px solid #f1f5f9' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e =>
                e.currentTarget.style.background = '#f0f4ff'}
              onMouseLeave={e =>
                e.currentTarget.style.background = 'transparent'}
            >
              {renderOption ? renderOption(opt) : opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label style={{
      display: 'block', fontSize: '13px', fontWeight: '600',
      color: '#475569', marginBottom: '6px', letterSpacing: '0.01em'
    }}>
      {children}
      {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
    </label>
  );
}

function Input({
  value, onChange, placeholder, type = 'text',
  disabled, readOnly, required, min, step
}) {
  return (
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder}
      disabled={disabled} readOnly={readOnly}
      required={required} min={min} step={step}
      style={{
        width: '100%', padding: '10px 12px',
        border: '1.5px solid #e2e8f0', borderRadius: '10px',
        fontSize: '14px',
        background: (disabled || readOnly) ? '#f8fafc' : '#fff',
        color: (disabled || readOnly) ? '#94a3b8' : '#1e293b',
        outline: 'none', transition: 'border-color 0.2s',
        boxSizing: 'border-box',
        cursor: (disabled || readOnly) ? 'not-allowed' : 'text',
      }}
      onFocus={e => {
        if (!disabled && !readOnly) e.target.style.borderColor = '#6366f1';
      }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
    />
  );
}

const EMPTY_ITEM = () => ({
  id: Date.now() + Math.random(),
  subhead: '', subheadSearch: '',
  itemName: '', itemNameSearch: '',
  unit: '', skuCode: '',
  quantity: '', amount: '', remarks: ''
});

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ExpensesFormComponent() {

  // ✅ Office Name ab dynamic dropdown hai
  const [selectedProject, setSelectedProject] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  const [payeeName, setPayeeName] = useState('');
  const [selectedFormRaised, setSelectedFormRaised] = useState('');
  const [formRaisedSearch, setFormRaisedSearch] = useState('');
  const [billPhoto, setBillPhoto] = useState('');
  const [billPhotoPreview, setBillPhotoPreview] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [items, setItems] = useState([EMPTY_ITEM()]);

  // ✅ API Hooks
  const { data: allData, isLoading } = useGetAllFormDataQuery();
  const {
    data: projectNames,
    isLoading: projectsLoading
  } = useGetProjectNamesQuery();                          // ✅ NEW
  const [submitPayment, { isLoading: submitting }] = useSubmitPaymentMutation();

  // ✅ Project dropdown filtering
  const filteredProjects = useMemo(() => {
    if (!projectNames) return [];
    if (!projectSearch) return projectNames;
    return projectNames.filter(p =>
      p.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [projectSearch, projectNames]);

  // Form Raised options
  const allFormRaisedOptions = useMemo(() => {
    if (!allData?.formRaised) return [];
    const all = new Set();
    Object.values(allData.formRaised).forEach(vals =>
      vals.forEach(v => all.add(v))
    );
    return Array.from(all);
  }, [allData?.formRaised]);

  const filteredFormRaised = useMemo(() => {
    if (!formRaisedSearch) return allFormRaisedOptions;
    return allFormRaisedOptions.filter(p =>
      p.toLowerCase().includes(formRaisedSearch.toLowerCase())
    );
  }, [formRaisedSearch, allFormRaisedOptions]);

  const subheadsList = allData?.subheads || [];

  const getFilteredSubheads = (search) => {
    if (!search) return subheadsList;
    return subheadsList.filter(s =>
      s.toLowerCase().includes(search.toLowerCase())
    );
  };

  const getFilteredItems = (subhead, search) => {
    const list = (allData?.items?.[subhead]) || [];
    if (!search) return list;
    return list.filter(i =>
      i.itemName.toLowerCase().includes(search.toLowerCase())
    );
  };

  const addItemAfter = (afterIndex) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems.splice(afterIndex + 1, 0, EMPTY_ITEM());
      return newItems;
    });
  };

  const removeItem = (id) => {
    if (items.length === 1) return alert('At least one item is required');
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = useCallback((id, fields) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, ...fields } : item)
    );
  }, []);

  const handleSubheadSelect = (id, subhead) => {
    updateItem(id, {
      subhead, subheadSearch: subhead,
      itemName: '', itemNameSearch: '',
      unit: '', skuCode: ''
    });
  };

  const handleItemSelect = (id, opt) => {
    updateItem(id, {
      itemName: opt.itemName,
      itemNameSearch: opt.itemName,
      unit: opt.unit,
      skuCode: opt.skuCode
    });
  };

  const handleBillPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBillPhoto(reader.result);
      setBillPhotoPreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const totalAmount = items.reduce(
    (s, i) => s + (parseFloat(i.amount) || 0), 0
  );

  // ✅ Full form reset
  const resetForm = () => {
    setSelectedProject('');       // ✅ Reset project
    setProjectSearch('');         // ✅ Reset project search
    setPayeeName('');
    setSelectedFormRaised('');
    setFormRaisedSearch('');
    setBillPhoto('');
    setBillPhotoPreview('');
    setFileInputKey(prev => prev + 1);
    setItems([EMPTY_ITEM()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Project validation
    if (!selectedProject) return alert('Please select a Project / Office Name');
    if (!payeeName) return alert('Please enter Payee Name');
    if (!selectedFormRaised) return alert('Please select Form Raised By');

    for (const item of items) {
      if (!item.subhead) return alert('Please select subhead for all items');
      if (!item.itemName) return alert('Please select item name for all items');
      if (!item.quantity) return alert('Please enter quantity for all items');
      if (!item.amount) return alert('Please enter amount for all items');
    }

    const payload = {
      officeName: selectedProject,    // ✅ Dynamic project name
      payeeName,
      expensesHead: 'Office Expenses',
      items: items.map(i => ({
        subhead: i.subhead,
        itemName: i.itemName,
        unit: i.unit,
        skuCode: i.skuCode,
        quantity: i.quantity,
        amount: i.amount,
        formRaisedBy: selectedFormRaised,
        billPhoto: billPhoto || '',
        remarks: i.remarks || ''
      })),
      remarks: ''
    };

    try {
      const result = await submitPayment(payload).unwrap();
      alert(
        `✅ Success!\nProject: ${selectedProject}\nBill No: ${result.data.billNumber}\nTotal: ₹${result.data.totalAmount}`
      );
      resetForm();
    } catch (err) {
      alert('Submission failed: ' + (err.data?.error || err.message));
    }
  };

  // ✅ Loading state — dono APIs ka wait
  if (isLoading || projectsLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', flexDirection: 'column', gap: '12px',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#6366f1', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Loading form data...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eef2ff 0%, #fafafa 55%, #ecfdf5 100%)',
      padding: '32px 16px',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        maxWidth: '780px', margin: '0 auto',
        background: '#fff', borderRadius: '20px',
        boxShadow: '0 4px 32px rgba(99,102,241,0.10)',
        overflow: 'visible'
      }}>

        {/* ═══ Header ═══ */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 32px',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{
            width: '46px', height: '46px',
            background: 'rgba(255,255,255,0.18)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '22px'
          }}>🧾</div>
          <div>
            <h1 style={{
              margin: 0, color: '#fff', fontSize: '20px',
              fontWeight: '800', letterSpacing: '-0.01em'
            }}>Office Expenses Form</h1>
            <p style={{
              margin: '2px 0 0',
              color: 'rgba(255,255,255,0.72)', fontSize: '13px'
            }}>
              {/* ✅ Dynamic project name in header */}
              {selectedProject || 'Select Project'} · Submit expense claims
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>

          {/* ═══ Section: Basic Info ═══ */}
          <div style={{
            fontSize: '12px', fontWeight: '700', color: '#6366f1',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span>📋</span> Basic Information
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>

            {/* ✅ Office / Project Name — Ab Searchable Dropdown */}
            <div>
              <Label required>Office / Project Name</Label>
              <SearchableDropdown
                value={projectSearch}
                onChange={(val) => {
                  setProjectSearch(val);
                  if (val === '') setSelectedProject('');
                }}
                onSelect={(project) => {
                  setSelectedProject(project);
                  setProjectSearch(project);
                }}
                options={filteredProjects}
                placeholder="🏢 Search project..."
              />
              {/* ✅ Selected project badge */}
              {selectedProject && (
                <div style={{
                  marginTop: '6px',
                  display: 'inline-flex',
                  alignItems: 'center', gap: '6px',
                  background: '#f0f4ff',
                  border: '1px solid #c7d2fe',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6366f1'
                }}>
                  ✅ {selectedProject}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject('');
                      setProjectSearch('');
                    }}
                    style={{
                      background: 'none', border: 'none',
                      color: '#94a3b8', cursor: 'pointer',
                      fontSize: '13px', padding: '0 2px',
                      lineHeight: 1
                    }}
                  >✕</button>
                </div>
              )}
            </div>

            {/* Payee Name */}
            <div>
              <Label required>Payee Name</Label>
              <Input
                value={payeeName}
                onChange={e => setPayeeName(e.target.value)}
                placeholder="Enter payee name"
                required
              />
            </div>

            {/* Form Raised By */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label required>Form Raised By</Label>
              <SearchableDropdown
                value={formRaisedSearch}
                onChange={(val) => {
                  setFormRaisedSearch(val);
                  setSelectedFormRaised('');
                }}
                onSelect={(person) => {
                  setSelectedFormRaised(person);
                  setFormRaisedSearch(person);
                }}
                options={filteredFormRaised}
                placeholder="Type to search or select person..."
              />
            </div>

            {/* Bill Photo */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Bill Photo (Optional)</Label>
              <input
                required
                key={fileInputKey}
                type="file"
                accept="image/*"
                onChange={handleBillPhoto}
                style={{
                  width: '100%', padding: '9px 12px',
                  border: '1.5px dashed #c7d2fe',
                  borderRadius: '10px', fontSize: '13px',
                  color: '#64748b', cursor: 'pointer',
                  background: '#fafbff'
                }}
              />
              {billPhotoPreview && (
                <div style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center', gap: '10px'
                }}>
                  <img
                    src={billPhotoPreview}
                    alt="Bill"
                    style={{
                      height: '60px', borderRadius: '8px',
                      border: '1.5px solid #e0e7ff'
                    }}
                  />
                  <button type="button"
                    onClick={() => {
                      setBillPhoto('');
                      setBillPhotoPreview('');
                      setFileInputKey(prev => prev + 1);
                    }}
                    style={{
                      background: 'none', border: 'none',
                      color: '#ef4444', cursor: 'pointer',
                      fontSize: '12px', padding: 0
                    }}>
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: '1px', background: '#f1f5f9',
            margin: '28px 0'
          }} />

          {/* ═══ Section: Items ═══ */}
          <div style={{
            fontSize: '12px', fontWeight: '700', color: '#6366f1',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span>📦</span> Items Details
          </div>

          {items.map((item, index) => (
            <div key={item.id}>

              {/* Item Card */}
              <div style={{
                border: '1.5px solid #e0e7ff',
                borderRadius: '14px', padding: '20px',
                background: '#fafbff'
              }}>

                {/* Item Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', borderRadius: '8px',
                    padding: '4px 12px', fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    Item #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: '#fff0f0', color: '#ef4444',
                        border: '1.5px solid #fecaca',
                        borderRadius: '8px', padding: '4px 12px',
                        fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e =>
                        e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e =>
                        e.currentTarget.style.background = '#fff0f0'}>
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px'
                }}>

                  {/* Subhead */}
                  <div>
                    <Label required>Subhead</Label>
                    <SearchableDropdown
                      value={item.subheadSearch}
                      onChange={(val) => updateItem(item.id, {
                        subheadSearch: val,
                        ...(val === '' ? { subhead: '' } : {})
                      })}
                      onSelect={(subhead) =>
                        handleSubheadSelect(item.id, subhead)}
                      options={getFilteredSubheads(item.subheadSearch)}
                      placeholder="Search subhead..."
                    />
                  </div>

                  {/* Item Name */}
                  <div>
                    <Label required>Item Name</Label>
                    <SearchableDropdown
                      value={item.itemNameSearch}
                      onChange={(val) => {
                        if (!item.subhead) {
                          alert('Please select subhead first');
                          return;
                        }
                        updateItem(item.id, {
                          itemNameSearch: val,
                          ...(val === '' ? {
                            itemName: '', unit: '', skuCode: ''
                          } : {})
                        });
                      }}
                      onSelect={(opt) => handleItemSelect(item.id, opt)}
                      options={getFilteredItems(
                        item.subhead, item.itemNameSearch
                      )}
                      placeholder={item.subhead
                        ? 'Search item...'
                        : 'Select subhead first'}
                      disabled={!item.subhead}
                      renderOption={(opt) => (
                        <div>
                          <div style={{
                            fontWeight: '600', color: '#1e293b',
                            fontSize: '13px'
                          }}>{opt.itemName}</div>
                          <div style={{
                            fontSize: '11px', color: '#94a3b8',
                            marginTop: '2px'
                          }}>
                            Unit: {opt.unit} · SKU: {opt.skuCode}
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <Label>Unit</Label>
                    <Input value={item.unit} readOnly
                      placeholder="Auto-filled" />
                  </div>

                  {/* SKU Code */}
                  <div>
                    <Label>SKU Code</Label>
                    <Input value={item.skuCode} readOnly
                      placeholder="Auto-filled" />
                  </div>

                  {/* Quantity */}
                  <div>
                    <Label required>Quantity</Label>
                    <Input
                      type="number" value={item.quantity}
                      onChange={e => updateItem(item.id, {
                        quantity: e.target.value
                      })}
                      placeholder="0" min="0" step="1" required
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <Label required>Amount (₹)</Label>
                    <Input
                      type="number" value={item.amount}
                      onChange={e => updateItem(item.id, {
                        amount: e.target.value
                      })}
                      placeholder="0.00" min="0"
                      step="0.01" required
                    />
                  </div>

                  {/* Remarks */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Remarks (Optional)</Label>
                    <textarea
                      value={item.remarks}
                      onChange={e => updateItem(item.id, {
                        remarks: e.target.value
                      })}
                      placeholder="Any notes for this item..."
                      rows={2}
                      style={{
                        width: '100%', padding: '10px 12px',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '10px', fontSize: '14px',
                        color: '#1e293b', resize: 'vertical',
                        fontFamily: 'inherit', background: '#fff',
                        outline: 'none'
                      }}
                      onFocus={e =>
                        e.target.style.borderColor = '#6366f1'}
                      onBlur={e =>
                        e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>
              </div>

              {/* Add Item Below */}
              <div style={{ margin: '10px 0' }}>
                <button
                  type="button"
                  onClick={() => addItemAfter(index)}
                  style={{
                    width: '100%', padding: '9px',
                    background: '#fff', color: '#6366f1',
                    border: '1.5px dashed #a5b4fc',
                    borderRadius: '10px',
                    fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '6px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f0f4ff';
                    e.currentTarget.style.borderColor = '#6366f1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#a5b4fc';
                  }}
                >
                  + Add Item Below
                </button>
              </div>

            </div>
          ))}

          {/* ═══ Total ═══ */}
          <div style={{
            background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)',
            border: '1.5px solid #e0e7ff', borderRadius: '12px',
            padding: '16px 22px',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px', marginTop: '8px'
          }}>
            <div>
              <div style={{
                fontSize: '11px', fontWeight: '700',
                color: '#94a3b8', textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>Total Amount</div>
              <div style={{
                fontSize: '12px', color: '#cbd5e1',
                marginTop: '2px'
              }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
                {/* ✅ Show project name in total */}
                {selectedProject && ` · ${selectedProject}`}
              </div>
            </div>
            <div style={{
              fontSize: '30px', fontWeight: '800',
              color: '#6366f1', letterSpacing: '-0.02em'
            }}>
              ₹{totalAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>

          {/* ═══ Submit ═══ */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: submitting
                ? '#c7d2fe'
                : 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
              color: '#fff', border: 'none',
              borderRadius: '12px', padding: '14px',
              fontSize: '16px', fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting
                ? 'none'
                : '0 4px 16px rgba(99,102,241,0.35)',
              letterSpacing: '0.01em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!submitting) e.currentTarget.style.opacity = '0.92';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {submitting
              ? '⏳ Submitting...'
              : `🚀 Submit ${items.length} Item${items.length !== 1 ? 's' : ''}`
            }
          </button>

        </form>
      </div>
    </div>
  );
}