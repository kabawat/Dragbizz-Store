"use client";
import moment from "moment";

const NeoEdgeTemplate = ({ invoiceData, selectedStore }) => {
  const formatCurrency = (amount) =>
    `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const PRIMARY_COLOR = "#004aad"; // Deep blue
  const SECONDARY_COLOR = "#0f172a"; // Navy dark
  const BG_GRADIENT = "linear-gradient(135deg, #004aad, #0284c7)";
  const LIGHT_BG = "#f8fafc";

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

                  /* ✅ MINI MODE – NeoEdge Perfect Compact Layout */
            body.print-mode-mini .neoedge-invoice {
              width: 74mm !important;
              max-width: 74mm !important;
              padding: 6px !important;
              margin: 0 auto !important;
              border: none !important;
              box-shadow: none !important;
              overflow: hidden !important;
            }

            /* ✅ Base Font Reduce */
            body.print-mode-mini .neoedge-body {
              font-size: 10.5px !important;
            }

            /* ✅ HEADER FIX */
            body.print-mode-mini .neoedge-header {
              padding: 10px !important;
              border-bottom-width: 2px !important;
              text-align: center !important;
            }

            body.print-mode-mini .neoedge-header h1 {
              font-size: 16px !important;
            }

            body.print-mode-mini .neoedge-store-info {
              font-size: 9px !important;
            }

            /* ✅ INFO CARDS TO ONE COLUMN */
            body.print-mode-mini .neoedge-info-section {
              display: block !important;
              margin: 8px !important;
            }

            body.print-mode-mini .neoedge-card {
              width: 100% !important;
              margin-bottom: 6px !important;
              padding: 8px !important;
            }

            body.print-mode-mini .neoedge-card .title {
              font-size: 9px !important;
              margin-bottom: 3px !important;
            }

            body.print-mode-mini .neoedge-card p {
              font-size: 10px !important;
              margin: 1px 0 !important;
            }

            /* ✅ TABLE FIX */
            body.print-mode-mini .neoedge-table {
              margin: 8px !important;
              width: 100% !important;
            }

            body.print-mode-mini .neoedge-table thead th {
              font-size: 8px !important;
              padding: 3px !important;
            }

            body.print-mode-mini .neoedge-table td {
              font-size: 9.5px !important;
              padding: 3px !important;
            }

            /* Prevent description overflow */
            body.print-mode-mini .neoedge-table td:first-child {
              max-width: 55mm !important;
              word-wrap: break-word !important;
            }

            /* ✅ TOTALS FIX */
            body.print-mode-mini .neoedge-totals {
              margin: 8px !important;
              justify-content: flex-start !important;
            }

            body.print-mode-mini .neoedge-total-card {
              width: 100% !important;
              padding: 8px !important;
            }

            body.print-mode-mini .neoedge-total-row {
              font-size: 10px !important;
              margin: 3px 0 !important;
              padding: 0 !important;
            }

            body.print-mode-mini .neoedge-total-label {
              font-size: 10px !important;
            }

            body.print-mode-mini .neoedge-total-amount {
              font-size: 10px !important;
              font-weight: 600 !important;
            }

            /* ✅ FINAL AMOUNT FIX */
            body.print-mode-mini .neoedge-total-final {
              font-size: 12px !important;
              padding-top: 6px !important;
              margin-top: 6px !important;
            }

            /* ✅ FOOTER FIX */
            body.print-mode-mini .neoedge-footer {
              padding: 6px !important;
  font-size: 9px !important;
}

body.print-mode-mini .neoedge-footer::before {
  font-size: 28px !important;  /* watermark small */
}

        .neoedge-body {
          font-family: "Poppins", sans-serif !important;
          background: ${LIGHT_BG};
          color: ${SECONDARY_COLOR};
          font-size: 13px;
          padding: 0;
          margin: 0;
        }

        .neoedge-invoice {
          max-width: 750px;
          margin: 40px auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
        }

        /* Header */
        .neoedge-header {
          background: ${BG_GRADIENT};
          color: white;
          padding: 25px 35px;
          border-bottom: 4px solid #93c5fd;
        }
        .neoedge-header h1 {
          font-size: 30px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 1px;
        }
        .neoedge-store-info {
          margin-top: 8px;
          font-size: 12px;
          opacity: 0.9;
        }

        /* Info Bar */
        .neoedge-info-section {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin: 30px;
        }
        .neoedge-card {
          flex: 1;
          border: 1px solid #e2e8f0;
          padding: 15px 20px;
          border-radius: 8px;
          background: #f9fafb;
        }
        .neoedge-card .title {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
          color: ${PRIMARY_COLOR};
          border-bottom: 1px dashed ${PRIMARY_COLOR};
          margin-bottom: 6px;
          padding-bottom: 4px;
        }
        .neoedge-card p {
          margin: 3px 0;
        }

        /* Table */
        .neoedge-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 30px 30px;
        }
        .neoedge-table thead tr {
          background: ${BG_GRADIENT};
          color: white;
        }
        .neoedge-table th {
          font-size: 11px;
          padding: 10px;
          text-transform: uppercase;
        }
        .neoedge-table td {
          padding: 10px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .neoedge-table tbody tr:nth-child(even) {
          background: #f1f5f9;
        }

        /* Totals */
        .neoedge-totals {
          margin: 0 30px 30px;
          display: flex;
          justify-content: flex-end;
        }
        .neoedge-total-card {
          background: #f8fafc;
          padding: 15px 25px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          width: 300px;
        }
        .neoedge-total-row {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
          font-size: 14px;
        }
        .neoedge-total-label {
          color: #555;
        }
        .neoedge-total-amount {
          font-weight: 600;
          color: ${SECONDARY_COLOR};
        }
        .neoedge-total-final {
          border-top: 2px solid ${PRIMARY_COLOR};
          padding-top: 10px;
          font-weight: 700;
          color: ${PRIMARY_COLOR};
          font-size: 18px;
        }

        /* Footer */
        .neoedge-footer {
          text-align: center;
          background: ${SECONDARY_COLOR};
          color: #cbd5e1;
          font-size: 12px;
          padding: 15px 0;
          position: relative;
        }
        .neoedge-footer::before {
          content: "NeoEdge";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 60px;
          opacity: 0.05;
          color: white;
          pointer-events: none;
        }
      `}</style>

      <div className="neoedge-body">
        <div className="neoedge-invoice">
          {/* Header */}
          <div className="neoedge-header">
            <h1>INVOICE</h1>
            <div className="neoedge-store-info">
              <strong>{selectedStore?.storeName || "NeoEdge Solutions"}</strong>{" "}
              | {selectedStore?.address || "G-45, Business Park, New Delhi"}
              <br />
              Ph: {selectedStore?.phone || "+91 9876543210"} | Email:{" "}
              {selectedStore?.email || "info@neoedge.com"}
            </div>
          </div>

          {/* Info Section */}
          <div className="neoedge-info-section">
            <div className="neoedge-card">
              <div className="title">Invoice Details</div>
              <p>
                Invoice #: <b>{invoiceData.invoiceNumber}</b>
              </p>
              <p>
                Date:{" "}
                <b>{moment(invoiceData.createdAt).format("DD MMM YYYY")}</b>
              </p>
            </div>
            <div className="neoedge-card">
              <div className="title">Customer</div>
              <p>
                <b>{invoiceData.customer?.name || "Walk-in Customer"}</b>
              </p>
              {invoiceData.customer?.email && (
                <p>{invoiceData.customer.email}</p>
              )}
              {invoiceData.customer?.phone && (
                <p>{invoiceData.customer.phone}</p>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="neoedge-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Rate</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.product?.name || "Unnamed Item"}</td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(item.price)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="neoedge-totals">
            <div className="neoedge-total-card">
              <div className="neoedge-total-row">
                <span className="neoedge-total-label">Subtotal:</span>
                <span className="neoedge-total-amount">
                  {formatCurrency(invoiceData.subtotal)}
                </span>
              </div>
              <div className="neoedge-total-row">
                <span className="neoedge-total-label">Tax (GST):</span>
                <span className="neoedge-total-amount">
                  {formatCurrency(invoiceData.gstAmount)}
                </span>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div className="neoedge-total-row">
                  <span className="neoedge-total-label">Discount:</span>
                  <span
                    className="neoedge-total-amount"
                    style={{ color: "#dc2626" }}
                  >
                    -{formatCurrency(invoiceData.totalDiscount)}
                  </span>
                </div>
              )}
              <div className="neoedge-total-row neoedge-total-final">
                <span>Total:</span>
                <span>{formatCurrency(invoiceData.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="neoedge-footer">
            <p>Thank you for your business — NeoEdge Billing Systems</p>
            <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NeoEdgeTemplate;
