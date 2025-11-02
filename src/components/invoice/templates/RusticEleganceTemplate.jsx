"use client";
import React from "react";
import moment from "moment";

const RusticEleganceTemplate = ({ invoiceData, selectedStore }) => {
  // Helper function remains the same
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_BROWN = "#795548"; // Muted Brown
  const ACCENT_TAUPE = "#a1887f"; // Soft Taupe/Brown
  const TEXT_GRAY = "#4e342e"; // Dark Brown Text
  const LIGHT_BORDER = "#d7ccc8"; // Very Light Brown

  return (
    <>
      <style jsx global>{`
        /* Rustic Elegance Template Styles */
        .rustic-body {
          font-family: 'Playfair Display', serif !important; /* Elegant serif font */
          background: #fafafa !important;
          color: ${TEXT_GRAY} !important;
          font-size: 15px !important;
          margin: 0;
          padding: 0;
        }
        .rustic-invoice {
          max-width: 700px;
          margin: 50px auto;
          padding: 50px;
          background: white;
          border: 1px solid ${LIGHT_BORDER};
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
        }

        /* Header */
        .rustic-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${PRIMARY_BROWN};
        }
        .rustic-header-left h1 {
            color: ${PRIMARY_BROWN};
            font-size: 36px;
            font-weight: 900;
            margin: 0 0 5px 0;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .rustic-store-info {
            text-align: right;
            font-size: 13px;
        }
        .rustic-store-info p {
            margin: 3px 0;
            color: #6d4c41;
        }

        /* Info Sections */
        .rustic-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .rustic-block {
            width: 48%;
            padding: 10px 0;
        }
        .rustic-block .title {
            font-family: 'Lato', sans-serif;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: ${ACCENT_TAUPE};
            margin-bottom: 5px;
        }
        .rustic-block p {
            margin: 3px 0;
            font-size: 14px;
        }
        .rustic-value-bold {
            font-weight: 600;
            color: ${TEXT_GRAY};
        }
        .rustic-invoice-number {
            font-size: 18px;
            font-weight: 900;
            color: ${PRIMARY_BROWN};
        }

        /* Table */
        .rustic-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        .rustic-table thead tr {
          border-bottom: 1px solid ${PRIMARY_BROWN};
        }
        .rustic-table th {
          font-family: 'Lato', sans-serif;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          padding: 10px 0;
          color: ${ACCENT_TAUPE};
        }
        .rustic-table td {
          padding: 10px 0;
          border-bottom: 1px dashed ${LIGHT_BORDER};
          font-size: 14px;
        }

        /* Totals Section */
        .rustic-totals-table {
          width: 280px;
          margin-left: auto;
          border-top: 2px dashed ${LIGHT_BORDER};
          padding-top: 15px;
        }
        .rustic-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 15px;
        }
        .rustic-totals-table .label {
          color: #6d4c41;
        }
        .rustic-totals-table .amount {
          font-weight: 700;
        }
        .rustic-totals-table .final-row {
          border-top: 3px double ${PRIMARY_BROWN};
          padding-top: 15px;
          margin-top: 10px;
          font-size: 20px;
        }
        .rustic-totals-table .final-row .label,
        .rustic-totals-table .final-row .amount {
            font-weight: 900;
            color: ${PRIMARY_BROWN};
        }

        /* Footer */
        .rustic-footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid ${LIGHT_BORDER};
          font-size: 12px;
          color: #999;
        }
      `}</style>
      <div className="rustic-body">
        <div className="rustic-invoice">
          
          {/* Header Section */}
          <div className="rustic-header">
            <div className="rustic-header-left">
                <h1>INVOICE</h1>
                <p style={{ fontSize: 13, color: ACCENT_TAUPE }}>
                    {selectedStore?.storeName || "The Artisan Collective"}
                </p>
            </div>
            <div className="rustic-store-info">
                <p>
                    {selectedStore?.address || "88 Serene Road, Old Town"}
                </p>
                <p>
                    {selectedStore?.phone || "+91 999-RUSTIC"} | {selectedStore?.email || "contact@artisan.com"}
                </p>
            </div>
          </div>
          
          {/* Info Section */}
          <div className="rustic-info-row">
            {/* Bill To Details */}
            <div className="rustic-block">
                <div className="title">Billed To</div>
                <p className="rustic-value-bold">{invoiceData.customer?.name || "Esteemed Patron"}</p>
                {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
                {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            </div>
            
            {/* Invoice Details */}
            <div className="rustic-block" style={{ textAlign: 'right' }}>
                <div className="title">Invoice Details</div>
                <p>Invoice #: <span className="rustic-invoice-number">{invoiceData.invoiceNumber}</span></p>
                <p>Date Issued: <span className="rustic-value-bold">{moment(invoiceData.createdAt).format("DD MMM, YYYY")}</span></p>
                <p>Due Date: <span className="rustic-value-bold">Upon Receipt</span></p>
            </div>
          </div>
          
          {/* Table */}
          <table className="rustic-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Item Description</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                <th style={{ width: "20%", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {item.product?.name || "Handcrafted Item"}
                    </div>
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
          <div className="rustic-totals-table">
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
                  <div className="amount" style={{ color: '#2e7d32' }}>
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
          <div className="rustic-footer">
            <p>Thank you for supporting our work. We value your business.</p>
          </div>
        </div>
      </div>
    </>
  );
};
export default RusticEleganceTemplate;