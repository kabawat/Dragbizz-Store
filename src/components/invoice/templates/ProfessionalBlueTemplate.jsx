"use client";
import React from "react";
import moment from "moment";

const ProfessionalBlueTemplate = ({ invoiceData, selectedStore }) => {
  // Helper function remains the same
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_BLUE = "#2980b9";
  const LIGHT_GRAY = "#f7f9fb";
  const TEXT_COLOR = "#34495e"; // Dark slate

  return (
    <>
      <style jsx global>{`
        /* Professional Blue Template Styles */
        .blue-invoice-body {
          font-family: 'Roboto', 'Arial', sans-serif !important;
          background: #ffffff !important;
          color: ${TEXT_COLOR} !important;
          font-size: 14px !important;
          margin: 0;
          padding: 0;
        }
        .blue-invoice {
          max-width: 800px;
          margin: 40px auto;
          padding: 30px;
          background: white;
          border: 1px solid #bdc3c7;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }

        /* Header Layout */
        .blue-header-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            border-bottom: 4px solid ${PRIMARY_BLUE};
            padding-bottom: 10px;
        }
        .blue-store-info {
            flex-basis: 50%;
        }
        .blue-store-info h2 {
            color: ${PRIMARY_BLUE};
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 5px 0;
        }
        .blue-store-info p {
            margin: 2px 0;
            font-size: 12px;
            color: #7f8c8d;
        }

        .blue-invoice-details {
            flex-basis: 40%;
            text-align: right;
        }
        .blue-invoice-details h1 {
            color: ${TEXT_COLOR};
            font-size: 36px;
            font-weight: 300;
            margin: 0 0 10px 0;
        }
        .blue-detail-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 3px;
        }
        .blue-detail-label {
            font-weight: 600;
            width: 100px;
            text-align: left;
            padding-right: 10px;
        }
        .blue-invoice-number {
            font-weight: 800;
            color: ${PRIMARY_BLUE};
            font-size: 18px;
        }

        /* Bill To */
        .blue-bill-to {
            margin-bottom: 30px;
            padding: 15px;
            background: ${LIGHT_GRAY};
            border-left: 5px solid ${PRIMARY_BLUE};
        }
        .blue-bill-to-title {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: ${PRIMARY_BLUE};
            margin-bottom: 5px;
        }
        .blue-bill-to-name {
            font-weight: 700;
            font-size: 16px;
            margin: 0;
        }
        .blue-bill-to p {
            margin: 2px 0;
            font-size: 13px;
        }

        /* Table */
        .blue-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border: 1px solid #bdc3c7;
        }
        .blue-table th, .blue-table td {
          border: 1px solid #ecf0f1;
          padding: 10px;
          text-align: left;
        }
        .blue-table thead th {
          background-color: ${PRIMARY_BLUE};
          color: white;
          font-size: 12px;
          text-transform: uppercase;
        }
        .blue-table td {
          font-size: 14px;
        }
        .blue-table-total-cell {
            font-weight: 700;
            color: ${PRIMARY_BLUE};
            text-align: right !important;
        }

        /* Totals Section */
        .blue-totals-table {
            width: 300px;
            margin-left: auto;
            border-top: 2px solid ${TEXT_COLOR};
        }
        .blue-totals-table .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        .blue-totals-table .label {
            font-weight: 500;
        }
        .blue-totals-table .amount {
            font-weight: 600;
        }
        .blue-totals-table .final-row {
            border-top: 1px solid #bdc3c7;
            padding-top: 10px;
            margin-top: 5px;
            font-size: 18px;
        }
        .blue-totals-table .final-row .amount {
            color: ${PRIMARY_BLUE};
            font-weight: 900;
        }
      `}</style>
      <div className="blue-invoice-body">
        <div className="blue-invoice">
          
          {/* Header Grid Section */}
          <div className="blue-header-grid">
            {/* Store Info - Left */}
            <div className="blue-store-info">
                <h2>{selectedStore?.storeName || "Corporate Solutions Inc."}</h2>
                <p>{selectedStore?.address || "123 Business Park, Metro City"}</p>
                <p>Ph: {selectedStore?.phone || "+91 9876543210"} | Email: {selectedStore?.email || "contact@corp.com"}</p>
            </div>
            
            {/* Invoice Details - Right */}
            <div className="blue-invoice-details">
                <h1>INVOICE</h1>
                <div className="blue-detail-row">
                    <div className="blue-detail-label">Invoice #</div>
                    <div className="blue-invoice-number">{invoiceData.invoiceNumber}</div>
                </div>
                <div className="blue-detail-row">
                    <div className="blue-detail-label">Date Issued</div>
                    <div>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</div>
                </div>
            </div>
          </div>
          
          {/* Bill To Section */}
          <div className="blue-bill-to">
              <div className="blue-bill-to-title">Bill To</div>
              <p className="blue-bill-to-name">{invoiceData.customer?.name || "Valued Client Name"}</p>
              {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
              {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
          </div>
          
          {/* Table */}
          <table className="blue-table">
            <thead>
              <tr>
                <th style={{ width: "45%" }}>Item Description</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "15%", textAlign: "right" }}>Unit Price</th>
                <th style={{ width: "10%", textAlign: "right" }}>Tax %</th>
                <th style={{ width: "20%", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="product-name">
                      {item.product?.name || "Service Rendered"}
                    </div>
                    {item.product?.sku && (
                      <div className="product-sku" style={{fontSize: '11px', color: '#95a5a6'}}>
                        SKU: {item.product.sku}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(item.price)}
                  </td>
                  <td style={{ textAlign: "right" }}>{item.taxRate || 0}%</td>
                  <td className="blue-table-total-cell">
                    {formatCurrency(item.quantity * item.price * (1 + (item.taxRate || 0)/100))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Totals */}
          <div className="blue-totals-table">
              <div className="row">
                <div className="label">Subtotal:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.subtotal)}
                </div>
              </div>
              <div className="row">
                <div className="label">Total Tax:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.gstAmount)}
                </div>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div className="row">
                  <div className="label">Total Discount:</div>
                  <div className="amount" style={{ color: '#e74c3c' }}>
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
          <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px solid #ecf0f1', paddingTop: '15px', fontSize: '12px', color: '#7f8c8d' }}>
            <p>Thank you for choosing us. Please pay within 30 days.</p>
          </div>
        </div>
      </div>
    </>
  );
};
export default ProfessionalBlueTemplate;