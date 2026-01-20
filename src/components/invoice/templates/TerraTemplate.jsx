"use client";
import moment from "moment";

const TerraTemplate = ({ invoiceData, selectedStore }) => {
  // A helper function to safely format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_COLOR = "#2ecc71"; // Fresh Green
  const SECONDARY_COLOR = "#7f8c8d"; // Neutral Gray

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

                /* ✅ MINI PRINTER MODE FIX */
        body.print-mode-mini .terra-invoice {
          flex-direction: column !important;
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 4px !important;
        }

        /* ✅ Left panel mini-mode */
        body.print-mode-mini .terra-left {
          width: 100% !important;
          padding: 8px !important;
          border-radius: 0 !important;
          text-align: center !important;
        }

        body.print-mode-mini .terra-left h2 {
          font-size: 14px !important;
        }

        body.print-mode-mini .terra-left p {
          font-size: 10px !important;
        }

        /* ✅ Right panel mini-mode */
        body.print-mode-mini .terra-right {
          width: 100% !important;
          padding: 6px !important;
        }

        /* ✅ Header */
        body.print-mode-mini .terra-header h1 {
          font-size: 16px !important;
        }

        body.print-mode-mini .terra-header .date {
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

        /* Terra Template Styles */
        .terra-invoice-body {
          font-family: 'Open Sans', 'Verdana', sans-serif !important;
          background: #fdfdfd !important;
          color: #333 !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }
        .terra-invoice {
          max-width: 850px;
          margin: 40px auto;
          padding: 40px;
          background: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
          border: 1px solid #eee;
        }
        .terra-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 3px solid ${PRIMARY_COLOR};
        }
        .terra-store-block {
          width: 50%;
        }
        .terra-store-block h2 {
          font-size: 26px;
          font-weight: 700;
          color: ${PRIMARY_COLOR};
          margin: 0 0 5px 0;
        }
        .terra-store-block p {
            font-size: 12px;
            color: ${SECONDARY_COLOR};
            margin: 2px 0;
        }
        .terra-title-block {
            text-align: right;
        }
        .terra-title-block h1 {
            font-size: 36px;
            color: #333;
            margin: 0;
            font-weight: 300;
        }
        
        .terra-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 30px;
        }
        .terra-detail-box {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 4px;
        }
        .terra-detail-box .label {
          font-size: 11px;
          text-transform: uppercase;
          color: ${SECONDARY_COLOR};
          margin-bottom: 5px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .terra-detail-box .value {
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }
        .terra-detail-box p {
            font-size: 12px;
            line-height: 1.4;
            color: #555;
            margin: 2px 0;
        }
        
        .terra-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        .terra-table thead tr {
          background-color: ${PRIMARY_COLOR};
          color: white;
        }
        .terra-table th {
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          padding: 10px 15px;
        }
        .terra-table td {
          padding: 10px 15px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .terra-table tbody tr:last-child td {
            border-bottom: none;
        }
        .terra-product-name {
          font-weight: 600;
          color: #333;
        }
        .terra-product-sku {
          font-size: 11px;
          color: #999;
        }

        .terra-totals-container {
          display: flex;
          justify-content: flex-end;
        }
        .terra-totals {
          width: 300px;
          padding: 10px 0;
        }
        .terra-totals .row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px dotted #ccc;
          font-size: 14px;
        }
        .terra-totals .label {
          color: #555;
          font-weight: 500;
        }
        .terra-totals .amount {
          font-weight: 500;
        }
        .terra-totals .final-row {
          border-bottom: none;
          padding-top: 10px;
          margin-top: 10px;
          font-size: 16px;
          color: ${PRIMARY_COLOR};
          border-top: 2px solid ${PRIMARY_COLOR};
        }
        .terra-totals .final-row .label,
        .terra-totals .final-row .amount {
            font-weight: 700;
        }
        
        .terra-footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 11px;
          color: ${SECONDARY_COLOR};
        }
      `}</style>
      <div className="terra-invoice-body">
        <div className="terra-invoice">
          {/* Header */}
          <div className="terra-header">
            <div className="terra-store-block">
              <h2>{selectedStore?.storeName || "ECO RETAIL"}</h2>
              <p>{selectedStore?.address || "456 Green Boulevard, City"}</p>
              <p>
                {selectedStore?.phone || "+91 9876543210"} |{" "}
                {selectedStore?.email || "hello@ecoretail.com"}
              </p>
            </div>
            <div className="terra-title-block">
              <h1>INVOICE</h1>
              <p
                style={{
                  fontSize: "12px",
                  color: SECONDARY_COLOR,
                  marginTop: "10px",
                }}
              >
                Date: **{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                **
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="terra-details-grid">
            <div className="terra-detail-box">
              <div className="label">Billed To</div>
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
            <div className="terra-detail-box">
              <div className="label">Invoice Reference</div>
              <div className="value">{invoiceData.invoiceNumber}</div>
              <p>Issued By: {selectedStore?.storeName || "ECO RETAIL"}</p>
              <p>
                Due Date: **
                {moment(invoiceData.createdAt)
                  .add(7, "days")
                  .format("MMMM DD, YYYY")}
                **
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="terra-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Product / Service</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                <th style={{ width: "20%", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="terra-product-name">
                      {item.product?.name || "Unnamed Product"}
                    </div>
                    {item.product?.sku && (
                      <div className="terra-product-sku">
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

          {/* Totals Section */}
          <div className="terra-totals-container">
            <div className="terra-totals">
              <div className="row">
                <div className="label">Subtotal:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.subtotal)}
                </div>
              </div>
              <div className="row">
                <div className="label">GST:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.gstAmount)}
                </div>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div className="row">
                  <div className="label">Discount:</div>
                  <div className="amount" style={{ color: PRIMARY_COLOR }}>
                    -{formatCurrency(invoiceData.totalDiscount)}
                  </div>
                </div>
              )}
              <div className="row final-row">
                <div className="label">TOTAL DUE:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.totalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="terra-footer">
            <p>
              Thank you for supporting{" "}
              {selectedStore?.storeName || "our business"}!
            </p>
            <p>
              Generated on{" "}
              {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TerraTemplate;
