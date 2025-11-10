"use client";
import React from "react";
import moment from "moment";

const AetherTemplate = ({ invoiceData, selectedStore }) => {
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
          background: #f8f9fa !important;
          color: #2c3e50 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }

    /* ✅ MINI PRINTER MODE FIX */
body.print-mode-mini .aether-invoice {
  flex-direction: column !important;
  width: 74mm !important;
  max-width: 74mm !important;
  padding: 4px !important;
}

/* ✅ Left panel mini-mode */
body.print-mode-mini .aether-left {
  width: 100% !important;
  padding: 8px !important;
  border-radius: 0 !important;
  text-align: center !important;
}

body.print-mode-mini .aether-left h2 {
  font-size: 14px !important;
}

body.print-mode-mini .aether-left p {
  font-size: 10px !important;
}

/* ✅ Right panel mini-mode */
body.print-mode-mini .aether-right {
  width: 100% !important;
  padding: 6px !important;
}

/* ✅ Header */
body.print-mode-mini .aether-header h1 {
  font-size: 16px !important;
}

body.print-mode-mini .aether-header .date {
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


        .aether-invoice {
          display: flex;
          flex-direction: row;
          max-width: 900px;
          margin: 40px auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .aether-left {
          background: #2c3e50;
          color: white;
          width: 35%;
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .aether-left h2 {
          font-size: 22px;
          font-weight: 500;
          margin-bottom: 10px;
        }

        .aether-left p {
          font-size: 12px;
          line-height: 1.5;
          color: #dfe6e9;
          margin: 2px 0;
        }

        .aether-right {
          width: 65%;
          padding: 40px;
        }

        .aether-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .aether-header h1 {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: 2px;
        }

        .aether-header .date {
          font-size: 12px;
          color: #7f8c8d;
        }

        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .info-section .block {
          width: 48%;
        }

        .info-section .label {
          font-size: 11px;
          text-transform: uppercase;
          color: #95a5a6;
          margin-bottom: 4px;
          letter-spacing: 1px;
        }

        .info-section .value {
          font-size: 14px;
          font-weight: 500;
          color: #2c3e50;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }

        th {
          text-align: left;
          font-size: 11px;
          color: #7f8c8d;
          text-transform: uppercase;
          padding: 10px 0;
          border-bottom: 1px solid #e5e8ea;
        }

        td {
          padding: 12px 0;
          border-bottom: 1px solid #f1f2f6;
          font-size: 13px;
        }

        .product-name {
          font-weight: 500;
          color: #2d3436;
        }

        .product-sku {
          font-size: 11px;
          color: #95a5a6;
        }

        .totals {
          margin-top: 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .totals .row {
          display: flex;
          justify-content: flex-end;
          width: 250px;
          margin-bottom: 6px;
        }

        .totals .label {
          width: 130px;
          font-size: 12px;
          color: #7f8c8d;
          text-align: right;
          margin-right: 10px;
        }

        .totals .amount {
          width: 100px;
          font-size: 13px;
          text-align: right;
          color: #2c3e50;
        }

        .totals .final {
          border-top: 1px solid #bdc3c7;
          padding-top: 8px;
          margin-top: 10px;
          font-weight: 600;
        }

        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 10px;
          color: #95a5a6;
        }

        .footer p {
          margin-bottom: 3px;
        }
      `}</style>

      <div className="aether-invoice">
        {/* Left Panel */}
        <div className="aether-left">
          <div>
            <h2>{selectedStore?.storeName || "Your Store"}</h2>
            <p>{selectedStore?.address || "123 Business Street"}</p>
            <p>City, State 12345</p>
            <p>{selectedStore?.phone || "+91 9876543210"}</p>
            <p>{selectedStore?.email || "info@yourstore.com"}</p>
          </div>
          <div>
            <p style={{ fontSize: "10px", marginTop: "40px" }}>
              © {moment().format("YYYY")} {selectedStore?.storeName || "Your Store"}
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="aether-right">
          <div className="aether-header">
            <div>
              <h1>INVOICE</h1>
              <div className="date">
                {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#7f8c8d" }}>
                Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
              </p>
            </div>
          </div>

          <div className="info-section">
            <div className="block">
              <div className="label">Bill To</div>
              <div className="value">
                {invoiceData.customer?.name || "Walk-in Customer"}
              </div>
              {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
              {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            </div>

            <div className="block">
              <div className="label">Issued By</div>
              <div className="value">{selectedStore?.storeName || "Your Store"}</div>
              <p>{selectedStore?.email}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Item</th>
                <th style={{ width: "15%" }}>Qty</th>
                <th style={{ width: "20%" }}>Rate</th>
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
                      <div className="product-sku">SKU: {item.product.sku}</div>
                    )}
                  </td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price?.toLocaleString()}</td>
                  <td>₹{(item.quantity * item.price)?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div className="row">
              <div className="label">Subtotal:</div>
              <div className="amount">₹{invoiceData.subtotal?.toLocaleString()}</div>
            </div>
            <div className="row">
              <div className="label">GST:</div>
              <div className="amount">
                ₹{invoiceData.gstAmount?.toLocaleString() || "0"}
              </div>
            </div>
            {invoiceData.totalDiscount > 0 && (
              <div className="row">
                <div className="label">Discount:</div>
                <div className="amount">
                  -₹{invoiceData.totalDiscount?.toLocaleString()}
                </div>
              </div>
            )}
            <div className="row final">
              <div className="label">Total:</div>
              <div className="amount">
                ₹{invoiceData.totalAmount?.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="footer">
            <p>Thank you for your business!</p>
            <p>
              Generated on{" "}
              {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
            </p>
            <p>This invoice does not require a signature.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AetherTemplate;
