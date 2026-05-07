
// 'use client';

// import React, { useState, useEffect, useRef } from "react";
// import { useGetPendingDimPaymentsQuery, useUpdateDimPaymentMutation } from "../../../features/paymentSlice";
// import { FaSearch, FaChevronDown, FaTimes, FaCheckCircle, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";

// // ─── helpers ────────────────────────────────────────────────────────────────
// const fmt = (n) =>
//   Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // ─── Sub-components ──────────────────────────────────────────────────────────
// const InfoChip = ({ label, value, accent }) => (
//   <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
//     <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
//       {label}
//     </span>
//     <span style={{ fontSize: 13, fontWeight: 600, color: accent || "#1e293b" }}>{value || "—"}</span>
//   </div>
// );

// const AmountBadge = ({ label, amount, color }) => (
//   <div style={{
//     display: "flex", flexDirection: "column", alignItems: "flex-end",
//     padding: "8px 14px", borderRadius: 10, backgroundColor: color + "18",
//     border: `1px solid ${color}40`
//   }}>
//     <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "0.06em" }}>{label}</span>
//     <span style={{ fontSize: 17, fontWeight: 800, color }}> ₹{fmt(amount)}</span>
//   </div>
// );

// // ─── Multi-Select Searchable Dropdown ────────────────────────────────────────
// const MultiSelectDropdown = ({ label, placeholder, selectedValues, onChange, options, displayKey }) => {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const filtered = options.filter((o) =>
//     (o[displayKey] || "").toLowerCase().includes(search.toLowerCase())
//   );

//   const toggleOption = (value) => {
//     if (selectedValues.includes(value)) {
//       onChange(selectedValues.filter((v) => v !== value));
//     } else {
//       onChange([...selectedValues, value]);
//     }
//   };

//   const removeTag = (value) => {
//     onChange(selectedValues.filter((v) => v !== value));
//   };

//   const selectAll = () => {
//     const allValues = filtered.map((o) => o[displayKey]);
//     const merged = [...new Set([...selectedValues, ...allValues])];
//     onChange(merged);
//   };

//   const clearAll = () => {
//     onChange([]);
//   };

//   return (
//     <div ref={ref} style={{ position: "relative" }}>
//       <label style={{
//         display: "block", fontSize: 11, fontWeight: 700, color: "#64748b",
//         marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase"
//       }}>
//         {label}
//         {selectedValues.length > 0 && (
//           <span style={{
//             marginLeft: 8, backgroundColor: "#6366f1", color: "white",
//             borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700
//           }}>
//             {selectedValues.length}
//           </span>
//         )}
//       </label>

//       {selectedValues.length > 0 && (
//         <div style={{
//           display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8,
//           maxHeight: 80, overflowY: "auto"
//         }}>
//           {selectedValues.map((val) => (
//             <span key={val} style={{
//               display: "inline-flex", alignItems: "center", gap: 4,
//               backgroundColor: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe",
//               borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600
//             }}>
//               {val}
//               <FaTimes
//                 onClick={() => removeTag(val)}
//                 style={{ fontSize: 9, cursor: "pointer", color: "#6366f1" }}
//               />
//             </span>
//           ))}
//           <span
//             onClick={clearAll}
//             style={{
//               display: "inline-flex", alignItems: "center",
//               backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
//               borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600,
//               cursor: "pointer"
//             }}
//           >
//             Clear All ✕
//           </span>
//         </div>
//       )}

//       <div style={{ position: "relative" }}>
//         <input
//           value={search}
//           onFocus={() => setOpen(true)}
//           onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
//           placeholder={selectedValues.length > 0
//             ? `${selectedValues.length} selected — search more…`
//             : placeholder}
//           style={{
//             width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10,
//             border: open ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
//             fontSize: 14, outline: "none", backgroundColor: "white",
//             boxSizing: "border-box", transition: "border-color 0.2s",
//             fontFamily: "inherit",
//           }}
//         />
//         <FaChevronDown style={{
//           position: "absolute", right: 13, top: "50%",
//           transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
//           color: "#94a3b8", fontSize: 11, transition: "transform 0.2s"
//         }} />
//       </div>

//       {open && (
//         <ul style={{
//           position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
//           backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: 10,
//           maxHeight: 240, overflowY: "auto", zIndex: 200,
//           listStyle: "none", margin: 0, padding: 0,
//           boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
//         }}>
//           <li style={{
//             padding: "8px 16px", display: "flex", justifyContent: "space-between",
//             borderBottom: "1.5px solid #f1f5f9", backgroundColor: "#f8fafc"
//           }}>
//             <span onClick={selectAll} style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}>
//               Select All ({filtered.length})
//             </span>
//             <span onClick={clearAll} style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", cursor: "pointer", textDecoration: "underline" }}>
//               Deselect All
//             </span>
//           </li>

//           {filtered.length === 0 ? (
//             <li style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
//               No results found
//             </li>
//           ) : (
//             filtered.map((o, i) => {
//               const val = o[displayKey];
//               const isChecked = selectedValues.includes(val);
//               return (
//                 <li
//                   key={i}
//                   onClick={() => toggleOption(val)}
//                   style={{
//                     padding: "10px 16px", cursor: "pointer", fontSize: 14,
//                     color: "#1e293b", display: "flex", alignItems: "center", gap: 10,
//                     borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
//                     backgroundColor: isChecked ? "#f0f4ff" : "transparent",
//                     transition: "background 0.15s",
//                   }}
//                   onMouseOver={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
//                   onMouseOut={(e) => { e.currentTarget.style.backgroundColor = isChecked ? "#f0f4ff" : "transparent"; }}
//                 >
//                   <div style={{
//                     width: 18, height: 18, borderRadius: 4, flexShrink: 0,
//                     border: `2px solid ${isChecked ? "#6366f1" : "#cbd5e1"}`,
//                     backgroundColor: isChecked ? "#6366f1" : "white",
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     transition: "all 0.15s"
//                   }}>
//                     {isChecked && (
//                       <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
//                         <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                       </svg>
//                     )}
//                   </div>
//                   <span style={{ fontWeight: isChecked ? 600 : 400 }}>{val}</span>
//                 </li>
//               );
//             })
//           )}
//         </ul>
//       )}
//     </div>
//   );
// };

// // ─── Main Component ──────────────────────────────────────────────────────────
// const DimPayment = () => {
//   const { data: apiData, isLoading, isError, refetch } = useGetPendingDimPaymentsQuery();
//   const [updateDimPayment, { isLoading: isSubmitting }] = useUpdateDimPaymentMutation();

//   const allData = apiData?.data || [];

//   const uniquePayees = [...new Map(
//     allData.map((d) => [d.PAYEE_NAME_1, { PAYEE_NAME_1: d.PAYEE_NAME_1 }])
//   ).values()].filter((p) => p.PAYEE_NAME_1);

//   const uniqueOffBillUIDs = [...new Map(
//     allData.map((d) => [d.OFFBILLUID, { OFFBILLUID: d.OFFBILLUID }])
//   ).values()].filter((p) => p.OFFBILLUID);

//   const [selectedPayees, setSelectedPayees] = useState([]);
//   const [selectedOffBillUIDs, setSelectedOffBillUIDs] = useState([]);
//   const [showBills, setShowBills] = useState(false);
//   const [filteredBills, setFilteredBills] = useState([]);

//   const [selectedBills, setSelectedBills] = useState([]);
//   const [paidAmounts, setPaidAmounts] = useState({});
//   const [tdsAmounts, setTdsAmounts] = useState({});
//   const [roundups, setRoundups] = useState({});
//   const [remarks, setRemarks] = useState({});

//   const [bankDetails, setBankDetails] = useState("");
//   const [paymentMode, setPaymentMode] = useState("");
//   const [paymentDetails, setPaymentDetails] = useState("");
//   const [paymentDate, setPaymentDate] = useState("");

//   const paymentSectionRef = useRef(null);

//   const filteredOffBillUIDs = selectedPayees.length > 0
//     ? [...new Map(
//         allData.filter((d) => selectedPayees.includes(d.PAYEE_NAME_1))
//           .map((d) => [d.OFFBILLUID, { OFFBILLUID: d.OFFBILLUID }])
//       ).values()].filter((p) => p.OFFBILLUID)
//     : uniqueOffBillUIDs;

//   const filteredPayees = selectedOffBillUIDs.length > 0
//     ? [...new Map(
//         allData.filter((d) => selectedOffBillUIDs.includes(d.OFFBILLUID))
//           .map((d) => [d.PAYEE_NAME_1, { PAYEE_NAME_1: d.PAYEE_NAME_1 }])
//       ).values()].filter((p) => p.PAYEE_NAME_1)
//     : uniquePayees;

//   const handleFilter = () => {
//     if (selectedPayees.length === 0 && selectedOffBillUIDs.length === 0) {
//       return alert("Please select at least one Payee or OFFBILLUID.");
//     }
//     const results = allData.filter((d) => {
//       const payeeMatch = selectedPayees.length === 0 || selectedPayees.includes(d.PAYEE_NAME_1);
//       const offBillMatch = selectedOffBillUIDs.length === 0 || selectedOffBillUIDs.includes(d.OFFBILLUID);
//       return payeeMatch && offBillMatch;
//     });
//     setFilteredBills(results);
//     setShowBills(true);
//     setSelectedBills([]);
//     setPaidAmounts({});
//     setTdsAmounts({});
//     setRoundups({});
//     setRemarks({});
//   };

//   const handleClearFilters = () => {
//     setShowBills(false);
//     setSelectedPayees([]);
//     setSelectedOffBillUIDs([]);
//     setSelectedBills([]);
//     setFilteredBills([]);
//     setPaidAmounts({});
//     setTdsAmounts({});
//     setRoundups({});
//     setRemarks({});
//   };

//   const toggleBill = (uid) => {
//     setSelectedBills((prev) => {
//       if (prev.includes(uid)) {
//         setPaidAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
//         setTdsAmounts((p)  => { const n = { ...p }; delete n[uid]; return n; });
//         setRoundups((p)    => { const n = { ...p }; delete n[uid]; return n; });
//         setRemarks((p)     => { const n = { ...p }; delete n[uid]; return n; });
//         return prev.filter((id) => id !== uid);
//       }
//       setPaidAmounts((p)  => ({ ...p, [uid]: "" }));
//       setTdsAmounts((p)   => ({ ...p, [uid]: "" }));
//       setRoundups((p)     => ({ ...p, [uid]: 0 }));
//       setRemarks((p)      => ({ ...p, [uid]: "" }));
//       return [...prev, uid];
//     });
//   };

//   const selectAllBills = () => {
//     const allUids = filteredBills.map((b) => b.uid);
//     setSelectedBills(allUids);
//     const newPaid = {}, newTds = {}, newRound = {}, newRemarks = {};
//     allUids.forEach((uid) => {
//       newPaid[uid]    = paidAmounts[uid]  ?? "";
//       newTds[uid]     = tdsAmounts[uid]   ?? "";
//       newRound[uid]   = roundups[uid]     ?? 0;
//       newRemarks[uid] = remarks[uid]      ?? "";
//     });
//     setPaidAmounts(newPaid);
//     setTdsAmounts(newTds);
//     setRoundups(newRound);
//     setRemarks(newRemarks);
//   };

//   const deselectAllBills = () => {
//     setSelectedBills([]);
//     setPaidAmounts({});
//     setTdsAmounts({});
//     setRoundups({});
//     setRemarks({});
//   };

//   const handleRoundupChange = (uid, value) => {
//     let numValue = value === "" ? 0 : parseFloat(value);
//     if (isNaN(numValue)) numValue = 0;
//     if (numValue > 9) numValue = 9;
//     if (numValue < -9) numValue = -9;
//     setRoundups((prev) => ({ ...prev, [uid]: numValue }));
//   };

//   const grandTotal = selectedBills.reduce((sum, uid) => {
//     const paid  = Number(paidAmounts[uid] || 0);
//     const tds   = Number(tdsAmounts[uid]  || 0);
//     const round = Number(roundups[uid]    || 0);
//     return sum + (paid - tds) + round;
//   }, 0);

//   const handleSubmit = async () => {
//     if (selectedBills.length === 0) return alert("कृपया कम से कम एक bill select करें।");
//     if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate)
//       return alert("सभी Global Payment Details भरें।");

//     const emptyPaid = selectedBills.filter(
//       (uid) => paidAmounts[uid] === "" || paidAmounts[uid] === undefined || isNaN(Number(paidAmounts[uid]))
//     );
//     if (emptyPaid.length > 0)
//       return alert(`${emptyPaid.length} bill(s) में Paid Amount खाली है।`);

//     const invalidTds = selectedBills.filter((uid) => {
//       const paid = Number(paidAmounts[uid] || 0);
//       const tds  = Number(tdsAmounts[uid]  || 0);
//       return tds > paid;
//     });
//     if (invalidTds.length > 0) {
//       return alert(`${invalidTds.length} bill(s) में TDS, Paid Amount से ज़्यादा है।`);
//     }

//     try {
//       for (const uid of selectedBills) {
//         const bill = filteredBills.find((b) => b.uid === uid);

//         // ✅ TOTAL_AMOUNT_4 use kar rahe hain NET_AMOUNT_4 ki jagah
//         const totalAmount = Number(
//           (bill?.TOTAL_AMOUNT_4 || "0").toString().replace(/,/g, "").trim()
//         ) || 0;

//         const currentPaid = Number(paidAmounts[uid] || 0);
//         const tds         = Number(tdsAmounts[uid]  || 0);
//         const roundup     = Number(roundups[uid]    || 0);
//         const netPayable  = (currentPaid - tds) + roundup;

//         await updateDimPayment({
//           uid,
//           STATUS_5:          "Done",
//           NET_AMOUNT_5:      totalAmount,   // ✅ TOTAL_AMOUNT_4 se aa raha hai
//           TDS_5:             tds || "",
//           PAID_AMOUNT_5:     currentPaid,
//           BALANCE_AMOUNT_5:  netPayable,
//           BANK_DETAILS_5:    bankDetails,
//           PAYMENT_MODE_5:    paymentMode,
//           PAYMENT_DETAILS_5: paymentDetails,
//           PAYMENT_DATE_5:    paymentDate,
//           Remark_5:          remarks[uid] || "",
//         }).unwrap();
//       }

//       alert(`✅ ${selectedBills.length} payment(s) successfully submitted!`);
//       handleClearFilters();
//       setBankDetails(""); setPaymentMode(""); setPaymentDetails(""); setPaymentDate("");
//       refetch();
//     } catch (err) {
//       alert("Error: " + (err?.data?.message || err?.message || "Unknown error"));
//     }
//   };

//   // ── Render ────────────────────────────────────────────────────────────────
//   if (isLoading) return (
//     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
//       <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite" }} />
//       <span style={{ color: "#64748b", fontSize: 14 }}>Loading payments…</span>
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );

//   if (isError) return (
//     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center", color: "#ef4444" }}>
//         <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
//         <div style={{ fontSize: 16, fontWeight: 600 }}>Failed to load payment data</div>
//       </div>
//     </div>
//   );

//   return (
//     <div style={{ padding: "28px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
//       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

//       {/* ── Header ── */}
//       <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
//             <FaMoneyBillWave style={{ color: "#6366f1", marginRight: 10, verticalAlign: "middle" }} />
//             Dimension Office Payment
//           </h1>
//           <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
//             {allData.length} pending bill{allData.length !== 1 ? "s" : ""} awaiting payment
//           </p>
//         </div>
//         <div style={{ backgroundColor: "#6366f118", border: "1px solid #6366f130", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
//           Stage 5 — Actual Payment
//         </div>
//       </div>

//       {/* ── Filter Card ── */}
//       <div style={{
//         backgroundColor: "white", borderRadius: 16, padding: "24px 28px",
//         boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, border: "1px solid #f1f5f9"
//       }}>
//         <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>
//           🔍 Filter Bills
//           <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8", marginLeft: 10 }}>
//             Select one or both filters. They work together (AND logic).
//           </span>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
//           <MultiSelectDropdown
//             label="Payee Name"
//             placeholder="Search & select payees…"
//             selectedValues={selectedPayees}
//             onChange={setSelectedPayees}
//             options={filteredPayees}
//             displayKey="PAYEE_NAME_1"
//           />
//           <MultiSelectDropdown
//             label="Office Bill UID (OFFBILLUID)"
//             placeholder="Search & select bill UIDs…"
//             selectedValues={selectedOffBillUIDs}
//             onChange={setSelectedOffBillUIDs}
//             options={filteredOffBillUIDs}
//             displayKey="OFFBILLUID"
//           />
//         </div>

