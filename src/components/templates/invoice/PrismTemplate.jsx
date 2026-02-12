"use client";
import moment from "moment";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";

const PrismTemplate = ({ invoiceData, selectedStore }) => {
  // A helper function to safely format currency, using a monospaced font style
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_COLOR = "#3498db"; // Strong Blue
  const SECONDARY_BG = "#ecf0f1"; // Light Gray Background

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
        /* Prism Template Styles */
        .prism-invoice-body {
          font-family: 'Roboto Mono', 'Consolas', monospace, sans-serif !important;
          background: #fcfcfc !important;
          color: #2c3e50 !important;
          font-size: 14px !important;
          margin: 0;
          padding: 0;
        }
        .prism-invoice {
          max-width: 850px;
          margin: 50px auto;
          background: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.08);
        }

        .prism-header {
            background-color: ${PRIMARY_COLOR};
            color: white;
            padding: 30px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .prism-header h1 {
            font-family: 'Arial', sans-serif !important;
            font-size: 36px;
            font-weight: 700;
            margin: 0;
            letter-spacing: 2px;
        }
        .prism-store-details {
            text-align: right;
            font-size: 12px;
        }
        .prism-store-details h2 {
            font-family: 'Arial', sans-serif !important;
            font-size: 20px;
            margin: 0;
            font-weight: 400;
            color: #ecf0f1;
        }
        .prism-store-details p {
            margin: 2px 0;
            color: #bdc3c7;
        }
        
        .prism-info-bar {
            background-color: ${SECONDARY_BG};
            padding: 15px 40px;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #34495e;
            font-weight: 500;
            border-bottom: 2px solid #ddd;
        }
        .prism-info-bar strong {
            font-weight: 700;
            font-size: 14px;
            color: ${PRIMARY_COLOR};
        }

        .prism-details-section {
          display: flex;
          justify-content: space-between;
          padding: 30px 40px;
        }
        .prism-details-block {
          width: 48%;
          font-family: 'Arial', sans-serif !important; /* Use a non-mono font for address */
        }
        .prism-details-block .label {
          font-size: 11px;
          text-transform: uppercase;
          color: #7f8c8d;
          margin-bottom: 5px;
          font-weight: 600;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .prism-details-block .value {
          font-size: 16px;
          font-weight: 600;
          color: ${PRIMARY_COLOR};
          margin-bottom: 15px;
        }
        .prism-details-block p {
            font-size: 13px;
            line-height: 1.4;
            color: #555;
            margin: 2px 0;
        }

        .prism-table {
          width: 100%;
          border-collapse: collapse;
          padding: 0 40px;
          margin-bottom: 30px;
        }
        .prism-table th {
          text-align: left;
          font-size: 12px;
          color: #7f8c8d;
          text-transform: uppercase;
          padding: 15px 40px 15px 40px; /* Padding to align with details section */
          border-bottom: 1px solid #ddd;
        }
        .prism-table td {
          padding: 10px 40px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }
        .prism-product-name {
          font-weight: 500;
          font-family: 'Arial', sans-serif !important;
          color: #333;
        }
        .prism-product-sku {
          font-size: 11px;
          color: #999;
          font-family: 'Arial', sans-serif !important;
        }

        .prism-totals-container {
          display: flex;
          justify-content: flex-end;
          padding-right: 40px;
          padding-bottom: 30px;
        }
        .prism-totals {
          width: 300px;
        }
        .prism-totals .row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        .prism-totals .label {
          color: #555;
          font-family: 'Arial', sans-serif !important;
        }
        .prism-totals .amount {
          font-weight: 500;
        }

        .prism-final-total-block {
          background-color: ${PRIMARY_COLOR};
          color: white;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          font-size: 24px;
          font-weight: 700;
          font-family: 'Arial', sans-serif !important;
        }
        
        .prism-footer {
          text-align: center;
          padding: 30px 40px;
          font-size: 11px;
          color: #7f8c8d;
        }
      `}</style>
      <div className="prism-invoice-body">
        <div className="prism-invoice">
          {/* Header Section (Brand Name and 'INVOICE') */}
          <div className="prism-header">
            <div>
              <h1 style={{ color: "white" }}>INVOICE</h1>
            </div>
            <div className="prism-store-details">
              <h2>{selectedStore?.storeName || "PRISM TECHNOLOGIES"}</h2>
              <p>{selectedStore?.address || "555 Innovation Park"}</p>
              <p>
                {selectedStore?.phone || "+91 9876543210"} |{" "}
                {selectedStore?.email || "billing@prismtech.com"}
              </p>
            </div>
          </div>

          {/* Info Bar (Invoice Number and Date) */}
          <div className="prism-info-bar">
            <span>
              Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
            </span>
            <span>
              Issue Date:{" "}
              <strong>
                {moment(invoiceData.createdAt).format("DD-MMM-YYYY")}
              </strong>
            </span>
            <span>
              Due Date:{" "}
              <strong>
                {moment(invoiceData.createdAt)
                  .add(30, "days")
                  .format("DD-MMM-YYYY")}
              </strong>
            </span>
          </div>

          {/* Billing Details Section */}
          <div className="prism-details-section">
            <div className="prism-details-block">
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
            <div className="prism-details-block">
              <div className="label">Issued By</div>
              <div className="value">
                {selectedStore?.storeName || "PRISM TECHNOLOGIES"}
              </div>
              <p>Prepared by: Accounts Dept.</p>
              <p>Reference: {invoiceData.invoiceNumber}</p>
            </div>
          </div>

          {/* Items Table */}
          <InvoiceItemsTable
            items={invoiceData.items}
            className="prism-table"
            columnWidths={{
              product: "40%",
              quantity: "12%",
              unitPrice: "18%",
              gst: "12%",
              total: "18%",
            }}
            renderProductCell={(item) => (
              <>
                <div className="prism-product-name">
                  {item.product?.name || "Unnamed Product"}
                </div>
                {item.product?.sku && (
                  <div className="prism-product-sku">
                    SKU: {item.product.sku}
                  </div>
                )}
              </>
            )}
            renderUnitPriceCell={(item) => formatCurrency(item.price)}
            renderTotalCell={(item) => {
              const total = item.calculatedTotal || item.quantity * item.price;
              return formatCurrency(total);
            }}
          />

          {/* Totals Section */}
          <div className="prism-totals-container">
            <div className="prism-totals">
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
                  <div className="amount" style={{ color: "#e74c3c" }}>
                    -{formatCurrency(invoiceData.totalDiscount)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Final Total Block */}
          <div className="prism-final-total-block">
            <span>TOTAL AMOUNT DUE:</span>
            <span>{formatCurrency(invoiceData.totalAmount)}</span>
          </div>

          {/* Footer */}
          <div className="prism-footer">
            <p>
              Thank you for choosing{" "}
              {selectedStore?.storeName || "Prism Technologies"}.
            </p>
            <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrismTemplate;
