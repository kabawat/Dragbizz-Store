"use client";
import React from "react";
import moment from "moment";

const SleekStreamTemplate = ({ invoiceData, selectedStore }) => {
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_COLOR = "#2980b9"; // Ocean Blue
  const SECONDARY_COLOR = "#34495e"; // Dark Slate
  const LIGHT_BG = "#f4f6f9"; // Very Light Grey

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
                /* ✅ MINI MODE – Sleek Template Full Fix */
        body.print-mode-mini .sleek-invoice {
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 6px !important;
          margin: 0 auto !important;
          overflow: hidden !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* ✅ Global font scaling */
        body.print-mode-mini .sleek-invoice-body {
          font-size: 10.5px !important;
        }

        /* ✅ Split Header Compact */
        body.print-mode-mini .sleek-split-header {
          flex-direction: column !important;
          min-height: auto !important;
        }

        body.print-mode-mini .sleek-meta-sidebar {
          width: 100% !important;
          padding: 8px !important;
          text-align: center !important;
        }

        body.print-mode-mini .sleek-meta-sidebar h1 {
          font-size: 16px !important;
          padding-bottom: 3px !important;
        }

        body.print-mode-mini .sleek-meta-value {
          font-size: 11px !important;
        }

        body.print-mode-mini .sleek-store-customer-info {
          width: 100% !important;
          padding: 8px !important;
          flex-direction: column !important;
          gap: 6px !important;
        }

        body.print-mode-mini .sleek-info-block {
          width: 100% !important;
        }

        body.print-mode-mini .sleek-info-block p {
          font-size: 10px !important;
        }

        /* ✅ TABLE FIX */
        body.print-mode-mini .sleek-table {
          padding: 0 !important;
          margin-bottom: 8px !important;
        }

        body.print-mode-mini .sleek-table thead th {
          font-size: 8px !important;
          padding: 3px 4px !important;
        }

        body.print-mode-mini .sleek-table td {
          font-size: 9.5px !important;
          padding: 3px 4px !important;
        }

        /* Prevent description overflow */
        body.print-mode-mini .sleek-table td:first-child {
          max-width: 55mm !important;
          word-wrap: break-word !important;
        }

        /* ✅ TOTALS AREA FIX */
        body.print-mode-mini .sleek-totals-area {
          justify-content: flex-start !important;
          padding: 0 !important;
          margin-top: 6px !important;
        }

        body.print-mode-mini .sleek-totals-table {
          width: 100% !important;
        }

        body.print-mode-mini .sleek-totals-table .row {
          padding: 3px 0 !important;
          font-size: 10px !important;
        }

        body.print-mode-mini .sleek-totals-table .label {
          font-size: 10px !important;
        }

        body.print-mode-mini .sleek-totals-table .amount {
          font-size: 10px !important;
          font-weight: 600 !important;
        }

        /* ✅ GRAND TOTAL FIX */
        body.print-mode-mini .sleek-totals-table .final-row {
          padding: 6px !important;
          font-size: 12px !important;
          margin-top: 6px !important;
        }

        /* ✅ FOOTER FIX */
        body.print-mode-mini .sleek-footer {
          padding: 6px 0 !important;
          font-size: 9px !important;
        }



        /* Sleek Stream Template Styles */
        .sleek-invoice-body {
          font-family: 'Poppins', 'Helvetica Neue', sans-serif !important;
          background: ${LIGHT_BG} !important;
          color: #333 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }
        .sleek-invoice {
          max-width: 800px; /* Wider for the split layout */
          margin: 50px auto;
          padding: 0;
          background: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }

        /* Top Section: Split Header */
        .sleek-split-header {
            display: flex;
            min-height: 150px;
        }
        .sleek-meta-sidebar {
            width: 30%;
            background-color: ${PRIMARY_COLOR};
            color: white;
            padding: 25px 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .sleek-meta-sidebar h1 {
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 5px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.3);
            padding-bottom: 5px;
        }
        .sleek-meta-detail {
            font-size: 10px;
            text-transform: uppercase;
            margin-top: 15px;
        }
        .sleek-meta-value {
            font-size: 16px;
            font-weight: 700;
            margin-top: 2px;
        }

        .sleek-store-customer-info {
            width: 70%;
            padding: 30px;
            display: flex;
            justify-content: space-between;
        }
        .sleek-info-block {
            width: 48%;
        }
        .sleek-info-block .title {
            font-size: 11px;
            text-transform: uppercase;
            color: ${PRIMARY_COLOR};
            font-weight: 700;
            margin-bottom: 5px;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 3px;
        }
        .sleek-info-block p {
            margin: 2px 0;
            font-size: 13px;
        }
        .sleek-value-bold {
            font-weight: 600;
            color: ${SECONDARY_COLOR};
        }
        .sleek-store-name {
            font-size: 18px;
            font-weight: 800;
            color: ${SECONDARY_COLOR};
        }
        .sleek-store-address {
            font-size: 12px;
            color: #777;
        }

        /* Table */
        .sleek-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          padding: 0 30px;
        }
        .sleek-table thead tr {
          background-color: ${LIGHT_BG};
          color: ${SECONDARY_COLOR};
          border-bottom: 2px solid ${PRIMARY_COLOR};
        }
        .sleek-table th {
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          padding: 10px 15px;
        }
        .sleek-table td {
          padding: 10px 15px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .sleek-product-name {
          font-weight: 600;
        }
        .sleek-product-sku {
          font-size: 10px;
          color: #999;
        }

        /* Totals Section */
        .sleek-totals-area {
            display: flex;
            justify-content: flex-end;
            padding: 0 30px 40px 30px;
        }
        .sleek-totals-table {
          width: 320px;
        }
        .sleek-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .sleek-totals-table .label {
          color: #555;
        }
        .sleek-totals-table .amount {
          font-weight: 600;
          color: ${SECONDARY_COLOR};
        }
        .sleek-totals-table .final-row {
          background-color: ${LIGHT_BG};
          padding: 15px 10px;
          margin-top: 10px;
          font-size: 24px;
          border: 1px solid #ddd;
        }
        .sleek-totals-table .final-row .label,
        .sleek-totals-table .final-row .amount {
            font-weight: 800;
            color: ${PRIMARY_COLOR};
        }
        
        /* Footer */
        .sleek-footer {
          text-align: center;
          background-color: ${SECONDARY_COLOR};
          color: white;
          padding: 15px 0;
          font-size: 12px;
        }
      `}</style>
      <div className="sleek-invoice-body">
        <div className="sleek-invoice">
          {/* Top Split Header */}
          <div className="sleek-split-header">
            {/* Left Sidebar (Blue) */}
            <div className="sleek-meta-sidebar">
              <h1>INVOICE</h1>

              <div className="sleek-meta-detail">Invoice Number:</div>
              <div className="sleek-meta-value">
                {invoiceData.invoiceNumber}
              </div>

              <div className="sleek-meta-detail">Date Issued:</div>
              <div className="sleek-meta-value">
                {moment(invoiceData.createdAt).format("DD MMMM, YYYY")}
              </div>

              <div className="sleek-meta-detail">Due Date:</div>
              <div className="sleek-meta-value">N/A</div>
            </div>

            {/* Right Info Section (White) */}
            <div className="sleek-store-customer-info">
              {/* Store Info */}
              <div className="sleek-info-block">
                <div className="title">From: Billed By</div>
                <p className="sleek-store-name">
                  {selectedStore?.storeName || "Sleek Stream Services"}
                </p>
                <p className="sleek-store-address">
                  {selectedStore?.address || "555 Modern Plaza, Tech City"}
                </p>
                <p className="sleek-store-address">
                  Ph: {selectedStore?.phone || "+91 9988776655"}
                </p>
                <p className="sleek-store-address">
                  Email: {selectedStore?.email || "contact@sleekstream.com"}
                </p>
              </div>

              {/* Customer Info */}
              <div className="sleek-info-block">
                <div className="title">To: Bill To</div>
                <p className="sleek-value-bold">
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
          </div>

          {/* Table Container (to apply padding) */}
          <div style={{ padding: "0 30px" }}>
            <table className="sleek-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>Service/Product Description</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                  <th style={{ width: "25%", textAlign: "right" }}>
                    Line Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items?.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="sleek-product-name">
                        {item.product?.name || "Unnamed Item"}
                      </div>
                      {item.product?.sku && (
                        <div className="sleek-product-sku">
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
          </div>

          {/* Totals Area */}
          <div className="sleek-totals-area">
            <div className="sleek-totals-table">
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
                  <div className="amount" style={{ color: "#e74c3c" }}>
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
          </div>

          {/* Footer */}
          <div className="sleek-footer">
            <p style={{ margin: 0 }}>
              Payment instructions will follow. Thank you for your business!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default SleekStreamTemplate;