//         <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//           <button onClick={handleFilter} style={{
//             padding: "11px 28px", backgroundColor: "#6366f1", color: "white",
//             border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700,
//             fontSize: 14, display: "flex", alignItems: "center", gap: 8,
//             boxShadow: "0 4px 14px #6366f140", transition: "opacity 0.2s", fontFamily: "inherit",
//           }}
//             onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
//             onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
//           >
//             <FaSearch style={{ fontSize: 12 }} /> Show Bills
//           </button>

//           {(selectedPayees.length > 0 || selectedOffBillUIDs.length > 0) && (
//             <button onClick={handleClearFilters} style={{
//               padding: "11px 20px", backgroundColor: "#fef2f2", color: "#dc2626",
//               border: "1px solid #fecaca", borderRadius: 10, cursor: "pointer",
//               fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center",
//               gap: 6, fontFamily: "inherit",
//             }}>
//               <FaTimes style={{ fontSize: 11 }} /> Clear Filters
//             </button>
//           )}

//           {(selectedPayees.length > 0 || selectedOffBillUIDs.length > 0) && (
//             <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
//               {selectedPayees.length > 0 && `${selectedPayees.length} payee(s)`}
//               {selectedPayees.length > 0 && selectedOffBillUIDs.length > 0 && " + "}
//               {selectedOffBillUIDs.length > 0 && `${selectedOffBillUIDs.length} bill UID(s)`}
//               {" selected"}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* ── Bills List ── */}
//       {showBills && (
//         <div>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//             <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
//               Filtered Bills
//               <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
//                 {filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""} found
//               </span>
//             </div>
//             <div style={{ display: "flex", gap: 10 }}>
//               {filteredBills.length > 0 && (
//                 <button
//                   onClick={selectedBills.length === filteredBills.length ? deselectAllBills : selectAllBills}
//                   style={{
//                     background: "none", border: "1px solid #c7d2fe", borderRadius: 8,
//                     padding: "7px 14px", cursor: "pointer", color: "#4f46e5",
//                     fontWeight: 600, fontSize: 12, fontFamily: "inherit",
//                     display: "flex", alignItems: "center", gap: 6
//                   }}
//                 >
//                   <FaCheckCircle style={{ fontSize: 11 }} />
//                   {selectedBills.length === filteredBills.length ? "Deselect All" : "Select All"}
//                 </button>
//               )}
//               <button onClick={handleClearFilters} style={{
//                 background: "none", border: "1px solid #e2e8f0", borderRadius: 8,
//                 padding: "7px 14px", cursor: "pointer", color: "#64748b",
//                 fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center",
//                 gap: 6, fontFamily: "inherit"
//               }}>
//                 <FaTimes style={{ fontSize: 11 }} /> Clear
//               </button>
//             </div>
//           </div>

//           {filteredBills.length === 0 ? (
//             <div style={{
//               textAlign: "center", padding: "60px 0", color: "#94a3b8",
//               fontSize: 15, backgroundColor: "white", borderRadius: 14, border: "1px solid #f1f5f9"
//             }}>
//               No pending bills found for the selected filters.
//             </div>
//           ) : (
//             filteredBills.map((bill) => {
//               const isSelected  = selectedBills.includes(bill.uid);
//               const parseAmt    = (v) => Number((v || "0").toString().replace(/,/g, "").trim()) || 0;

//               // ✅ SIRF YAHAN CHANGE — TOTAL_AMOUNT_4
//               const totalAmount   = parseAmt(bill.TOTAL_AMOUNT_4);

//               const currentPaid = Number(paidAmounts[bill.uid]  || 0);
//               const tds         = Number(tdsAmounts[bill.uid]   || 0);
//               const roundup     = Number(roundups[bill.uid]     || 0);
//               const netPayable  = (currentPaid - tds) + roundup;

//               // ✅ Progress bar bhi TOTAL_AMOUNT_4 ke against calculate hogi
//               const progressPct = totalAmount > 0
//                 ? Math.min((netPayable / totalAmount) * 100, 100)
//                 : 0;

//               return (
//                 <div
//                   key={bill.uid}
//                   style={{
//                     backgroundColor: "white", borderRadius: 14, padding: "22px 26px",
//                     marginBottom: 16,
//                     border: isSelected ? "2px solid #6366f1" : "1.5px solid #f1f5f9",
//                     boxShadow: isSelected ? "0 0 0 3px #6366f115" : "0 1px 4px rgba(0,0,0,0.05)",
//                     transition: "all 0.2s",
//                   }}
//                 >
//                   {/* Bill header */}
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
//                     <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
//                       <div
//                         onClick={() => toggleBill(bill.uid)}
//                         style={{
//                           width: 22, height: 22, borderRadius: 6,
//                           border: `2px solid ${isSelected ? "#6366f1" : "#cbd5e1"}`,
//                           backgroundColor: isSelected ? "#6366f1" : "white",
//                           display: "flex", alignItems: "center", justifyContent: "center",
//                           cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
//                         }}
//                       >
//                         {isSelected && <FaCheckCircle style={{ color: "white", fontSize: 12 }} />}
//                       </div>
//                       <div>
//                         <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
//                           {bill.OFFICE_NAME_1 || bill.PAYEE_NAME_1}
//                         </div>
//                         <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
//                           {bill.EXPENSES_HEAD_1}
//                           {bill.EXPENSES_SUBHEAD_1 ? ` → ${bill.EXPENSES_SUBHEAD_1}` : ""}
//                           {bill.OFFBILLUID && (
//                             <span style={{
//                               marginLeft: 8, color: "#f59e0b", fontWeight: 600,
//                               backgroundColor: "#fef3c7", padding: "1px 6px", borderRadius: 4, fontSize: 11
//                             }}>
//                               {bill.OFFBILLUID}
//                             </span>
//                           )}
//                           {bill.uid && (
//                             <span style={{ marginLeft: 6, color: "#c7d2fe", fontWeight: 600 }}>
//                               UID: {bill.uid}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* ✅ AmountBadge ab TOTAL_AMOUNT_4 show kar raha hai */}
//                     <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//                       <AmountBadge label="Bill Amount" amount={totalAmount} color="#6366f1" />
//                     </div>
//                   </div>

//                   {/* Details */}
//                   <div style={{
//                     display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
//                     gap: "12px 20px", paddingTop: 14, borderTop: "1px solid #f8fafc"
//                   }}>
//                     <InfoChip label="Item Name" value={bill.ITEM_NAME_1} />
//                     <InfoChip label="Dept" value={bill.DEPARTMENT_1} />
//                     <InfoChip label="Raised By" value={bill.RAISED_BY_1} />
//                     <InfoChip label="Vendor" value={bill.Vendor_Name_4} />
//                     <InfoChip label="Bill No" value={bill.BILL_NO_4} accent="#6366f1" />
//                     <InfoChip label="Bill Date" value={bill.BILL_DATE_4} />
//                     <InfoChip label="GST" value={`CGST: ${bill.CGST_4 || "—"} | SGST: ${bill.SGST_4 || "—"}`} />
//                     <InfoChip label="Planned Date" value={bill.PLANNED_5} accent="#f59e0b" />
//                     <InfoChip label="Payment Mode" value={bill.PAYMENT_MODE_3} />
//                   </div>

//                   {bill.Bill_Photo && (
//                     <div style={{ marginTop: 14 }}>
//                       <a href={bill.Bill_Photo} target="_blank" rel="noopener noreferrer"
//                         style={{
//                           fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none",
//                           border: "1px solid #6366f130", borderRadius: 6, padding: "5px 12px", backgroundColor: "#6366f108"
//                         }}>
//                         📎 View Bill Photo
//                       </a>
//                     </div>
//                   )}

