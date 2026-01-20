"use client";
import moment from "moment";

const EclipseTemplate = ({ invoiceData, selectedStore }) => {
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

        body {
          font-family: "Poppins", "Arial", sans-serif !important;
          background: #121212 !important;
          color: #e5e7eb !important;
          font-size: 13px;
          margin: 0;
          padding: 0;
        }

                  /* ✅ MINI PRINTER MODE FIX */
          body.print-mode-mini .eclipse-invoice {
            flex-direction: column !important;
            width: 74mm !important;
            max-width: 74mm !important;
            padding: 4px !important;
          }

          /* ✅ Left panel mini-mode */
          body.print-mode-mini .eclipse-left {
            width: 100% !important;
            padding: 8px !important;
            border-radius: 0 !important;
            text-align: center !important;
          }

          body.print-mode-mini .eclipse-left h2 {
            font-size: 14px !important;
          }

          body.print-mode-mini .eclipse-left p {
            font-size: 10px !important;
          }

          /* ✅ Right panel mini-mode */
          body.print-mode-mini .eclipse-right {
            width: 100% !important;
            padding: 6px !important;
          }

          /* ✅ Header */
          body.print-mode-mini .eclipse-header h1 {
            font-size: 16px !important;
          }

          body.print-mode-mini .eclipse-header .date {
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

        .eclipse-invoice {
          max-width: 850px;
          background: #1f1f1f;
          margin: 50px auto;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #2c2c2c;
        }

        .eclipse-header {
          background: linear-gradient(90deg, #0f172a, #1e3a8a, #0ea5e9);
          color: white;
          padding: 40px;
          text-align: center;
        }

        .eclipse-header h1 {
          font-size: 30px;
          letter-spacing: 2px;
          margin-bottom: 6px;
        }

        .eclipse-header p {
          font-size: 13px;
          opacity: 0.9;
        }

        .details-section {
          display: flex;
          justify-content: space-between;
          padding: 30px 40px;
          border-bottom: 1px solid #2e2e2e;
        }

        .block {
          width: 48%;
        }

        .label {
          font-size: 11px;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 4px;
        }

        .value {
          font-size: 14px;
          font-weight: 500;
          color: #f3f4f6;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          padding: 0 40px;
        }

        th {
          background: #2c2c2c;
          color: #9ca3af;
          font-size: 12px;
          text-transform: uppercase;
          padding: 10px;
          text-align: left;
        }

        td {
          padding: 14px 10px;
          border-bottom: 1px solid #2c2c2c;
          font-size: 13px;
          color: #f3f4f6;
        }

        .product-name {
          font-weight: 500;
          color: #ffffff;
        }

        .totals {
          background: #111827;
          margin: 30px 40px;
          border-radius: 10px;
          padding: 20px;
          box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.05);
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .totals-label {
          color: #9ca3af;
          font-size: 12px;
        }

        .totals-value {
          font-size: 13px;
          font-weight: 500;
        }

        .final-total {
          border-top: 1px solid #374151;
          padding-top: 10px;
          margin-top: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #10b981;
        }

        .footer {
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
          padding: 20px;
          border-top: 1px solid #2c2c2c;
          background: #181818;
        }

        .footer p {
          margin: 3px 0;
        }
      `}</style>

      <div className="eclipse-invoice">
        {/* Header */}
        <div className="eclipse-header">
          <h1>INVOICE</h1>
          <p>{selectedStore?.storeName || "Your Store"}</p>
          <p>Invoice No: {invoiceData.invoiceNumber}</p>
          <p>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</p>
        </div>

        {/* Customer & Store Info */}
        <div className="details-section">
          <div className="block">
            <div className="label">Bill To</div>
            <div className="value">
              {invoiceData.customer?.name || "Walk-in Customer"}
            </div>
            {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
          </div>

          <div className="block" style={{ textAlign: "right" }}>
            <div className="label">From</div>
            <div className="value">
              {selectedStore?.storeName || "Your Store"}
            </div>
            <p>{selectedStore?.email || "info@yourstore.com"}</p>
            <p>{selectedStore?.phone || "+91 9876543210"}</p>
          </div>
        </div>

        {/* Table */}
        <div style={{ padding: "0 40px" }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Item</th>
                <th style={{ width: "15%" }}>Qty</th>
                <th style={{ width: "20%" }}>Price</th>
                <th style={{ width: "15%" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="product-name">
                      {item.product?.name || "Unnamed Product"}
                    </div>
                    {item.product?.sku && (
                      <small style={{ color: "#9ca3af" }}>
                        SKU: {item.product.sku}
                      </small>
                    )}
                  </td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price?.toLocaleString()}</td>
                  <td>₹{(item.quantity * item.price)?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="totals">
          <div className="totals-row">
            <span className="totals-label">Subtotal:</span>
            <span className="totals-value">
              ₹{invoiceData.subtotal?.toLocaleString()}
            </span>
          </div>
          <div className="totals-row">
            <span className="totals-label">GST:</span>
            <span className="totals-value">
              ₹{invoiceData.gstAmount?.toLocaleString() || "0"}
            </span>
          </div>
          {invoiceData.totalDiscount > 0 && (
            <div className="totals-row">
              <span className="totals-label">Discount:</span>
              <span className="totals-value">
                -₹{invoiceData.totalDiscount?.toLocaleString()}
              </span>
            </div>
          )}
          <div className="totals-row final-total">
            <span className="totals-label">Total:</span>
            <span className="totals-value">
              ₹{invoiceData.totalAmount?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for your business!</p>
          <p>
            Generated on{" "}
            {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
          </p>
          <p>
            This invoice was auto-generated and does not require a signature.
          </p>
        </div>
      </div>
    </>
  );
};

export default EclipseTemplate;
