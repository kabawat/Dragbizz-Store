"use client";
import moment from "moment";

const RoyalEdgeTemplate = ({ invoiceData = {}, selectedStore = {} }) => {
  const formatCurrency = (amount) =>
    `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const GRADIENT_START = "#7c3aed";
  const GRADIENT_END = "#0f172a";
  const CARD_BG = "#ffffff";
  const MUTED = "#6b7280";

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

        /* Root */
        .royal-body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: #f3f4f6;
          color: #111827;
          padding: 24px 16px;
          box-sizing: border-box;
        }

        .royal-invoice {
          max-width: 920px;
          margin: 36px auto;
          background: ${CARD_BG};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.04);
        }

        /* Header */
        .royal-header {
          background: linear-gradient(120deg, ${GRADIENT_START}, ${GRADIENT_END});
          color: white;
          padding: 28px 34px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .royal-brand {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .royal-logo {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: 0.6px;
        }
        .royal-brand .title {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.6px;
        }
        .royal-meta {
          text-align: right;
          font-size: 13px;
        }
        .royal-meta .meta-row {
          opacity: 0.95;
        }
        .royal-meta .meta-strong {
          display: block;
          font-weight: 700;
          margin-top: 6px;
          font-size: 16px;
        }

        /* Body layout: cards and table */
        .royal-body-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 22px;
          padding: 26px;
        }

        /* Info Cards */
        .royal-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.98));
          padding: 18px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.04);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
        }
        .royal-info-pair {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .royal-info-left {
          flex: 1;
          margin-right: 6px;
        }
        .royal-info-right {
          color: ${MUTED};
          font-size: 13px;
        }
        .royal-info-title {
          font-size: 11px;
          font-weight: 700;
          color: ${GRADIENT_START};
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .royal-info-val {
          font-weight: 600;
          color: #0b1220;
          margin-bottom: 4px;
        }
        .royal-small {
          font-size: 13px;
          color: ${MUTED};
        }

        /* Table container spans left column */
        .royal-items-area {
          grid-column: 1 / 2;
        }
        .royal-items-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 12px;
          overflow: hidden;
          border-radius: 10px;
        }
        .royal-items-table thead th {
          background: linear-gradient(180deg, rgba(124,58,237,0.12), rgba(15,23,42,0.04));
          font-size: 12px;
          text-align: left;
          padding: 12px 16px;
          text-transform: uppercase;
          color: #0f172a;
          border-bottom: 1px solid rgba(15, 23, 42, 0.04);
        }
        .royal-items-table tbody td {
          padding: 14px 16px;
          font-size: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.04);
        }
        .royal-items-table tbody tr:nth-child(even) td {
          background: #fbfdff;
        }
        .royal-desc {
          font-weight: 600;
          color: #0b1220;
        }
        .royal-sku {
          font-size: 12px;
          color: ${MUTED};
          margin-top: 4px;
        }

        /* Right column: totals & extra */
        .royal-right-stack {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .royal-totals {
          margin-top: 2px;
          border-radius: 12px;
          padding: 16px;
          background: linear-gradient(180deg, rgba(15,23,42,0.03), rgba(255,255,255,0.98));
          border: 1px solid rgba(15,23,42,0.04);
        }
        .royal-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          color: ${MUTED};
          font-size: 14px;
        }
        .royal-row .val {
          font-weight: 700;
          color: #0b1220;
        }
        .royal-grand {
          margin-top: 12px;
          padding: 12px;
          border-radius: 10px;
          background: ${GRADIENT_START};
          color: white;
          font-weight: 800;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 18px;
          box-shadow: 0 8px 20px rgba(124,58,237,0.12);
        }

        .royal-notes {
          font-size: 13px;
          color: ${MUTED};
          line-height: 1.4;
        }

        /* Footer */
        .royal-footer {
          border-top: 1px dashed rgba(15,23,42,0.06);
          padding: 14px 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: ${MUTED};
        }
        .royal-footer .icons {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .royal-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(15,23,42,0.04);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: ${MUTED};
        }

        /* Responsive */
        @media (max-width: 880px) {
          .royal-body-grid {
            grid-template-columns: 1fr;
          }
          .royal-right-stack {
            order: 3;
          }
          .royal-items-area {
            grid-column: 1 / -1;
          }
        }
      `}</style>

      <div className="royal-body">
        <div className="royal-invoice" role="document" aria-label="Invoice">
          {/* Header */}
          <div className="royal-header">
            <div className="royal-brand" aria-hidden>
              <div className="royal-logo">R</div>
              <div>
                <div className="title">
                  {selectedStore?.storeName || "RoyalEdge"}
                </div>
                <div className="royal-small">
                  {selectedStore?.tagline || "Premium Billing & Invoicing"}
                </div>
              </div>
            </div>

            <div className="royal-meta">
              <div className="meta-row">Invoice</div>
              <div className="meta-strong">
                {invoiceData.invoiceNumber || "—"}
              </div>
              <div className="meta-row">
                {moment(invoiceData.createdAt).format("DD MMM YYYY")}
              </div>
            </div>
          </div>

          {/* Body Grid */}
          <div className="royal-body-grid">
            {/* Left column: store & items */}
            <div>
              {/* Store & Customer Cards */}
              <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                <div
                  style={{ flex: 1 }}
                  className="royal-card"
                  aria-labelledby="from"
                >
                  <div id="from" className="royal-info-title">
                    From
                  </div>
                  <div className="royal-info-val">
                    {selectedStore?.storeName || "RoyalEdge Billing"}
                  </div>
                  <div className="royal-small">
                    {selectedStore?.address || "Suite 100, Central Avenue"}
                  </div>
                  <div className="royal-small" style={{ marginTop: 8 }}>
                    Phone: {selectedStore?.phone || "+91 98765 43210"}
                  </div>
                  <div className="royal-small">
                    Email: {selectedStore?.email || "hello@royaledge.com"}
                  </div>
                </div>

                <div
                  style={{ flex: 1 }}
                  className="royal-card"
                  aria-labelledby="to"
                >
                  <div id="to" className="royal-info-title">
                    Bill To
                  </div>
                  <div className="royal-info-val">
                    {invoiceData.customer?.name || "Walk-in Customer"}
                  </div>
                  {invoiceData.customer?.email && (
                    <div className="royal-small">
                      {invoiceData.customer.email}
                    </div>
                  )}
                  {invoiceData.customer?.phone && (
                    <div className="royal-small">
                      Phone: {invoiceData.customer.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="royal-card">
                <div className="royal-info-title" style={{ marginBottom: 10 }}>
                  Items
                </div>

                <table className="royal-items-table" aria-label="Invoice items">
                  <thead>
                    <tr>
                      <th style={{ width: "52%" }}>Description</th>
                      <th style={{ width: "12%", textAlign: "center" }}>Qty</th>
                      <th style={{ width: "18%", textAlign: "right" }}>Rate</th>
                      <th style={{ width: "18%", textAlign: "right" }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoiceData.items && invoiceData.items.length > 0
                      ? invoiceData.items
                      : [
                        {
                          product: { name: "No items" },
                          quantity: 0,
                          price: 0,
                        },
                      ]
                    ).map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="royal-desc">
                            {item.product?.name || "Unnamed Item"}
                          </div>
                          {item.product?.sku && (
                            <div className="royal-sku">
                              SKU: {item.product.sku}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ textAlign: "right" }}>
                          {formatCurrency(item.price)}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                          {formatCurrency(
                            (item.quantity || 0) * (item.price || 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column: totals, notes */}
            <div className="royal-right-stack">
              <div
                className="royal-card royal-totals"
                aria-labelledby="summary"
              >
                <div id="summary" className="royal-info-title">
                  Summary
                </div>

                <div className="royal-row">
                  <div>Subtotal</div>
                  <div className="val">
                    {formatCurrency(invoiceData.subtotal)}
                  </div>
                </div>

                <div className="royal-row">
                  <div>Tax (GST)</div>
                  <div className="val">
                    {formatCurrency(invoiceData.gstAmount)}
                  </div>
                </div>

                {invoiceData.totalDiscount > 0 && (
                  <div className="royal-row">
                    <div>Discount</div>
                    <div className="val">
                      -{formatCurrency(invoiceData.totalDiscount)}
                    </div>
                  </div>
                )}

                <div className="royal-grand" role="status" aria-live="polite">
                  <div>Amount Due</div>
                  <div>{formatCurrency(invoiceData.totalAmount)}</div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="royal-info-title" style={{ fontSize: 12 }}>
                    Payment
                  </div>
                  <div className="royal-small">
                    Payment Mode: {invoiceData.paymentMode || "Not specified"}
                  </div>
                </div>
              </div>

              <div className="royal-card">
                <div className="royal-info-title">Notes</div>
                <div className="royal-notes">
                  {invoiceData.notes ||
                    "Thank you for your business. Please make payment within the agreed terms."}
                </div>
              </div>

              <div
                className="royal-card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div className="royal-info-title" style={{ fontSize: 12 }}>
                    Prepared By
                  </div>
                  <div className="royal-small">
                    {selectedStore?.preparedBy || "Accounts Team"}
                  </div>
                </div>
                <div>
                  <div
                    style={{ textAlign: "center", fontSize: 12, color: MUTED }}
                  >
                    Signature
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      width: 120,
                      height: 36,
                      borderRadius: 8,
                      background:
                        "linear-gradient(90deg, rgba(15,23,42,0.04), rgba(124,58,237,0.06))",
                      display: "inline-block",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="royal-footer">
            <div>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</div>
            <div className="icons" aria-hidden>
              <div className="royal-icon">★</div>
              <div className="royal-icon">☎</div>
              <div className="royal-icon">✉</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoyalEdgeTemplate;
