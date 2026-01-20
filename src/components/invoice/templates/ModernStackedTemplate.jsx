"use client";
import moment from "moment";

const ModernStackedTemplate = ({ invoiceData, selectedStore }) => {
  // Helper function remains the same
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const ACCENT_RED = "#e74c3c"; // Bold Red
  const TEXT_DARK = "#2c3e50"; // Dark Navy/Slate
  const BACKGROUND_LIGHT = "#f8f8f8";

  return (
    <>
      <style jsx global>{`

                /* ✅ MINI PRINTER MODE FIX */
        body.print-mode-mini .modern-invoice {
          flex-direction: column !important;
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 4px !important;
        }

        /* ✅ Left panel mini-mode */
        body.print-mode-mini .modern-left {
          width: 100% !important;
          padding: 8px !important;
          border-radius: 0 !important;
          text-align: center !important;
        }

        body.print-mode-mini .modern-left h2 {
          font-size: 14px !important;
        }

        body.print-mode-mini .modern-left p {
          font-size: 10px !important;
        }

        /* ✅ Right panel mini-mode */
        body.print-mode-mini .modern-right {
          width: 100% !important;
          padding: 6px !important;
        }

        /* ✅ Header */
        body.print-mode-mini .modern-header h1 {
          font-size: 16px !important;
        }

        body.print-mode-mini .modern-header .date {
          font-size: 10px !important;
        }

        /* ✅ Bill To etc */
        body.print-mode-mini .info-section {
          flex-direction: column !important;
          gap: 4px !important;
        }

        body.print-mode-mini .info-section .block {
          width: 100% !important;
        }

        body.print-mode-mini .info-section .value {
          font-size: 12px !important;
        }

                  /* ✅ MINI MODE — FIX Modern Table Size */
          body.print-mode-mini .modern-table {
            margin-bottom: 10px !important;
            border-width: 1px !important;
          }

          body.print-mode-mini .modern-table thead tr {
            height: auto !important;
          }

          body.print-mode-mini .modern-table th {
            font-size: 8.5px !important;     /* ✅ Smaller header text */
            padding: 3px 4px !important;     /* ✅ Compact padding */
          }

          body.print-mode-mini .modern-table td {
            font-size: 9.5px !important;     /* ✅ Smaller row text */
            padding: 3px 4px !important;     /* ✅ Less spacing */
            line-height: 1.1 !important;
          }

          /* ✅ Prevent description overflow */
          body.print-mode-mini .modern-table td:first-child {
            max-width: 55mm !important;
            word-wrap: break-word !important;
          }

          /* ✅ Reduce zebra row background intensity */
          body.print-mode-mini .modern-table tbody tr:nth-child(even) {
            background-color: #f5f5f5 !important;
          }


                /* ✅ Mini Printer – FIX Modern Totals Section Size */
          body.print-mode-mini .modern-totals-table {
            width: 100% !important;
            margin-top: 4px !important;
          }

          body.print-mode-mini .modern-totals-table .row {
            padding: 3px 0 !important;
            font-size: 10px !important;   /* ✅ Smaller clean size */
            border-bottom: 1px dotted #ccc !important;
          }

          body.print-mode-mini .modern-totals-table .label {
            font-size: 10px !important;
          }

          body.print-mode-mini .modern-totals-table .amount {
            font-size: 10px !important;
            font-weight: 600 !important;
          }

          /* ✅ AMOUNT DUE fix (large size reduce) */
          body.print-mode-mini .modern-totals-table .final-row {
            font-size: 12px !important;        /* ✅ Reduced from 22px → perfect for 74mm */
            padding-top: 6px !important;
            margin-top: 6px !important;
            border-top: 2px solid ${ACCENT_RED} !important;
          }

          body.print-mode-mini .modern-totals-table .final-row .label,
          body.print-mode-mini .modern-totals-table .final-row .amount {
            font-size: 12px !important;        /* ✅ Perfectly balanced */
            font-weight: 700 !important;
          }
            
        /* Modern Stacked Template Styles */
        .modern-body {
          font-family: 'Poppins', 'Helvetica', sans-serif !important;
          background: #ffffff !important;
          color: ${TEXT_DARK} !important;
          font-size: 14px !important;
          margin: 0;
          padding: 0;
        }
        .modern-invoice {
          max-width: 750px;
          margin: 40px auto;
          padding: 30px 40px;
          background: white;
          border-left: 5px solid ${ACCENT_RED};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .modern-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
        }
        .modern-header h1 {
            color: ${ACCENT_RED};
            font-size: 40px;
            font-weight: 800;
            margin: 0;
        }
        .modern-store-info {
            text-align: right;
        }
        .modern-store-info p {
            margin: 2px 0;
            font-size: 12px;
            color: #7f8c8d;
        }

        /* Info Blocks */
        .modern-info-container {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        .modern-block {
            flex: 1;
            padding: 15px;
            background: ${BACKGROUND_LIGHT};
            border-radius: 4px;
        }
        .modern-block.customer {
            border-top: 3px solid ${TEXT_DARK};
        }
        .modern-block.invoice {
            border-top: 3px solid ${ACCENT_RED};
        }

        .modern-block .title {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 8px;
            color: ${ACCENT_RED};
        }
        .modern-block p {
            margin: 4px 0;
            font-size: 13px;
        }
        .modern-value-large {
            font-size: 16px;
            font-weight: 700;
            color: ${TEXT_DARK};
        }

        /* Table */
        .modern-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
          border: 1px solid #bdc3c7;
        }
        .modern-table thead tr {
          background-color: ${TEXT_DARK};
          color: white;
        }
        .modern-table th {
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          padding: 12px 10px;
        }
        .modern-table td {
          padding: 10px;
          border: none; /* Remove internal borders */
          font-size: 14px;
        }
        .modern-table tbody tr:nth-child(even) {
            background-color: ${BACKGROUND_LIGHT}; /* Striped effect */
        }

        /* Totals Section */
        .modern-totals-table {
          width: 300px;
          margin-left: auto;
        }
        .modern-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dotted #ccc;
        }
        .modern-totals-table .label {
          font-weight: 500;
          color: #555;
        }
        .modern-totals-table .amount {
          font-weight: 600;
        }
        .modern-totals-table .final-row {
          border-top: 5px solid ${ACCENT_RED};
          padding-top: 15px;
          margin-top: 10px;
          font-size: 22px;
        }
        .modern-totals-table .final-row .label,
        .modern-totals-table .final-row .amount {
            font-weight: 900;
            color: ${ACCENT_RED};
        }

        /* Footer */
        .modern-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px dashed #ccc;
          font-size: 12px;
          color: #999;
        }
      `}</style>
      <div className="modern-body">
        <div className="modern-invoice">
          {/* Header Section */}
          <div className="modern-header">
            <h1>INVOICE</h1>
            <div className="modern-store-info">
              <p style={{ fontWeight: 700, color: TEXT_DARK, fontSize: 16 }}>
                {selectedStore?.storeName || "Redline Solutions"}
              </p>
              <p>{selectedStore?.address || "101 Modern Street, High City"}</p>
              <p>
                Ph: {selectedStore?.phone || "+91 800-REDLINE"} |{" "}
                {selectedStore?.email || "info@redlines.com"}
              </p>
            </div>
          </div>

          {/* Info Blocks */}
          <div className="modern-info-container">
            {/* Bill To Details */}
            <div className="modern-block customer">
              <div className="title">Bill To</div>
              <p className="modern-value-large">
                {invoiceData.customer?.name || "Premium Customer"}
              </p>
              {invoiceData.customer?.email && (
                <p>{invoiceData.customer.email}</p>
              )}
              {invoiceData.customer?.phone && (
                <p>{invoiceData.customer.phone}</p>
              )}
            </div>

            {/* Invoice Details */}
            <div className="modern-block invoice">
              <div className="title">Invoice Details</div>
              <p>
                Invoice #:{" "}
                <span className="modern-value-large">
                  {invoiceData.invoiceNumber}
                </span>
              </p>
              <p>
                Date Issued:{" "}
                <span className="modern-value-large">
                  {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                </span>
              </p>
              <p>
                Due Date: <span className="modern-value-large">IMMEDIATE</span>
              </p>
            </div>
          </div>

          {/* Table */}
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Description (SKU)</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                <th style={{ width: "20%", textAlign: "right" }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {item.product?.name || "Unnamed Service"}
                    </div>
                    {item.product?.sku && (
                      <div style={{ fontSize: "11px", color: "#7f8c8d" }}>
                        SKU: {item.product.sku}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(item.price)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="modern-totals-table">
            <div className="row">
              <div className="label">Subtotal:</div>
              <div className="amount">
                {formatCurrency(invoiceData.subtotal)}
              </div>
            </div>
            <div className="row">
              <div className="label">Tax (GST):</div>
              <div className="amount">
                {formatCurrency(invoiceData.gstAmount)}
              </div>
            </div>
            {invoiceData.totalDiscount > 0 && (
              <div className="row">
                <div className="label">Discount:</div>
                <div className="amount" style={{ color: "#2ecc71" }}>
                  -{formatCurrency(invoiceData.totalDiscount)}
                </div>
              </div>
            )}
            <div className="row final-row">
              <div className="label">AMOUNT DUE</div>
              <div className="amount">
                {formatCurrency(invoiceData.totalAmount)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modern-footer">
            <p style={{ textAlign: "center" }}>
              Payment confirms acceptance of services. Invoice generated on{" "}
              {moment().format("MMMM Do YYYY, h:mm a")}.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default ModernStackedTemplate;
