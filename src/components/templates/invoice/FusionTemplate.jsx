"use client";
import moment from "moment";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";

const FusionTemplate = ({ invoiceData, selectedStore }) => {
  // A helper function to safely format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const BRAND_COLOR = "#2c3e50"; // Dark Navy/Blue
  const ACCENT_COLOR = "#3498db"; // Bright Blue

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
        body.print-mode-mini .fusion-invoice {
          flex-direction: column !important;
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 4px !important;
        }

        /* ✅ Left panel mini-mode */
        body.print-mode-mini .fusion-left {
          width: 100% !important;
          padding: 8px !important;
          border-radius: 0 !important;
          text-align: center !important;
        }

        body.print-mode-mini .fusion-left h2 {
          font-size: 14px !important;
        }

        body.print-mode-mini .fusion-left p {
          font-size: 10px !important;
        }

        /* ✅ Right panel mini-mode */
        body.print-mode-mini .fusion-right {
          width: 100% !important;
          padding: 6px !important;
        }

        /* ✅ Header */
        body.print-mode-mini .fusion-header h1 {
          font-size: 16px !important;
        }

        body.print-mode-mini .fusion-header .date {
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

        /* Fusion Template Styles */
        .fusion-invoice-body {
          font-family: 'Segoe UI', 'Roboto', sans-serif !important;
          background: #f0f2f5 !important;
          color: #333 !important;
          font-size: 14px !important;
          margin: 0;
          padding: 0;
        }
        .fusion-invoice {
          max-width: 850px;
          margin: 50px auto;
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .fusion-header-section {
            display: flex;
            justify-content: space-between;
            padding: 40px;
            background-color: ${BRAND_COLOR};
            color: white;
        }
        .fusion-branding-block {
            width: 50%;
        }
        .fusion-branding-block h2 {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 5px 0;
            color: white;
        }
        .fusion-branding-block p {
            font-size: 12px;
            margin: 2px 0;
            color: #bdc3c7;
        }
        
        .fusion-invoice-info {
            text-align: right;
            padding-top: 10px;
        }
        .fusion-invoice-info h1 {
            font-size: 32px;
            font-weight: 300;
            margin: 0 0 15px 0;
            color: ${ACCENT_COLOR};
        }
        .fusion-tag {
            display: inline-block;
            background-color: ${ACCENT_COLOR};
            color: white;
            padding: 5px 12px;
            margin-left: 10px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
        }

        .fusion-details-section {
          display: flex;
          justify-content: space-between;
          padding: 30px 40px;
          border-bottom: 2px solid ${BRAND_COLOR};
        }
        .fusion-details-block {
          width: 48%;
        }
        .fusion-details-block .label {
          font-size: 11px;
          text-transform: uppercase;
          color: ${ACCENT_COLOR};
          margin-bottom: 5px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .fusion-details-block .value {
          font-size: 16px;
          font-weight: 600;
          color: ${BRAND_COLOR};
          margin-bottom: 15px;
        }
        .fusion-details-block p {
            font-size: 13px;
            line-height: 1.4;
            color: #555;
            margin: 2px 0;
        }

        .fusion-table {
          width: 100%;
          border-collapse: collapse;
          padding: 0 40px;
          margin-bottom: 30px;
        }
        .fusion-table thead tr {
          border-bottom: 1px solid #ddd;
        }
        .fusion-table th {
          text-align: left;
          font-size: 12px;
          color: ${BRAND_COLOR};
          text-transform: uppercase;
          padding: 15px 0;
        }
        .fusion-table td {
          padding: 12px 0;
          border-bottom: 1px dashed #eee;
          font-size: 13px;
        }
        .fusion-product-name {
          font-weight: 500;
          color: #333;
        }
        .fusion-product-sku {
          font-size: 11px;
          color: #999;
        }

        .fusion-totals-container {
          display: flex;
          justify-content: flex-end;
          padding: 0 40px 0 40px;
        }
        .fusion-totals {
          width: 300px;
          padding: 10px 0;
        }
        .fusion-totals .row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 14px;
        }
        .fusion-totals .label {
          color: #555;
          font-weight: 500;
        }
        .fusion-totals .amount {
          font-weight: 500;
        }

        .fusion-final-bar {
          background: ${ACCENT_COLOR};
          color: white;
          display: flex;
          justify-content: space-between;
          padding: 15px 40px;
          margin-top: 20px;
          font-size: 18px;
          font-weight: 700;
        }
        
        .fusion-footer {
          text-align: center;
          padding: 30px 40px;
          font-size: 11px;
          color: #999;
        }
      `}</style>
      <div className="fusion-invoice-body">
        <div className="fusion-invoice">
          {/* Header Section (Branding and Invoice ID) */}
          <div className="fusion-header-section">
            <div className="fusion-branding-block">
              <h2>{selectedStore?.storeName || "FUSION INC."}</h2>
              <p>{selectedStore?.address || "101 Tech Center, City"}</p>
              <p>{selectedStore?.phone || "+91 9876543210"}</p>
              <p>{selectedStore?.email || "contact@fusioninc.com"}</p>
            </div>
            <div className="fusion-invoice-info">
              <h1>INVOICE</h1>
              <div>
                <span style={{ color: "#bdc3c7" }}>No:</span>
                <span className="fusion-tag">{invoiceData.invoiceNumber}</span>
              </div>
              <div style={{ marginTop: "5px" }}>
                <span style={{ color: "#bdc3c7" }}>Date:</span>
                <span className="fusion-tag">
                  {moment(invoiceData.createdAt).format("DD-MMM-YYYY")}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section (Bill To and Issue By) */}
          <div className="fusion-details-section">
            <div className="fusion-details-block">
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
            <div className="fusion-details-block">
              <div className="label">Issued By</div>
              <div className="value">
                {selectedStore?.storeName || "FUSION INC."}
              </div>
              <p>Prepared by: **Sales Team**</p>
              <p>Reference: **{invoiceData.invoiceNumber}**</p>
            </div>
          </div>

          {/* Items Table */}
          <InvoiceItemsTable
            items={invoiceData.items}
            className="fusion-table"
            columnWidths={{
              product: "40%",
              quantity: "12%",
              unitPrice: "18%",
              gst: "12%",
              total: "18%",
            }}
            renderProductCell={(item) => (
              <>
                <div className="fusion-product-name">
                  {item.product?.name || "Unnamed Product"}
                </div>
                {item.product?.sku && (
                  <div className="fusion-product-sku">
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
          <div className="fusion-totals-container">
            <div className="fusion-totals">
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

          {/* Final Total Bar */}
          <div className="fusion-final-bar">
            <span>TOTAL AMOUNT DUE:</span>
            <span>{formatCurrency(invoiceData.totalAmount)}</span>
          </div>

          {/* Footer */}
          <div className="fusion-footer">
            <p>
              Thank you for your business. We look forward to serving you again!
            </p>
            <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FusionTemplate;
