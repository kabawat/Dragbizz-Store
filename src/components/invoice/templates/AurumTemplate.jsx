"use client";
import React from "react";
import moment from "moment";

const AurumTemplate = ({ invoiceData, selectedStore }) => {
  const formatCurrency = (amount) =>
    `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const PRIMARY_COLOR = "#d4af37"; // Rich gold
  const SECONDARY_COLOR = "#111"; // Deep black
  const LIGHT_TEXT = "#f5f5f5";

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

        .aurum-body {
          font-family: "Playfair Display", "Poppins", serif;
          background: #fafafa;
          color: ${SECONDARY_COLOR};
          font-size: 13px;
          padding: 0;
          margin: 0;
        }

        .aurum-invoice {
          max-width: 720px;
          margin: 50px auto;
          background: white;
          border-radius: 10px;
          border: 2px solid ${PRIMARY_COLOR};
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .aurum-header {
          background: ${SECONDARY_COLOR};
          color: ${LIGHT_TEXT};
          text-align: center;
          padding: 30px 20px;
          border-bottom: 3px solid ${PRIMARY_COLOR};
        }
        .aurum-header h1 {
          font-size: 34px;
          font-weight: 700;
          letter-spacing: 3px;
          margin-bottom: 10px;
          color: ${PRIMARY_COLOR};
        }
        .aurum-header .aurum-subtitle {
          font-size: 14px;
          color: ${LIGHT_TEXT};
          opacity: 0.9;
        }

        /* Info Section */
        .aurum-info-bar {
          display: flex;
          justify-content: space-between;
          padding: 25px 30px;
          background: #fefcf8;
          border-bottom: 1px solid #eee;
        }
        .aurum-block {
          width: 48%;
          border-left: 3px solid ${PRIMARY_COLOR};
          padding-left: 15px;
        }
        .aurum-block .title {
          font-size: 11px;
          text-transform: uppercase;
          color: ${SECONDARY_COLOR};
          font-weight: 600;
          margin-bottom: 6px;
        }
        .aurum-block p {
          margin: 3px 0;
        }

        /* Table */
        .aurum-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px;
        }
        .aurum-table thead tr {
          background: ${SECONDARY_COLOR};
          color: ${PRIMARY_COLOR};
        }
        .aurum-table th {
          padding: 10px;
          font-size: 11px;
          text-transform: uppercase;
          border-bottom: 2px solid ${PRIMARY_COLOR};
        }
        .aurum-table td {
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 13px;
        }
        .aurum-table tbody tr:nth-child(even) {
          background: #fcfcfc;
        }

        /* Totals */
        .aurum-totals {
          display: flex;
          justify-content: flex-end;
          padding: 0 30px 30px;
        }
        .aurum-total-card {
          background: ${SECONDARY_COLOR};
          color: ${PRIMARY_COLOR};
          padding: 20px 25px;
          border-radius: 8px;
          width: 300px;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
        }
        .aurum-total-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 14px;
        }
        .aurum-total-label {
          color: #ddd;
        }
        .aurum-total-final {
          border-top: 2px solid ${PRIMARY_COLOR};
          margin-top: 8px;
          padding-top: 10px;
          font-weight: 700;
          font-size: 18px;
          color: ${PRIMARY_COLOR};
        }

        /* Footer */
        .aurum-footer {
          text-align: center;
          padding: 25px 20px;
          border-top: 1px solid #ddd;
          background: #fdfbf5;
          font-size: 12px;
          color: #777;
          position: relative;
        }
        .aurum-footer::after {
          content: "Aurum";
          position: absolute;
          bottom: 10px;
          right: 20px;
          font-size: 60px;
          color: ${PRIMARY_COLOR};
          opacity: 0.05;
          pointer-events: none;
        }
      `}</style>

      <div className="aurum-body">
        <div className="aurum-invoice">
          {/* Header */}
          <div className="aurum-header">
            <h1>INVOICE</h1>
            <div className="aurum-subtitle">
              {selectedStore?.storeName || "Aurum Billing Systems"} |{" "}
              {selectedStore?.address || "B-12 Gold Tower, Mumbai"}
            </div>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              Ph: {selectedStore?.phone || "+91 9876543210"} | Email:{" "}
              {selectedStore?.email || "contact@aurum.com"}
            </div>
          </div>

          {/* Info Bar */}
          <div className="aurum-info-bar">
            <div className="aurum-block">
              <div className="title">Invoice Details</div>
              <p>
                Invoice #: <b>{invoiceData.invoiceNumber}</b>
              </p>
              <p>
                Date Issued:{" "}
                <b>{moment(invoiceData.createdAt).format("DD MMM YYYY")}</b>
              </p>
            </div>
            <div className="aurum-block">
              <div className="title">Customer</div>
              <p>
                <b>{invoiceData.customer?.name || "Walk-in Customer"}</b>
              </p>
              {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
              {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            </div>
          </div>

          {/* Table */}
          <table className="aurum-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Rate</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.product?.name || "Unnamed Item"}</td>
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
          <div className="aurum-totals">
            <div className="aurum-total-card">
              <div className="aurum-total-row">
                <span className="aurum-total-label">Subtotal:</span>
                <span>{formatCurrency(invoiceData.subtotal)}</span>
              </div>
              <div className="aurum-total-row">
                <span className="aurum-total-label">GST:</span>
                <span>{formatCurrency(invoiceData.gstAmount)}</span>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div className="aurum-total-row">
                  <span className="aurum-total-label">Discount:</span>
                  <span style={{ color: "#e63946" }}>
                    -{formatCurrency(invoiceData.totalDiscount)}
                  </span>
                </div>
              )}
              <div className="aurum-total-row aurum-total-final">
                <span>Total:</span>
                <span>{formatCurrency(invoiceData.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="aurum-footer">
            <p>
              <em>Thank you for your trust and partnership.</em>
            </p>
            <p>
              Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AurumTemplate;
