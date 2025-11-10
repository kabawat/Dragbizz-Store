"use client";
import React from "react";
import moment from "moment";

const AuraTemplate = ({ invoiceData, selectedStore }) => {
  // A helper function to safely format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const ACCENT_BG = "#f5f8fa"; // Very light blue/gray background for tables/headers
  const TEXT_COLOR = "#2c3e50"; // Dark text color

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
        body.print-mode-mini .aura-invoice {
          flex-direction: column !important;
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 4px !important;
        }

        /* ✅ Left panel mini-mode */
        body.print-mode-mini .aura-left {
          width: 100% !important;
          padding: 8px !important;
          border-radius: 0 !important;
          text-align: center !important;
        }

        body.print-mode-mini .aura-left h2 {
          font-size: 14px !important;
        }

        body.print-mode-mini .aura-left p {
          font-size: 10px !important;
        }

        /* ✅ Right panel mini-mode */
        body.print-mode-mini .aura-right {
          width: 100% !important;
          padding: 6px !important;
        }

        /* ✅ Header */
        body.print-mode-mini .aura-header h1 {
          font-size: 16px !important;
        }

        body.print-mode-mini .aura-header .date {
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

        /* Aura Template Styles */
        .aura-invoice-body {
          font-family: 'Helvetica Neue', 'Arial', sans-serif !important;
          background: #fafafa !important;
          color: ${TEXT_COLOR} !important;
          font-size: 14px !important;
          margin: 0;
          padding: 0;
        }
        .aura-invoice {
          max-width: 800px;
          margin: 50px auto;
          padding: 40px;
          background: white;
          border: 1px solid #e0e0e0;
        }
        
        .aura-top-bar {
            background-color: ${ACCENT_BG};
            padding: 10px 0;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #7f8c8d;
            margin: -40px -40px 30px -40px; /* Extend to fill padding space */
            padding-left: 40px;
            padding-right: 40px;
            border-bottom: 1px solid #e0e0e0;
        }
        .aura-top-bar strong {
            color: ${TEXT_COLOR};
        }

        .aura-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
        }
        .aura-header h1 {
          font-size: 38px;
          font-weight: 200; /* Light weight for modern feel */
          color: ${TEXT_COLOR};
          margin: 0;
        }
        .aura-header h2 {
            font-size: 18px;
            font-weight: 500;
            color: ${TEXT_COLOR};
            margin: 0;
            text-align: right;
        }
        .aura-store-info p {
            font-size: 13px;
            margin: 2px 0;
            color: #7f8c8d;
            text-align: right;
        }

        .aura-info-section {
          display: flex;
          justify-content: space-between;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .aura-info-block {
          width: 45%;
        }
        .aura-info-block .label {
          font-size: 11px;
          text-transform: uppercase;
          color: #95a5a6;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }
        .aura-info-block .value {
          font-size: 15px;
          font-weight: 500;
          color: ${TEXT_COLOR};
          margin-bottom: 15px;
        }
        .aura-info-block p {
            font-size: 13px;
            line-height: 1.4;
            color: #555;
            margin: 2px 0;
        }

        .aura-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .aura-table thead tr {
          border-bottom: 2px solid #ddd;
        }
        .aura-table th {
          text-align: left;
          font-size: 12px;
          color: #7f8c8d;
          text-transform: uppercase;
          padding: 10px 0;
        }
        .aura-table td {
          padding: 10px 0;
          border-bottom: 1px solid ${ACCENT_BG}; /* Very light line */
          font-size: 14px;
        }
        .aura-table tbody tr:last-child td {
            border-bottom: none;
        }
        .aura-product-name {
          font-weight: 500;
          color: ${TEXT_COLOR};
        }
        .aura-product-sku {
          font-size: 11px;
          color: #95a5a6;
        }

        .aura-totals-container {
          display: flex;
          justify-content: flex-end;
        }
        .aura-totals {
          width: 250px;
        }
        .aura-totals .row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 14px;
        }
        .aura-totals .label {
          color: #555;
        }
        .aura-totals .amount {
          font-weight: 500;
        }
        .aura-totals .final-row {
          border-top: 2px solid ${TEXT_COLOR};
          padding-top: 8px;
          margin-top: 10px;
        }
        .aura-totals .final-row .label {
          font-weight: 700;
          font-size: 16px;
          color: ${TEXT_COLOR};
        }
        .aura-totals .final-row .amount {
          font-weight: 700;
          font-size: 16px;
          color: ${TEXT_COLOR};
        }
        .aura-footer {
          text-align: center;
          margin-top: 40px;
          font-size: 11px;
          color: #95a5a6;
        }
      `}</style>
      <div className="aura-invoice-body">
        <div className="aura-invoice">
          
          {/* Top Bar for Invoice Number and Date */}
          <div className="aura-top-bar">
            <span>
                Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
            </span>
            <span>
                Date Issued: <strong>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</strong>
            </span>
          </div>

          {/* Header Section */}
          <div className="aura-header">
            <div>
              <h1>INVOICE</h1>
            </div>
            <div className="aura-store-info">
                <h2>{selectedStore?.storeName || "PREMIUM SOLUTIONS"}</h2>
                <p>{selectedStore?.address || "789 Corporate Drive"}</p>
                <p>{selectedStore?.phone || "+91 9876543210"}</p>
                <p>{selectedStore?.email || "contact@premium.com"}</p>
            </div>
          </div>

          {/* Billing and Customer Info */}
          <div className="aura-info-section">
            <div className="aura-info-block">
              <div className="label">Bill To</div>
              <div className="value">
                {invoiceData.customer?.name || "Walk-in Customer"}
              </div>
              {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
              {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            </div>
            <div className="aura-info-block" style={{ textAlign: 'right' }}>
              <div className="label">Payment Status</div>
              <div className="value" style={{ color: TEXT_COLOR }}>
                PAID / DUE
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="aura-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Item Description</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                <th style={{ width: "20%", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="aura-product-name">
                      {item.product?.name || "Unnamed Product"}
                    </div>
                    {item.product?.sku && (
                      <div className="aura-product-sku">
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
          <div className="aura-totals-container">
            <div className="aura-totals">
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
                  <div className="amount" style={{ color: '#e74c3c' }}>
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
          <div className="aura-footer">
            <p>Thank you for your business. Please make payments promptly.</p>
            <p>
              Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuraTemplate;