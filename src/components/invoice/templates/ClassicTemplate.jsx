"use client"
import React from 'react';
import moment from 'moment';

const ClassicTemplate = ({ invoiceData, selectedStore }) => {
  return (
    <>
      <style jsx global>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', serif !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            color: black !important;
            background: white !important;
          }
          
          .classic-invoice {
            width: 100% !important;
            max-width: 800px !important;
            margin: 0 auto !important;
            padding: 40px !important;
            background: white !important;
          }
          
          .classic-header {
            text-align: center !important;
            margin-bottom: 40px !important;
            border-bottom: 3px double #000 !important;
            padding-bottom: 20px !important;
          }
          
          .classic-header h1 {
            font-size: 32px !important;
            font-weight: bold !important;
            margin-bottom: 10px !important;
            letter-spacing: 2px !important;
          }
          
          .classic-header .invoice-number {
            font-size: 18px !important;
            font-weight: bold !important;
            margin-top: 15px !important;
          }
          
          .classic-info {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 30px !important;
          }
          
          .classic-info .company-info,
          .classic-info .customer-info {
            width: 45% !important;
          }
          
          .classic-info h3 {
            font-size: 16px !important;
            font-weight: bold !important;
            margin-bottom: 10px !important;
            border-bottom: 1px solid #000 !important;
            padding-bottom: 5px !important;
          }
          
          .classic-info p {
            margin-bottom: 5px !important;
            font-size: 12px !important;
          }
          
          .classic-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 30px !important;
          }
          
          .classic-table th {
            background-color: #f5f5f5 !important;
            border: 2px solid #000 !important;
            padding: 12px 8px !important;
            text-align: center !important;
            font-weight: bold !important;
            font-size: 13px !important;
          }
          
          .classic-table td {
            border: 1px solid #000 !important;
            padding: 10px 8px !important;
            text-align: center !important;
            font-size: 12px !important;
          }
          
          .classic-table .description {
            text-align: left !important;
          }
          
          .classic-totals {
            width: 300px !important;
            margin-left: auto !important;
            margin-top: 20px !important;
          }
          
          .classic-totals .total-row {
            display: flex !important;
            justify-content: space-between !important;
            padding: 8px 0 !important;
            border-bottom: 1px solid #000 !important;
          }
          
          .classic-totals .total-row.final {
            border-top: 2px solid #000 !important;
            border-bottom: 2px solid #000 !important;
            font-weight: bold !important;
            font-size: 14px !important;
          }
          
          .classic-footer {
            margin-top: 50px !important;
            text-align: center !important;
            border-top: 1px solid #000 !important;
            padding-top: 20px !important;
          }
          
          .classic-footer p {
            font-size: 10px !important;
            margin-bottom: 5px !important;
          }
        }
      `}</style>

      <div className="classic-invoice">
        {/* Header */}
        <div className="classic-header">
          <h1>INVOICE</h1>
          <div className="invoice-number">
            {invoiceData.invoiceNumber}
          </div>
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            Date: {moment(invoiceData.createdAt).format('MMMM DD, YYYY')}
          </div>
        </div>

        {/* Company and Customer Info */}
        <div className="classic-info">
          <div className="company-info">
            <h3>FROM:</h3>
            <p style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {selectedStore?.storeName || 'Your Store'}
            </p>
            <p>{selectedStore?.address || '123 Business Street'}</p>
            <p>City, State 12345</p>
            <p>Phone: {selectedStore?.phone || '+91 9876543210'}</p>
            <p>Email: {selectedStore?.email || 'info@yourstore.com'}</p>
          </div>
          
          <div className="customer-info">
            <h3>BILL TO:</h3>
            <p style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {invoiceData.customer?.name || 'Walk-in Customer'}
            </p>
            {invoiceData.customer?.email && <p>Email: {invoiceData.customer.email}</p>}
            {invoiceData.customer?.phone && <p>Phone: {invoiceData.customer.phone}</p>}
            {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="classic-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Description</th>
              <th style={{ width: '15%' }}>Qty</th>
              <th style={{ width: '20%' }}>Rate</th>
              <th style={{ width: '25%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items?.map((item, index) => (
              <tr key={index}>
                <td className="description">
                  <div style={{ fontWeight: 'bold' }}>
                    {item.product?.name || 'Unknown Product'}
                  </div>
                  {item.product?.sku && (
                    <div style={{ fontSize: '10px', color: '#666' }}>
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
        <div className="classic-totals">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>₹{invoiceData.subtotal?.toLocaleString()}</span>
          </div>
          <div className="total-row">
            <span>GST:</span>
            <span>₹{invoiceData.gstAmount?.toLocaleString() || '0'}</span>
          </div>
          {invoiceData.totalDiscount > 0 && (
            <div className="total-row">
              <span>Discount:</span>
              <span>-₹{invoiceData.totalDiscount?.toLocaleString()}</span>
            </div>
          )}
          <div className="total-row final">
            <span>TOTAL:</span>
            <span>₹{invoiceData.totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="classic-footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p>Generated on {moment(invoiceData.createdAt).format('MMMM DD, YYYY [at] HH:mm')}</p>
        </div>
      </div>
    </>
  );
};

export default ClassicTemplate;
