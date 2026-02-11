"use client";
import moment from "moment";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";

const ModernTemplate = ({ invoiceData, selectedStore }) => {
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
           font-family: 'Arial', sans-serif !important;
           font-size: 14px !important;
           line-height: 1.6 !important;
           color: #333 !important;
           background: white !important;
           }

          body.print-mode-mini .modern-invoice {
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 6px !important;
          border: none !important;
          box-shadow: none !important;
      }
            body.print-mode-standard .modern-invoice {
                max-width: 800px !important;
                padding: 40px !important;
            }

              /* ✅ MODERN TEMPLATE – PERFECT 74MM MINI PRINTER STYLES */
        @media print {
          /* ✅ 74mm wrapper */
          body.print-mode-mini .modern-invoice {
            width: 74mm !important;
            max-width: 74mm !important;
            padding: 4px !important;
            margin: 0 auto !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* ✅ Header compress */
          body.print-mode-mini .modern-header {
            padding-bottom: 6px !important;
            margin-bottom: 10px !important;
            border-bottom-width: 1px !important;
          }

          body.print-mode-mini .modern-header h1 {
            font-size: 16px !important;
            margin-bottom: 4px !important;
          }

          body.print-mode-mini .modern-header .invoice-number {
            font-size: 10px !important;
          }

          body.print-mode-mini .modern-header .date {
            font-size: 9px !important;
          }

          /* ✅ Info section collapse */
          body.print-mode-mini .modern-info {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
            margin-bottom: 10px !important;
          }

          body.print-mode-mini .modern-info .section {
            padding: 6px !important;
          }

          body.print-mode-mini .modern-info h3 {
            font-size: 10px !important;
            margin-bottom: 4px !important;
            padding-bottom: 2px !important;
          }

          body.print-mode-mini .modern-info  .company-name,
          body.print-mode-mini .modern-info .customer-name {
            font-size: 15px !important;
            margin-bottom: 5px 0 !important;
          }
          body.print-mode-mini .modern-info p {
            font-size: 9px !important;
            margin: 2px 0 !important;
          }

          /* ✅ Table perfect-fit for thermal */
          body.print-mode-mini .modern-table {
            margin-bottom: 12px !important;
            box-shadow: none !important;
          }

          body.print-mode-mini .modern-table th {
            font-size: 8px !important;
            padding: 3px !important;
          }

          body.print-mode-mini .modern-table td {
            font-size: 9px !important;
            padding: 3px !important;
            line-height: 1.1 !important;
          }

          /* ✅ Product name wrap fix */
          body.print-mode-mini .modern-table .product-name {
            white-space: normal !important;
            display: block !important;
            max-width: 42mm !important;
          }

          /* ✅ SKU smaller */
          body.print-mode-mini .modern-table .product-sku {
            font-size: 8px !important;
            margin-top: 1px !important;
          }

          /* ✅ Totals section shrink */
          body.print-mode-mini .modern-totals {
            justify-content: flex-start !important;
            margin-top: 6px !important;
          }

          body.print-mode-mini .modern-totals .totals-box {
            width: 100% !important;
            padding: 6px !important;
            border-width: 1px !important;
          }

          body.print-mode-mini .modern-totals .total-row {
            padding: 4px 0 !important;
            font-size: 10px !important;
          }

          /* ✅ Final (Grand Total) clean thermal look */
          body.print-mode-mini .modern-totals .total-row:last-child {
            font-size: 12px !important;
            padding: 6px 0 !important;
            border-top-width: 2px !important;
          }

          /* ✅ Footer small */
          body.print-mode-mini .modern-footer {
            margin-top: 8px !important;
            padding: 6px !important;
          }

          body.print-mode-mini .modern-footer p {
            font-size: 9px !important;
          }
        }


          .modern-invoice {
            width: 100% !important;
            max-width: 900px !important;
            margin: 0 auto !important;
            padding: 30px !important;
            background: white !important;
          }
          
          .modern-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            margin-bottom: 40px !important;
            padding-bottom: 20px !important;
            border-bottom: 4px solid #007bff !important;
          }
          
          .modern-header .left {
            flex: 1 !important;
          }
          
          .modern-header .right {
            text-align: right !important;
            flex: 1 !important;
          }
          
          .modern-header h1 {
            font-size: 36px !important;
            font-weight: 300 !important;
            color: #007bff !important;
            margin-bottom: 10px !important;
            letter-spacing: 1px !important;
          }
          
          .modern-header .invoice-number {
            font-size: 20px !important;
            font-weight: 600 !important;
            color: #333 !important;
            margin-bottom: 10px !important;
          }
          
          .modern-header .date {
            font-size: 14px !important;
            color: #666 !important;
          }
          
          .modern-info {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
            margin-bottom: 40px !important;
          }
          
          .modern-info .section {
            background: #f8f9fa !important;
            padding: 20px !important;
            border-radius: 8px !important;
            border-left: 4px solid #007bff !important;
          }
          
          .modern-info h3 {
            font-size: 16px !important;
            font-weight: 600 !important;
            color: #007bff !important;
            margin-bottom: 15px !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
          }
          
          .modern-info .company-name,
          .modern-info .customer-name {
            font-size: 18px !important;
            font-weight: 600 !important;
            color: #333 !important;
            margin-bottom: 10px !important;
          }
          
          .modern-info p {
            margin-bottom: 5px !important;
            color: #666 !important;
          }
          
          .modern-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 30px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          }
          
          .modern-table th {
            background: linear-gradient(135deg, #007bff, #0056b3) !important;
            color: white !important;
            padding: 15px 12px !important;
            text-align: left !important;
            font-weight: 600 !important;
            font-size: 13px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }
          
          .modern-table td {
            padding: 12px !important;
            border-bottom: 1px solid #e9ecef !important;
            font-size: 13px !important;
          }
          
          .modern-table tr:nth-child(even) {
            background-color: #f8f9fa !important;
          }
          
          .modern-table .product-name {
            font-weight: 600 !important;
            color: #333 !important;
          }
          
          .modern-table .product-sku {
            font-size: 11px !important;
            color: #666 !important;
            margin-top: 2px !important;
          }
          
          .modern-totals {
            display: flex !important;
            justify-content: flex-end !important;
            margin-top: 30px !important;
          }
          
          .modern-totals .totals-box {
            width: 350px !important;
            background: #f8f9fa !important;
            padding: 20px !important;
            border-radius: 8px !important;
            border: 1px solid #e9ecef !important;
          }
          
          .modern-totals .total-row {
            display: flex !important;
            justify-content: space-between !important;
            padding: 8px 0 !important;
            border-bottom: 1px solid #e9ecef !important;
          }
          
          .modern-totals .total-row:last-child {
            border-bottom: none !important;
            border-top: 2px solid #007bff !important;
            margin-top: 10px !important;
            padding-top: 15px !important;
            font-weight: 600 !important;
            font-size: 16px !important;
            color: #007bff !important;
          }
          
          .modern-footer {
            margin-top: 40px !important;
            text-align: center !important;
            padding: 20px !important;
            background: #f8f9fa !important;
            border-radius: 8px !important;
          }
          
          .modern-footer p {
            margin-bottom: 5px !important;
            color: #666 !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div className="modern-invoice">
        {/* Header */}
        <div className="modern-header">
          <div className="left">
            <h1>INVOICE</h1>
            <div style={{ color: "#666", fontSize: "14px" }}>
              Professional Business Invoice
            </div>
          </div>
          <div className="right">
            <div className="invoice-number">{invoiceData.invoiceNumber}</div>
            <div className="date">
              {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
            </div>
          </div>
        </div>

        {/* Company and Customer Info */}
        <div className="modern-info">
          <div className="section">
            <h3>From</h3>
            <div className="company-name">
              {selectedStore?.storeName || "Your Store"}
            </div>
            <p>{selectedStore?.address || "123 Business Street"}</p>
            <p>City, State 12345</p>
            <p>Phone: {selectedStore?.phone || "+91 9876543210"}</p>
            <p>Email: {selectedStore?.email || "info@yourstore.com"}</p>
          </div>

          <div className="section">
            <h3>Bill To</h3>
            <div className="customer-name">
              {invoiceData.customer?.name || "Walk-in Customer"}
            </div>
            {invoiceData.customer?.email && (
              <p>Email: {invoiceData.customer.email}</p>
            )}
            {invoiceData.customer?.phone && (
              <p>Phone: {invoiceData.customer.phone}</p>
            )}
            {invoiceData.customer?.address && (
              <p>{invoiceData.customer.address}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <InvoiceItemsTable
          items={invoiceData.items}
          className="modern-table"
          renderProductCell={(item) => (
            <>
              <div className="product-name">
                {item.product?.name || "Unknown Product"}
              </div>
              {item.product?.sku && (
                <div className="product-sku">SKU: {item.product.sku}</div>
              )}
              {item.gstRate && item.gstRate > 0 && (
                <div
                  className="product-sku"
                  style={{ fontSize: "10px", color: "#666" }}
                >
                  GST: {item.gstRate}%
                </div>
              )}
            </>
          )}
          renderTotalCell={(item) => {
            const total = item.calculatedTotal || item.quantity * item.price;
            return `₹${total.toLocaleString()}`;
          }}
        />

        {/* Totals */}
        <div className="modern-totals">
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
            <div className="total-row">
              <span>TOTAL:</span>
              <span>₹{invoiceData.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modern-footer">
          <p>Thank you for your business!</p>
          <p>
            This is a computer-generated invoice and does not require a
            signature.
          </p>
          <p>
            Generated on{" "}
            {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
          </p>
        </div>
      </div>
    </>
  );
};

export default ModernTemplate;
