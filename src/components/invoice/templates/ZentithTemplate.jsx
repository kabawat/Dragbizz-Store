"use client";
import React from "react";
import moment from "moment";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";

const ZenithTemplate = ({ invoiceData, selectedStore }) => {
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

        body {
          font-family: "Inter", "Arial", sans-serif !important;
          background: #f4f6f8 !important;
          color: #1f2937 !important;
          font-size: 13px;
          margin: 0;
          padding: 0;
        }

                  /* ✅ MINI PRINTER MODE FIX */
          body.print-mode-mini .zenith-invoice {
            flex-direction: column !important;
            width: 74mm !important;
            max-width: 74mm !important;
            padding: 4px !important;
          }

          /* ✅ Left panel mini-mode */
          body.print-mode-mini .zenith-sidebar {
            width: 100% !important;
            padding: 8px !important;
            border-radius: 0 !important;
            text-align: center !important;
          }

          body.print-mode-mini .zenith-sidebar h2 {
            font-size: 14px !important;
          }

          body.print-mode-mini .zenith-sidebar p {
            font-size: 10px !important;
          }

          /* ✅ Right panel mini-mode */
          body.print-mode-mini .zenith-main {
            width: 100% !important;
            padding: 6px !important;
          }

          /* ✅ Header */
          body.print-mode-mini .zenith-header {
            flex-direction: column !important;
            align-items: center;
          }
          body.print-mode-mini .zenith-header h1 {
            font-size: 16px !important;
            text-align: center !important;
          }
          body.print-mode-mini .zenith-header .right {
            width: 100% !important;
            text-align: center !important;
          }

          body.print-mode-mini .zenith-header .date {
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


        .zenith-invoice {
          max-width: 900px;
          margin: 40px auto;
          background: white;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: row;
        }

        .zenith-sidebar {
          width: 28%;
          background: linear-gradient(180deg, #2563eb, #3b82f6);
          color: white;
          padding: 40px 25px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .zenith-sidebar h2 {
          font-size: 22px;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .zenith-sidebar p {
          font-size: 12px;
          line-height: 1.6;
          color: #e0e7ff;
          margin: 2px 0;
        }

        .zenith-main {
          width: 72%;
          padding: 40px 50px;
          display: flex;
          flex-direction: column;
        }

        .zenith-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 15px;
        }

        .zenith-header h1 {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .zenith-header .right {
          text-align: right;
        }

        .zenith-header .right p {
          font-size: 12px;
          color: #6b7280;
          margin: 3px 0;
        }

        .zenith-info {
          display: flex;
          justify-content: space-between;
          margin: 20px 0 30px;
        }

        .zenith-card {
          width: 48%;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 15px 20px;
        }

        .zenith-card h4 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .zenith-card p {
          font-size: 13px;
          margin: 2px 0;
          color: #111827;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }

        th {
          text-align: left;
          background: #f1f5f9;
          padding: 10px;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }

        td {
          padding: 12px 10px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
          color: #1f2937;
        }

        .product-name {
          font-weight: 500;
        }

        .totals {
          width: 100%;
          display: flex;
          justify-content: flex-end;
        }

        .totals-box {
          width: 270px;
          background: #f9fafb;
          padding: 15px 20px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .totals-label {
          color: #6b7280;
          font-size: 12px;
        }

        .totals-value {
          font-size: 13px;
          font-weight: 500;
        }

        .final-total {
          border-top: 1px solid #d1d5db;
          margin-top: 8px;
          padding-top: 8px;
          font-weight: 600;
          color: #1d4ed8;
        }

        .footer {
          text-align: center;
          font-size: 11px;
          color: #6b7280;
          margin-top: 30px;
        }
      `}</style>

      <div className="zenith-invoice">
        {/* Left Sidebar */}
        <div className="zenith-sidebar">
          <div>
            <h2>{selectedStore?.storeName || "Your Store"}</h2>
            <p>{selectedStore?.address || "123 Business Avenue"}</p>
            <p>{selectedStore?.phone || "+91 9876543210"}</p>
            <p>{selectedStore?.email || "info@yourstore.com"}</p>
          </div>

          <div>
            <p style={{ fontSize: "11px", opacity: 0.9, marginTop: "40px" }}>
              © {moment().format("YYYY")}{" "}
              {selectedStore?.storeName || "Your Store"}
            </p>
          </div>
        </div>

        {/* Right Main */}
        <div className="zenith-main">
          <div className="zenith-header">
            <h1>INVOICE</h1>
            <div className="right">
              <p>
                Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
              </p>
              <p>
                Date: {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
              </p>
            </div>
          </div>

          <div className="zenith-info">
            <div className="zenith-card">
              <h4>Bill To</h4>
              <p>{invoiceData.customer?.name || "Walk-in Customer"}</p>
              {invoiceData.customer?.phone && (
                <p>{invoiceData.customer.phone}</p>
              )}
              {invoiceData.customer?.email && (
                <p>{invoiceData.customer.email}</p>
              )}
            </div>

            <div className="zenith-card">
              <h4>From</h4>
              <p>{selectedStore?.storeName || "Your Store"}</p>
              <p>{selectedStore?.email}</p>
              <p>{selectedStore?.phone}</p>
            </div>
          </div>

          <InvoiceItemsTable
            items={invoiceData.items}
            columnWidths={{
              product: "40%",
              quantity: "15%",
              unitPrice: "20%",
              gst: "10%",
              total: "15%",
            }}
            renderProductCell={(item) => (
              <>
                <div className="product-name">{item.product?.name}</div>
                {item.product?.sku && (
                  <small style={{ color: "#9ca3af" }}>
                    SKU: {item.product.sku}
                  </small>
                )}
              </>
            )}
          />

          <div className="totals">
            <div className="totals-box">
              <div className="totals-row">
                <span className="totals-label">Subtotal:</span>
                <span className="totals-value">
                  ₹{invoiceData.subtotal?.toLocaleString()}
                </span>
              </div>
              <div className="totals-row">
                <span className="totals-label">GST:</span>
                <span className="totals-value">
                  ₹{invoiceData.gstAmount?.toLocaleString() || "0"}
                </span>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div className="totals-row">
                  <span className="totals-label">Discount:</span>
                  <span className="totals-value">
                    -₹{invoiceData.totalDiscount?.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="totals-row final-total">
                <span className="totals-label">Total:</span>
                <span className="totals-value">
                  ₹{invoiceData.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="footer">
            <p>Thank you for choosing us!</p>
            <p>
              Generated on{" "}
              {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
            </p>
            <p>
              This invoice is system-generated and does not require a signature.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ZenithTemplate;