//                   {/* ── Per-bill payment entry ── */}
//                   {isSelected && (
//                     <div style={{
//                       marginTop: 20, padding: "18px 20px",
//                       backgroundColor: "#f8f9ff", borderRadius: 12, border: "1px solid #e0e7ff"
//                     }}>
//                       <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 14 }}>
//                         Payment Entry — {bill.ITEM_NAME_1 || bill.uid}
//                       </div>

//                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 16 }}>

//                         {/* 1. Paid Amount */}
//                         <div>
//                           <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                             PAID AMOUNT ₹
//                           </label>
//                           <input
//                             type="number" min="0"
//                             placeholder="Enter amount"
//                             value={paidAmounts[bill.uid] ?? ""}
//                             onChange={(e) => {
//                               let v = Number(e.target.value);
//                               setPaidAmounts((p) => ({ ...p, [bill.uid]: v }));
//                             }}
//                             style={{
//                               width: "100%", padding: "10px 12px", borderRadius: 9,
//                               border: "1.5px solid #a5b4fc", fontSize: 14, outline: "none",
//                               boxSizing: "border-box", fontFamily: "inherit"
//                             }}
//                           />
//                         </div>

//                         {/* 2. TDS */}
//                         <div>
//                           <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                             TDS ₹
//                             <span style={{
//                               marginLeft: 6, fontSize: 9, fontWeight: 600,
//                               color: "#94a3b8", backgroundColor: "#f1f5f9",
//                               borderRadius: 4, padding: "1px 5px",
//                             }}>
//                               OPTIONAL
//                             </span>
//                           </label>
//                           <input
//                             type="number" min="0"
//                             placeholder="0 (optional)"
//                             value={tdsAmounts[bill.uid] ?? ""}
//                             onChange={(e) => {
//                               const val = e.target.value;
//                               if (val === "") {
//                                 setTdsAmounts((p) => ({ ...p, [bill.uid]: "" }));
//                               } else {
//                                 let v = Number(val);
//                                 const paid = Number(paidAmounts[bill.uid] || 0);
//                                 if (v > paid) {
//                                   alert(`TDS (₹${v}) Paid Amount (₹${fmt(paid)}) से ज़्यादा नहीं हो सकता`);
//                                   v = paid;
//                                 }
//                                 setTdsAmounts((p) => ({ ...p, [bill.uid]: v }));
//                               }
//                             }}
//                             style={{
//                               width: "100%", padding: "10px 12px", borderRadius: 9,
//                               border: "1.5px solid #86efac", fontSize: 14, outline: "none",
//                               boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f0fdf4",
//                             }}
//                           />
//                         </div>

//                         {/* 3. Round Off */}
//                         <div>
//                           <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                             ROUND OFF ₹ (+/-)
//                           </label>
//                           <input
//                             type="number" step="0.01" min="-9" max="9"
//                             placeholder="0"
//                             value={roundups[bill.uid] ?? ""}
//                             onChange={(e) => handleRoundupChange(bill.uid, e.target.value)}
//                             style={{
//                               width: "100%", padding: "10px 12px", borderRadius: 9,
//                               border: "1.5px solid #fcd34d", fontSize: 14, outline: "none",
//                               boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffdf0"
//                             }}
//                           />
//                         </div>

//                         {/* 4. NET PAYABLE */}
//                         <div>
//                           <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                             NET PAYABLE ₹
//                           </label>
//                           <input
//                             readOnly
//                             value={fmt(netPayable)}
//                             style={{
//                               width: "100%", padding: "10px 12px", borderRadius: 9,
//                               border: `1.5px solid ${netPayable > 0 ? "#86efac" : "#fca5a5"}`,
//                               fontSize: 14,
//                               backgroundColor: netPayable > 0 ? "#f0fdf4" : "#fff5f5",
//                               color: netPayable > 0 ? "#16a34a" : "#dc2626",
//                               fontWeight: 700, boxSizing: "border-box", fontFamily: "inherit"
//                             }}
//                           />
//                           {tds > 0 && (
//                             <div style={{ fontSize: 10, color: "#64748b", marginTop: 4, fontWeight: 600 }}>
//                               ₹{fmt(currentPaid)} − ₹{fmt(tds)} TDS
//                               {roundup !== 0 && ` ${roundup > 0 ? "+" : ""}${fmt(roundup)}`}
//                             </div>
//                           )}
//                         </div>

//                         {/* 5. Remark */}
//                         <div>
//                           <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                             REMARK
//                           </label>
//                           <input
//                             type="text" placeholder="Optional remark"
//                             value={remarks[bill.uid] || ""}
//                             onChange={(e) => setRemarks((p) => ({ ...p, [bill.uid]: e.target.value }))}
//                             style={{
//                               width: "100%", padding: "10px 12px", borderRadius: 9,
//                               border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
//                               boxSizing: "border-box", fontFamily: "inherit"
//                             }}
//                           />
//                         </div>
//                       </div>

//                       {/* Summary breakdown */}
//                       {(currentPaid > 0 || tds > 0) && (
//                         <div style={{
//                           marginTop: 14, padding: "10px 16px",
//                           backgroundColor: "#eef2ff", borderRadius: 8,
//                           border: "1px solid #c7d2fe",
//                           display: "flex", justifyContent: "space-between",
//                           flexWrap: "wrap", gap: 12, fontSize: 12
//                         }}>
//                           <span style={{ color: "#4f46e5", fontWeight: 600 }}>
//                             Paid: ₹{fmt(currentPaid)}
//                           </span>
//                           {tds > 0 && (
//                             <span style={{ color: "#dc2626", fontWeight: 600 }}>
//                               − TDS: ₹{fmt(tds)}
//                             </span>
//                           )}
//                           {roundup !== 0 && (
//                             <span style={{ color: "#f59e0b", fontWeight: 600 }}>
//                               {roundup > 0 ? "+" : ""}Round Off: ₹{fmt(roundup)}
//                             </span>
//                           )}
//                           <span style={{ color: "#16a34a", fontWeight: 800 }}>
//                             = Net Payable: ₹{fmt(netPayable)}
//                           </span>
//                         </div>
//                       )}

//                       {/* Progress bar */}
//                       {netPayable > 0 && (
//                         <div style={{ marginTop: 14 }}>
//                           <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
//                             <span>
//                               Payment progress
//                               {tds > 0 ? ` (TDS ₹${fmt(tds)} deducted)` : ""}
//                             </span>
//                             <span>{progressPct.toFixed(1)}%</span>
//                           </div>
//                           <div style={{ height: 6, backgroundColor: "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
//                             <div style={{
//                               height: "100%", width: `${progressPct}%`,
//                               backgroundColor: "#6366f1", borderRadius: 99, transition: "width 0.3s ease"
//                             }} />
//                           </div>
//                         </div>
//                       )}

//                       <button
//                         onClick={() => paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
//                         style={{
//                           marginTop: 14, padding: "8px 18px", backgroundColor: "#f0f4ff",
//                           border: "1.5px solid #c7d2fe", borderRadius: 8, cursor: "pointer",
//                           color: "#4f46e5", fontWeight: 600, fontSize: 12, display: "flex",
//                           alignItems: "center", gap: 6, fontFamily: "inherit"
//                         }}
//                       >
//                         <FaArrowDown style={{ fontSize: 10 }} /> Go to Global Payment Details
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}

//           {/* ── Grand Total ── */}
//           {selectedBills.length > 0 && (
//             <div style={{
//               backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe",
//               borderRadius: 14, padding: "16px 24px", marginTop: 8,
//               display: "flex", justifyContent: "space-between", alignItems: "center"
//             }}>
//               <div style={{ fontSize: 14, fontWeight: 700, color: "#4f46e5" }}>
//                 Grand Total — {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} selected
//                 {selectedBills.some((uid) => Number(tdsAmounts[uid] || 0) > 0) && (
//                   <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 500, color: "#dc2626" }}>
//                     (Total TDS: ₹{fmt(selectedBills.reduce((s, uid) => s + Number(tdsAmounts[uid] || 0), 0))})
//                   </span>
//                 )}
//               </div>
//               <div style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5" }}>
//                 ₹{fmt(grandTotal)}
//               </div>
//             </div>
//           )}

