"use client";
import React from "react";
import moment from "moment";

const AeroTemplate = ({ invoiceData, selectedStore }) => {
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
          .aero-invoice {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
        }

        body {
          font-family: 'Poppins', 'Inter', sans-serif !important;
          background-color: #f8fafc !important; /* Light gray-blue */
          color: #1e293b !important;
          font-size: 14px !important;
        }

          body {
          /* Using a classic serif font */
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #4e342e !important; /* Dark brown text */
          background-color: #fcfaf7 !important; /* Light beige background */
        }

         body.print-mode-mini .aero-invoice {
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 6px !important;
          border: none !important; /* thermal usually no border */
          box-shadow: none !important;
        }
        body.print-mode-mini .aero-header {
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;

          .invoice-title-box {
            text-align: center !important;
          }
        }
        body.print-mode-mini .info-section {
            flex-direction: column !important;
            .info-card {
              width: 100% !important;
            }
        }
        body.print-mode-mini table th,
        body.print-mode-mini table td {
            font-size: 10px !important;
        }

        body.print-mode-standard .aero-invoice {
          max-width: 800px !important;
          padding: 40px !important;
        }
        body.print-mode-standard .aero-invoice {
          max-width: 800px !important;
          padding: 40px !important;
        }

        
        .aero-invoice {
          max-width: 850px !important;
          margin: 40px auto !important;
          background: #ffffff !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          padding: 40px !important;
          border: 1px solid #e2e8f0 !important;
        }

        .aero-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          border-bottom: 2px solid #e2e8f0 !important;
          padding-bottom: 20px !important;
          margin-bottom: 30px !important;
        }

        .store-name {
          font-size: 26px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }

        .store-details p {
          margin: 4px 0 !important;
          color: #475569 !important;
          font-size: 13px !important;
        }

        .invoice-title {
          font-size: 36px !important;
          font-weight: 700 !important;
          color: #2563eb !important; /* Primary blue */
          margin-bottom: 5px !important;
        }

        .invoice-meta p {
          margin: 2px 0 !important;
          font-size: 13px !important;
          color: #64748b !important;
          text-align: right !important;
        }

        .info-section {
          display: flex !important;
          justify-content: space-between !important;
          margin-bottom: 30px !important;
        }

        .info-card {
          width: 48% !important;
          background: #f9fafb !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 15px !important;
        }

        .info-card h3 {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #2563eb !important;
          text-transform: uppercase !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding-bottom: 5px !important;
          margin-bottom: 8px !important;
        }

        .info-card p {
          font-size: 13px !important;
          color: #334155 !important;
          margin: 3px 0 !important;
        }

        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-bottom: 30px !important;
        }

        th {
          background-color: #2563eb !important;
          color: #ffffff !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          font-size: 13px !important;
          padding: 12px 10px !important;
          text-align: left !important;
        }

        td {
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 10px !important;
          font-size: 14px !important;
          color: #1e293b !important;
        }

        tr:nth-child(even) {
          background-color: #f9fafb !important;
        }

        .product-name {
          font-weight: 600 !important;
        }

        .totals {
          display: flex !important;
          justify-content: flex-end !important;
          margin-top: 20px !important;
        }

        .totals-box {
          width: 280px !important;
          background: #f8fafc !important;
          border-radius: 8px !important;
          padding: 15px !important;
          border: 1px solid #e2e8f0 !important;
        }

        .total-row {
          display: flex !important;
          justify-content: space-between !important;
          margin: 5px 0 !important;
        }

        .total-row span:first-child {
          color: #475569 !important;
        }

        .grand-total {
          border-top: 2px solid #2563eb !important;
          margin-top: 10px !important;
          padding-top: 8px !important;
          font-size: 16px !important;
          font-weight: 700 !important;
          color: #2563eb !important;
        }

        .footer {
          text-align: center !important;
          margin-top: 40px !important;
          font-size: 12px !important;
          color: #64748b !important;
        }
      `}</style>

      <div className="aero-invoice">
        {/* Header */}
        <div className="aero-header">
          <div>
            <div className="store-name">
              {selectedStore?.storeName || "Your Store"}
            </div>
            <div className="store-details">
              <p>{selectedStore?.address || "123 Market Street, City"}</p>
              {selectedStore?.phone && <p>Phone: {selectedStore.phone}</p>}
              {selectedStore?.email && <p>Email: {selectedStore.email}</p>}
            </div>
          </div>
          <div className="invoice-meta">
            <h1 className="invoice-title">INVOICE</h1>
            <p>#{invoiceData.invoiceNumber}</p>
            <p>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</p>
          </div>
        </div>

        {/* Info */}
        <div className="info-section">
          <div className="info-card">
            <h3>Bill To</h3>
            <p>
              <strong>
                {invoiceData.customer?.name || "Walk-in Customer"}
              </strong>
            </p>
            {invoiceData.customer?.address && (
              <p>{invoiceData.customer.address}</p>
            )}
            {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
          </div>

          <div className="info-card">
            <h3>Payment Info</h3>
            <p>
              <strong>Mode:</strong> {invoiceData.paymentMode || "Cash"}
            </p>
            <p>
              <strong>Status:</strong> {invoiceData.status || "Paid"}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {moment(invoiceData.createdAt).format("DD MMM YYYY")}
            </p>
          </div>
        </div>

        {/* Table */}
        <table width={"100%"}>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Rate</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items?.map((item, index) => (
              <tr key={index}>
                <td>
                  <span className="product-name">
                    {item.product?.name || "Product"}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>
                  ₹{item.price?.toLocaleString()}
                </td>
                <td style={{ textAlign: "right" }}>
                  ₹{(item.quantity * item.price)?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="totals">
          <div className="totals-box">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{invoiceData.subtotal?.toLocaleString()}</span>
            </div>
            <div className="total-row">
              <span>GST:</span>
              <span>₹{invoiceData.gstAmount?.toLocaleString() || "0"}</span>
            </div>
            {invoiceData.totalDiscount > 0 && (
              <div className="total-row">
                <span>Discount:</span>
                <span>-₹{invoiceData.totalDiscount?.toLocaleString()}</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>₹{invoiceData.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for your purchase!</p>
          <p>
            This invoice was generated on{" "}
            {moment(invoiceData.createdAt).format("DD/MM/YYYY")}.
          </p>
        </div>
      </div>
    </>
  );
};

export default AeroTemplate;
