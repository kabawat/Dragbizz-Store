"use client";
import moment from "moment";

// --- New Template Component ---
const CosmicReceiptTemplate = ({ invoiceData, selectedStore }) => {
  // Helper function remains the same
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const BACKGROUND_COLOR = "#1c1c1c"; // Deep Dark Gray
  const TEXT_COLOR = "white";
  const ACCENT_COLOR = "#00e676"; // Electric Green

  return (
    <>
      <style jsx global>{`
        @media print {
          /* Note: Dark mode templates might not print well without specific user printer settings. */
          .no-print {
            display: none !important;
          }
        }
        
        /* Cosmic Receipt Template Styles */
        .cosmic-invoice-body {
          font-family: 'Consolas', 'Courier New', monospace !important; /* Monospace font for a futuristic/terminal feel */
          background: #333 !important; /* Outside background */
          color: ${TEXT_COLOR} !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }
        .cosmic-invoice {
          max-width: 650px; /* Narrower, receipt style */
          margin: 50px auto;
          padding: 30px;
          background: ${BACKGROUND_COLOR};
          border: 1px solid ${ACCENT_COLOR}; /* Green border */
        }
        
        /* Header */
        .cosmic-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid ${ACCENT_COLOR};
        }
        .cosmic-header h1 {
            color: ${ACCENT_COLOR};
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
            letter-spacing: 4px; /* Wide spacing */
        }
        .cosmic-store-info p {
            margin: 3px 0;
            font-size: 11px;
            color: #ccc;
        }
        .cosmic-store-name {
            font-weight: 600;
            color: ${TEXT_COLOR};
            font-size: 13px;
        }

        /* Details & Customer Info */
        .cosmic-info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            padding: 10px 0;
            border-top: 1px dashed #555;
            border-bottom: 1px dashed #555;
        }
        .cosmic-block {
            width: 48%;
        }
        .cosmic-block .title {
            font-size: 10px;
            text-transform: uppercase;
            color: ${ACCENT_COLOR};
            margin-bottom: 5px;
            font-weight: 600;
        }
        .cosmic-block p {
            margin: 2px 0;
            font-size: 13px;
        }
        .cosmic-value-bold {
            font-weight: 700;
            color: ${TEXT_COLOR};
        }

        /* Table */
        .cosmic-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .cosmic-table thead tr {
          border-bottom: 1px solid ${ACCENT_COLOR};
        }
        .cosmic-table th {
          text-align: left;
          font-size: 10px;
          text-transform: uppercase;
          padding: 8px 0;
          color: ${ACCENT_COLOR};
        }
        .cosmic-table td {
          padding: 8px 0;
          border-bottom: 1px dashed #333;
          font-size: 13px;
        }
        .cosmic-product-name {
          font-weight: 600;
          color: ${TEXT_COLOR};
        }
        .cosmic-product-sku {
          font-size: 10px;
          color: #777;
        }

        /* Totals Section */
        .cosmic-totals-table {
          width: 100%; /* Full width for dark mode */
          margin-top: 20px;
        }
        .cosmic-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .cosmic-totals-table .label {
          color: #ccc;
        }
        .cosmic-totals-table .amount {
          font-weight: 600;
          color: ${TEXT_COLOR};
        }
        .cosmic-totals-table .final-row {
          border-top: 2px solid ${ACCENT_COLOR};
          padding-top: 15px;
          margin-top: 10px;
          font-size: 22px;
          background-color: #2c2c2c; /* Slightly lighter dark background */
          padding: 15px 10px;
        }
        .cosmic-totals-table .final-row .label,
        .cosmic-totals-table .final-row .amount {
            font-weight: 800;
            color: ${ACCENT_COLOR}; /* Highlight the total with green */
        }

        /* Footer */
        .cosmic-footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px dashed #555;
          font-size: 10px;
          color: #777;
        }
      `}</style>
      <div className="cosmic-invoice-body">
        <div className="cosmic-invoice">
          {/* Header Section */}
          <div className="cosmic-header">
            <h1>RECEIPT</h1>
            <div className="cosmic-store-info">
              <p>
                <span className="cosmic-store-name">
                  {selectedStore?.storeName || "Cosmic Systems Ltd."}
                </span>
              </p>
              <p>
                {selectedStore?.address || "Unit 404, Cyber Tower"} | Ph:{" "}
                {selectedStore?.phone || "+91 0101010101"}
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="cosmic-info-section">
            <div className="cosmic-block">
              <div className="title">Transaction Meta</div>
              <p>
                Invoice #:{" "}
                <span className="cosmic-value-bold">
                  {invoiceData.invoiceNumber}
                </span>
              </p>
              <p>
                Date:{" "}
                <span className="cosmic-value-bold">
                  {moment(invoiceData.createdAt).format("YYYY-MM-DD")}
                </span>
              </p>
            </div>

            <div className="cosmic-block" style={{ textAlign: "right" }}>
              <div className="title">Billed To</div>
              <p className="cosmic-value-bold">
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
          <table className="cosmic-table">
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
                    <div className="cosmic-product-name">
                      {item.product?.name || "Unnamed Item"}
                    </div>
                    {item.product?.sku && (
                      <div className="cosmic-product-sku">
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
          <div className="cosmic-totals-table">
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
                <div className="amount" style={{ color: "#ff5252" }}>
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
          <div className="cosmic-footer">
            <p>Processing complete. Data stream verified.</p>
            <p>Thank you for your transaction.</p>
          </div>
        </div>
      </div>
    </>
  );
};
export default CosmicReceiptTemplate;
