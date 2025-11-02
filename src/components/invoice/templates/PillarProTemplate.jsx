"use client";
import React from "react";
import moment from "moment";

// --- Pillar Pro Template Component ---
const PillarProTemplate = ({ invoiceData, selectedStore }) => {
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_COLOR = "#0f4c75"; // Deep Navy Blue
  const ACCENT_COLOR = "#3498db"; // Bright Sky Blue
  const LIGHT_BG = "#f8f9fa"; // Off-White

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
        
        /* Pillar Pro Template Styles */
        .pillar-invoice-body {
          font-family: 'Georgia', serif !important; /* Serif font for a magazine feel */
          background: #fdfdfd !important;
          color: #333 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }
        .pillar-invoice {
          max-width: 750px; 
          margin: 50px auto;
          padding: 30px 40px;
          background: white;
          border: 1px solid #ddd;
        }

        /* Header */
        .pillar-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
        }
        .pillar-header h1 {
            color: ${PRIMARY_COLOR};
            font-size: 40px;
            font-weight: 800;
            margin: 0;
            line-height: 1;
        }
        .pillar-store-info {
            text-align: right;
            font-size: 12px;
            color: #555;
        }
        .pillar-store-info p {
            margin: 2px 0;
        }

        /* Detail Columns */
        .pillar-detail-columns {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr; /* Three columns */
            gap: 20px;
            padding: 15px 0;
            border-top: 3px solid ${PRIMARY_COLOR};
            border-bottom: 1px solid ${LIGHT_BG};
            margin-bottom: 30px;
        }
        .pillar-meta-block .title {
            font-size: 10px;
            text-transform: uppercase;
            color: ${ACCENT_COLOR};
            font-weight: 700;
            margin-bottom: 5px;
        }
        .pillar-meta-block p {
            margin: 2px 0;
            font-size: 14px;
        }
        .pillar-value-bold {
            font-weight: 700;
            color: ${PRIMARY_COLOR};
        }
        .pillar-customer-name {
            font-size: 16px;
            font-weight: 800;
        }

        /* Table */
        .pillar-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .pillar-table thead tr {
          background-color: ${LIGHT_BG};
          color: ${PRIMARY_COLOR};
          border-bottom: 2px solid ${ACCENT_COLOR};
        }
        .pillar-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          padding: 10px 15px;
        }
        .pillar-table td {
          padding: 12px 15px;
          border-bottom: 1px solid ${LIGHT_BG};
          font-size: 13px;
        }
        .pillar-product-name {
          font-weight: 600;
        }

        /* Totals */
        .pillar-totals-area {
            display: flex;
            justify-content: flex-end;
        }
        .pillar-totals-table {
          width: 300px;
        }
        .pillar-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .pillar-totals-table .label {
          color: #555;
        }
        .pillar-totals-table .amount {
          font-weight: 600;
          color: ${PRIMARY_COLOR};
        }
        .pillar-totals-table .final-row {
          border-top: 3px solid ${PRIMARY_COLOR};
          padding-top: 15px;
          margin-top: 10px;
          font-size: 22px;
          background-color: ${LIGHT_BG};
          padding: 15px 10px;
        }
      `}</style>
      <div className="pillar-invoice-body">
        <div className="pillar-invoice">
          
          {/* Header Section */}
          <div className="pillar-header">
            <h1>INVOICE</h1>
            <div className="pillar-store-info">
                <p className="pillar-value-bold" style={{ color: PRIMARY_COLOR }}>{selectedStore?.storeName || "Pillar Pro Solutions"}</p>
                <p>{selectedStore?.address || "321 Executive Center"}</p>
                <p>{selectedStore?.phone || "+91 99999 88888"} | {selectedStore?.email || "contact@pillarpro.com"}</p>
            </div>
          </div>
          
          {/* Detail Columns */}
          <div className="pillar-detail-columns">
            {/* Invoice Meta */}
            <div className="pillar-meta-block">
                <div className="title">Invoice Details</div>
                <p># <span className="pillar-value-bold">{invoiceData.invoiceNumber}</span></p>
                <p>Issued: <span className="pillar-value-bold">{moment(invoiceData.createdAt).format("MMM DD, YYYY")}</span></p>
            </div>
            
            {/* Bill To */}
            <div className="pillar-meta-block">
                <div className="title">Bill To</div>
                <p className="pillar-customer-name">{invoiceData.customer?.name || "Walk-in Customer"}</p>
                {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
                {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            </div>

             {/* Payment Terms */}
            <div className="pillar-meta-block">
                <div className="title">Terms</div>
                <p>Due: <span className="pillar-value-bold">N/A</span></p>
                <p>Payment Method: <span className="pillar-value-bold">E-Transfer</span></p>
            </div>
          </div>
          
          {/* Table */}
          <table className="pillar-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Description</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                <th style={{ width: "20%", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="pillar-product-name">
                      {item.product?.name || "Unnamed Item"}
                    </div>
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
          <div className="pillar-totals-area">
              <div className="pillar-totals-table">
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
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px dashed #ccc', paddingTop: '15px', fontSize: '11px', color: '#777' }}>
            <p>Thank you for your order. Please remit payment by the due date.</p>
          </div>
        </div>
      </div>
    </>
  );
};
export default PillarProTemplate;