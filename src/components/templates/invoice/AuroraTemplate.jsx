"use client";
import moment from "moment";

const AuroraTemplate = ({ invoiceData, selectedStore }) => {
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
          font-family: "Inter", "Arial", sans-serif !important;
          background: #f3f4f6 !important;
          color: #1f2937 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }

        .aurora-invoice {
          max-width: 900px;
          background: white;
          margin: 50px auto;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }

        .aurora-header {
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          color: white;
          padding: 30px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .aurora-header h1 {
          font-size: 26px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .aurora-header .right {
          text-align: right;
        }

        .aurora-header .right p {
          margin: 2px 0;
          font-size: 12px;
        }

        .aurora-body {
          padding: 40px;
        }

        .info-card {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .info-box {
          width: 48%;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 15px 20px;
        }

        .info-box h4 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .info-box p {
          font-size: 13px;
          margin: 2px 0;
          color: #111827;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          border-radius: 8px;
          overflow: hidden;
        }

        th {
          background: #f1f5f9;
          text-align: left;
          padding: 10px;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }

        td {
          padding: 12px 10px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
        }

        .product-name {
          font-weight: 500;
        }

        .totals {
          width: 100%;
          display: flex;
          justify-content: flex-end;
        }

        .totals-table {
          width: 260px;
        }

        .totals-table tr td {
          padding: 6px 0;
        }

        .totals-table .label {
          color: #6b7280;
          text-align: left;
          width: 140px;
        }

        .totals-table .amount {
          text-align: right;
          font-weight: 500;
        }

        .final-total {
          border-top: 2px solid #4f46e5;
          font-size: 14px;
          font-weight: 600;
          padding-top: 8px;
        }

        .footer {
          text-align: center;
          font-size: 11px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding: 15px 0;
          background: #fafafa;
        }
      `}</style>

      <div className="aurora-invoice">
        {/* Header */}
        <div className="aurora-header">
          <div>
            <h1>INVOICE</h1>
            <p>{selectedStore?.storeName || "Your Store"}</p>
          </div>
          <div className="right">
            <p>
              Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
            </p>
            <p>Date: {moment(invoiceData.createdAt).format("MMM DD, YYYY")}</p>
          </div>
        </div>

        {/* Body */}
        <div className="aurora-body">
          <div className="info-card">
            <div className="info-box">
              <h4>Bill To</h4>
              <p>{invoiceData.customer?.name || "Walk-in Customer"}</p>
              {invoiceData.customer?.phone && (
                <p>{invoiceData.customer.phone}</p>
              )}
              {invoiceData.customer?.email && (
                <p>{invoiceData.customer.email}</p>
              )}
            </div>

            <div className="info-box">
              <h4>From</h4>
              <p>{selectedStore?.storeName || "Your Store"}</p>
              <p>{selectedStore?.email || "info@yourstore.com"}</p>
              <p>{selectedStore?.phone || "+91 9876543210"}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Item</th>
                <th style={{ width: "15%" }}>Qty</th>
                <th style={{ width: "20%" }}>Price</th>
                <th style={{ width: "15%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="product-name">{item.product?.name}</div>
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

          <div className="totals">
            <table className="totals-table">
              <tbody>
                <tr>
                  <td className="label">Subtotal:</td>
                  <td className="amount">
                    ₹{invoiceData.subtotal?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="label">GST:</td>
                  <td className="amount">
                    ₹{invoiceData.gstAmount?.toLocaleString() || "0"}
                  </td>
                </tr>
                {invoiceData.totalDiscount > 0 && (
                  <tr>
                    <td className="label">Discount:</td>
                    <td className="amount">
                      -₹{invoiceData.totalDiscount?.toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr className="final-total">
                  <td className="label">Total:</td>
                  <td className="amount">
                    ₹{invoiceData.totalAmount?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for your purchase!</p>
          <p>
            Generated on{" "}
            {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
          </p>
        </div>
      </div>
    </>
  );
};

export default AuroraTemplate;
