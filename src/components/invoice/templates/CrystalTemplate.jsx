"use client";
import React from "react";
import moment from "moment";

const CrystalTemplate = ({ invoiceData, selectedStore }) => {
  // Utility function for currency formatting (assuming '₹' for Indian Rupee and 'en-IN' locale)
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <>
      <style jsx global>{`
        /* --- GLOBAL & PRINT STYLES (Crystal) --- */
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .crystal-invoice {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
        }

        body {
          /* Light, clean sans-serif font */
          font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif !important;
          font-size: 13px !important;
          line-height: 1.6 !important;
          color: #333333 !important; /* Dark text */
          background-color: #f8faff !important; /* Very light, cool blue/white */
        }

          body {
          /* Using a classic serif font */
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #4e342e !important; /* Dark brown text */
          background-color: #fcfaf7 !important; /* Light beige background */
        }

         body.print-mode-mini .crystal-invoice {
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 6px !important;
          border: none !important; /* thermal usually no border */
          box-shadow: none !important;
        }
        body.print-mode-mini .crystal-header {
          flex-direction: column-reverse !important;
          align-item: center !important;
          text-align: center !important;
            .invoice-title-box {
              text-align: center !important;
            }
        }
        body.print-mode-mini .crystal-info {
          grid-template-columns: 1fr !important;
        
        }

        body.print-mode-standard .crystal-invoice {
          max-width: 800px !important;
          padding: 40px !important;
        }
        body.print-mode-mini .crystal-table thead th,
        body.print-mode-mini .crystal-table td {
            font-size: 10px !important;
        }

        .crystal-invoice {
          max-width: 850px !important;
          margin: 30px auto !important;
          padding: 30px !important;
          background: #ffffff !important;
          /* Subtle box-shadow for a "floating" glass effect */
          box-shadow: 0 8px 30px rgba(0, 50, 100, 0.08) !important;
          border-radius: 8px !important;
          border: 1px solid #e0e7ff !important; /* Very faint cool border */
        }

        /* --- HEADER & TITLES --- */
        .crystal-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 25px 0 !important;
          margin-bottom: 30px !important;
          /* Light icy blue gradient background for header */
          background: linear-gradient(90deg, #f0f8ff 0%, #ffffff 100%) !important;
          border-bottom: 3px solid #6699ff !important; /* Icy Blue Accent Line */
        }
        
        .crystal-header > div {
            padding: 0 15px; /* Padding for content inside the header */
        }

        .crystal-header .store-name {
          font-size: 24px !important;
          font-weight: 300 !important; /* Lighter font weight for modern look */
          color: #1e3a8a !important; /* Deep Blue Text */
          letter-spacing: 1px !important;
          text-transform: uppercase !important;
        }

        .crystal-header .store-details p {
          font-size: 12px !important;
          color: #555555 !important;
          margin-top: 5px !important;
          line-height: 1.4 !important;
        }

        .crystal-header .invoice-title-box {
          text-align: right !important;
        }

        .crystal-header .invoice-title-box h1 {
          font-size: 30px !important;
          font-weight: 700 !important;
          color: #3b82f6 !important; /* Bright Blue Title */
          margin: 0 !important;
          letter-spacing: 3px !important;
          text-transform: uppercase !important;
        }

        .crystal-header .invoice-title-box p {
          font-size: 14px !important;
          color: #666666 !important;
          margin: 4px 0 !important;
        }

        /* --- INFO SECTIONS --- */
        .crystal-info {
          display: grid !important;
          grid-template-columns: 1fr 1fr 1fr !important; /* 3-column layout */
          gap: 20px !important;
          margin-bottom: 40px !important;
        }

        .crystal-info .info-box {
          padding: 15px !important;
          background: #fdfdff !important;
          border: 1px solid #dbeafe !important;
          border-radius: 4px !important;
          /* Subtle inner glow effect */
          box-shadow: inset 0 0 5px rgba(150, 200, 255, 0.1); 
        }
        
        .crystal-info .info-box h3 {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #3b82f6 !important; /* Bright Blue */
          margin-bottom: 10px !important;
          text-transform: uppercase !important;
          border-bottom: 1px solid #e0e7ff !important;
          padding-bottom: 5px !important;
        }
        
        .crystal-info .info-box p {
          font-size: 13px !important;
          color: #444444 !important;
          margin-bottom: 4px !important;
        }
        
        /* --- ITEMS TABLE --- */
        .crystal-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-bottom: 30px !important;
        }

        .crystal-table thead th {
          background: #e0f2ff !important; /* Very light blue header */
          color: #1e3a8a !important; /* Deep Blue text */
          padding: 12px 15px !important;
          text-align: left !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          border-bottom: 2px solid #93c5fd !important; /* Light blue underline */
        }
        
        .crystal-table td {
          padding: 10px 15px !important;
          border-bottom: 1px solid #f0f0f0 !important; /* Faint separator */
          font-size: 13px !important;
          color: #444444 !important;
        }

        .crystal-table .product-name {
          font-weight: 500 !important;
          color: #333333 !important;
        }
        
        .crystal-table tr:last-child td {
            border-bottom: 2px solid #f0f0f0 !important;
        }

        /* --- TOTALS --- */
        .crystal-totals {
          display: flex !important;
          justify-content: flex-end !important;
          margin-top: 20px !important;
        }

        .crystal-totals .totals-box {
          width: 300px !important;
        }

        .crystal-totals .total-row {
          display: flex !important;
          justify-content: space-between !important;
          padding: 8px 0 !important;
          font-size: 14px !important;
        }

        .crystal-totals .total-row span:first-child {
          color: #666666 !important;
          font-weight: 500 !important;
        }

        .crystal-totals .total-row span:last-child {
          font-weight: 600 !important;
          color: #333333 !important;
        }
        
        .crystal-totals .total-row.grand-total {
          border: 2px solid #3b82f6 !important; /* Bold crystal border */
          background-color: #f0f8ff !important; /* Very light blue background */
          color: #1e3a8a !important; /* Deep Blue text */
          margin-top: 10px !important;
          padding: 12px !important;
          font-size: 16px !important;
          font-weight: 700 !important;
          border-radius: 4px !important;
        }

        /* --- FOOTER --- */
        .crystal-footer {
          margin-top: 40px !important;
          text-align: center !important;
          padding-top: 20px !important;
          border-top: 1px solid #e0e7ff !important; /* Faint cool separator */
          font-size: 11px !important;
          color: #888888 !important;
        }
      `}</style>

      <div className="crystal-invoice">
        {/* Header */}
        <div className="crystal-header">
          <div className="store-details">
            <div className="store-name">
              {selectedStore?.storeName || "CRYSTAL VENTURES"}
            </div>
            <p>
              {selectedStore?.address || "900 Prism Tower, Azure City 67890"}{" "}
              <br />
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Contact: ${selectedStore.email}`}
            </p>
          </div>
          <div className="invoice-title-box">
            <h1>INVOICE</h1>
            <p>Ref: {invoiceData.invoiceNumber}</p>
            <p>Date: {moment(invoiceData.createdAt).format("DD/MM/YYYY")}</p>
          </div>
        </div>

        {/* Customer Info and Payment Info (3-column layout) */}
        <div className="crystal-info">
          <div className="info-box">
            <h3>Billed To</h3>
            <p>
              <strong>{invoiceData.customer?.name || "Customer Name"}</strong>
            </p>
            {invoiceData.customer?.address && (
              <p>{invoiceData.customer.address}</p>
            )}
            {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
          </div>
          <div className="info-box">
            <h3>Ship To</h3>
            <p>
              <strong>{invoiceData.customer?.name || "Customer Name"}</strong>
            </p>
            <p>Same as Billing Address</p>
          </div>
          <div className="info-box">
            <h3>Invoice Details</h3>
            <p>
              <strong>Payment Mode:</strong>{" "}
              {invoiceData.paymentMode || "Bank Transfer"}
            </p>
            <p>
              <strong>Invoice Status:</strong>{" "}
              {invoiceData.status || "Approved"}
            </p>
            <p>
              <strong>Terms:</strong> Net 30 Days
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="crystal-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: "center", width: "10%" }}>Qty</th>
              <th style={{ textAlign: "right", width: "15%" }}>Rate</th>
              <th style={{ textAlign: "right", width: "15%" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items?.map((item, index) => (
              <tr key={index}>
                <td>
                  <span className="product-name">
                    {item.product?.name || "Crystal Product"}
                  </span>
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

        {/* Totals */}
        <div className="crystal-totals">
          <div className="totals-box">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            {invoiceData.totalDiscount > 0 && (
              <div className="total-row">
                <span>Discount:</span>
                <span style={{ color: "#ef4444" }}>
                  -{formatCurrency(invoiceData.totalDiscount)}
                </span>
              </div>
            )}
            <div className="total-row">
              <span>GST:</span>
              <span>{formatCurrency(invoiceData.gstAmount)}</span>
            </div>

            <div className="total-row grand-total">
              <span>BALANCE DUE:</span>
              <span>{formatCurrency(invoiceData.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="crystal-footer">
          <p>
            We appreciate your valuable business. All sales are final after 30
            days.
          </p>
          <p>System Generated on {moment().format("HH:mm:ss, DD/MM/YYYY")}</p>
        </div>
      </div>
    </>
  );
};

export default CrystalTemplate;
