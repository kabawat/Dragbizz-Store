"use client";
import React from "react";
import moment from "moment";

const MinimalistMonochromeTemplate = ({ invoiceData, selectedStore }) => {
  // Helper function remains the same
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const DEEP_BLACK = "#1a1a1a";
  const LIGHT_GRAY = "#cccccc";

  return (
    <>
      <style jsx global>{`
        /* Minimalist Monochrome Template Styles */
        .mono-invoice-body {
          font-family: 'Georgia', serif !important; /* Serif font for elegance */
          background: #ffffff !important;
          color: ${DEEP_BLACK} !important;
          font-size: 14px !important;
          margin: 0;
          padding: 0;
        }
        .mono-invoice {
          max-width: 700px;
          margin: 60px auto;
          padding: 50px;
          background: white;
        }

        /* Header Section */
        .mono-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 50px;
        }
        .mono-header-left h1 {
            font-size: 48px;
            font-weight: 300;
            margin: 0;
            letter-spacing: 5px;
            text-transform: uppercase;
        }
        .mono-header-left p {
            font-size: 13px;
            color: #555;
            margin: 2px 0;
        }

        .mono-header-right {
            text-align: right;
            line-height: 1.6;
        }
        .mono-header-right .title {
            font-size: 11px;
            text-transform: uppercase;
            color: #888;
            margin-bottom: 5px;
        }
        .mono-header-right .value {
            font-size: 14px;
            font-weight: 400;
        }
        .mono-invoice-number {
            font-size: 20px;
            font-weight: 700;
            color: ${DEEP_BLACK};
        }

        /* Bill To & Date Block */
        .mono-address-block {
            display: flex;
            justify-content: space-between;
            margin-bottom: 50px;
            padding-bottom: 15px;
            border-bottom: 1px solid ${LIGHT_GRAY};
        }
        .mono-address-details {
            width: 45%;
        }
        .mono-address-details .title {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 10px;
            color: ${DEEP_BLACK};
        }
        .mono-address-details p {
            margin: 3px 0;
            font-size: 14px;
            line-height: 1.5;
        }
        .mono-customer-name {
            font-weight: 700;
        }
        .mono-date-issued {
            text-align: right;
            font-size: 16px;
            font-weight: 500;
            padding-top: 15px;
        }

        /* Table */
        .mono-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        .mono-table thead tr {
          border-top: 2px solid ${DEEP_BLACK};
          border-bottom: 1px solid ${DEEP_BLACK};
        }
        .mono-table th {
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          padding: 10px 0;
        }
        .mono-table td {
          padding: 8px 0;
          border-bottom: 1px dashed ${LIGHT_GRAY}; /* Only dashed lines for separation */
          font-size: 14px;
        }
        .mono-table tbody tr:last-child td {
            border-bottom: none;
        }

        /* Totals Section */
        .mono-totals-table {
          width: 250px;
          margin-left: auto;
          border-top: 1px solid ${DEEP_BLACK};
          padding-top: 15px;
        }
        .mono-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 16px;
        }
        .mono-totals-table .label {
          font-weight: 300;
        }
        .mono-totals-table .amount {
          font-weight: 500;
        }
        .mono-totals-table .final-row {
          border-top: 3px solid ${DEEP_BLACK};
          padding-top: 10px;
          margin-top: 10px;
          font-size: 24px;
        }
        .mono-totals-table .final-row .amount {
            font-weight: 700;
        }
      `}</style>
      <div className="mono-invoice-body">
        <div className="mono-invoice">
          
          {/* Header Section */}
          <div className="mono-header">
            <div className="mono-header-left">
                <h1>INVOICE</h1>
                <p>{selectedStore?.storeName || "Minimalist Design Co."}</p>
                <p>
                    {selectedStore?.address || "789 White Space, Zen City"}
                </p>
            </div>
            
            <div className="mono-header-right">
                <div className="title">Invoice #</div>
                <div className="mono-invoice-number">{invoiceData.invoiceNumber}</div>
            </div>
          </div>
          
          {/* Bill To & Date Block */}
          <div className="mono-address-block">
            {/* Bill To Details */}
            <div className="mono-address-details">
                <div className="title">Bill To</div>
                <p className="mono-customer-name">{invoiceData.customer?.name || "Client"}</p>
                {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
                {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            </div>
            
            {/* Date Details */}
            <div className="mono-address-details">
                <div className="title" style={{textAlign: 'right'}}>Date Issued</div>
                <p className="mono-date-issued">{moment(invoiceData.createdAt).format("DD MMMM YYYY")}</p>
            </div>
          </div>
          
          {/* Table */}
          <table className="mono-table">
            <thead>
              <tr>
                <th style={{ width: "55%" }}>Product/Service</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "15%", textAlign: "right" }}>Rate</th>
                <th style={{ width: "20%", textAlign: "right" }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="product-name">
                      {item.product?.name || "Item"}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(item.price)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Totals */}
          <div className="mono-totals-table">
              <div className="row">
                <div className="label">Subtotal</div>
                <div className="amount">
                  {formatCurrency(invoiceData.subtotal)}
                </div>
              </div>
              <div className="row">
                <div className="label">Tax (GST)</div>
                <div className="amount">
                  {formatCurrency(invoiceData.gstAmount)}
                </div>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div className="row">
                  <div className="label">Discount</div>
                  <div className="amount" style={{ color: '#888' }}>
                    -{formatCurrency(invoiceData.totalDiscount)}
                  </div>
                </div>
              )}
              <div className="row final-row">
                <div className="label">TOTAL</div>
                <div className="amount">
                  {formatCurrency(invoiceData.totalAmount)}
                </div>
              </div>
          </div>
          
        </div>
      </div>
    </>
  );
};
export default MinimalistMonochromeTemplate;