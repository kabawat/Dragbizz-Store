"use client";
import React from "react";
import moment from "moment";

const ElitePaperTemplate = ({ invoiceData, selectedStore }) => {
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_COLOR = "#1b5e20"; // Deep Forest Green
  const SECONDARY_COLOR = "#2c3e50"; // Dark Slate Gray
  const ACCENT_BG = "#e8f5e9"; // Very light green background

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
        
        /* ElitePaper Template Styles */
        .elitepaper-invoice-body {
          font-family: 'Montserrat', 'Segoe UI', sans-serif !important;
          background: #fcfcfc !important;
          color: #333 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }

        .elitepaper-invoice {
          max-width: 700px;
          margin: 50px auto;
          padding: 30px;
          background: white;
          border: 1px solid #ddd;
        }

        /* Header */
        .elitepaper-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 4px solid ${PRIMARY_COLOR};
        }
        .elitepaper-header h1 {
            color: ${SECONDARY_COLOR};
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 5px;
            letter-spacing: 2px;
        }
        .elitepaper-store-tagline {
            color: ${PRIMARY_COLOR};
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .elitepaper-store-info {
            font-size: 12px;
            color: #777;
        }
        .elitepaper-store-info p {
            margin: 2px 0;
        }

        /* Details & Customer Info */
        .elitepaper-info-bar {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .elitepaper-block {
            padding: 15px 20px;
            width: 48%;
            border: 1px solid #eee;
            border-radius: 4px;
        }
        .elitepaper-block .title {
            font-size: 10px;
            text-transform: uppercase;
            color: ${PRIMARY_COLOR};
            margin-bottom: 8px;
            font-weight: 700;
            border-bottom: 1px dashed ${PRIMARY_COLOR};
            padding-bottom: 5px;
        }
        .elitepaper-invoice-meta p {
            margin: 2px 0;
            font-size: 13px;
        }
        .elitepaper-customer-info p {
            margin: 2px 0;
            font-size: 13px;
        }
        .elitepaper-value-bold {
            font-weight: 700;
            color: ${SECONDARY_COLOR};
        }

        /* Table */
        .elitepaper-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .elitepaper-table thead tr {
          background-color: ${SECONDARY_COLOR};
          color: white;
        }
        .elitepaper-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          padding: 10px 15px;
        }
        .elitepaper-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .elitepaper-table tbody tr:nth-child(even) {
            background-color: ${ACCENT_BG};
        }
        .elitepaper-product-name {
          font-weight: 600;
          color: ${SECONDARY_COLOR};
        }
        .elitepaper-product-sku {
          font-size: 10px;
          color: #999;
        }

        /* Totals Section */
        .elitepaper-totals-table {
          width: 300px;
          margin-left: auto;
        }
        .elitepaper-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 7px 0;
          font-size: 14px;
        }
        .elitepaper-totals-table .label {
          color: #555;
        }
        .elitepaper-totals-table .amount {
          font-weight: 600;
          color: ${SECONDARY_COLOR};
        }
        .elitepaper-totals-table .final-row {
          border-top: 3px solid ${PRIMARY_COLOR};
          padding-top: 15px;
          margin-top: 10px;
          font-size: 20px;
        }
        .elitepaper-totals-table .final-row .label,
        .elitepaper-totals-table .final-row .amount {
            font-weight: 800;
            color: ${PRIMARY_COLOR};
        }

        /* Footer */
        .elitepaper-footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 25px;
          border-top: 1px dashed #ccc;
          font-size: 12px;
          color: #999;
        }
      `}</style>

      <div className="elitepaper-invoice-body">
        <div className="elitepaper-invoice">
          
          {/* Header Section */}
          <div className="elitepaper-header">
            <h1>INVOICE</h1>
            <div className="elitepaper-store-tagline">ElitePaper Billing Solutions</div>
            <div className="elitepaper-store-info">
                <p>
                    <span className="elitepaper-value-bold">{selectedStore?.storeName || "ElitePaper Global"}</span> | {selectedStore?.address || "789 Corporate Blvd"}
                </p>
                <p>
                    Ph: {selectedStore?.phone || "+91 1234567890"} | Email: {selectedStore?.email || "billing@elitepaper.com"}
                </p>
            </div>
          </div>

          {/* Info Bar */}
          <div className="elitepaper-info-bar">
            <div className="elitepaper-block elitepaper-invoice-meta">
                <div className="title">Invoice Details</div>
                <p>Invoice #: <span className="elitepaper-value-bold">{invoiceData.invoiceNumber}</span></p>
                <p>Date Issued: <span className="elitepaper-value-bold">{moment(invoiceData.createdAt).format("MMM DD, YYYY")}</span></p>
                <p>Due Date: <span className="elitepaper-value-bold">N/A</span></p>
            </div>
            
            <div className="elitepaper-block elitepaper-customer-info">
                <div className="title">Bill To</div>
                <p className="elitepaper-value-bold">{invoiceData.customer?.name || "Walk-in Customer"}</p>
                {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
                {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            </div>
          </div>
          
          {/* Table */}
          <table className="elitepaper-table">
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
                    <div className="elitepaper-product-name">
                      {item.product?.name || "Unnamed Item"}
                    </div>
                    {item.product?.sku && (
                      <div className="elitepaper-product-sku">
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
          
          {/* Totals */}
          <div className="elitepaper-totals-table">
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
                  <div className="amount" style={{ color: '#c0392b' }}>
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
          <div className="elitepaper-footer">
            <p>Thank you for choosing ElitePaper. All prices are inclusive of applicable taxes.</p>
            <p>
              Generated at {moment().format("HH:mm:ss")} on {moment().format("YYYY-MM-DD")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ElitePaperTemplate;
