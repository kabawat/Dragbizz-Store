"use client";
import moment from "moment";

// --- New Template Component ---
const VelocityLedgerTemplate = ({ invoiceData, selectedStore }) => {
  // Helper function remains the same for consistency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_COLOR = "#1f3a68"; // Dark Navy Blue
  const ACCENT_COLOR = "#ff7e29"; // Vibrant Orange/Gold
  const LIGHT_BG = "#f8f9fa"; // Very light off-white

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
        
                /* ✅ MINI PRINTER MODE FIX */
        body.print-mode-mini .velocity-invoice {
          flex-direction: column !important;
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 4px !important;
        }

        /* ✅ Left panel mini-mode */
        body.print-mode-mini .velocity-left {
          width: 100% !important;
          padding: 8px !important;
          border-radius: 0 !important;
          text-align: center !important;
        }

        body.print-mode-mini .velocity-left h2 {
          font-size: 14px !important;
        }

        body.print-mode-mini .velocity-left p {
          font-size: 10px !important;
        }

        /* ✅ Right panel mini-mode */
        body.print-mode-mini .velocity-right {
          width: 100% !important;
          padding: 6px !important;
        }

        /* ✅ Header */
        body.print-mode-mini .velocity-header h1 {
          font-size: 16px !important;
        }

        body.print-mode-mini .velocity-header .date {
          font-size: 10px !important;
        }

        /* ✅ Bill To etc */
        body.print-mode-mini .info-section {
          flex-direction: column !important;
          gap: 4px !important;
        }

        body.print-mode-mini .info-section .block {
          width: 100% !important;
        }

        body.print-mode-mini .info-section .value {
          font-size: 12px !important;
        }

        /* ✅ Table Compact */
        body.print-mode-mini table th {
          font-size: 9px !important;
          padding: 4px 0 !important;
        }

        body.print-mode-mini table td {
          font-size: 10px !important;
          padding: 4px 0 !important;
        }

        /* ✅ Totals */
        body.print-mode-mini .totals .row {
          width: 100% !important;
        }

        body.print-mode-mini .totals .label,
        body.print-mode-mini .totals .amount {
          font-size: 10px !important;
        }

        /* ✅ Footer */
        body.print-mode-mini .footer {
          font-size: 9px !important;
          margin-top: 10px !important;
        }


        /* Velocity Ledger Template Styles */
        .velocity-invoice-body {
          font-family: 'Open Sans', 'Arial', sans-serif !important;
          background: #fcfcfc !important;
          color: #333 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }
        .velocity-invoice {
          max-width: 700px;
          margin: 50px auto;
          padding: 0;
          background: white;
          border: 1px solid #eee;
        }

        /* Header */
        .velocity-header-band {
            background-color: ${PRIMARY_COLOR};
            color: white;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .velocity-header-band h1 {
            font-size: 30px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 2px;
        }
        .velocity-invoice-number {
            font-size: 18px;
            font-weight: 700;
            background-color: ${ACCENT_COLOR};
            padding: 5px 15px;
            border-radius: 3px;
        }

        .velocity-store-info-area {
            padding: 20px 30px;
            text-align: right;
            border-bottom: 2px solid ${ACCENT_COLOR};
            margin-bottom: 20px;
        }
        .velocity-store-info-area .store-name {
            font-size: 18px;
            font-weight: 700;
            color: ${PRIMARY_COLOR};
            margin-bottom: 5px;
        }
        .velocity-store-info-area p {
            margin: 2px 0;
            font-size: 12px;
            color: #777;
        }

        /* Details & Customer Info */
        .velocity-info-container {
            padding: 0 30px;
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
        }
        .velocity-detail-box {
            width: 47%;
            padding: 15px;
            border: 1px solid ${LIGHT_BG};
            background-color: ${LIGHT_BG};
            border-radius: 4px;
        }
        .velocity-detail-box .title {
            font-size: 10px;
            text-transform: uppercase;
            color: ${ACCENT_COLOR};
            margin-bottom: 8px;
            font-weight: 700;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .velocity-detail-box p {
            margin: 3px 0;
            font-size: 13px;
        }
        .velocity-value-bold {
            font-weight: 600;
            color: ${PRIMARY_COLOR};
        }

        /* Table */
        .velocity-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          padding: 0 30px;
        }
        .velocity-table thead tr {
          background-color: ${PRIMARY_COLOR};
          color: white;
        }
        .velocity-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          padding: 10px 15px;
        }
        .velocity-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .velocity-table tbody tr:nth-child(odd) {
            background-color: #fcfcfc;
        }
        .velocity-product-name {
          font-weight: 600;
          color: ${PRIMARY_COLOR};
        }
        .velocity-product-sku {
          font-size: 10px;
          color: #999;
        }

        /* Totals Section */
        .velocity-totals-area {
            display: flex;
            justify-content: flex-end;
            padding: 0 30px 20px 30px;
        }
        .velocity-totals-table {
          width: 300px;
        }
        .velocity-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        .velocity-totals-table .label {
          color: #555;
        }
        .velocity-totals-table .amount {
          font-weight: 600;
          color: #333;
        }
        
        /* Grand Total Highlight */
        .velocity-grand-total {
            background-color: ${ACCENT_COLOR};
            color: white;
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            font-size: 22px;
            font-weight: 800;
            margin-top: 20px;
        }
        .velocity-grand-total .label {
            letter-spacing: 1px;
        }
      `}</style>
      <div className="velocity-invoice-body">
        <div className="velocity-invoice">
          {/* Header Band */}
          <div className="velocity-header-band">
            <h1>TAX INVOICE</h1>
            <div className="velocity-invoice-number">
              INVOICE # {invoiceData.invoiceNumber}
            </div>
          </div>

          {/* Store Info Block (Right-aligned) */}
          <div className="velocity-store-info-area">
            <div className="store-name">
              {selectedStore?.storeName || "Velocity Solutions Corp."}
            </div>
            <p>
              {selectedStore?.address || "101 Commerce Tower, Business Park"}
            </p>
            <p>
              Ph: {selectedStore?.phone || "+91 80000 11111"} | Email:{" "}
              {selectedStore?.email || "contact@velocity.com"}
            </p>
          </div>

          {/* Info Bar - Invoice Meta and Customer */}
          <div className="velocity-info-container">
            {/* Invoice Details Box */}
            <div className="velocity-detail-box">
              <div className="title">Invoice Date & Due</div>
              <p>
                Issued:{" "}
                <span className="velocity-value-bold">
                  {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                </span>
              </p>
              <p>
                Due: <span className="velocity-value-bold">N/A</span>
              </p>
            </div>

            {/* Bill To Box */}
            <div className="velocity-detail-box">
              <div className="title">Bill To / Customer</div>
              <p className="velocity-value-bold">
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

          {/* Table Container (to apply padding) */}
          <div
            className="velocity-table-container"
            style={{ padding: "0 30px" }}
          >
            <table className="velocity-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>Description</th>
                  <th style={{ width: "15%", textAlign: "center" }}>Qty</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items?.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="velocity-product-name">
                        {item.product?.name || "Unnamed Item"}
                      </div>
                      {item.product?.sku && (
                        <div className="velocity-product-sku">
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
          <div className="velocity-totals-area">
            <div className="velocity-totals-table">
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
            </div>
          </div>

          {/* Grand Total Footer Band */}
          <div className="velocity-grand-total">
            <div className="label">TOTAL AMOUNT DUE:</div>
            <div className="amount">
              {formatCurrency(invoiceData.totalAmount)}
            </div>
          </div>

          <div
            style={{
              padding: "15px 30px",
              textAlign: "center",
              fontSize: "11px",
              color: "#777",
            }}
          >
            <p style={{ margin: 0 }}>
              This invoice was generated electronically and is valid without a
              signature. Thank you for your continued partnership.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default VelocityLedgerTemplate;
