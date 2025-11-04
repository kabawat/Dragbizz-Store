"use client"
import React from 'react';
import moment from 'moment';

const MinimalTemplate = ({ invoiceData, selectedStore }) => {
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
            font-family: 'Helvetica', 'Arial', sans-serif !important;
            font-size: 13px !important;
            line-height: 1.5 !important;
            color: #2c3e50 !important;
            background: white !important;
          }
          
          .minimal-invoice {
            width: 100% !important;
            max-width: 700px !important;
            margin: 0 auto !important;
            padding: 50px !important;
            background: white !important;
          }
          
          .minimal-header {
            text-align: center !important;
            margin-bottom: 50px !important;
          }
          
          .minimal-header h1 {
            font-size: 24px !important;
            font-weight: 300 !important;
            color: #2c3e50 !important;
            margin-bottom: 10px !important;
            letter-spacing: 3px !important;
          }
          
          .minimal-header .invoice-number {
            font-size: 14px !important;
            color: #7f8c8d !important;
            margin-bottom: 20px !important;
          }
          
          .minimal-header .date {
            font-size: 12px !important;
            color: #95a5a6 !important;
          }
          
          .minimal-info {
            margin-bottom: 40px !important;
          }
          
          .minimal-info .row {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 30px !important;
          }
          
          .minimal-info .section {
            width: 45% !important;
          }
          
          .minimal-info .label {
            font-size: 11px !important;
            color: #95a5a6 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            margin-bottom: 8px !important;
          }
          
          .minimal-info .company-name,
          .minimal-info .customer-name {
            font-size: 16px !important;
            font-weight: 400 !important;
            color: #2c3e50 !important;
            margin-bottom: 5px !important;
          }
          
          .minimal-info p {
            font-size: 12px !important;
            color: #7f8c8d !important;
            margin-bottom: 2px !important;
          }
          
          .minimal-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 40px !important;
          }
          
          .minimal-table th {
            padding: 15px 0 !important;
            text-align: left !important;
            font-weight: 400 !important;
            font-size: 11px !important;
            color: #95a5a6 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            border-bottom: 1px solid #ecf0f1 !important;
          }
          
          .minimal-table td {
            padding: 12px 0 !important;
            border-bottom: 1px solid #ecf0f1 !important;
            font-size: 13px !important;
          }
          
          .minimal-table .product-name {
            font-weight: 400 !important;
            color: #2c3e50 !important;
          }
          
          .minimal-table .product-sku {
            font-size: 11px !important;
            color: #95a5a6 !important;
            margin-top: 2px !important;
          }
          
          .minimal-totals {
            margin-top: 30px !important;
            text-align: right !important;
          }
          
          .minimal-totals .total-row {
            display: flex !important;
            justify-content: flex-end !important;
            margin-bottom: 8px !important;
          }
          
          .minimal-totals .total-row .label {
            width: 120px !important;
            text-align: right !important;
            font-size: 12px !important;
            color: #7f8c8d !important;
          }
          
          .minimal-totals .total-row .amount {
            width: 100px !important;
            text-align: right !important;
            font-size: 12px !important;
            color: #2c3e50 !important;
          }
          
          .minimal-totals .total-row.final {
            border-top: 1px solid #bdc3c7 !important;
            padding-top: 10px !important;
            margin-top: 15px !important;
          }
          
          .minimal-totals .total-row.final .label,
          .minimal-totals .total-row.final .amount {
            font-weight: 500 !important;
            font-size: 14px !important;
          }
          
          .minimal-footer {
            margin-top: 60px !important;
            text-align: center !important;
            padding-top: 30px !important;
            border-top: 1px solid #ecf0f1 !important;
          }
          
          .minimal-footer p {
            font-size: 10px !important;
            color: #95a5a6 !important;
            margin-bottom: 3px !important;
            line-height: 1.4 !important;
          }
        }
      `}</style>

      <div className="minimal-invoice">
        {/* Header */}
        <div className="minimal-header">
          <h1>INVOICE</h1>
          <div className="invoice-number">
            {invoiceData.invoiceNumber}
          </div>
          <div className="date">
            {moment(invoiceData.createdAt).format('MMMM DD, YYYY')}
          </div>
        </div>

        {/* Company and Customer Info */}
        <div className="minimal-info">
          <div className="row">
            <div className="section">
              <div className="label">From</div>
              <div className="company-name">
                {selectedStore?.storeName || 'Your Store'}
              </div>
              <p>{selectedStore?.address || '123 Business Street'}</p>
              <p>City, State 12345</p>
              <p>{selectedStore?.phone || '+91 9876543210'}</p>
              <p>{selectedStore?.email || 'info@yourstore.com'}</p>
            </div>
            
            <div className="section">
              <div className="label">Bill To</div>
              <div className="customer-name">
                {invoiceData.customer?.name || 'Walk-in Customer'}
              </div>
              {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
              {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
              {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="minimal-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Description</th>
              <th style={{ width: '15%' }}>Qty</th>
              <th style={{ width: '20%' }}>Rate</th>
              <th style={{ width: '15%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items?.map((item, index) => (
              <tr key={index}>
                <td>
                  <div className="product-name">
                    {item.product?.name || 'Unknown Product'}
                  </div>
                  {item.product?.sku && (
                    <div className="product-sku">
                      SKU: {item.product.sku}
                    </div>
                  )}
                </td>
                <td>{item.quantity}</td>
                <td>₹{item.price?.toLocaleString()}</td>
                <td>₹{(item.quantity * item.price)?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="minimal-totals">
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
              <div className="amount">-₹{invoiceData.totalDiscount?.toLocaleString()}</div>
            </div>
          )}
          <div className="total-row final">
            <div className="label">Total:</div>
            <div className="amount">₹{invoiceData.totalAmount?.toLocaleString()}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="minimal-footer">
          <p>Thank you for your business</p>
          <p>This is a computer-generated invoice and does not require a signature</p>
          <p>Generated on {moment(invoiceData.createdAt).format('MMMM DD, YYYY [at] HH:mm')}</p>
        </div>
      </div>
    </>
  );
};

export default MinimalTemplate;
