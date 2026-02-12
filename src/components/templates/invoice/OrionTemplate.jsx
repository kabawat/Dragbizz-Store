"use client";
import moment from "moment";

const OrionTemplate = ({ invoiceData, selectedStore }) => {
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
          font-family: "Nunito", "Segoe UI", sans-serif !important;
          background: #eef1f5 !important;
          color: #2f3640 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }




        .orion-invoice {
          max-width: 900px;
          margin: 40px auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .orion-header {
          background: #3a86ff;
          color: white;
          text-align: center;
          padding: 25px 20px;
          position: relative;
        }

        .orion-header::after {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 4px;
          border-radius: 4px;
          background: #ffbe0b;
        }

        .orion-header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .orion-header p {
          font-size: 12px;
          margin-top: 6px;
          opacity: 0.9;
        }

        .invoice-content {
          padding: 40px 45px;
        }

        .store-info {
          text-align: center;
          margin-bottom: 25px;
          color: #555;
        }

        .store-info h2 {
          margin: 0;
          font-size: 20px;
          color: #2f3640;
        }

        .store-info p {
          font-size: 12px;
          margin: 2px 0;
          color: #7f8c8d;
        }

        .details {
          display: flex;
          justify-content: space-between;
          background: #f9fafc;
          border-radius: 10px;
          padding: 20px 25px;
          margin-bottom: 30px;
          border: 1px solid #e6e9ec;
        }

        .details .block {
          width: 48%;
        }

        .details .label {
          font-size: 11px;
          color: #7f8c8d;
          text-transform: uppercase;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }

        .details .value {
          font-size: 14px;
          font-weight: 600;
          color: #2f3640;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th {
          text-align: left;
          font-size: 11px;
          color: #7f8c8d;
          text-transform: uppercase;
          border-bottom: 2px solid #e6e9ec;
          padding: 10px 0;
        }

        td {
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
          color: #2f3640;
        }

        .product-name {
          font-weight: 600;
        }

        .totals {
          margin-top: 25px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .totals .row {
          display: flex;
          justify-content: flex-end;
          width: 260px;
          margin-bottom: 6px;
        }

        .totals .label {
          width: 140px;
          text-align: right;
          color: #7f8c8d;
          font-size: 12px;
          margin-right: 10px;
        }

        .totals .amount {
          width: 100px;
          text-align: right;
          font-weight: 500;
        }

        .totals .final {
          border-top: 2px solid #dcdde1;
          padding-top: 10px;
          margin-top: 10px;
          font-weight: 700;
          color: #000;
        }

        .footer {
          background: #f9fafc;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          padding: 20px;
          font-size: 11px;
          color: #7f8c8d;
        }

        .footer p {
          margin: 3px 0;
        }
      `}</style>

      <div className="orion-invoice">
        {/* Header */}
        <div className="orion-header">
          <h1>INVOICE</h1>
          <p>
            Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
          </p>
        </div>

        <div className="invoice-content">
          {/* Store Info */}
          <div className="store-info">
            <h2>{selectedStore?.storeName || "Your Store"}</h2>
            <p>{selectedStore?.address || "123 Business Street, City"}</p>
            <p>{selectedStore?.phone || "+91 9876543210"}</p>
            <p>{selectedStore?.email || "info@yourstore.com"}</p>
          </div>

          {/* Details */}
          <div className="details">
            <div className="block">
              <div className="label">Bill To</div>
              <div className="value">
                {invoiceData.customer?.name || "Walk-in Customer"}
              </div>
              {invoiceData.customer?.email && (
                <p>{invoiceData.customer.email}</p>
              )}
              {invoiceData.customer?.phone && (
                <p>{invoiceData.customer.phone}</p>
              )}
            </div>
            <div className="block">
              <div className="label">Date</div>
              <div className="value">
                {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
              </div>
            </div>
          </div>

          {/* Table */}
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
                  <td className="product-name">
                    {item.product?.name || "Unnamed Product"}
                  </td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price?.toLocaleString()}</td>
                  <td>₹{(item.quantity * item.price)?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals">
            <div className="row">
              <div className="label">Subtotal:</div>
              <div className="amount">
                ₹{invoiceData.subtotal?.toLocaleString()}
              </div>
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
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for shopping with us!</p>
          <p>
            Generated on{" "}
            {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
          </p>
          <p>
            This invoice is system-generated and doesn’t require a signature.
          </p>
        </div>
      </div>
    </>
  );
};

export default OrionTemplate;
