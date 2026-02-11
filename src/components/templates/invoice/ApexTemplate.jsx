"use client";
import moment from "moment";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";

const ApexTemplate = ({ invoiceData, selectedStore }) => {
  // A helper function to safely format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const ACCENT_COLOR = "#e74c3c"; // Deep Red for a bold, corporate look

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
        body.print-mode-mini .apex-invoice {
          flex-direction: column !important;
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 4px !important;
        }

        /* ✅ Left panel mini-mode */
        body.print-mode-mini .apex-left {
          width: 100% !important;
          padding: 8px !important;
          border-radius: 0 !important;
          text-align: center !important;
        }

        body.print-mode-mini .apex-left h2 {
          font-size: 14px !important;
        }

        body.print-mode-mini .apex-left p {
          font-size: 10px !important;
        }

        /* ✅ Right panel mini-mode */
        body.print-mode-mini .apex-right {
          width: 100% !important;
          padding: 6px !important;
        }

        /* ✅ Header */
        body.print-mode-mini .apex-header h1 {
          font-size: 16px !important;
        }

        body.print-mode-mini .apex-header .date {
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

        /* Apex Template Styles */
        .apex-invoice-body {
          font-family: 'Montserrat', 'Arial', sans-serif !important;
          background: #f4f4f4 !important;
          color: #34495e !important;
          font-size: 14px !important;
          margin: 0;
          padding: 0;
        }
        .apex-invoice {
          max-width: 750px;
          margin: 40px auto;
          background: white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .apex-header {
          display: flex;
          justify-content: space-between;
          padding: 30px 40px;
          background-color: #34495e; /* Dark Blue/Gray Background */
          color: white;
        }
        .apex-header h1 {
          font-size: 30px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 3px;
          border-bottom: 2px solid ${ACCENT_COLOR};
          padding-bottom: 5px;
        }
        .apex-store-info p {
            font-size: 12px;
            margin: 2px 0;
            color: #bdc3c7;
            text-align: right;
        }
        .apex-details-section {
          display: flex;
          justify-content: space-between;
          padding: 20px 40px 30px;
        }
        .apex-info-block {
          width: 45%;
        }
        .apex-info-block .label {
          font-size: 11px;
          text-transform: uppercase;
          color: #95a5a6;
          margin-bottom: 5px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .apex-info-block .value {
          font-size: 16px;
          font-weight: 700;
          color: #34495e;
          margin-bottom: 10px;
        }
        .apex-info-block p {
          font-size: 13px;
          line-height: 1.4;
          color: #555;
          margin: 2px 0;
        }
        .apex-info-block.right-align {
            text-align: right;
        }
        .apex-table {
          width: 100%;
          border-collapse: collapse;
          border-top: 1px solid #ecf0f1;
        }
        .apex-table th {
          text-align: left;
          font-size: 12px;
          color: white;
          background: #34495e;
          text-transform: uppercase;
          padding: 12px 40px;
        }
        .apex-table td {
          padding: 12px 40px;
          font-size: 13px;
        }
        .apex-table tbody tr:nth-child(even) {
            background-color: #f8f9fa; /* Zebra stripes */
        }
        .apex-product-name {
          font-weight: 600;
          color: #34495e;
        }
        .apex-product-sku {
          font-size: 11px;
          color: #95a5a6;
        }
        .apex-totals-section {
          padding: 20px 40px;
          display: flex;
          justify-content: flex-end;
        }
        .apex-totals {
          width: 280px;
        }
        .apex-totals .row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        .apex-totals .label {
          color: #555;
          font-weight: 500;
        }
        .apex-totals .amount {
          font-weight: 500;
        }
        .apex-final-bar {
          background: ${ACCENT_COLOR};
          color: white;
          display: flex;
          justify-content: space-between;
          padding: 15px 40px;
          font-size: 18px;
          font-weight: 700;
        }
        .apex-footer {
          text-align: center;
          padding: 30px 40px;
          border-top: 1px solid #ecf0f1;
          font-size: 11px;
          color: #95a5a6;
        }
      `}</style>
      <div className="apex-invoice-body">
        <div className="apex-invoice">
          {/* Header */}
          <div className="apex-header">
            <div>
              <h1>INVOICE</h1>
              <p
                style={{
                  fontSize: "14px",
                  marginTop: "10px",
                  color: "#bdc3c7",
                }}
              >
                Date: {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
              </p>
            </div>
            <div className="apex-store-info">
              <h2
                style={{ fontSize: "20px", margin: "0", color: ACCENT_COLOR }}
              >
                {selectedStore?.storeName || "Your Store"}
              </h2>
              <p>{selectedStore?.address || "123 Corporate Tower"}</p>
              <p>{selectedStore?.phone || "+91 9876543210"}</p>
              <p>{selectedStore?.email || "info@yourstore.com"}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="apex-details-section">
            <div className="apex-info-block">
              <div className="label">Invoice Number</div>
              <div className="value">{invoiceData.invoiceNumber}</div>
              <div className="label">Bill To</div>
              <p className="value">
                {invoiceData.customer?.name || "Walk-in Customer"}
              </p>
              {invoiceData.customer?.email && (
                <p>{invoiceData.customer.email}</p>
              )}
              {invoiceData.customer?.phone && (
                <p>{invoiceData.customer.phone}</p>
              )}
            </div>
            <div className="apex-info-block right-align">
              <div className="label">Payment Status</div>
              <div className="value" style={{ color: ACCENT_COLOR }}>
                {/* Assuming a payment status is available or can be determined */}
                PAID
              </div>
            </div>
          </div>

          {/* Items Table */}
          <InvoiceItemsTable
            items={invoiceData.items}
            className="apex-table"
            columnWidths={{
              product: "40%",
              quantity: "12%",
              unitPrice: "18%",
              gst: "12%",
              total: "18%",
            }}
            renderProductCell={(item) => (
              <>
                <div className="apex-product-name">
                  {item.product?.name || "Unnamed Product"}
                </div>
                {item.product?.sku && (
                  <div className="apex-product-sku">
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
          <div className="apex-totals-section">
            <div className="apex-totals">
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
                  <div
                    className="amount"
                    style={{ color: ACCENT_COLOR, fontWeight: 700 }}
                  >
                    -{formatCurrency(invoiceData.totalDiscount)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Final Total Bar */}
          <div className="apex-final-bar">
            <span>TOTAL AMOUNT DUE:</span>
            <span>{formatCurrency(invoiceData.totalAmount)}</span>
          </div>

          {/* Footer */}
          <div className="apex-footer">
            <p>
              Thank you for your business. We appreciate your prompt payment.
            </p>
            <p>
              This document is computer-generated and requires no signature.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApexTemplate;
