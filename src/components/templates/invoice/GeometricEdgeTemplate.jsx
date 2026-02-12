"use client";
import moment from "moment";

const GeometricEdgeTemplate = ({ invoiceData, selectedStore }) => {
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const PRIMARY_COLOR = "#800020";
  const TEXT_COLOR = "#36454F";
  const BORDER_COLOR = "#e0e0e0";

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
        /* Geometric Edge Template Styles */
        .geometric-invoice-body {
          font-family: 'Roboto Condensed', 'Arial', sans-serif !important;
          background: #fdfdfd !important;
          color: ${TEXT_COLOR} !important;
          font-size: 13px !important;
          margin: 0;
          padding: 0;
        }
        .geometric-invoice {
          max-width: 720px; 
          margin: 50px auto;
          padding: 30px;
          background: white;
          border: 1px solid ${BORDER_COLOR};
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }

        /* Header */
        .geometric-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 4px solid ${PRIMARY_COLOR};
        }
        .geometric-header h1 {
            color: ${PRIMARY_COLOR};
            font-size: 36px;
            font-weight: 900;
            margin: 0;
            letter-spacing: 2px;
        }

        /* Info Boxes */
        .geometric-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .geometric-box {
            border: 1px solid ${BORDER_COLOR};
            padding: 15px;
            border-radius: 4px;
        }
        .geometric-box .title {
            font-size: 10px;
            text-transform: uppercase;
            color: ${PRIMARY_COLOR};
            font-weight: 700;
            margin-bottom: 8px;
            border-bottom: 1px solid ${BORDER_COLOR};
            padding-bottom: 4px;
        }
        .geometric-box p {
            margin: 3px 0;
            font-size: 13px;
            line-height: 1.4;
        }
        .geometric-value-bold {
            font-weight: 700;
            color: ${TEXT_COLOR};
        }
        .geometric-store-info {
            font-size: 12px;
            color: #777;
        }
        .geometric-store-name {
            font-size: 15px;
            font-weight: 800;
            color: ${TEXT_COLOR};
        }

        /* Table */
        .geometric-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border: 1px solid ${BORDER_COLOR};
        }
        .geometric-table thead tr {
          background-color: #f7f7f7;
          border-bottom: 2px solid ${BORDER_COLOR};
        }
        .geometric-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          padding: 10px 15px;
          color: ${TEXT_COLOR};
        }
        .geometric-table td {
          padding: 10px 15px;
          border-bottom: 1px solid ${BORDER_COLOR};
          font-size: 13px;
        }
        .geometric-table tbody tr:last-child td {
            border-bottom: none;
        }
        .geometric-product-name {
          font-weight: 600;
        }

        /* Totals Section */
        .geometric-totals-area {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        .geometric-totals-table {
          width: 300px;
        }
        .geometric-totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          border-bottom: 1px dashed ${BORDER_COLOR};
        }
        .geometric-totals-table .label {
          color: #555;
        }
        .geometric-totals-table .amount {
          font-weight: 600;
          color: ${TEXT_COLOR};
        }
        .geometric-totals-table .final-row {
          background-color: ${PRIMARY_COLOR};
          color: white;
          padding: 15px 10px;
          margin-top: 10px;
          font-size: 20px;
        }
        .geometric-totals-table .final-row .label,
        .geometric-totals-table .final-row .amount {
            font-weight: 800;
        }

        /* Footer */
        .geometric-signature-box {
            border-top: 1px solid ${BORDER_COLOR};
            padding-top: 20px;
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
        }
        .geometric-signature-line {
            border-top: 1px solid ${TEXT_COLOR};
            width: 150px;
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #777;
        }
      `}</style>
      <div className="geometric-invoice-body">
        <div className="geometric-invoice">
          {/* Header Section */}
          <div className="geometric-header">
            <h1>INVOICE</h1>
            <div className="geometric-meta-info">
              <p>
                Invoice No:{" "}
                <span className="geometric-value-bold">
                  {invoiceData.invoiceNumber}
                </span>
              </p>
              <p>
                Date:{" "}
                <span className="geometric-value-bold">
                  {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                </span>
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="geometric-info-grid">
            {/* Store/Biller Info */}
            <div className="geometric-box">
              <div className="title">Billed By</div>
              <p className="geometric-store-name">
                {selectedStore?.storeName || "Geometric Billing Corp"}
              </p>
              <p className="geometric-store-info">
                {selectedStore?.address || "123 Structure Road, Business Park"}
              </p>
              <p className="geometric-store-info">
                Ph: {selectedStore?.phone || "+91 12345 54321"} | Email:{" "}
                {selectedStore?.email || "billing@geometric.com"}
              </p>
            </div>

            {/* Customer/Bill To Info */}
            <div className="geometric-box">
              <div className="title">Bill To</div>
              <p className="geometric-value-bold">
                {invoiceData.customer?.name || "Walk-in Customer"}
              </p>
              {invoiceData.customer?.email && (
                <p>{invoiceData.customer.email}</p>
              )}
              {invoiceData.customer?.phone && (
                <p>{invoiceData.customer.phone}</p>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="geometric-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Description</th>
                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                <th style={{ width: "20%", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="geometric-product-name">
                      {item.product?.name || "Unnamed Item"}
                    </div>
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

          {/* Totals Area */}
          <div className="geometric-totals-area">
            <div className="geometric-totals-table">
              <div className="row">
                <div className="label">Subtotal:</div>
                <div className="amount">
                  {formatCurrency(invoiceData.subtotal)}
                </div>
              </div>
              <div className="row">
                <div className="label">Tax (GST):</div>
                <div className="amount">
                  {formatCurrency(invoiceData.gstAmount)}
                </div>
              </div>
              {invoiceData.totalDiscount > 0 && (
                <div
                  className="row"
                  style={{ borderBottom: "1px dashed #c0392b" }}
                >
                  <div className="label">Discount:</div>
                  <div className="amount" style={{ color: "#c0392b" }}>
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

          {/* Footer & Signature */}
          <div className="geometric-signature-box">
            <p>
              Thank you for choosing Geometric Billing. All amounts are in INR.
            </p>
            <div className="geometric-signature-line">Authorized Signature</div>
          </div>
        </div>
      </div>
    </>
  );
};
export default GeometricEdgeTemplate;
