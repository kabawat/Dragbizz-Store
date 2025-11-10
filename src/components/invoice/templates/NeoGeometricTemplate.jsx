"use client";
import React from "react";
import moment from "moment";

const NeoGeometricTemplate = ({ invoiceData = {}, selectedStore = {} }) => {
  const formatCurrency = (amount) =>
    `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Palette
  const ACCENT = "#0ea5e9"; // cyan/blue
  const DARK = "#0f172a";
  const BG = "#f8fafc";
  const BORDER = "rgba(15, 23, 42, 0.08)";

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }

                  /* ✅ MINI MODE – Full Neo Template Fix */
        body.print-mode-mini .neo-invoice {
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 6px !important;
          margin: 0 auto !important;
          border: none !important;
          box-shadow: none !important;
          overflow: hidden !important;
        }

        /* ✅ Global font shrink */
        body.print-mode-mini .neo-body {
          font-size: 10.5px !important;
        }

        /* ✅ Header Compact */
        body.print-mode-mini .neo-header {
          padding: 10px !important;
          clip-path: none !important;
          border-radius: 0 !important;
          flex-direction: column !important;
          text-align: center !important;
          gap: 4px !important;
        }

        body.print-mode-mini .neo-brand .title {
          font-size: 12px !important;
        }

        body.print-mode-mini .neo-logo {
          width: 36px !important;
          height: 36px !important;
          font-size: 14px !important;
        }

        body.print-mode-mini .neo-meta {
          font-size: 10px !important;
        }

        body.print-mode-mini .neo-meta strong {
          font-size: 12px !important;
        }

        /* ✅ GRID FIX */
        body.print-mode-mini .neo-grid {
          display: block !important;
          padding: 10px !important;
        }

        /* ✅ CARDS FIX */
        body.print-mode-mini .neo-card {
          padding: 8px !important;
          margin-bottom: 6px !important;
        }

        body.print-mode-mini .neo-title {
          font-size: 9px !important;
        }

        body.print-mode-mini .neo-val,
        body.print-mode-mini .neo-sub {
          font-size: 10px !important;
        }

        /* ✅ ITEMS TABLE FIX */
        body.print-mode-mini .neo-items thead th {
          font-size: 8px !important;
          padding: 3px 4px !important;
        }

        body.print-mode-mini .neo-items tbody td {
          font-size: 9.5px !important;
          padding: 3px 4px !important;
        }

        /* prevent description overflow */
        body.print-mode-mini .neo-items tbody td:first-child {
          max-width: 55mm !important;
          word-wrap: break-word !important;
        }

        /* ✅ SUMMARY (TOTALS) FIX */
        body.print-mode-mini .neo-summary {
          padding: 8px !important;
          margin-top: 8px !important;
        }

        body.print-mode-mini .neo-row {
          font-size: 10px !important;
          margin-bottom: 4px !important;
          padding: 0px !important;
        }

        /* ✅ GRAND TOTAL FIX */
        body.print-mode-mini .neo-grand {
          font-size: 12px !important;
          padding: 6px !important;
          margin-top: 6px !important;
          border-radius: 4px !important;
          justify-content: space-between !important;
        }

        /* ✅ Footer Compact */
        body.print-mode-mini .neo-footer {
          padding: 6px !important;
          font-size: 9px !important;
          margin-top: 6px !important;
        }


        .neo-body {
          font-family: "Inter", system-ui, sans-serif;
          background: ${BG};
          color: ${DARK};
          padding: 24px 16px;
        }

        .neo-invoice {
          max-width: 940px;
          margin: 32px auto;
          background: white;
          border-radius: 0.75rem;
          border: 2px solid ${BORDER};
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
        }

        /* Header */
        .neo-header {
          background: linear-gradient(135deg, ${ACCENT}, ${DARK});
          color: white;
          padding: 28px 34px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }

        .neo-logo {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-weight: 800;
          font-size: 22px;
        }

        .neo-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .neo-brand .title {
          font-weight: 700;
          font-size: 20px;
        }

        .neo-meta {
          text-align: right;
          font-size: 14px;
        }

        .neo-meta strong {
          display: block;
          font-size: 18px;
          margin-top: 4px;
          font-weight: 700;
        }

        /* Layout */
        .neo-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 22px;
          padding: 26px;
        }

        /* Cards */
        .neo-card {
          border: 1px solid ${BORDER};
          border-radius: 12px;
          padding: 18px;
          background: linear-gradient(180deg, #fff, #f9fafb);
        }

        .neo-title {
          font-size: 11px;
          text-transform: uppercase;
          color: ${ACCENT};
          font-weight: 700;
          margin-bottom: 6px;
        }

        .neo-val {
          font-weight: 600;
          color: ${DARK};
        }

        .neo-sub {
          font-size: 13px;
          color: #6b7280;
        }

        /* Items */
        .neo-items {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          border: 1px solid ${BORDER};
          border-radius: 8px;
          overflow: hidden;
        }

        .neo-items thead th {
          background: ${ACCENT};
          color: white;
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          text-transform: uppercase;
        }

        .neo-items tbody td {
          padding: 12px 16px;
          border-top: 1px solid ${BORDER};
          font-size: 14px;
        }

        .neo-items tbody tr:nth-child(even) td {
          background: #f1f5f9;
        }

        /* Totals */
        .neo-summary {
          background: #f8fafc;
          border: 1px solid ${BORDER};
          border-radius: 12px;
          padding: 16px;
        }

        .neo-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 8px;
          color: #374151;
        }

        .neo-row .val {
          font-weight: 700;
        }

        .neo-grand {
          background: ${ACCENT};
          color: white;
          padding: 12px 16px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 800;
          font-size: 18px;
          margin-top: 12px;
        }

        /* Footer */
        .neo-footer {
          border-top: 1px dashed ${BORDER};
          padding: 14px 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #6b7280;
        }

        @media (max-width: 880px) {
          .neo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="neo-body">
        <div className="neo-invoice">
          {/* Header */}
          <div className="neo-header">
            <div className="neo-brand">
              <div className="neo-logo">N</div>
              <div>
                <div className="title">{selectedStore?.storeName || "NeoGeometric"}</div>
                <div className="neo-sub">{selectedStore?.tagline || "Precision Invoice Design"}</div>
              </div>
            </div>

            <div className="neo-meta">
              Invoice
              <strong>{invoiceData.invoiceNumber || "—"}</strong>
              <div>{moment(invoiceData.createdAt).format("DD MMM YYYY")}</div>
            </div>
          </div>

          {/* Body */}
          <div className="neo-grid">
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                <div className="neo-card">
                  <div className="neo-title">From</div>
                  <div className="neo-val">{selectedStore?.storeName || "NeoGeometric Billing"}</div>
                  <div className="neo-sub">{selectedStore?.address || "Suite 100, Central Avenue"}</div>
                  <div className="neo-sub">Phone: {selectedStore?.phone || "+91 98765 43210"}</div>
                  <div className="neo-sub">Email: {selectedStore?.email || "info@neogeometric.com"}</div>
                </div>

                <div className="neo-card">
                  <div className="neo-title">Bill To</div>
                  <div className="neo-val">{invoiceData.customer?.name || "Walk-in Customer"}</div>
                  {invoiceData.customer?.email && <div className="neo-sub">{invoiceData.customer.email}</div>}
                  {invoiceData.customer?.phone && <div className="neo-sub">Phone: {invoiceData.customer.phone}</div>}
                </div>
              </div>

              <div className="neo-card">
                <div className="neo-title">Items</div>
                <table className="neo-items">
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }}>Description</th>
                      <th style={{ width: "12%", textAlign: "center" }}>Qty</th>
                      <th style={{ width: "18%", textAlign: "right" }}>Rate</th>
                      <th style={{ width: "20%", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoiceData.items && invoiceData.items.length > 0 ? invoiceData.items : [{
                      product: { name: "No items" },
                      quantity: 0,
                      price: 0,
                    }]).map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.product?.name || "Unnamed Item"}</div>
                          {item.product?.sku && <div className="neo-sub">SKU: {item.product.sku}</div>}
                        </td>
                        <td style={{ textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ textAlign: "right" }}>{formatCurrency(item.price)}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                          {formatCurrency((item.quantity || 0) * (item.price || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column */}
            <div className="neo-card neo-summary">
              <div className="neo-title">Summary</div>
              <div className="neo-row">
                <div>Subtotal</div>
                <div className="val">{formatCurrency(invoiceData.subtotal)}</div>
              </div>
              <div className="neo-row">
                <div>Tax (GST)</div>
                <div className="val">{formatCurrency(invoiceData.gstAmount)}</div>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div className="neo-row">
                  <div>Discount</div>
                  <div className="val">-{formatCurrency(invoiceData.totalDiscount)}</div>
                </div>
              )}
              <div className="neo-grand">
                <div>Amount Due</div>
                <div>{formatCurrency(invoiceData.totalAmount)}</div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div className="neo-title" style={{ fontSize: 12 }}>Payment</div>
                <div className="neo-sub">Mode: {invoiceData.paymentMode || "Not specified"}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="neo-footer">
            <div>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</div>
            <div>© {new Date().getFullYear()} {selectedStore?.storeName || "NeoGeometric"}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NeoGeometricTemplate;
