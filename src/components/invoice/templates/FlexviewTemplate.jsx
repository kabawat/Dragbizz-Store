"use client";
import React from "react";
import moment from "moment";

const FlexviewTemplate = ({ invoiceData, selectedStore }) => {
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_COLOR = "#16a085"; // Teal
  const SECONDARY_COLOR = "#1abc9c"; // Light Mint
  const LIGHT_BG = "#f9fdfc";

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

        .flexview-body {
          font-family: 'Poppins', sans-serif;
          background: ${LIGHT_BG};
          color: #333;
          font-size: 14px;
          padding: 0;
          margin: 0;
        }

        .flexview-invoice {
          max-width: 850px;
          background: white;
          margin: 40px auto;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid #e8f5f3;
        }

        /* Header Section */
        .flexview-header {
          background: linear-gradient(135deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR});
          color: white;
          padding: 25px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .flexview-header h1 {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 2px;
        }
        .flexview-store {
          text-align: right;
          font-size: 13px;
          line-height: 1.5;
        }

        /* Customer + Invoice Details */
        .flexview-info {
          display: flex;
          justify-content: space-between;
          padding: 25px 40px;
          border-bottom: 1px solid #f0f0f0;
          background: #fcfcfc;
        }

        .flexview-info .block {
          width: 48%;
        }
        .flexview-info .block h3 {
          margin-bottom: 10px;
          color: ${PRIMARY_COLOR};
          font-size: 14px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .flexview-info .block p {
          margin: 3px 0;
          font-size: 13px;
        }

        /* Product Table */
        .flexview-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }

        .flexview-table thead tr {
          background: ${PRIMARY_COLOR};
          color: white;
        }

        .flexview-table th,
        .flexview-table td {
          padding: 12px 15px;
          text-align: left;
        }

        .flexview-table tbody tr:nth-child(even) {
          background-color: #f9fdfc;
        }

        .flexview-table td:last-child,
        .flexview-table th:last-child {
          text-align: right;
        }

        /* Totals */
        .flexview-totals {
          display: flex;
          justify-content: flex-end;
          padding: 20px 40px 10px 0;
        }
        .flexview-totals-box {
          width: 320px;
          border: 1px solid #e8f5f3;
          border-radius: 8px;
          padding: 15px 20px;
          background: #f7fcfb;
        }
        .flexview-totals-box .row {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
        }
        .flexview-totals-box .label {
          color: #555;
        }
        .flexview-totals-box .amount {
          font-weight: 600;
        }
        .flexview-totals-box .grand-total {
          border-top: 2px solid ${PRIMARY_COLOR};
          margin-top: 10px;
          padding-top: 10px;
          font-size: 17px;
          font-weight: 800;
          color: ${PRIMARY_COLOR};
        }

        /* Footer */
        .flexview-footer {
          text-align: center;
          padding: 15px;
          background: linear-gradient(90deg, ${SECONDARY_COLOR}, ${PRIMARY_COLOR});
          color: white;
          font-size: 12px;
          letter-spacing: 0.3px;
        }
      `}</style>

      <div className="flexview-body">
        <div className="flexview-invoice">
          {/* Header */}
          <div className="flexview-header">
            <h1>INVOICE</h1>
            <div className="flexview-store">
              <p style={{ fontWeight: "600" }}>
                {selectedStore?.storeName || "Flexview Builders"}
              </p>
              <p>{selectedStore?.address || "Sunset Avenue, Mumbai"}</p>
              <p>
                {selectedStore?.phone || "+91 9876543210"} |{" "}
                {selectedStore?.email || "support@flexviewbuild.com"}
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="flexview-info">
            <div className="block">
              <h3>Bill To</h3>
              <p>{invoiceData.customer?.name || "Walk-in Customer"}</p>
              {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
              {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
            </div>
            <div className="block" style={{ textAlign: "right" }}>
              <h3>Invoice Details</h3>
              <p><b>Invoice #:</b> {invoiceData.invoiceNumber}</p>
              <p><b>Date:</b> {moment(invoiceData.createdAt).format("MMM DD, YYYY")}</p>
            </div>
          </div>

          {/* Table */}
          <table className="flexview-table">
            <thead>
              <tr>
                <th>Product / Service</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Rate</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product?.name || "Unnamed Item"}</td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(item.price)}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flexview-totals">
            <div className="flexview-totals-box">
              <div className="row">
                <div className="label">Subtotal</div>
                <div className="amount">
                  {formatCurrency(invoiceData.subtotal)}
                </div>
              </div>
              <div className="row">
                <div className="label">GST</div>
                <div className="amount">
                  {formatCurrency(invoiceData.gstAmount)}
                </div>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div className="row">
                  <div className="label">Discount</div>
                  <div
                    className="amount"
                    style={{ color: "#e74c3c" }}
                  >
                    -{formatCurrency(invoiceData.totalDiscount)}
                  </div>
                </div>
              )}
              <div className="row grand-total">
                <div className="label">Total Due</div>
                <div className="amount">
                  {formatCurrency(invoiceData.totalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flexview-footer">
            <p>Thank you for choosing Flexview Builders!</p>
            <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlexviewTemplate;
