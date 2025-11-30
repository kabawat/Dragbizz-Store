"use client";
import React from "react";
import moment from "moment";

const ElegantTemplate = ({ invoiceData, selectedStore }) => {
  return (
    <>
      <style jsx global>{`

              /* ✅ Mini Printer – Elegant Template Compacting */
        @media print {
          body.print-mode-mini .elegant-wrapper {
            width: 74mm !important;
            max-width: 74mm !important;
            padding: 4px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }

          /* ✅ Header */
          body.print-mode-mini .elegant-header {
            width : 100% !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 4px !important;
          }

          body.print-mode-mini .elegant-store-details .elegant-store-name {
            font-size: 14px !important;
          }

          body.print-mode-mini .elegant-store-details .elegant-store-address {
            font-size: 10px !important;
          }

          body.print-mode-mini .elegant-details .elegant-title {
            font-size: 16px !important;
            text-align:center !important;
          }

          body.print-mode-mini .elegant-details p {
            font-size: 10px !important;
            text-align:center !important;
          }

          /* ✅ Info boxes compact */
          body.print-mode-mini .elegant-info-section {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
            margin-bottom: 10px !important;
          }

          body.print-mode-mini .elegant-info-box {
            padding: 6px !important;
          }

          body.print-mode-mini .elegant-info-box h3 {
            font-size: 10px !important;
            margin-bottom: 4px !important;
          }

          body.print-mode-mini .elegant-info-box p {
            font-size: 9.5px !important;
            line-height: 1.2 !important;
          }

          /* ✅ Items Table – 74mm Optimized */
          body.print-mode-mini .elegant-table th {
            font-size: 9px !important;
            padding: 3px 2px !important;
          }

          body.print-mode-mini .elegant-table td {
            font-size: 9.5px !important;
            padding: 3px 2px !important;
            line-height: 1.1 !important;
            white-space: normal !important;
            word-break: break-word !important;
          }

          /* ✅ Description column width fix */
          body.print-mode-mini .elegant-table td:first-child {
            max-width: 42mm !important;
            white-space: normal !important;
          }

          /* ✅ Totals compact */
          body.print-mode-mini .elegant-totals-section {
            justify-content: flex-start !important;
            margin-top: 6px !important;
          }

          body.print-mode-mini .elegant-totals-box {
            width: 100% !important;
            padding: 6px !important;
          }

          body.print-mode-mini .elegant-totals-row {
            font-size: 10px !important;
            margin-bottom: 3px !important;
          }

          body.print-mode-mini .elegant-totals-row.grand-total {
            font-size: 12px !important;
            padding-top: 6px !important;
          }

          /* ✅ Footer */
          body.print-mode-mini .elegant-footer {
            font-size: 9px !important;
            margin-top: 10px !important;
            padding-top: 8px !important;
          }
        }

        body {
          font-family: "Poppins", sans-serif !important;
          font-size: 14px !important;
          background-color: #f4f7f6 !important;
          color: #333 !important;
        }

          body {
          /* Using a classic serif font */
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #4e342e !important; /* Dark brown text */
          background-color: #fcfaf7 !important; /* Light beige background */
        }

         body.print-mode-mini .elegant-wrapper {
    width: 74mm !important;
    max-width: 74mm !important;
    padding: 6px !important;
    border: none !important; /* thermal usually no border */
    box-shadow: none !important;
  }

  body.print-mode-standard .elegant-wrapper {
    max-width: 800px !important;
    padding: 40px !important;
  }

        .elegant-wrapper {
          max-width: 850px !important;
          margin: 30px auto !important;
          padding: 40px !important;
          background: #ffffff !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
        }

        /* Header */
        .elegant-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          margin-bottom: 40px !important;
        }

        .elegant-store-details .elegant-store-name {
          font-size: 24px !important;
          font-weight: 600 !important;
          color: #3498db !important;
        }

        .elegant-store-details .elegant-store-address {
          font-size: 13px !important;
          color: #666 !important;
          line-height: 1.5 !important;
          margin-top: 5px !important;
        }

        .elegant-details .elegant-title {
          font-size: 36px !important;
          font-weight: 700 !important;
          color: #2c3e50 !important;
          text-align: right !important;
          margin-bottom: 5px !important;
        }

        .elegant-details p {
          text-align: right !important;
          margin: 4px 0 !important;
          font-size: 13px !important;
          color: #555 !important;
        }

        /* Info Section */
        .elegant-info-section {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 25px !important;
          margin-bottom: 40px !important;
        }

        .elegant-info-box {
          padding: 20px !important;
          background: #fdfdfd !important;
          border: 1px solid #eaeaea !important;
          border-radius: 6px !important;
        }

        .elegant-info-box h3 {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #3498db !important;
          margin-bottom: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          border-bottom: 1px solid #f0f0f0 !important;
          padding-bottom: 8px !important;
        }

        .elegant-info-box p {
          font-size: 13px !important;
          margin-bottom: 5px !important;
          line-height: 1.6 !important;
        }

        /* Items Table */
        .elegant-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-bottom: 30px !important;
        }

        .elegant-table th {
          background: #f8f9fa !important;
          color: #555 !important;
          padding: 12px 15px !important;
          text-align: left !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          border-bottom: 2px solid #3498db !important;
        }

        .elegant-table td {
          padding: 12px 15px !important;
          border-bottom: 1px solid #f0f0f0 !important;
          font-size: 14px !important;
        }

        .elegant-table .align-right {
          text-align: right !important;
        }

        .elegant-table .align-center {
          text-align: center !important;
        }

        /* Totals */
        .elegant-totals-section {
          display: flex !important;
          justify-content: flex-end !important;
          margin-top: 20px !important;
        }

        .elegant-totals-box {
          width: 300px !important;
          background: #fdfdfd !important;
          border: 1px solid #eaeaea !important;
          border-radius: 6px !important;
          padding: 20px !important;
        }

        .elegant-totals-row {
          display: flex !important;
          justify-content: space-between !important;
          margin-bottom: 8px !important;
          font-size: 14px !important;
        }

        .elegant-totals-row span:first-child {
          color: #555 !important;
        }

        .elegant-totals-row.grand-total {
          margin-top: 10px !important;
          padding-top: 10px !important;
          border-top: 2px solid #3498db !important;
          font-weight: 700 !important;
          font-size: 16px !important;
          color: #3498db !important;
        }

        /* Footer */
        .elegant-footer {
          text-align: center !important;
          font-size: 12px !important;
          color: #888 !important;
          margin-top: 40px !important;
          border-top: 1px solid #f0f0f0 !important;
          padding-top: 20px !important;
        }

        /* Print */
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .elegant-wrapper {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Main Wrapper */}
      <div className="elegant-wrapper">
        {/* Header */}
        <div className="elegant-header">
          <div className="elegant-store-details">
            <div className="elegant-store-name">{selectedStore?.storeName || "Your Store"}</div>
            <div className="elegant-store-address">
              {selectedStore?.address || "123 Market Road, City 12345"} <br />
              {selectedStore?.phone && `Phone: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Email: ${selectedStore.email}`}
            </div>
          </div>
          <div className="elegant-details">
            <div className="elegant-title">INVOICE</div>
            <p>{invoiceData.invoiceNumber}</p>
            <p>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="elegant-info-section">
          <div className="elegant-info-box">
            <h3>Bill To</h3>
            <p><strong>{invoiceData.customer?.name || "Walk-in Customer"}</strong></p>
            {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
            {invoiceData.customer?.phone && <p>Phone: {invoiceData.customer.phone}</p>}
            {invoiceData.customer?.email && <p>Email: {invoiceData.customer.email}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="elegant-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="align-center">Qty</th>
              <th className="align-right">Rate</th>
              <th className="align-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items?.map((item, index) => (
              <tr key={index}>
                <td>{item.product?.name || "Product"}</td>
                <td className="align-center">{item.quantity}</td>
                <td className="align-right">₹{item.price?.toLocaleString()}</td>
                <td className="align-right">
                  ₹{(item.quantity * item.price)?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="elegant-totals-section">
          <div className="elegant-totals-box">
            <div className="elegant-totals-row">
              <span>Subtotal:</span>
              <span>₹{invoiceData.subtotal?.toLocaleString()}</span>
            </div>
            <div className="elegant-totals-row">
              <span>GST:</span>
              <span>₹{invoiceData.gstAmount?.toLocaleString() || "0"}</span>
            </div>
            {invoiceData.totalDiscount > 0 && (
              <div className="elegant-totals-row">
                <span>Discount:</span>
                <span>-₹{invoiceData.totalDiscount?.toLocaleString()}</span>
              </div>
            )}
            <div className="elegant-totals-row grand-total">
              <span>Total:</span>
              <span>₹{invoiceData.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="elegant-footer">
          <p>Thank you for shopping with us!</p>
          <p>Generated on {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] hh:mm A")}</p>
          <p>This is a system-generated invoice and does not require a signature.</p>
        </div>
      </div>
    </>
  );
};

export default ElegantTemplate;
