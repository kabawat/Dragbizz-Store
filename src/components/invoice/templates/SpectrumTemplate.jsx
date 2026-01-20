"use client";
import React from "react";
import moment from "moment";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";

const SpectrumTemplate = ({ invoiceData, selectedStore }) => {
  // A helper function to safely format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const GRADIENT_START = "#4e54c8"; // Deep Blue
  const GRADIENT_END = "#8f94fb"; // Light Violet
  const DARK_HEADER_COLOR = "#34495e"; // Dark slate gray for table

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
        body.print-mode-mini .spectrum-invoice {
          flex-direction: column !important;
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 4px !important;
        }

        /* ✅ Left panel mini-mode */
        body.print-mode-mini .spectrum-left {
          width: 100% !important;
          padding: 8px !important;
          border-radius: 0 !important;
          text-align: center !important;
        }

        body.print-mode-mini .spectrum-left h2 {
          font-size: 14px !important;
        }

        body.print-mode-mini .spectrum-left p {
          font-size: 10px !important;
        }

        /* ✅ Right panel mini-mode */
        body.print-mode-mini .spectrum-right {
          width: 100% !important;
          padding: 6px !important;
        }

        /* ✅ Header */
        body.print-mode-mini .spectrum-header h1 {
          font-size: 16px !important;
        }

        body.print-mode-mini .spectrum-header .date {
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

        /* Spectrum Template Styles */
        .spectrum-invoice-body {
          font-family: 'Lato', 'Helvetica', sans-serif !important;
          background: #fcfcfc !important;
          color: #333 !important;
          font-size: 14px !important;
          margin: 0;
          padding: 0;
        }
        .spectrum-invoice {
          max-width: 800px;
          margin: 50px auto;
          padding: 40px;
          background: white;
          border-top: 5px solid ${GRADIENT_START}; /* Top border fallback */
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
        }

        /* Use a slight gradient for the main title/brand area */
        .spectrum-branding h1 {
            background-image: linear-gradient(to right, ${GRADIENT_START}, ${GRADIENT_END});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 38px;
            font-weight: 900;
            margin: 0;
            line-height: 1;
        }
        
        .spectrum-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .spectrum-store-info {
            padding-top: 10px;
            font-size: 13px;
            color: #555;
        }
        .spectrum-store-info p {
            margin: 2px 0;
        }
        
        .spectrum-details-block {
            background-color: #f7f9fc;
            padding: 20px;
            border-radius: 6px;
            width: 45%;
            text-align: right;
        }
        .spectrum-details-block .label {
            font-size: 11px;
            text-transform: uppercase;
            color: ${GRADIENT_START};
            margin-bottom: 5px;
            font-weight: 700;
        }
        .spectrum-details-block .value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        .spectrum-customer-info {
            font-size: 13px;
            color: #555;
            margin-top: 15px;
            border-top: 1px dashed #ddd;
            padding-top: 10px;
        }
        .spectrum-customer-info .label {
            color: #777;
            text-align: right;
            margin-bottom: 0;
            font-weight: 500;
        }
        .spectrum-customer-info .value {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 2px;
        }

        .spectrum-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border: 1px solid #eee;
        }
        .spectrum-table thead tr {
          background-color: ${DARK_HEADER_COLOR};
          color: white;
        }
        .spectrum-table th {
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          padding: 12px 15px;
        }
        .spectrum-table td {
          padding: 10px 15px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .spectrum-table tbody tr:last-child td {
            border-bottom: none;
        }
        .spectrum-product-name {
          font-weight: 600;
          color: #333;
        }
        .spectrum-product-sku {
          font-size: 11px;
          color: #999;
        }

        .spectrum-totals-container {
          display: flex;
          justify-content: flex-end;
          padding-right: 0px;
        }
        .spectrum-totals {
          width: 300px;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 15px;
        }
        .spectrum-totals .row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 14px;
        }
        .spectrum-totals .label {
          color: #555;
        }
        .spectrum-totals .amount {
          font-weight: 500;
        }
        .spectrum-totals .final-row {
          border-top: 2px solid ${GRADIENT_START};
          padding-top: 10px;
          margin-top: 10px;
          font-size: 18px;
        }
        .spectrum-totals .final-row .label,
        .spectrum-totals .final-row .amount {
            font-weight: 800;
            color: ${GRADIENT_START};
        }
        
        .spectrum-footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 11px;
          color: #999;
        }
      `}</style>
      <div className="spectrum-invoice-body">
        <div className="spectrum-invoice">
          {/* Header Section: Branding Left, Details Right */}
          <div className="spectrum-header">
            <div className="spectrum-branding">
              <h1>INVOICE</h1>
              <div className="spectrum-store-info">
                <p style={{ fontWeight: 700, color: DARK_HEADER_COLOR }}>
                  {selectedStore?.storeName || "Spectrum Solutions"}
                </p>
                <p>{selectedStore?.address || "404 Innovation Street"}</p>
                <p>
                  {selectedStore?.phone || "+91 9876543210"} |{" "}
                  {selectedStore?.email || "info@spectrum.com"}
                </p>
              </div>
            </div>

            {/* Key Invoice Details */}
            <div className="spectrum-details-block">
              <div className="label">Invoice Number</div>
              <div className="value">{invoiceData.invoiceNumber}</div>
              <div className="label">Date Issued</div>
              <div className="value">
                {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
              </div>

              <div className="spectrum-customer-info">
                <div className="label">Bill To:</div>
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
            </div>
          </div>

          {/* Items Table */}
          <InvoiceItemsTable
            items={invoiceData.items}
            className="spectrum-table"
            columnWidths={{
              product: "40%",
              quantity: "12%",
              unitPrice: "18%",
              gst: "12%",
              total: "18%",
            }}
            renderProductCell={(item) => (
              <>
                <div className="spectrum-product-name">
                  {item.product?.name || "Unnamed Product"}
                </div>
                {item.product?.sku && (
                  <div className="spectrum-product-sku">
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
          <div className="spectrum-totals-container">
            <div className="spectrum-totals">
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
              <div className="row final-row">
                <div className="label">TOTAL DUE:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.totalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="spectrum-footer">
            <p>Thank you for your business. Payment due within 7 days.</p>
            <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpectrumTemplate;