//           {/* ── Global Payment Details ── */}
//           {selectedBills.length > 0 && (
//             <div
//               ref={paymentSectionRef}
//               style={{
//                 backgroundColor: "white", borderRadius: 16, padding: "26px 28px",
//                 marginTop: 24, border: "1.5px solid #e0e7ff",
//                 boxShadow: "0 4px 16px rgba(99,102,241,0.08)"
//               }}
//             >
//               <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>
//                 Global Payment Details
//                 <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
//                   Applied to all {selectedBills.length} selected bill{selectedBills.length > 1 ? "s" : ""}
//                 </span>
//               </div>

//               <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>BANK DETAILS</label>
//                   <select value={bankDetails} onChange={(e) => setBankDetails(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
//                     <option value="">— Select Bank —</option>
//                     <option>DIMENSIONS HDFC A/c(0504)</option>
//                     <option>SNV Interior And Infrastructure HDFC A/c(7597)</option>
//                     <option>Smriti Design Studio HDFC(7097)</option>
//                     <option>VIPIN CHOUHAN HDFC A/c(4319)</option>
//                     <option>SMRITI CHOUHAN HDFC A/c(1986)</option>
//                     <option>Dimensions Petty Cash A/c</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAYMENT MODE</label>
//                   <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
//                     <option value="">— Select Mode —</option>
//                     <option>Cheque</option>
//                     <option>NEFT</option>
//                     <option>RTGS</option>
//                     <option>Cash</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                     {paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS"}
//                   </label>
//                   <input
//                     type="text"
//                     placeholder={paymentMode === "Cheque" ? "Enter cheque number" : "Ref / UTR / Details"}
//                     value={paymentDetails}
//                     onChange={(e) => setPaymentDetails(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
//                   />
//                 </div>

//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAYMENT DATE</label>
//                   <input
//                     type="date" value={paymentDate}
//                     onChange={(e) => setPaymentDate(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
//                   />
//                 </div>
//               </div>

//               <div style={{
//                 marginTop: 18, padding: "12px 16px", backgroundColor: "#fffbeb",
//                 borderRadius: 9, border: "1px solid #fde68a", fontSize: 12, color: "#92400e"
//               }}>
//                 ⚠️ Bank, Payment Mode, Details, and Date will be applied to <strong>all selected bills</strong>.
//                 Paid Amount, TDS, Round Off and Remark are set per-bill above.
//               </div>

//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting}
//                 style={{
//                   marginTop: 24, padding: "14px 40px",
//                   backgroundColor: isSubmitting ? "#a5b4fc" : "#6366f1",
//                   color: "white", border: "none", borderRadius: 10,
//                   fontWeight: 800, fontSize: 15,
//                   cursor: isSubmitting ? "not-allowed" : "pointer",
//                   boxShadow: "0 4px 16px #6366f135", fontFamily: "inherit",
//                   transition: "background 0.2s",
//                 }}
//               >
//                 {isSubmitting
//                   ? "Submitting…"
//                   : `✓ Submit ${selectedBills.length} Payment${selectedBills.length > 1 ? "s" : ""} — ₹${fmt(grandTotal)}`
//                 }
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DimPayment;






'use client';

import React, { useState, useEffect, useRef } from "react";
import { useGetPendingDimPaymentsQuery, useUpdateDimPaymentMutation } from "../../../features/paymentSlice";
import { FaSearch, FaChevronDown, FaTimes, FaCheckCircle, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";

// ✅ Same helpers as Level1Approval
const getAllowedPaymentModes = (userName, isAdmin) => {
  if (isAdmin) return ['bank', 'cash'];
  const name = (userName || '').trim().toLowerCase();
  if (name === 'vijay patil') return ['bank'];
  if (name === 'richa koul') return ['cash'];
  return [];
};

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const InfoChip = ({ label, value, accent }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label}
    </span>
    <span style={{ fontSize: 13, fontWeight: 600, color: accent || "#1e293b" }}>{value || "—"}</span>
  </div>
);

const AmountBadge = ({ label, amount, color }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "flex-end",
    padding: "8px 14px", borderRadius: 10, backgroundColor: color + "18",
    border: `1px solid ${color}40`
  }}>
    <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "0.06em" }}>{label}</span>
    <span style={{ fontSize: 17, fontWeight: 800, color }}> ₹{fmt(amount)}</span>
  </div>
);

