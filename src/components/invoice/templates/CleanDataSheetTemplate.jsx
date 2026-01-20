"use client";
import React from "react";
import moment from "moment";

// --- New Template Component ---
const CleanDataSheetTemplate = ({ invoiceData, selectedStore }) => {
  // Helper function remains the same
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const ACCENT_COLOR = "#ffc107"; // Soft Gold/Amber
  const TEXT_COLOR = "#333333"; // Charcoal Gray
  const LIGHT_BORDER = "#eeeeee"; // Very Light Gray

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
              /* ✅ MINI PRINTER MODE FIX */
      body.print-mode-mini .clean-invoice {
        flex-direction: column !important;
        width: 74mm !important;
        max-width: 74mm !important;
        padding: 4px !important;
      }

      /* ✅ Left panel mini-mode */
      body.print-mode-mini .clean-left {
        width: 100% !important;
        padding: 8px !important;
        border-radius: 0 !important;
        text-align: center !important;
      }

      body.print-mode-mini .clean-left h2 {
        font-size: 14px !important;
      }

      body.print-mode-mini .clean-left p {
        font-size: 10px !important;
      }

      /* ✅ Right panel mini-mode */
      body.print-mode-mini .clean-right {
        width: 100% !important;
        padding: 6px !important;
      }

      /* ✅ Header */
      body.print-mode-mini .clean-header h1 {
        font-size: 16px !important;
      }

      body.print-mode-mini .clean-header .date {
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

      /* ✅ Table Compact */
      body.print-mode-mini table th {
        font-size: 9px !important;
        padding: 4px 0 !important;
      }

      body.print-mode-mini table td {
        font-size: 10px !important;
        padding: 4px 0 !important;
      }

      /* ✅ Totals */
      body.print-mode-mini .totals .row {
        width: 100% !important;
      }

      body.print-mode-mini .totals .label,
      body.print-mode-mini .totals .amount {
        font-size: 10px !important;
      }

      /* ✅ Footer */
      body.print-mode-mini .footer {
        font-size: 9px !important;
        margin-top: 10px !important;
      }

        /* Clean Data Sheet Template Styles */
        .clean-invoice-body {
          font-family: 'Lato', 'Helvetica', sans-serif !important;
          background: #fcfcfc !important;
          color: ${TEXT_COLOR} !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }
        .clean-invoice {
          max-width: 600px; /* Narrower for a tighter, minimalist feel */
          margin: 50px auto;
          padding: 40px;
          background: white;
          border: 1px solid ${LIGHT_BORDER};
        }

        /* Header */
        .clean-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${ACCENT_COLOR}; /* Subtle accent line */
        }
        .clean-header h1 {
            color: ${TEXT_COLOR};
            font-size: 30px;
            font-weight: 900;
            margin-bottom: 5px;
            letter-spacing: 1px;
        }
        .clean-store-name {
            font-size: 16px;
            font-weight: 700;
            color: ${ACCENT_COLOR};
            margin-bottom: 5px;
        }
        .clean-store-info p {
            margin: 2px 0;
            font-size: 11px;
            color: #777;
        }

        /* Info Section - Stacked */
        .clean-info-section {
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            gap: 30px;
        }
        .clean-block {
            width: 45%;
        }
        .clean-block .title {
            font-size: 11px;
            text-transform: uppercase;
            color: ${TEXT_COLOR};
            font-weight: 700;
            margin-bottom: 8px;
            border-bottom: 1px solid ${LIGHT_BORDER};
            padding-bottom: 5px;
        }
        .clean-block p {
            margin: 4px 0;
            font-size: 13px;
        }
        .clean-value-bold {
            font-weight: 600;
            color: ${TEXT_COLOR};
        }
        .clean-invoice-number {
            font-size: 15px;
            font-weight: 800;
            color: ${ACCENT_COLOR};
        }

        /* Table */
        .clean-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .clean-table thead tr {
          border-bottom: 2px solid ${TEXT_COLOR};
        }
        .clean-table th {
          text-align: left;
          font-size: 10px;
          text-transform: uppercase;
          padding: 10px 0;
        }
        .clean-table td {
          padding: 8px 0;
          border-bottom: 1px dashed ${LIGHT_BORDER};
          font-size: 13px;
        }
        .clean-product-name {
          font-weight: 600;
        }
        .clean-product-sku {
          font-size: 10px;
          color: #999;
        }

        /* Totals Section */
        .clean-totals-table {
          width: 250px;
          margin-left: auto;
          border-top: 1px solid ${LIGHT_BORDER};
        }
        .clean-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 14px;
        }
        .clean-totals-table .label {
          color: #555;
        }
        .clean-totals-table .amount {
          font-weight: 600;
          color: ${TEXT_COLOR};
        }
        .clean-totals-table .final-row {
          border-top: 3px double ${TEXT_COLOR};
          padding-top: 10px;
          margin-top: 5px;
          font-size: 20px;
        }
        .clean-totals-table .final-row .label,
        .clean-totals-table .final-row .amount {
            font-weight: 800;
            color: ${ACCENT_COLOR};
        }

        /* Footer */
        .clean-footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid ${LIGHT_BORDER};
          font-size: 12px;
          color: #999;
        }
      `}</style>
      <div className="clean-invoice-body">
        <div className="clean-invoice">
          {/* Header Section */}
          <div className="clean-header">
            <h1>INVOICE</h1>
            <div className="clean-store-name">
              {selectedStore?.storeName || "Data Stream Accounting"}
            </div>
            <div className="clean-store-info">
              <p>
                {selectedStore?.address || "456 Minimalist Way, Clarity City"}
              </p>
              <p>
                Ph: {selectedStore?.phone || "+91 7654321098"} | Email:{" "}
                {selectedStore?.email || "billing@datastream.com"}
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="clean-info-section">
            {/* Invoice Details */}
            <div className="clean-block">
              <div className="title">Invoice Details</div>
              <p>
                Invoice #:{" "}
                <span className="clean-invoice-number">
                  {invoiceData.invoiceNumber}
                </span>
              </p>
              <p>
                Date Issued:{" "}
                <span className="clean-value-bold">
                  {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                </span>
              </p>
              <p>
                Due Date: <span className="clean-value-bold">N/A</span>
              </p>
            </div>

            {/* Bill To Details */}
            <div className="clean-block">
              <div className="title">Bill To</div>
              <p className="clean-value-bold">
                {invoiceData.customer?.name || "Walk-in Customer"}
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
          <table className="clean-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Description</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                <th style={{ width: "20%", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="clean-product-name">
                      {item.product?.name || "Unnamed Item"}
                    </div>
                    {item.product?.sku && (
                      <div className="clean-product-sku">
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
          <div className="clean-totals-table">
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
                <div className="amount" style={{ color: "#c0392b" }}>
                  -{formatCurrency(invoiceData.totalDiscount)}
                </div>
              </div>
            )}
            <div className="row final-row">
              <div className="label">AMOUNT DUE:</div>
              <div className="amount">
                {formatCurrency(invoiceData.totalAmount)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="clean-footer">
            <p>
              We appreciate your business. All figures are accurate as of the
              invoice date.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default CleanDataSheetTemplate;
