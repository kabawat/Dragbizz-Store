"use client"
import React from 'react';
import moment from 'moment';

const StructuredTemplate = ({ invoiceData, selectedStore }) => {
  const accentColor = '#2980b9'; // Deep Blue for modern touch

  return (
    <>
      <style jsx global>{`
            @media print {
            body {
              background: white !important;
              -webkit-print-color-adjust: exact; /* For printing background colors/images in Chrome */
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
          }
          body {
            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            color: #34495e !important; /* Darker text */
            background: #f8f9fa !important;
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
          .modern-invoice {
            width: 100% !important;
            max-width: 800px !important;
            margin: 0 auto !important;
            padding: 40px !important;
            background: white !important;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.05) !important;
          }
          
          .modern-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            padding-bottom: 20px !important;
            border-bottom: 3px solid ${accentColor} !important;
            margin-bottom: 30px !important;
          }
          
          .modern-header-left h1 {
            font-size: 32px !important;
            font-weight: 700 !important;
            color: ${accentColor} !important;
            margin: 0 !important;
          }
          
          .modern-header-right {
            text-align: right !important;
          }
          
          .modern-header-right .invoice-detail {
            font-size: 15px !important;
            font-weight: 500 !important;
            margin-bottom: 5px !important;
          }
          
          .modern-header-right .invoice-detail span {
            font-weight: 400 !important;
            color: #7f8c8d !important;
            margin-left: 10px !important;
          }

          .modern-header-right .date {
            font-size: 13px !important;
            color: #95a5a6 !important;
          }
          
          .modern-address-info {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 40px !important;
            padding: 10px 0 !important;
            border-bottom: 1px solid #ecf0f1 !important;
          }
          
          .modern-address-block {
            width: 45% !important;
          }
          
          .modern-address-block h3 {
            font-size: 14px !important;
            color: ${accentColor} !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            border-bottom: 2px solid #ecf0f1 !important;
            padding-bottom: 5px !important;
            margin-bottom: 10px !important;
          }
          
          .modern-address-block p {
            font-size: 13px !important;
            color: #34495e !important;
            margin: 2px 0 !important;
          }
          
          .modern-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 30px !important;
          }
          
          .modern-table th {
            padding: 15px 10px !important;
            text-align: left !important;
            font-weight: 500 !important;
            font-size: 12px !important;
            color: white !important;
            background-color: ${accentColor} !important; /* Blue header */
            text-transform: uppercase !important;
          }
          
          .modern-table td {
            padding: 12px 10px !important;
            border-bottom: 1px solid #ecf0f1 !important;
            font-size: 14px !important;
          }
          
          .modern-table tbody tr:nth-child(even) {
            background-color: #f9f9f9 !important; /* Banded rows */
          }
          
          .modern-table .product-detail {
            font-weight: 500 !important;
          }

          .modern-table .product-sku {
            font-size: 11px !important;
            color: #95a5a6 !important;
            display: block !important;
            margin-top: 2px !important;
          }
          
          .modern-totals-summary {
            display: flex !important;
            justify-content: flex-end !important;
          }

          .modern-totals {
            width: 300px !important; /* Fixed width for totals section */
          }
          
          .modern-totals .total-row {
            display: flex !important;
            justify-content: space-between !important;
            padding: 8px 0 !important;
            font-size: 14px !important;
          }
          
          .modern-totals .total-row .label {
            font-weight: 400 !important;
            color: #34495e !important;
          }
          
          .modern-totals .total-row .amount {
            font-weight: 500 !important;
            color: #34495e !important;
          }
          
          .modern-totals .total-row.final {
            border-top: 2px solid ${accentColor} !important;
            margin-top: 15px !important;
            padding-top: 15px !important;
          }
          
          .modern-totals .total-row.final .label,
          .modern-totals .total-row.final .amount {
            font-weight: 700 !important;
            font-size: 18px !important;
            color: ${accentColor} !important;
          }

          .modern-footer {
            margin-top: 60px !important;
            padding-top: 30px !important;
            border-top: 1px solid #ecf0f1 !important;
            display: flex !important;
            justify-content: space-between !important;
          }

          .modern-footer .terms-notes {
            width: 60% !important;
          }

          .modern-footer .terms-notes h4 {
            font-size: 13px !important;
            color: ${accentColor} !important;
            margin-bottom: 5px !important;
          }

          .modern-footer .terms-notes p {
            font-size: 12px !important;
            color: #7f8c8d !important;
            line-height: 1.5 !important;
          }

          .modern-footer .signature {
            width: 30% !important;
            text-align: right !important;
            border-top: 1px dashed #bdc3c7 !important;
            margin-top: 20px !important;
            padding-top: 5px !important;
            font-size: 11px !important;
            color: #95a5a6 !important;
          }
        }
      `}</style>

      <div className="modern-invoice">
        {/* Header - Invoice Title and Number/Date */}
        <div className="modern-header">
          <div className="modern-header-left">
            <h1>INVOICE</h1>
          </div>
          <div className="modern-header-right">
            <div className="invoice-detail">
              Invoice \#: <span>{invoiceData.invoiceNumber}</span>
            </div>
            <div className="invoice-detail">
              Date: <span>{moment(invoiceData.createdAt).format('MMMM DD, YYYY')}</span>
            </div>
            <div className="invoice-detail">
              Due: <span>{moment(invoiceData.createdAt).add(7, 'days').format('MMMM DD, YYYY')}</span>
            </div>
          </div>
        </div>

        {/* Company and Customer Address Info */}
        <div className="modern-address-info">
          <div className="modern-address-block">
            <h3>Billed From</h3>
            <p style={{ fontWeight: 600 }}>
              {selectedStore?.storeName || 'Your Premium Store'}
            </p>
            <p>{selectedStore?.address || '456 Modern Avenue'}</p>
            <p>City, State 67890</p>
            <p>Phone: {selectedStore?.phone || '+91 9876543210'}</p>
            <p>Email: {selectedStore?.email || 'sales@modernstore.com'}</p>
          </div>

          <div className="modern-address-block">
            <h3>Billed To</h3>
            <p style={{ fontWeight: 600 }}>
              {invoiceData.customer?.name || 'Walk-in Customer'}
            </p>
            {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
            {invoiceData.customer?.phone && <p>Phone: {invoiceData.customer.phone}</p>}
            {invoiceData.customer?.email && <p>Email: {invoiceData.customer.email}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Item Description</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Unit Price</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items?.map((item, index) => (
              <tr key={index}>
                <td>
                  <span className="product-detail">
                    {item.product?.name || 'Unknown Product'}
                  </span>
                  {item.product?.sku && (
                    <span className="product-sku">
                      SKU: {item.product.sku}
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>₹{item.price?.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>₹{(item.quantity * item.price)?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="modern-totals-summary">
            <div className="modern-totals">
            <div className="total-row">
                <div className="label">Subtotal:</div>
                <div className="amount">₹{invoiceData.subtotal?.toLocaleString()}</div>
            </div>
            <div className="total-row">
                <div className="label">GST:</div>
                <div className="amount">₹{invoiceData.gstAmount?.toLocaleString() || '0'}</div>
            </div>
            {invoiceData.totalDiscount > 0 && (
                <div className="total-row">
                <div className="label">Discount:</div>
                <div className="amount" style={{ color: '#e74c3c' }}>-₹{invoiceData.totalDiscount?.toLocaleString()}</div>
                </div>
            )}
            <div className="total-row final">
                <div className="label">Grand Total:</div>
                <div className="amount">₹{invoiceData.totalAmount?.toLocaleString()}</div>
            </div>
            </div>
        </div>


        {/* Footer */}
        <div className="modern-footer">
            <div className="terms-notes">
                <h4>Payment Terms & Notes</h4>
                <p>Payment is due within 7 days of the invoice date. Thank you for choosing our services!</p>
                <p style={{marginTop: '10px'}}>Generated on {moment(invoiceData.createdAt).format('MMMM DD, YYYY [at] HH:mm')}</p>
            </div>
            <div className="signature">
                Authorized Signature
            </div>
        </div>
      </div>
    </>
  );
};

export default StructuredTemplate;