const MultiSelectDropdown = ({ label, placeholder, selectedValues, onChange, options, displayKey }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    (o[displayKey] || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeTag = (value) => onChange(selectedValues.filter((v) => v !== value));
  const selectAll = () => onChange([...new Set([...selectedValues, ...filtered.map((o) => o[displayKey])])]);
  const clearAll = () => onChange([]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700, color: "#64748b",
        marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase"
      }}>
        {label}
        {selectedValues.length > 0 && (
          <span style={{
            marginLeft: 8, backgroundColor: "#6366f1", color: "white",
            borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700
          }}>
            {selectedValues.length}
          </span>
        )}
      </label>

      {selectedValues.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, maxHeight: 80, overflowY: "auto" }}>
          {selectedValues.map((val) => (
            <span key={val} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              backgroundColor: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe",
              borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600
            }}>
              {val}
              <FaTimes onClick={() => removeTag(val)} style={{ fontSize: 9, cursor: "pointer", color: "#6366f1" }} />
            </span>
          ))}
          <span onClick={clearAll} style={{
            display: "inline-flex", alignItems: "center",
            backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
            borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer"
          }}>
            Clear All ✕
          </span>
        </div>
      )}

      <div style={{ position: "relative" }}>
        <input
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          placeholder={selectedValues.length > 0 ? `${selectedValues.length} selected — search more…` : placeholder}
          style={{
            width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10,
            border: open ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
            fontSize: 14, outline: "none", backgroundColor: "white",
            boxSizing: "border-box", transition: "border-color 0.2s", fontFamily: "inherit",
          }}
        />
        <FaChevronDown style={{
          position: "absolute", right: 13, top: "50%",
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          color: "#94a3b8", fontSize: 11, transition: "transform 0.2s"
        }} />
      </div>

      {open && (
        <ul style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: 10,
          maxHeight: 240, overflowY: "auto", zIndex: 200,
          listStyle: "none", margin: 0, padding: 0,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        }}>
          <li style={{
            padding: "8px 16px", display: "flex", justifyContent: "space-between",
            borderBottom: "1.5px solid #f1f5f9", backgroundColor: "#f8fafc"
          }}>
            <span onClick={selectAll} style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}>
              Select All ({filtered.length})
            </span>
            <span onClick={clearAll} style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", cursor: "pointer", textDecoration: "underline" }}>
              Deselect All
            </span>
          </li>
          {filtered.length === 0 ? (
            <li style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No results found</li>
          ) : (
            filtered.map((o, i) => {
              const val = o[displayKey];
              const isChecked = selectedValues.includes(val);
              return (
                <li key={i} onClick={() => toggleOption(val)} style={{
                  padding: "10px 16px", cursor: "pointer", fontSize: 14,
                  color: "#1e293b", display: "flex", alignItems: "center", gap: 10,
                  borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  backgroundColor: isChecked ? "#f0f4ff" : "transparent", transition: "background 0.15s",
                }}
                  onMouseOver={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = isChecked ? "#f0f4ff" : "transparent"; }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${isChecked ? "#6366f1" : "#cbd5e1"}`,
                    backgroundColor: isChecked ? "#6366f1" : "white",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s"
                  }}>
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontWeight: isChecked ? 600 : 400 }}>{val}</span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const DimPayment = ({ user }) => {
  const { data: apiData, isLoading, isError, refetch } = useGetPendingDimPaymentsQuery();
  const [updateDimPayment, { isLoading: isSubmitting }] = useUpdateDimPaymentMutation();


  console.log("Fetched API Data:", apiData);  

  // ✅ currentUserName state
  const [currentUserName, setCurrentUserName] = useState('Unknown User');

  // ✅ isAdmin check
  const isAdmin = Boolean(
    user &&
    String(user.userType || user.role || '').trim().toUpperCase() === 'ADMIN'
  );

  // ✅ sessionStorage se name read karo
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = sessionStorage.getItem('name');
    if (storedName) {
      setCurrentUserName(storedName);
      return;
    }
    if (user?.name) {
      setCurrentUserName(user.name);
      sessionStorage.setItem('name', user.name);
    }
  }, [user?.name]);

  const rawAllData = apiData?.data || [];

  // ✅ Filter data based on PAYMENT_MODE_3 + user
  const allData = rawAllData.filter((d) => {
    const mode = String(d.PAYMENT_MODE_3 || '').trim().toLowerCase();

    // Admin → dono dikhao
    if (isAdmin) {
      return ['bank', 'cash'].includes(mode);
    }

    // Non-admin → allowed modes check
    const allowedModes = getAllowedPaymentModes(currentUserName, isAdmin);
    if (!allowedModes.includes(mode)) return false;

    // APPROVAL_DOER check
    const approvalDoer = String(d.APPROVAL_DOER || '').trim();
    if (!approvalDoer) return true;
    return approvalDoer.toLowerCase() === currentUserName.toLowerCase();
  });

  const uniquePayees = [...new Map(
    allData.map((d) => [d.PAYEE_NAME_1, { PAYEE_NAME_1: d.PAYEE_NAME_1 }])
  ).values()].filter((p) => p.PAYEE_NAME_1);

  const uniqueOffBillUIDs = [...new Map(
    allData.map((d) => [d.OFFBILLUID, { OFFBILLUID: d.OFFBILLUID }])
  ).values()].filter((p) => p.OFFBILLUID);

  const [selectedPayees, setSelectedPayees] = useState([]);
  const [selectedOffBillUIDs, setSelectedOffBillUIDs] = useState([]);
  const [showBills, setShowBills] = useState(false);
  const [filteredBills, setFilteredBills] = useState([]);

  const [selectedBills, setSelectedBills] = useState([]);
  const [paidAmounts, setPaidAmounts] = useState({});
  const [tdsAmounts, setTdsAmounts] = useState({});
  const [roundups, setRoundups] = useState({});
  const [remarks, setRemarks] = useState({});

  const [bankDetails, setBankDetails] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const paymentSectionRef = useRef(null);

  const filteredOffBillUIDs = selectedPayees.length > 0
    ? [...new Map(
        allData.filter((d) => selectedPayees.includes(d.PAYEE_NAME_1))
          .map((d) => [d.OFFBILLUID, { OFFBILLUID: d.OFFBILLUID }])
      ).values()].filter((p) => p.OFFBILLUID)
    : uniqueOffBillUIDs;

  const filteredPayees = selectedOffBillUIDs.length > 0
    ? [...new Map(
        allData.filter((d) => selectedOffBillUIDs.includes(d.OFFBILLUID))
          .map((d) => [d.PAYEE_NAME_1, { PAYEE_NAME_1: d.PAYEE_NAME_1 }])
      ).values()].filter((p) => p.PAYEE_NAME_1)
    : uniquePayees;

  const handleFilter = () => {
    if (selectedPayees.length === 0 && selectedOffBillUIDs.length === 0) {
      return alert("Please select at least one Payee or OFFBILLUID.");
    }
    const results = allData.filter((d) => {
      const payeeMatch = selectedPayees.length === 0 || selectedPayees.includes(d.PAYEE_NAME_1);
      const offBillMatch = selectedOffBillUIDs.length === 0 || selectedOffBillUIDs.includes(d.OFFBILLUID);
      return payeeMatch && offBillMatch;
    });
    setFilteredBills(results);
    setShowBills(true);
    setSelectedBills([]);
    setPaidAmounts({});
    setTdsAmounts({});
    setRoundups({});
    setRemarks({});
  };

  const handleClearFilters = () => {
    setShowBills(false);
    setSelectedPayees([]);
    setSelectedOffBillUIDs([]);
    setSelectedBills([]);
    setFilteredBills([]);
    setPaidAmounts({});
    setTdsAmounts({});
    setRoundups({});
    setRemarks({});
  };

  const toggleBill = (uid) => {
    setSelectedBills((prev) => {
      if (prev.includes(uid)) {
        setPaidAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
        setTdsAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
        setRoundups((p) => { const n = { ...p }; delete n[uid]; return n; });
        setRemarks((p) => { const n = { ...p }; delete n[uid]; return n; });
        return prev.filter((id) => id !== uid);
      }
      setPaidAmounts((p) => ({ ...p, [uid]: "" }));
      setTdsAmounts((p) => ({ ...p, [uid]: "" }));
      setRoundups((p) => ({ ...p, [uid]: 0 }));
      setRemarks((p) => ({ ...p, [uid]: "" }));
      return [...prev, uid];
    });
  };

  const selectAllBills = () => {
    const allUids = filteredBills.map((b) => b.uid);
    setSelectedBills(allUids);
    const newPaid = {}, newTds = {}, newRound = {}, newRemarks = {};
    allUids.forEach((uid) => {
      newPaid[uid] = paidAmounts[uid] ?? "";
      newTds[uid] = tdsAmounts[uid] ?? "";
      newRound[uid] = roundups[uid] ?? 0;
      newRemarks[uid] = remarks[uid] ?? "";
    });
    setPaidAmounts(newPaid);
    setTdsAmounts(newTds);
    setRoundups(newRound);
    setRemarks(newRemarks);
  };

  const deselectAllBills = () => {
    setSelectedBills([]);
    setPaidAmounts({});
    setTdsAmounts({});
    setRoundups({});
    setRemarks({});
  };

  const handleRoundupChange = (uid, value) => {
    let numValue = value === "" ? 0 : parseFloat(value);
    if (isNaN(numValue)) numValue = 0;
    if (numValue > 9) numValue = 9;
    if (numValue < -9) numValue = -9;
    setRoundups((prev) => ({ ...prev, [uid]: numValue }));
  };

  const grandTotal = selectedBills.reduce((sum, uid) => {
    const paid = Number(paidAmounts[uid] || 0);
    const tds = Number(tdsAmounts[uid] || 0);
    const round = Number(roundups[uid] || 0);
    return sum + (paid - tds) + round;
  }, 0);

  const handleSubmit = async () => {
    if (selectedBills.length === 0) return alert("कृपया कम से कम एक bill select करें।");
    if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate)
      return alert("सभी Global Payment Details भरें।");

    const emptyPaid = selectedBills.filter(
      (uid) => paidAmounts[uid] === "" || paidAmounts[uid] === undefined || isNaN(Number(paidAmounts[uid]))
    );
    if (emptyPaid.length > 0) return alert(`${emptyPaid.length} bill(s) में Paid Amount खाली है।`);

    const invalidTds = selectedBills.filter((uid) => {
      const paid = Number(paidAmounts[uid] || 0);
      const tds = Number(tdsAmounts[uid] || 0);
      return tds > paid;
    });
    if (invalidTds.length > 0) return alert(`${invalidTds.length} bill(s) में TDS, Paid Amount से ज़्यादा है।`);

    try {
      for (const uid of selectedBills) {
        const bill = filteredBills.find((b) => b.uid === uid);
        const totalAmount = Number((bill?.TOTAL_AMOUNT_4 || "0").toString().replace(/,/g, "").trim()) || 0;
        const currentPaid = Number(paidAmounts[uid] || 0);
        const tds = Number(tdsAmounts[uid] || 0);
        const roundup = Number(roundups[uid] || 0);
        const netPayable = (currentPaid - tds) + roundup;

        await updateDimPayment({
          uid,
          STATUS_5: "Done",
          NET_AMOUNT_5: totalAmount,
          TDS_5: tds || "",
          PAID_AMOUNT_5: currentPaid,
          BALANCE_AMOUNT_5: netPayable,
          BANK_DETAILS_5: bankDetails,
          PAYMENT_MODE_5: paymentMode,
          PAYMENT_DETAILS_5: paymentDetails,
          PAYMENT_DATE_5: paymentDate,
          Remark_5: remarks[uid] || "",
        }).unwrap();
      }

      alert(`✅ ${selectedBills.length} payment(s) successfully submitted!`);
      handleClearFilters();
      setBankDetails(""); setPaymentMode(""); setPaymentDetails(""); setPaymentDate("");
      refetch();
    } catch (err) {
      alert("Error: " + (err?.data?.message || err?.message || "Unknown error"));
    }
  };

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "#64748b", fontSize: 14 }}>Loading payments…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center", color: "#ef4444" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Failed to load payment data</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
            <FaMoneyBillWave style={{ color: "#6366f1", marginRight: 10, verticalAlign: "middle" }} />
            {isAdmin ? 'Dimension Office Payment (Admin View)' : 'Dimension Office Payment'}
          </h1>
          {/* ✅ User info + payment mode badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              {allData.length} pending bill{allData.length !== 1 ? "s" : ""} awaiting payment
            </p>

            {/* ✅ Admin / User badge */}
            {isAdmin ? (
              <span style={{
                backgroundColor: "#ede9fe", color: "#7c3aed",
                borderRadius: 10, padding: "2px 10px", fontSize: 11, fontWeight: 700
              }}>
                Admin – 🏦 Bank + 💵 Cash
              </span>
            ) : (
              getAllowedPaymentModes(currentUserName, isAdmin).length > 0 && (
                <span style={{
                  backgroundColor: getAllowedPaymentModes(currentUserName, isAdmin).includes('bank') ? "#dbeafe" : "#dcfce7",
                  color: getAllowedPaymentModes(currentUserName, isAdmin).includes('bank') ? "#1d4ed8" : "#16a34a",
                  borderRadius: 10, padding: "2px 10px", fontSize: 11, fontWeight: 700
                }}>
                  {getAllowedPaymentModes(currentUserName, isAdmin).includes('bank') ? '🏦 Bank Only' : '💵 Cash Only'}
                </span>
              )
            )}

            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              • Logged in as: <strong style={{ color: "#1e293b" }}>{currentUserName}</strong>
            </span>
          </div>
        </div>

        <div style={{
          backgroundColor: "#6366f118", border: "1px solid #6366f130",
          borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6366f1"
        }}>
          Stage 5 — Actual Payment
        </div>
      </div>

      {/* ✅ No Data Message */}
      {allData.length === 0 && (
        <div style={{
          backgroundColor: "white", borderRadius: 16, padding: "60px 28px",
          textAlign: "center", border: "1px solid #f1f5f9",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>All caught up!</div>
          <div style={{ fontSize: 14, color: "#64748b" }}>
            No pending payments {isAdmin ? 'in the system' : `for ${currentUserName}`} right now.
          </div>
        </div>
      )}

      {/* ── Filter Card ── */}
      {allData.length > 0 && (
        <div style={{
          backgroundColor: "white", borderRadius: 16, padding: "24px 28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, border: "1px solid #f1f5f9"
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>
            🔍 Filter Bills
            <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8", marginLeft: 10 }}>
              Select one or both filters. They work together (AND logic).
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <MultiSelectDropdown
              label="Payee Name"
              placeholder="Search & select payees…"
              selectedValues={selectedPayees}
              onChange={setSelectedPayees}
              options={filteredPayees}
              displayKey="PAYEE_NAME_1"
            />
            <MultiSelectDropdown
              label="Office Bill UID (OFFBILLUID)"
              placeholder="Search & select bill UIDs…"
              selectedValues={selectedOffBillUIDs}
              onChange={setSelectedOffBillUIDs}
              options={filteredOffBillUIDs}
              displayKey="OFFBILLUID"
            />
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={handleFilter} style={{
              padding: "11px 28px", backgroundColor: "#6366f1", color: "white",
              border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700,
              fontSize: 14, display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 14px #6366f140", fontFamily: "inherit",
            }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <FaSearch style={{ fontSize: 12 }} /> Show Bills
            </button>

            {(selectedPayees.length > 0 || selectedOffBillUIDs.length > 0) && (
              <button onClick={handleClearFilters} style={{
                padding: "11px 20px", backgroundColor: "#fef2f2", color: "#dc2626",
                border: "1px solid #fecaca", borderRadius: 10, cursor: "pointer",
                fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center",
                gap: 6, fontFamily: "inherit",
              }}>
                <FaTimes style={{ fontSize: 11 }} /> Clear Filters
              </button>
            )}

            {(selectedPayees.length > 0 || selectedOffBillUIDs.length > 0) && (
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                {selectedPayees.length > 0 && `${selectedPayees.length} payee(s)`}
                {selectedPayees.length > 0 && selectedOffBillUIDs.length > 0 && " + "}
                {selectedOffBillUIDs.length > 0 && `${selectedOffBillUIDs.length} bill UID(s)`}
                {" selected"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Bills List ── */}
      {showBills && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
              Filtered Bills
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
                {filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {filteredBills.length > 0 && (
                <button
                  onClick={selectedBills.length === filteredBills.length ? deselectAllBills : selectAllBills}
                  style={{
                    background: "none", border: "1px solid #c7d2fe", borderRadius: 8,
                    padding: "7px 14px", cursor: "pointer", color: "#4f46e5",
                    fontWeight: 600, fontSize: 12, fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <FaCheckCircle style={{ fontSize: 11 }} />
                  {selectedBills.length === filteredBills.length ? "Deselect All" : "Select All"}
                </button>
              )}
              <button onClick={handleClearFilters} style={{
                background: "none", border: "1px solid #e2e8f0", borderRadius: 8,
                padding: "7px 14px", cursor: "pointer", color: "#64748b",
                fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center",
                gap: 6, fontFamily: "inherit"
              }}>
                <FaTimes style={{ fontSize: 11 }} /> Clear
              </button>
            </div>
          </div>

          {filteredBills.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 0", color: "#94a3b8",
              fontSize: 15, backgroundColor: "white", borderRadius: 14, border: "1px solid #f1f5f9"
            }}>
              No pending bills found for the selected filters.
            </div>
          ) : (
            filteredBills.map((bill) => {
              const isSelected = selectedBills.includes(bill.uid);
              const parseAmt = (v) => Number((v || "0").toString().replace(/,/g, "").trim()) || 0;
              const totalAmount = parseAmt(bill.TOTAL_AMOUNT_4);
              const currentPaid = Number(paidAmounts[bill.uid] || 0);
              const tds = Number(tdsAmounts[bill.uid] || 0);
              const roundup = Number(roundups[bill.uid] || 0);
              const netPayable = (currentPaid - tds) + roundup;
              const progressPct = totalAmount > 0 ? Math.min((netPayable / totalAmount) * 100, 100) : 0;

              return (
                <div key={bill.uid} style={{
                  backgroundColor: "white", borderRadius: 14, padding: "22px 26px", marginBottom: 16,
                  border: isSelected ? "2px solid #6366f1" : "1.5px solid #f1f5f9",
                  boxShadow: isSelected ? "0 0 0 3px #6366f115" : "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div onClick={() => toggleBill(bill.uid)} style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: `2px solid ${isSelected ? "#6366f1" : "#cbd5e1"}`,
                        backgroundColor: isSelected ? "#6366f1" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                      }}>
                        {isSelected && <FaCheckCircle style={{ color: "white", fontSize: 12 }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                          {bill.OFFICE_NAME_1 || bill.PAYEE_NAME_1}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                          {bill.EXPENSES_HEAD_1}
                          {bill.EXPENSES_SUBHEAD_1 ? ` → ${bill.EXPENSES_SUBHEAD_1}` : ""}
                          {bill.OFFBILLUID && (
                            <span style={{
                              marginLeft: 8, color: "#f59e0b", fontWeight: 600,
                              backgroundColor: "#fef3c7", padding: "1px 6px", borderRadius: 4, fontSize: 11
                            }}>
                              {bill.OFFBILLUID}
                            </span>
                          )}
                          {bill.uid && (
                            <span style={{ marginLeft: 6, color: "#c7d2fe", fontWeight: 600 }}>
                              UID: {bill.uid}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <AmountBadge label="Bill Amount" amount={totalAmount} color="#6366f1" />
                    </div>
                  </div>

                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: "12px 20px", paddingTop: 14, borderTop: "1px solid #f8fafc"
                  }}>
                    <InfoChip label="Item Name" value={bill.ITEM_NAME_1} />
                    <InfoChip label="Dept" value={bill.DEPARTMENT_1} />
                    <InfoChip label="Raised By" value={bill.RAISED_BY_1} />
                    <InfoChip label="Vendor" value={bill.Vendor_Name_4} />
                    <InfoChip label="Bill No" value={bill.BILL_NO_4} accent="#6366f1" />
                    <InfoChip label="Bill Date" value={bill.BILL_DATE_4} />
                    <InfoChip label="GST" value={`CGST: ${bill.CGST_4 || "—"} | SGST: ${bill.SGST_4 || "—"}`} />
                    <InfoChip label="Planned Date" value={bill.PLANNED_5} accent="#f59e0b" />
                    <InfoChip label="Payment Mode" value={bill.PAYMENT_MODE_3} />
                  </div>

                  {bill.Bill_Photo && (
                    <div style={{ marginTop: 14 }}>
                      <a href={bill.Bill_Photo} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none",
                        border: "1px solid #6366f130", borderRadius: 6, padding: "5px 12px", backgroundColor: "#6366f108"
                      }}>
                        📎 View Bill Photo
                      </a>
                    </div>
                  )}

                  {isSelected && (
                    <div style={{
                      marginTop: 20, padding: "18px 20px",
                      backgroundColor: "#f8f9ff", borderRadius: 12, border: "1px solid #e0e7ff"
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 14 }}>
                        Payment Entry — {bill.ITEM_NAME_1 || bill.uid}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 16 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                            PAID AMOUNT ₹
                          </label>
                          <input type="number" min="0" placeholder="Enter amount"
                            value={paidAmounts[bill.uid] ?? ""}
                            onChange={(e) => setPaidAmounts((p) => ({ ...p, [bill.uid]: Number(e.target.value) }))}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #a5b4fc", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                            TDS ₹ <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 600, color: "#94a3b8", backgroundColor: "#f1f5f9", borderRadius: 4, padding: "1px 5px" }}>OPTIONAL</span>
                          </label>
                          <input type="number" min="0" placeholder="0 (optional)"
                            value={tdsAmounts[bill.uid] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") { setTdsAmounts((p) => ({ ...p, [bill.uid]: "" })); return; }
                              let v = Number(val);
                              const paid = Number(paidAmounts[bill.uid] || 0);
                              if (v > paid) { alert(`TDS (₹${v}) Paid Amount (₹${fmt(paid)}) से ज़्यादा नहीं हो सकता`); v = paid; }
                              setTdsAmounts((p) => ({ ...p, [bill.uid]: v }));
                            }}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #86efac", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f0fdf4" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                            ROUND OFF ₹ (+/-)
                          </label>
                          <input type="number" step="0.01" min="-9" max="9" placeholder="0"
                            value={roundups[bill.uid] ?? ""}
                            onChange={(e) => handleRoundupChange(bill.uid, e.target.value)}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fcd34d", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffdf0" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>NET PAYABLE ₹</label>
                          <input readOnly value={fmt(netPayable)} style={{
                            width: "100%", padding: "10px 12px", borderRadius: 9,
                            border: `1.5px solid ${netPayable > 0 ? "#86efac" : "#fca5a5"}`,
                            fontSize: 14,
                            backgroundColor: netPayable > 0 ? "#f0fdf4" : "#fff5f5",
                            color: netPayable > 0 ? "#16a34a" : "#dc2626",
                            fontWeight: 700, boxSizing: "border-box", fontFamily: "inherit"
                          }} />
                          {tds > 0 && (
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 4, fontWeight: 600 }}>
                              ₹{fmt(currentPaid)} − ₹{fmt(tds)} TDS
                              {roundup !== 0 && ` ${roundup > 0 ? "+" : ""}${fmt(roundup)}`}
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>REMARK</label>
                          <input type="text" placeholder="Optional remark"
                            value={remarks[bill.uid] || ""}
                            onChange={(e) => setRemarks((p) => ({ ...p, [bill.uid]: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                          />
                        </div>
                      </div>

                      {(currentPaid > 0 || tds > 0) && (
                        <div style={{
                          marginTop: 14, padding: "10px 16px", backgroundColor: "#eef2ff",
                          borderRadius: 8, border: "1px solid #c7d2fe",
                          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12
                        }}>
                          <span style={{ color: "#4f46e5", fontWeight: 600 }}>Paid: ₹{fmt(currentPaid)}</span>
                          {tds > 0 && <span style={{ color: "#dc2626", fontWeight: 600 }}>− TDS: ₹{fmt(tds)}</span>}
                          {roundup !== 0 && <span style={{ color: "#f59e0b", fontWeight: 600 }}>{roundup > 0 ? "+" : ""}Round Off: ₹{fmt(roundup)}</span>}
                          <span style={{ color: "#16a34a", fontWeight: 800 }}>= Net Payable: ₹{fmt(netPayable)}</span>
                        </div>
                      )}

                      {netPayable > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
                            <span>Payment progress{tds > 0 ? ` (TDS ₹${fmt(tds)} deducted)` : ""}</span>
                            <span>{progressPct.toFixed(1)}%</span>
                          </div>
                          <div style={{ height: 6, backgroundColor: "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: "#6366f1", borderRadius: 99, transition: "width 0.3s ease" }} />
                          </div>
                        </div>
                      )}

                      <button onClick={() => paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" })} style={{
                        marginTop: 14, padding: "8px 18px", backgroundColor: "#f0f4ff",
                        border: "1.5px solid #c7d2fe", borderRadius: 8, cursor: "pointer",
                        color: "#4f46e5", fontWeight: 600, fontSize: 12, display: "flex",
                        alignItems: "center", gap: 6, fontFamily: "inherit"
                      }}>
                        <FaArrowDown style={{ fontSize: 10 }} /> Go to Global Payment Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {selectedBills.length > 0 && (
            <div style={{
              backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe",
              borderRadius: 14, padding: "16px 24px", marginTop: 8,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#4f46e5" }}>
                Grand Total — {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} selected
                {selectedBills.some((uid) => Number(tdsAmounts[uid] || 0) > 0) && (
                  <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 500, color: "#dc2626" }}>
                    (Total TDS: ₹{fmt(selectedBills.reduce((s, uid) => s + Number(tdsAmounts[uid] || 0), 0))})
                  </span>
                )}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5" }}>₹{fmt(grandTotal)}</div>
            </div>
          )}

          {selectedBills.length > 0 && (
            <div ref={paymentSectionRef} style={{
              backgroundColor: "white", borderRadius: 16, padding: "26px 28px",
              marginTop: 24, border: "1.5px solid #e0e7ff",
              boxShadow: "0 4px 16px rgba(99,102,241,0.08)"
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>
                Global Payment Details
                <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
                  Applied to all {selectedBills.length} selected bill{selectedBills.length > 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>BANK DETAILS</label>
                  <select value={bankDetails} onChange={(e) => setBankDetails(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                    <option value="">— Select Bank —</option>
                    <option>DIMENSIONS HDFC A/c(0504)</option>
                    <option>SNV Interior And Infrastructure HDFC A/c(7597)</option>
                    <option>Smriti Design Studio HDFC(7097)</option>
                    <option>VIPIN CHOUHAN HDFC A/c(4319)</option>
                    <option>SMRITI CHOUHAN HDFC A/c(1986)</option>
                    <option>Dimensions Petty Cash A/c</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAYMENT MODE</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                    <option value="">— Select Mode —</option>
                    <option>Cheque</option>
                    <option>NEFT</option>
                    <option>RTGS</option>
                    <option>Cash</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                    {paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS"}
                  </label>
                  <input type="text"
                    placeholder={paymentMode === "Cheque" ? "Enter cheque number" : "Ref / UTR / Details"}
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAYMENT DATE</label>
                  <input type="date" value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>
              </div>

              <div style={{
                marginTop: 18, padding: "12px 16px", backgroundColor: "#fffbeb",
                borderRadius: 9, border: "1px solid #fde68a", fontSize: 12, color: "#92400e"
              }}>
                ⚠️ Bank, Payment Mode, Details, and Date will be applied to <strong>all selected bills</strong>.
                Paid Amount, TDS, Round Off and Remark are set per-bill above.
              </div>

              <button onClick={handleSubmit} disabled={isSubmitting} style={{
                marginTop: 24, padding: "14px 40px",
                backgroundColor: isSubmitting ? "#a5b4fc" : "#6366f1",
                color: "white", border: "none", borderRadius: 10,
                fontWeight: 800, fontSize: 15,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px #6366f135", fontFamily: "inherit",
              }}>
                {isSubmitting
                  ? "Submitting…"
                  : `✓ Submit ${selectedBills.length} Payment${selectedBills.length > 1 ? "s" : ""} — ₹${fmt(grandTotal)}`
                }
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DimPayment;