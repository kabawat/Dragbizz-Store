"use client";
import moment from "moment";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";

const ElegantTemplate = ({ invoiceData, selectedStore }) => {
  return (
    <>
      <style jsx global>{`



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
            <div className="elegant-store-name">
              {selectedStore?.storeName || "Your Store"}
            </div>
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
            <p>
              <strong>
                {invoiceData.customer?.name || "Walk-in Customer"}
              </strong>
            </p>
            {invoiceData.customer?.address && (
              <p>{invoiceData.customer.address}</p>
            )}
            {invoiceData.customer?.phone && (
              <p>Phone: {invoiceData.customer.phone}</p>
            )}
            {invoiceData.customer?.email && (
              <p>Email: {invoiceData.customer.email}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <InvoiceItemsTable
          items={invoiceData.items}
          className="elegant-table"
          thClassName="align-center"
          columnWidths={{
            product: "35%",
            quantity: "12%",
            unitPrice: "18%",
            gst: "15%",
            total: "20%",
          }}
          renderQuantityCell={(item) => (
            <span className="align-center">{item.quantity}</span>
          )}
          renderUnitPriceCell={(item) => (
            <span className="align-right">₹{item.price?.toLocaleString()}</span>
          )}
          renderGstCell={(item) => {
            const itemGst = item.calculatedGst || 0;
            return (
              <span className="align-right">
                {itemGst > 0 ? `₹${itemGst.toLocaleString()}` : "-"}
              </span>
            );
          }}
          renderTotalCell={(item) => {
            const total = item.calculatedTotal || item.quantity * item.price;
            return (
              <span className="align-right">₹{total.toLocaleString()}</span>
            );
          }}
        />

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
          <p>
            Generated on{" "}
            {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] hh:mm A")}
          </p>
          <p>
            This is a system-generated invoice and does not require a signature.
          </p>
        </div>
      </div>
    </>
  );
};

export default ElegantTemplate;
