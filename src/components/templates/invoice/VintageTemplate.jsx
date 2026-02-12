"use client";
import moment from "moment";

const VintageTemplate = ({ invoiceData, selectedStore }) => {
  return (
    <>
      <style jsx global>
        {`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .vintage-invoice {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
        }
          
        body {
          /* Using a classic serif font */
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #4e342e !important; /* Dark brown text */
          background-color: #fcfaf7 !important; /* Light beige background */
        }


          
        .vintage-invoice {
          max-width: 800px !important;
          margin: 30px auto !important;
          padding: 40px !important;
          background: #ffffff !important;
          /* Strong double border for a vintage document feel */
          border: 6px double #795548 !important; /* Sepia/dark brown border */
          border-radius: 4px !important;
          box-shadow: 0 0 15px rgba(0,0,0,0.1) !important;
        }
          
        .vintage-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          border-bottom: 2px solid #a1887f !important; /* Lighter brown */
          padding-bottom: 20px !important;
          margin-bottom: 30px !important;
        }
          
        .vintage-header .store-details .store-name {
          font-size: 26px !important;
          font-weight: 600 !important;
          color: #4e342e !important;
          font-variant: small-caps !important; /* Unique touch */
        }
          
        .vintage-header .store-details p {
          font-size: 13px !important;
          color: #6d4c41 !important;
          margin-top: 5px !important;
        }
          
        .vintage-header .invoice-title-box {
          text-align: right !important;
        }
          
        .vintage-header .invoice-title-box h1 {
          font-size: 32px !important;
          font-weight: 700 !important;
          color: #79867c !important; /* Muted green */
          margin: 0 !important;
          letter-spacing: 1px !important;
        }
          
        .vintage-header .invoice-title-box p {
          font-size: 13px !important;
          color: #6d4c41 !important;
          margin: 3px 0 !important;
        }
          
        .vintage-info {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 30px !important;
          margin-bottom: 30px !important;
        }
          
        .vintage-info .info-box {
          padding: 15px !important;
          background: #fdfcfb !important; /* Very light cream */
          border: 1px dashed #c7b2a3 !important; /* Dashed border */
          border-radius: 4px !important;
        }
          
        .vintage-info .info-box h3 {
          font-size: 15px !important;
          font-weight: 600 !important;
          color: #79867c !important; /* Muted green */
          margin-bottom: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          border-bottom: 1px solid #e0e0e0 !important;
          padding-bottom: 5px !important;
        }
          
        .vintage-info .info-box p {
          font-size: 13px !important;
          color: #5d4037 !important;
          margin-bottom: 3px !important;
        }
          
        .vintage-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-bottom: 30px !important;
          border: 1px solid #a1887f !important; /* Border around table */
        }
          
        .vintage-table th {
          background: #79867c !important; /* Muted green */
          color: #ffffff !important;
          padding: 12px 10px !important;
          text-align: left !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          border-right: 1px solid #a1887f !important;
        }
        
        .vintage-table th:last-child {
          border-right: none !important;
        }
          
        .vintage-table td {
          padding: 10px !important;
          border-bottom: 1px solid #d7ccc8 !important; /* Light brown border */
          font-size: 14px !important;
          color: #4e342e !important;
          border-right: 1px solid #d7ccc8 !important;
        }

        .vintage-table td:last-child {
          border-right: none !important;
        }
          
        .vintage-table tr:nth-child(even) {
          background-color: #fdfcfb !important; /* Light cream stripe */
        }
          
        .vintage-table .product-name {
          font-weight: 600 !important;
        }
          
        .vintage-totals {
          display: flex !important;
          justify-content: flex-end !important;
          margin-top: 20px !important;
        }
          
        .vintage-totals .totals-box {
          width: 300px !important;
        }
          
        .vintage-totals .total-row {
          display: flex !important;
          justify-content: space-between !important;
          padding: 6px 0 !important;
          font-size: 14px !important;
        }

        .vintage-totals .total-row span:first-child {
          color: #6d4c41 !important;
          font-weight: 600 !important;
        }

        .vintage-totals .total-row span:last-child {
          font-weight: 600 !important;
        }
          
        .vintage-totals .total-row.grand-total {
          border-top: 2px solid #795548 !important;
          margin-top: 8px !important;
          padding-top: 8px !important;
          font-size: 16px !important;
          color: #79867c !important; /* Muted green */
          font-weight: 700 !important;
        }
          
        .vintage-footer {
          margin-top: 40px !important;
          text-align: center !important;
          padding-top: 20px !important;
          border-top: 1px dotted #a1887f !important;
          font-style: italic !important;
          font-size: 12px !important;
          color: #6d4c41 !important;
        }
      `}
      </style>

      <div className="vintage-invoice">
        {/* Header */}
        <div className="vintage-header">
          <div className="store-details">
            <div className="store-name">
              {selectedStore?.storeName || "Your Store"}
            </div>
            <p>
              {selectedStore?.address || "123 Market Road, City 12345"} <br />
              {selectedStore?.phone && `Phone: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Email: ${selectedStore.email}`}
            </p>
          </div>
          <div className="invoice-title-box">
            <h1>INVOICE</h1>
            <p>{invoiceData.invoiceNumber}</p>
            <p>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="vintage-info">
          <div className="info-box">
            <h3>Bill To</h3>
            <p>
              <strong>
                {invoiceData.customer?.name || "Walk-in Customer"}
              </strong>
            </p>
            {invoiceData.customer?.address && (
              <p>{invoiceData.customer.address}</p>
            )}
            {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
            {invoiceData.customer?.email && (
              <p>Email: {invoiceData.customer.email}</p>
            )}
          </div>
          <div className="info-box">
            <h3>Payment Info</h3>
            <p>
              <strong>Payment Mode:</strong> {invoiceData.paymentMode || "Cash"}
            </p>
            <p>
              <strong>Invoice Date:</strong>{" "}
              {moment(invoiceData.createdAt).format("DD MMM YYYY")}
            </p>
            <p>
              <strong>Status:</strong> {invoiceData.status || "Paid"}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="vintage-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Rate</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items?.map((item, index) => (
              <tr key={index}>
                <td>
                  <span className="product-name">
                    {item.product?.name || "Product"}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>
                  ₹{item.price?.toLocaleString()}
                </td>
                <td style={{ textAlign: "right" }}>
                  ₹{(item.quantity * item.price)?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="vintage-totals">
          <div className="totals-box">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{invoiceData.subtotal?.toLocaleString()}</span>
            </div>
            <div className="total-row">
              <span>GST:</span>
              <span>₹{invoiceData.gstAmount?.toLocaleString() || "0"}</span>
            </div>
            {invoiceData.totalDiscount > 0 && (
              <div className="total-row">
                <span>Discount:</span>
                <span>-₹{invoiceData.totalDiscount?.toLocaleString()}</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>₹{invoiceData.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="vintage-footer">
          <p>Thank you for your business!</p>
          <p>
            This is a system-generated invoice. Generated on{" "}
            {moment(invoiceData.createdAt).format("MM/DD/YYYY")}
          </p>
        </div>
      </div>
    </>
  );
};

export default VintageTemplate;
