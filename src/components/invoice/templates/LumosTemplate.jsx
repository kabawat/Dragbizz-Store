"use client";
import React from "react";
import moment from "moment";

const LumosTemplate = ({ invoiceData, selectedStore }) => {
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
          font-family: "Inter", "Segoe UI", sans-serif !important;
          background: #f4f6f8 !important;
          color: #2f3640 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }

                /* ✅ MINI PRINTER MODE FIX */
        body.print-mode-mini .lumos-invoice {
          flex-direction: column !important;
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 4px !important;
        }

        /* ✅ Left panel mini-mode */
        body.print-mode-mini .lumos-left {
          width: 100% !important;
          padding: 8px !important;
          border-radius: 0 !important;
          text-align: center !important;
        }

        body.print-mode-mini .lumos-left h2 {
          font-size: 14px !important;
        }

        body.print-mode-mini .lumos-left p {
          font-size: 10px !important;
        }

        /* ✅ Right panel mini-mode */
        body.print-mode-mini .lumos-right {
          width: 100% !important;
          padding: 6px !important;
        }

        /* ✅ Header */
        body.print-mode-mini .lumos-header h1 {
          font-size: 16px !important;
        }

        body.print-mode-mini .lumos-header .date {
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


        .lumos-invoice {
          max-width: 900px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .lumos-header {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 25px 35px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lumos-header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .lumos-header .store-info {
          text-align: right;
          font-size: 12px;
          line-height: 1.6;
        }

        .invoice-body {
          padding: 35px;
        }

        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 35px;
        }

        .info-section .block {
          width: 48%;
        }

        .info-section .label {
          font-size: 11px;
          text-transform: uppercase;
          color: #8c8c8c;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }

        .info-section .value {
          font-size: 14px;
          font-weight: 600;
          color: #2f3640;
        }

        .invoice-summary {
          background: #f9fafc;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
        }

        .invoice-summary div {
          font-size: 13px;
          color: #333;
        }

        .invoice-summary strong {
          font-weight: 600;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }

        th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          color: #7f8c8d;
          padding: 10px 0;
          border-bottom: 2px solid #e6e9ec;
        }

        td {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
          color: #2f3640;
        }

        .product-name {
          font-weight: 500;
        }

        .totals {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          width: 100%;
        }

        .totals .row {
          display: flex;
          justify-content: flex-end;
          width: 260px;
          margin-bottom: 5px;
        }

        .totals .label {
          width: 140px;
          font-size: 12px;
          color: #7f8c8d;
          text-align: right;
          margin-right: 10px;
        }

        .totals .amount {
          width: 100px;
          text-align: right;
          font-weight: 500;
        }

        .totals .final {
          border-top: 2px solid #c5c6ca;
          padding-top: 8px;
          margin-top: 10px;
          font-weight: 700;
          color: #000;
        }

        .footer {
          background: #f9fafc;
          text-align: center;
          padding: 20px;
          font-size: 11px;
          color: #7f8c8d;
          border-top: 1px solid #e0e0e0;
        }

        .footer p {
          margin: 3px 0;
        }
      `}</style>

      <div className="lumos-invoice">
        {/* Header Section */}
        <div className="lumos-header">
          <div>
            <h1>INVOICE</h1>
            <p style={{ fontSize: "12px", marginTop: "5px" }}>
              Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
            </p>
          </div>
          <div className="store-info">
            <strong>{selectedStore?.storeName || "Your Store"}</strong>
            <p>{selectedStore?.address || "123 Business Street"}</p>
            <p>{selectedStore?.phone || "+91 9876543210"}</p>
            <p>{selectedStore?.email || "info@yourstore.com"}</p>
          </div>
        </div>

        {/* Body Section */}
        <div className="invoice-body">
          <div className="invoice-summary">
            <div>
              <strong>Date:</strong>{" "}
              {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
            </div>
            <div>
              <strong>Customer:</strong>{" "}
              {invoiceData.customer?.name || "Walk-in Customer"}
            </div>
          </div>

          <div className="info-section">
            <div className="block">
              <div className="label">Bill To</div>
              <div className="value">
                {invoiceData.customer?.name || "Walk-in Customer"}
              </div>
              {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
              {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            </div>
            <div className="block">
              <div className="label">Issued By</div>
              <div className="value">
                {selectedStore?.storeName || "Your Store"}
              </div>
              <p>{selectedStore?.email}</p>
            </div>
          </div>

          {/* Product Table */}
          <table>
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Item</th>
                <th style={{ width: "15%" }}>Qty</th>
                <th style={{ width: "20%" }}>Rate</th>
                <th style={{ width: "15%" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td className="product-name">
                    {item.product?.name || "Unnamed Product"}
                  </td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price?.toLocaleString()}</td>
                  <td>₹{(item.quantity * item.price)?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals">
            <div className="row">
              <div className="label">Subtotal:</div>
              <div className="amount">
                ₹{invoiceData.subtotal?.toLocaleString()}
              </div>
            </div>
            <div className="row">
              <div className="label">GST:</div>
              <div className="amount">
                ₹{invoiceData.gstAmount?.toLocaleString() || "0"}
              </div>
            </div>
            {invoiceData.totalDiscount > 0 && (
              <div className="row">
                <div className="label">Discount:</div>
                <div className="amount">
                  -₹{invoiceData.totalDiscount?.toLocaleString()}
                </div>
              </div>
            )}
            <div className="row final">
              <div className="label">Total:</div>
              <div className="amount">
                ₹{invoiceData.totalAmount?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for choosing {selectedStore?.storeName || "our store"}!</p>
          <p>
            Generated on{" "}
            {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
          </p>
          <p>This is a system-generated invoice and requires no signature.</p>
        </div>
      </div>
    </>
  );
};

export default LumosTemplate;
