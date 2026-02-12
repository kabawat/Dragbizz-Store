"use client";
import moment from "moment";

// --- Matrix Ledger Template Component ---
const MatrixLedgerTemplate = ({ invoiceData, selectedStore }) => {
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_TEXT = "#111111"; // Near Black
  const LIGHT_TEXT = "#555555";
  const BORDER_HEAVY = "#333333"; // Heavy Black Border
  const BORDER_LIGHT = "#dddddd"; // Light Gray Border

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
        


        /* Matrix Ledger Template Styles */
        .matrix-invoice-body {
          font-family: 'Consolas', 'Courier New', monospace !important; /* Fixed-width font for data look */
          background: #fcfcfc !important;
          color: ${PRIMARY_TEXT} !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }
        .matrix-invoice {
          max-width: 680px; 
          margin: 50px auto;
          padding: 30px;
          background: white;
          border: 4px double ${BORDER_HEAVY}; /* Unique double border */
        }

        /* Header */
        .matrix-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .matrix-header h1 {
            color: ${PRIMARY_TEXT};
            font-size: 28px;
            font-weight: 900;
            margin-bottom: 5px;
            letter-spacing: 1px;
            border-bottom: 1px solid ${BORDER_HEAVY};
            padding-bottom: 5px;
        }
        .matrix-store-info {
            font-size: 11px;
            color: ${LIGHT_TEXT};
        }
        .matrix-store-info p {
            margin: 2px 0;
        }

        /* Detail Blocks */
        .matrix-info-bar {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            padding: 10px 0;
            border-top: 1px solid ${BORDER_HEAVY};
            border-bottom: 1px solid ${BORDER_HEAVY};
        }
        .matrix-meta-block {
            width: 48%;
        }
        .matrix-meta-block .title {
            font-size: 10px;
            text-transform: uppercase;
            color: ${LIGHT_TEXT};
            margin-bottom: 5px;
            font-weight: 700;
        }
        .matrix-meta-block p {
            margin: 2px 0;
            font-size: 13px;
        }
        .matrix-value-bold {
            font-weight: 700;
            color: ${PRIMARY_TEXT};
        }
        .matrix-invoice-number {
             font-size: 15px;
        }

        /* Table */
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .matrix-table thead tr {
          border-bottom: 3px solid ${BORDER_HEAVY};
        }
        .matrix-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          padding: 8px 0;
          color: ${PRIMARY_TEXT};
        }
        .matrix-table td {
          padding: 6px 0;
          border-bottom: 1px solid ${BORDER_LIGHT};
          font-size: 13px;
        }
        .matrix-product-name {
          font-weight: 600;
        }
        .matrix-table tbody tr:last-child td {
            border-bottom: none;
        }

        /* Totals */
        .matrix-totals-table {
          width: 300px;
          margin-left: auto;
          border: 1px solid ${BORDER_HEAVY};
        }
        .matrix-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 6px 10px;
          font-size: 14px;
        }
        .matrix-totals-table .label {
          color: ${LIGHT_TEXT};
        }
        .matrix-totals-table .amount {
          font-weight: 600;
          color: ${PRIMARY_TEXT};
        }
        .matrix-totals-table .final-row {
          background-color: ${BORDER_HEAVY};
          color: white;
          padding: 10px 10px;
          font-size: 20px;
        }
        .matrix-totals-table .final-row .label,
        .matrix-totals-table .final-row .amount {
            font-weight: 800;
        }
        
        /* Footer */
        .matrix-footer {
          text-align: left;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px dashed ${LIGHT_TEXT};
          font-size: 11px;
          color: ${LIGHT_TEXT};
        }
      `}</style>
      <div className="matrix-invoice-body">
        <div className="matrix-invoice">
          {/* Header Section */}
          <div className="matrix-header">
            <h1>TAX INVOICE / RECEIPT</h1>
            <div className="matrix-store-info">
              <p>
                {selectedStore?.storeName || "Matrix Ledger Systems"} |{" "}
                {selectedStore?.address || "Data Center, Ledger Street"}
              </p>
              <p>
                TIN: XXXX-XXXXX | Email:{" "}
                {selectedStore?.email || "data@matrixledger.com"}
              </p>
            </div>
          </div>

          {/* Info Bar */}
          <div className="matrix-info-bar">
            {/* Invoice Meta */}
            <div className="matrix-meta-block">
              <div className="title">Transaction Data</div>
              <p>
                Invoice #:{" "}
                <span className="matrix-value-bold matrix-invoice-number">
                  {invoiceData.invoiceNumber}
                </span>
              </p>
              <p>
                Date Issued:{" "}
                <span className="matrix-value-bold">
                  {moment(invoiceData.createdAt).format("YYYY-MM-DD")}
                </span>
              </p>
            </div>

            {/* Bill To */}
            <div className="matrix-meta-block">
              <div className="title">Bill To Entity</div>
              <p className="matrix-value-bold">
                {invoiceData.customer?.name || "Walk-in Customer"}
              </p>
              {invoiceData.customer?.phone && (
                <p>Ph: {invoiceData.customer.phone}</p>
              )}
              {invoiceData.customer?.email && (
                <p>Email: {invoiceData.customer.email}</p>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>ITEM DESCRIPTION</th>
                <th style={{ width: "10%", textAlign: "center" }}>QTY</th>
                <th style={{ width: "20%", textAlign: "right" }}>UNIT PRICE</th>
                <th style={{ width: "20%", textAlign: "right" }}>LINE TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="matrix-product-name">
                      {item.product?.name || "Unnamed Item"}
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
          <div className="matrix-totals-table">
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
              <div className="row" style={{ color: "#c0392b" }}>
                <div className="label">DISCOUNT APPLIED:</div>
                <div className="amount">
                  -{formatCurrency(invoiceData.totalDiscount)}
                </div>
              </div>
            )}
            <div className="row final-row">
              <div className="label">AMOUNT DUE (INR):</div>
              <div className="amount">
                {formatCurrency(invoiceData.totalAmount)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="matrix-footer">
            <p>E&OE. This transaction record is digitally generated.</p>
            <p>Audit Stamp: {moment().format("YYYYMMDDHHmmss")}</p>
          </div>
        </div>
      </div>
    </>
  );
};
export default MatrixLedgerTemplate;
