

'use client';


import React, { useState, useEffect, useRef } from "react";
import { useGetPendingDimPaymentsQuery, useUpdateDimPaymentMutation } from "../../../features/paymentSlice";
import { FaSearch, FaChevronDown, FaTimes, FaCheckCircle, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Sub-components ──────────────────────────────────────────────────────────
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

// ─── Searchable Dropdown ─────────────────────────────────────────────────────
const SearchDropdown = ({ label, placeholder, value, onChange, options, displayKey }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => { setSearch(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    (o[displayKey] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); onChange(""); }}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10,
            border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
            backgroundColor: "white", boxSizing: "border-box",
            transition: "border-color 0.2s",
            fontFamily: "inherit",
          }}
          onMouseOver={(e) => (e.target.style.borderColor = "#6366f1")}
          onMouseOut={(e) => (e.target.style.borderColor = open ? "#6366f1" : "#e2e8f0")}
        />
        <FaChevronDown style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 11 }} />
      </div>
      {open && filtered.length > 0 && (
        <ul style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: 10,
          maxHeight: 200, overflowY: "auto", zIndex: 200,
          listStyle: "none", margin: 0, padding: "6px 0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        }}>
          {filtered.map((o, i) => (
            <li
              key={i}
              onClick={() => { onChange(o[displayKey]); setSearch(o[displayKey]); setOpen(false); }}
              style={{
                padding: "10px 16px", cursor: "pointer", fontSize: 14, color: "#1e293b",
                borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {o[displayKey]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const DimPayment = () => {
  const { data: apiData, isLoading, isError, refetch } = useGetPendingDimPaymentsQuery();
  const [updateDimPayment, { isLoading: isSubmitting }] = useUpdateDimPaymentMutation();

  const allData = apiData?.data || [];

  // Unique payees from data
  const uniquePayees = [...new Map(
    allData.map((d) => [d.PAYEE_NAME_1, { PAYEE_NAME_1: d.PAYEE_NAME_1 }])
  ).values()].filter((p) => p.PAYEE_NAME_1);

  const [selectedPayee, setSelectedPayee] = useState("");
  const [showBills, setShowBills] = useState(false);
  const [filteredBills, setFilteredBills] = useState([]);

  // Selected bills & per-bill amounts
  const [selectedBills, setSelectedBills] = useState([]);  // array of UIDs
  const [paidAmounts, setPaidAmounts] = useState({});
  const [roundups, setRoundups] = useState({});            // ✅ roundup state
  const [remarks, setRemarks] = useState({});

  // Global payment fields
  const [bankDetails, setBankDetails] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const paymentSectionRef = useRef(null);

  const handleFilter = () => {
    if (!selectedPayee) return alert("Please select a payee first.");
    const results = allData.filter(
      (d) => (d.PAYEE_NAME_1 || "").toLowerCase() === selectedPayee.toLowerCase()
    );
    setFilteredBills(results);
    setShowBills(true);
    setSelectedBills([]);
    setPaidAmounts({});
    setRoundups({});
    setRemarks({});
  };

  const toggleBill = (uid) => {
    setSelectedBills((prev) => {
      if (prev.includes(uid)) {
        setPaidAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
        setRoundups((p) => { const n = { ...p }; delete n[uid]; return n; });
        setRemarks((p) => { const n = { ...p }; delete n[uid]; return n; });
        return prev.filter((id) => id !== uid);
      }
      setPaidAmounts((p) => ({ ...p, [uid]: "" }));
      setRoundups((p) => ({ ...p, [uid]: 0 }));   // default 0
      setRemarks((p) => ({ ...p, [uid]: "" }));
      return [...prev, uid];
    });
  };

  // ✅ Roundup handler — clamp between -9 and +9
  const handleRoundupChange = (uid, value) => {
    let numValue = value === "" ? 0 : parseFloat(value);
    if (isNaN(numValue)) numValue = 0;
    if (numValue > 9) numValue = 9;
    if (numValue < -9) numValue = -9;
    setRoundups((prev) => ({ ...prev, [uid]: numValue }));
  };

  // ✅ Grand total includes roundup
  const grandTotal = selectedBills.reduce(
    (sum, uid) => sum + (Number(paidAmounts[uid]) || 0) + (Number(roundups[uid]) || 0),
    0
  );

  const handleSubmit = async () => {
    if (selectedBills.length === 0) return alert("कृपया कम से कम एक bill select करें।");
    if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate)
      return alert("सभी Global Payment Details भरें।");

    const emptyPaid = selectedBills.filter(
      (uid) =>
        paidAmounts[uid] === "" ||
        paidAmounts[uid] === undefined ||
        isNaN(Number(paidAmounts[uid])) ||
        roundups[uid] === "" ||
        roundups[uid] === undefined ||
        isNaN(Number(roundups[uid]))
    );
    if (emptyPaid.length > 0)
      return alert(`${emptyPaid.length} bill(s) में Paid Amount या Round Off खाली है।`);

    // Confirm if effective paid = 0
    const zeroPaid = selectedBills.filter(
      (uid) => Number(paidAmounts[uid] || 0) + Number(roundups[uid] || 0) === 0
    );
    if (zeroPaid.length > 0) {
      const ok = window.confirm(`${zeroPaid.length} bill(s) में effective paid amount 0 है। क्या आप submit करना चाहते हैं?`);
      if (!ok) return;
    }

    try {
      for (const uid of selectedBills) {
        const bill = filteredBills.find((b) => b.uid === uid);
        const netAmount = Number((bill?.NET_AMOUNT_4 || "0").toString().replace(/,/g, "").trim()) || 0;
        const currentPaid = Number(paidAmounts[uid] || 0);
        const roundup = Number(roundups[uid] || 0);
        const effectivePaid = currentPaid + roundup;   // ✅ paid + roundup
        const balance = netAmount - effectivePaid;

        await updateDimPayment({
          uid,
          STATUS_5: balance <= 0 ? "Done" : "Partial",
          NET_AMOUNT_5: netAmount,
          PAID_AMOUNT_5: effectivePaid,
          BALANCE_AMOUNT_5: balance,
          BANK_DETAILS_5: bankDetails,
          PAYMENT_MODE_5: paymentMode,
          PAYMENT_DETAILS_5: paymentDetails,
          PAYMENT_DATE_5: paymentDate,
          Remark_5: remarks[uid] || "",
        }).unwrap();
      }

      alert(`✅ ${selectedBills.length} payment(s) successfully submitted!`);
      setShowBills(false);
      setSelectedBills([]);
      setPaidAmounts({});
      setRoundups({});
      setRemarks({});
      setBankDetails(""); setPaymentMode(""); setPaymentDetails(""); setPaymentDate("");
      setSelectedPayee("");
      refetch();
    } catch (err) {
      alert("Error submitting: " + (err?.data?.message || err?.message || "Unknown error"));
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
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
            Dimension Office Payment
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            {allData.length} pending bill{allData.length !== 1 ? "s" : ""} awaiting payment
          </p>
        </div>
        <div style={{ backgroundColor: "#6366f118", border: "1px solid #6366f130", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
          Stage 5 — Actual Payment
        </div>
      </div>

      {/* ── Filter Card ── */}
      <div style={{ backgroundColor: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, border: "1px solid #f1f5f9" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "flex-end" }}>
          <SearchDropdown
            label="Select Payee"
            placeholder="Search payee name…"
            value={selectedPayee}
            onChange={setSelectedPayee}
            options={uniquePayees}
            displayKey="PAYEE_NAME_1"
          />
          <button
            onClick={handleFilter}
            style={{
              padding: "11px 28px", backgroundColor: "#6366f1", color: "white",
              border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700,
              fontSize: 14, display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 14px #6366f140", transition: "opacity 0.2s",
              fontFamily: "inherit", whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <FaSearch style={{ fontSize: 12 }} /> Show Bills
          </button>
        </div>
      </div>

      {/* ── Bills List ── */}
      {showBills && (
        <div>
          {/* Payee header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
              Bills for: <span style={{ color: "#6366f1" }}>{selectedPayee}</span>
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
                {filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => { setShowBills(false); setSelectedPayee(""); setSelectedBills([]); }}
              style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "#64748b", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
            >
              <FaTimes style={{ fontSize: 11 }} /> Clear
            </button>
          </div>

          {filteredBills.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 15 }}>
              No pending bills found for this payee.
            </div>
          ) : (
            filteredBills.map((bill) => {
              const isSelected = selectedBills.includes(bill.uid);
              const parseAmt = (v) => Number((v || "0").toString().replace(/,/g, "").trim()) || 0;
              const netAmount = parseAmt(bill.NET_AMOUNT_4);
              const currentPaid = Number(paidAmounts[bill.uid] || 0);
              const roundup = Number(roundups[bill.uid] || 0);
              const effectivePaid = currentPaid + roundup;
              const balance = netAmount - effectivePaid;
              const progressPct = netAmount > 0 ? Math.min((effectivePaid / netAmount) * 100, 100) : 0;

              return (
                <div
                  key={bill.uid}
                  style={{
                    backgroundColor: "white", borderRadius: 14, padding: "22px 26px",
                    marginBottom: 16, border: isSelected ? "2px solid #6366f1" : "1.5px solid #f1f5f9",
                    boxShadow: isSelected ? "0 0 0 3px #6366f115" : "0 1px 4px rgba(0,0,0,0.05)",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Bill header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      {/* Checkbox */}
                      <div
                        onClick={() => toggleBill(bill.uid)}
                        style={{
                          width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? "#6366f1" : "#cbd5e1"}`,
                          backgroundColor: isSelected ? "#6366f1" : "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                        }}
                      >
                        {isSelected && <FaCheckCircle style={{ color: "white", fontSize: 12 }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                          {bill.OFFICE_NAME_1 || bill.PAYEE_NAME_1}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                          {bill.EXPENSES_HEAD_1} {bill.EXPENSES_SUBHEAD_1 ? `→ ${bill.EXPENSES_SUBHEAD_1}` : ""}
                          {bill.uid ? <span style={{ marginLeft: 8, color: "#c7d2fe", fontWeight: 600 }}>UID: {bill.uid}</span> : null}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <AmountBadge label="Bill Amount" amount={netAmount} color="#6366f1" />
                    </div>
                  </div>

                  {/* Details grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px 20px", paddingTop: 14, borderTop: "1px solid #f8fafc" }}>
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

                  {/* Bill photo link */}
                  {bill.Bill_Photo && (
                    <div style={{ marginTop: 14 }}>
                      <a href={bill.Bill_Photo} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none", border: "1px solid #6366f130", borderRadius: 6, padding: "5px 12px", backgroundColor: "#6366f108" }}>
                        📎 View Bill Photo
                      </a>
                    </div>
                  )}

                  {/* ── Per-bill payment inputs (shown when selected) ── */}
                  {isSelected && (
                    <div style={{ marginTop: 20, padding: "18px 20px", backgroundColor: "#f8f9ff", borderRadius: 12, border: "1px solid #e0e7ff" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 14 }}>
                        Payment Entry — {bill.ITEM_NAME_1 || bill.uid}
                      </div>

                      {/* 4 columns: Paid | Round Off | Balance | Remark */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                        {/* Paid Amount */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                            PAID AMOUNT ₹
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={netAmount}
                            placeholder="Enter amount"
                            value={paidAmounts[bill.uid] ?? ""}
                            onChange={(e) => {
                              let v = Number(e.target.value);
                              if (v > netAmount) { alert(`Amount cannot exceed ₹${fmt(netAmount)}`); v = netAmount; }
                              setPaidAmounts((p) => ({ ...p, [bill.uid]: v }));
                            }}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #a5b4fc", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                          />
                        </div>

                        {/* ✅ Round Off */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                            ROUND OFF ₹ (+/-)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="-9"
                            max="9"
                            placeholder="0"
                            value={roundups[bill.uid] ?? ""}
                            onChange={(e) => handleRoundupChange(bill.uid, e.target.value)}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fcd34d", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffdf0" }}
                          />
                        </div>

                        {/* Balance (auto-calculated) */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                            BALANCE ₹
                          </label>
                          <input
                            readOnly
                            value={fmt(balance)}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fca5a5", fontSize: 14, backgroundColor: "#fff5f5", color: "#dc2626", fontWeight: 700, boxSizing: "border-box", fontFamily: "inherit" }}
                          />
                        </div>

                        {/* Remark */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                            REMARK
                          </label>
                          <input
                            type="text"
                            placeholder="Optional remark"
                            value={remarks[bill.uid] || ""}
                            onChange={(e) => setRemarks((p) => ({ ...p, [bill.uid]: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                          />
                        </div>
                      </div>

                      {/* Progress bar */}
                      {effectivePaid > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
                            <span>Payment progress</span>
                            <span>{progressPct.toFixed(1)}%</span>
                          </div>
                          <div style={{ height: 6, backgroundColor: "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: "#6366f1", borderRadius: 99, transition: "width 0.3s ease" }} />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                        style={{ marginTop: 14, padding: "8px 18px", backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe", borderRadius: 8, cursor: "pointer", color: "#4f46e5", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
                      >
                        <FaArrowDown style={{ fontSize: 10 }} /> Go to Global Payment Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* ── Grand Total ── */}
          {selectedBills.length > 0 && (
            <div style={{ backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe", borderRadius: 14, padding: "16px 24px", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#4f46e5" }}>
                Grand Total — {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} selected
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5" }}>
                ₹{fmt(grandTotal)}
              </div>
            </div>
          )}

          {/* ── Global Payment Details ── */}
          {selectedBills.length > 0 && (
            <div
              ref={paymentSectionRef}
              style={{ backgroundColor: "white", borderRadius: 16, padding: "26px 28px", marginTop: 24, border: "1.5px solid #e0e7ff", boxShadow: "0 4px 16px rgba(99,102,241,0.08)" }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>
                Global Payment Details
                <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
                  Applied to all {selectedBills.length} selected bill{selectedBills.length > 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                {/* Bank */}
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

                {/* Mode */}
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

                {/* Details / Cheque No */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                    {paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS"}
                  </label>
                  <input
                    type="text"
                    placeholder={paymentMode === "Cheque" ? "Enter cheque number" : "Ref / UTR / Details"}
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>

                {/* Date */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAYMENT DATE</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>
              </div>

              {/* Info note */}
              <div style={{ marginTop: 18, padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: 9, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
                ⚠️ Bank, Payment Mode, Details, and Date will be applied to <strong>all selected bills</strong>. Paid Amount, Round Off and Remark are set per-bill above.
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  marginTop: 24, padding: "14px 40px",
                  backgroundColor: isSubmitting ? "#a5b4fc" : "#6366f1",
                  color: "white", border: "none", borderRadius: 10,
                  fontWeight: 800, fontSize: 15, cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px #6366f135", fontFamily: "inherit",
                  transition: "background 0.2s",
                }}
              >
                {isSubmitting ? "Submitting…" : `✓ Submit ${selectedBills.length} Payment${selectedBills.length > 1 ? "s" : ""} — ₹${fmt(grandTotal)}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DimPayment;