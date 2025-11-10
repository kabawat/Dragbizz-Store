"use client";
import React from "react";
import moment from "moment";

const CelesteTemplate = ({ invoiceData, selectedStore }) => {
  // A helper function to safely format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
          body.print-mode-mini .celeste-invoice {
            flex-direction: column !important;
            width: 74mm !important;
            max-width: 74mm !important;
            padding: 4px !important;
          }

          /* ✅ Left panel mini-mode */
          body.print-mode-mini .celeste-left {
            width: 100% !important;
            padding: 8px !important;
            border-radius: 0 !important;
            text-align: center !important;
          }

          body.print-mode-mini .celeste-left h2 {
            font-size: 14px !important;
          }

          body.print-mode-mini .celeste-left p {
            font-size: 10px !important;
          }

          /* ✅ Right panel mini-mode */
          body.print-mode-mini .celeste-right {
            width: 100% !important;
            padding: 6px !important;
          }

          /* ✅ Header */
          body.print-mode-mini .celeste-header h1 {
            font-size: 16px !important;
          }

          body.print-mode-mini .celeste-header .date {
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

        /* Celeste Template Styles */
        .celeste-invoice-body {
          font-family: 'Roboto', 'Arial', sans-serif !important;
          background: #f4f6f9 !important;
          color: #333 !important;
          font-size: 14px !important;
          margin: 0;
          padding: 0;
        }
        .celeste-invoice {
          max-width: 800px;
          margin: 40px auto;
          padding: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          border-top: 5px solid #007bff; /* Primary color stripe */
        }
        .celeste-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }
        .celeste-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #007bff;
          margin: 0;
          letter-spacing: 1px;
        }
        .celeste-header p {
          font-size: 14px;
          color: #666;
          margin: 5px 0 0;
        }
        .celeste-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .celeste-info-block {
          padding: 15px;
          border-left: 3px solid #007bff;
          background: #f8f9fa;
        }
        .celeste-info-block .label {
          font-size: 12px;
          text-transform: uppercase;
          color: #007bff;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .celeste-info-block .value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .celeste-info-block p {
          font-size: 13px;
          line-height: 1.4;
          color: #555;
          margin: 2px 0;
        }

        .celeste-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .celeste-table th {
          text-align: left;
          font-size: 12px;
          color: white;
          background: #007bff;
          text-transform: uppercase;
          padding: 12px 10px;
        }
        .celeste-table td {
          padding: 12px 10px;
          border-bottom: 1px dashed #e0e0e0;
          font-size: 13px;
        }
        .celeste-table tr:last-child td {
          border-bottom: none;
        }
        .celeste-product-name {
          font-weight: 500;
          color: #333;
        }
        .celeste-product-sku {
          font-size: 11px;
          color: #888;
        }

        .celeste-totals-container {
          display: flex;
          justify-content: flex-end;
        }
        .celeste-totals {
          width: 300px;
          padding-top: 10px;
        }
        .celeste-totals .row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 14px;
        }
        .celeste-totals .label {
          color: #555;
        }
        .celeste-totals .amount {
          font-weight: 500;
        }
        .celeste-totals .final-row {
          margin-top: 15px;
          padding: 10px 15px;
          background: #007bff;
          color: white;
          border-radius: 4px;
        }
        .celeste-totals .final-row .label {
          font-weight: 700;
          font-size: 16px;
          color: white;
        }
        .celeste-totals .final-row .amount {
          font-weight: 700;
          font-size: 16px;
        }
        .celeste-footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          font-size: 11px;
          color: #777;
        }
      `}</style>
      <div className="celeste-invoice-body">
        <div className="celeste-invoice">
          <div className="celeste-header">
            <h1>INVOICE</h1>
            <p>
              Invoice No: <strong>{invoiceData.invoiceNumber}</strong> | Date:{" "}
              {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
            </p>
          </div>

          {/* Business and Customer Info */}
          <div className="celeste-info-grid">
            <div className="celeste-info-block">
              <div className="label">Billed To</div>
              <div className="value">
                {invoiceData.customer?.name || "Walk-in Customer"}
              </div>
              {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
              {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            </div>
            <div className="celeste-info-block">
              <div className="label">Issued By</div>
              <div className="value">
                {selectedStore?.storeName || "Your Store Name"}
              </div>
              <p>{selectedStore?.address || "123 Business Street"}</p>
              <p>
                {selectedStore?.phone || "+91 9876543210"} |{" "}
                {selectedStore?.email || "info@yourstore.com"}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="celeste-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Item Description</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right" }}>Unit Price</th>
                <th style={{ width: "20%", textAlign: "right" }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="celeste-product-name">
                      {item.product?.name || "Unnamed Product"}
                    </div>
                    {item.product?.sku && (
                      <div className="celeste-product-sku">
                        SKU: {item.product.sku}
                      </div>
                    )}
                  </td>
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

          {/* Totals Section */}
          <div className="celeste-totals-container">
            <div className="celeste-totals">
              <div className="row">
                <div className="label">Subtotal:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.subtotal)}
                </div>
              </div>
              <div className="row">
                <div className="label">GST:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.gstAmount)}
                </div>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div className="row">
                  <div className="label">Discount:</div>
                  <div className="amount" style={{ color: "red" }}>
                    -{formatCurrency(invoiceData.totalDiscount)}
                  </div>
                </div>
              )}
              <div className="row final-row">
                <div className="label">TOTAL DUE:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.totalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="celeste-footer">
            <p>Thank you for choosing {selectedStore?.storeName || "Our Store"}!</p>
            <p>
              Generated on{" "}
              {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] h:mm A")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CelesteTemplate;