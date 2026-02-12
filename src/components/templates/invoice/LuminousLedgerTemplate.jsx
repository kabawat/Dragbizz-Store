"use client";
import moment from "moment";

// --- New Template Component ---
const LuminousLedgerTemplate = ({ invoiceData, selectedStore }) => {
  // Helper function remains the same
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_COLOR = "#1abc9c"; // Muted Teal/Aqua
  const SECONDARY_COLOR = "#2c3e50"; // Dark Navy
  const LIGHT_BG = "#f5f5f5"; // Very Light Grey

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
        



        /* Luminous Ledger Template Styles */
        .luminous-invoice-body {
          font-family: 'Inter', 'Roboto', sans-serif !important;
          background: #fcfcfc !important;
          color: #333 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }
        .luminous-invoice {
          max-width: 750px; /* Slightly wider */
          margin: 50px auto;
          padding: 0;
          background: white;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.05); /* Subtle shadow for depth */
        }
        /* Header */
        .luminous-header-top {
            background-color: ${SECONDARY_COLOR};
            color: white;
            padding: 25px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .luminous-header-top h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            letter-spacing: 1px;
        }
        .luminous-invoice-tag {
            background-color: ${PRIMARY_COLOR};
            padding: 5px 15px;
            border-radius: 2px;
            font-size: 16px;
            font-weight: 600;
        }

        .luminous-store-block {
            padding: 20px 40px;
            border-bottom: 5px solid ${PRIMARY_COLOR}; /* Strong accent line */
            margin-bottom: 25px;
        }
        .luminous-store-name {
            font-size: 20px;
            font-weight: 700;
            color: ${SECONDARY_COLOR};
            margin-bottom: 5px;
        }
        .luminous-store-details p {
            margin: 2px 0;
            font-size: 12px;
            color: #777;
        }

        /* Details & Customer Info */
        .luminous-info-bar {
            padding: 0 40px;
            display: flex;
            justify-content: flex-start;
            gap: 50px; /* Increased space */
            margin-bottom: 30px;
        }
        .luminous-block .title {
            font-size: 10px;
            text-transform: uppercase;
            color: ${PRIMARY_COLOR};
            margin-bottom: 8px;
            font-weight: 700;
            border-bottom: 1px solid ${LIGHT_BG};
            padding-bottom: 5px;
        }
        .luminous-meta p, .luminous-customer-info p {
            margin: 3px 0;
            font-size: 13px;
        }
        .luminous-value-bold {
            font-weight: 600;
            color: ${SECONDARY_COLOR};
        }

        /* Table */
        .luminous-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          padding: 0 40px;
        }
        .luminous-table thead tr {
          border-bottom: 2px solid ${PRIMARY_COLOR};
        }
        .luminous-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          padding: 10px 0;
          color: ${SECONDARY_COLOR};
        }
        .luminous-table td {
          padding: 12px 0;
          border-bottom: 1px solid ${LIGHT_BG};
          font-size: 13px;
        }
        .luminous-table tbody tr:last-child td {
            border-bottom: none;
        }
        .luminous-table tbody tr:hover {
            background-color: #fafafa;
        }
        .luminous-product-name {
          font-weight: 600;
        }
        .luminous-product-sku {
          font-size: 10px;
          color: #999;
        }

        /* Totals Section */
        .luminous-totals-area {
            display: flex;
            justify-content: flex-end;
            padding: 0 40px 40px 40px;
        }
        .luminous-totals-table {
          width: 300px;
          border-left: 5px solid ${PRIMARY_COLOR};
          padding-left: 15px;
        }
        .luminous-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        .luminous-totals-table .label {
          color: #555;
        }
        .luminous-totals-table .amount {
          font-weight: 600;
          color: ${SECONDARY_COLOR};
        }
        .luminous-totals-table .final-row {
          border-top: 1px dashed #ccc;
          padding-top: 12px;
          margin-top: 5px;
          font-size: 20px;
        }
        .luminous-totals-table .final-row .label,
        .luminous-totals-table .final-row .amount {
            font-weight: 800;
            color: ${PRIMARY_COLOR};
        }
      `}</style>
      <div className="luminous-invoice-body">
        <div className="luminous-invoice">
          {/* Top Header Bar */}
          <div className="luminous-header-top">
            <h1>INVOICE</h1>
            <div className="luminous-invoice-tag">
              #
              <span style={{ fontWeight: 800 }}>
                {invoiceData.invoiceNumber}
              </span>
            </div>
          </div>

          {/* Store Info Block */}
          <div className="luminous-store-block">
            <div className="luminous-store-name">
              {selectedStore?.storeName || "Luminous Ledger Co."}
            </div>
            <div className="luminous-store-details">
              <p>
                {selectedStore?.address || "123 Modern Avenue, City, Country"}
              </p>
              <p>
                Ph: {selectedStore?.phone || "+91 9876543210"} | Email:{" "}
                {selectedStore?.email || "info@luminousledger.com"}
              </p>
            </div>
          </div>

          {/* Info Bar - Invoice Meta and Customer */}
          <div className="luminous-info-bar">
            {/* Invoice Details Block */}
            <div className="luminous-meta">
              <div className="title">Date & Due</div>
              <p>
                Issued:{" "}
                <span className="luminous-value-bold">
                  {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                </span>
              </p>
              <p>
                Due: <span className="luminous-value-bold">N/A</span>
              </p>
            </div>

            {/* Bill To Block */}
            <div className="luminous-customer-info">
              <div className="title">Bill To</div>
              <p className="luminous-value-bold">
                {invoiceData.customer?.name || "Walk-in Customer"}
              </p>
              {invoiceData.customer?.email && (
                <p>{invoiceData.customer.email}</p>
              )}
              {invoiceData.customer?.phone && (
                <p>{invoiceData.customer.phone}</p>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ padding: "0 40px" }}>
            {" "}
            {/* Container for table to align with info bar */}
            <table className="luminous-table" style={{ width: "100%" }}>
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
                      <div className="luminous-product-name">
                        {item.product?.name || "Unnamed Item"}
                      </div>
                      {item.product?.sku && (
                        <div className="luminous-product-sku">
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
          </div>

          {/* Totals Area */}
          <div className="luminous-totals-area">
            <div className="luminous-totals-table">
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
                  <div className="amount" style={{ color: "#e74c3c" }}>
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

          {/* Simple Note at the bottom */}
          <div
            style={{
              padding: "0 40px 20px",
              textAlign: "left",
              fontSize: "11px",
              color: "#999",
            }}
          >
            <p style={{ margin: 0 }}>
              **Note:** Thank you for your business. Payment is due upon
              receipt.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default LuminousLedgerTemplate;
