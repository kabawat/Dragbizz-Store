"use client"
import React from 'react';
import moment from 'moment';

const ProfessionalTemplate = ({ invoiceData, selectedStore }) => {
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

                    /* ✅ PROFESSIONAL TEMPLATE — 74MM MINI PRINTER OPTIMIZATION */
          /* ✅ Runs ONLY when print-mode-mini class is active */
          @media print {
            body.print-mode-mini .professional-invoice {
              width: 74mm !important;
              max-width: 74mm !important;
              padding: 4px !important;
              margin: 0 auto !important;
              border: none !important;
              box-shadow: none !important;
            }

            /* ✅ Header compact */
            body.print-mode-mini .professional-header {
              margin-bottom: 10px !important;
              padding-bottom: 6px !important;
              border-bottom: 1px solid #000 !important;
            }

            body.print-mode-mini .professional-header h1 {
              font-size: 16px !important;
              letter-spacing: 1px !important;
              margin-bottom: 3px !important;
            }

            body.print-mode-mini .professional-header .subtitle {
              font-size: 9px !important;
              margin-bottom: 3px !important;
            }

            body.print-mode-mini .professional-header .invoice-number {
              font-size: 10px !important;
            }

            body.print-mode-mini .professional-header .date {
              font-size: 9px !important;
            }

            /* ✅ Info section compressed */
            body.print-mode-mini .professional-info {
              grid-template-columns: 1fr !important;
              gap: 6px !important;
              margin-bottom: 10px !important;
            }

            body.print-mode-mini .professional-info .section {
              padding: 6px !important;
              border-width: 1px !important;
            }

            body.print-mode-mini .professional-info h3 {
              font-size: 10px !important;
              margin-bottom: 4px !important;
              padding-bottom: 3px !important;
            }

            body.print-mode-mini .professional-info p {
              font-size: 9px !important;
              margin-bottom: 3px !important;
              line-height: 1.2 !important;
            }

            /* ✅ Table optimized for thermal printer */
            body.print-mode-mini .professional-table {
              border-width: 1px !important;
              margin-bottom: 12px !important;
            }

            body.print-mode-mini .professional-table th {
              font-size: 8px !important;
              padding: 3px !important;
              letter-spacing: 0 !important;
            }

            body.print-mode-mini .professional-table td {
              font-size: 9px !important;
              padding: 3px !important;
              line-height: 1.1 !important;
            }

            /* ✅ Description wrap fix for 74mm */
            body.print-mode-mini .professional-table .description {
              white-space: normal !important;
              max-width: 42mm !important;
            }

            /* ✅ Totals condensed */
            body.print-mode-mini .professional-totals {
              justify-content: flex-start !important;
              margin-top: 6px !important;
            }

            body.print-mode-mini .professional-totals .totals-box {
              width: 100% !important;
              padding: 6px !important;
              border-width: 1px !important;
            }

            body.print-mode-mini .professional-totals .total-row {
              padding: 4px !important;
              font-size: 10px !important;
            }

            body.print-mode-mini .professional-totals .total-row:last-child {
              font-size: 12px !important;
              padding: 6px !important;
            }

            /* ✅ Footer compact */
            body.print-mode-mini .professional-footer {
              padding: 6px !important;
              margin-top: 8px !important;
            }

            body.print-mode-mini .professional-footer p {
              font-size: 9px !important;
            }

            body.print-mode-mini .professional-footer .signature-area {
              display: none !important; /* thermal me signatures ki jagah nahi hoti */
            }
          }

        
          body {
            font-family: 'Georgia', 'Times New Roman', serif !important;
            font-size: 13px !important;
            line-height: 1.6 !important;
            color: #1a1a1a !important;
            background: white !important;
          }

            body {
          /* Using a classic serif font */
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #4e342e !important; /* Dark brown text */
          background-color: #fcfaf7 !important; /* Light beige background */
        }

         body.print-mode-mini .professional-invoice {
    width: 74mm !important;
    max-width: 74mm !important;
    padding: 6px !important;
    border: none !important; /* thermal usually no border */
    box-shadow: none !important;
  }

  body.print-mode-standard .professional-invoice {
    max-width: 800px !important;
    padding: 40px !important;
  }
          
          .professional-invoice {
            width: 100% !important;
            max-width: 850px !important;
            margin: 0 auto !important;
            padding: 60px 50px !important;
            background: white !important;
            border: 2px solid #1a1a1a !important;
          }
          
          .professional-header {
            text-align: center !important;
            margin-bottom: 50px !important;
            padding-bottom: 30px !important;
            border-bottom: 3px solid #1a1a1a !important;
            position: relative !important;
          }
          
          .professional-header::after {
            content: '' !important;
            position: absolute !important;
            bottom: -3px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 100px !important;
            height: 3px !important;
            background: #1a1a1a !important;
          }
          
          .professional-header h1 {
            font-size: 42px !important;
            font-weight: bold !important;
            color: #1a1a1a !important;
            margin-bottom: 15px !important;
            letter-spacing: 4px !important;
            text-transform: uppercase !important;
          }
          
          .professional-header .subtitle {
            font-size: 14px !important;
            color: #666 !important;
            margin-bottom: 20px !important;
            font-style: italic !important;
          }
          
          .professional-header .invoice-number {
            font-size: 20px !important;
            font-weight: bold !important;
            color: #1a1a1a !important;
            margin-bottom: 10px !important;
          }
          
          .professional-header .date {
            font-size: 14px !important;
            color: #666 !important;
          }
          
          .professional-info {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 60px !important;
            margin-bottom: 50px !important;
          }
          
          .professional-info .section {
            border: 1px solid #ddd !important;
            padding: 25px !important;
            background: #fafafa !important;
          }
          
          .professional-info h3 {
            font-size: 18px !important;
            font-weight: bold !important;
            color: #1a1a1a !important;
            margin-bottom: 20px !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            border-bottom: 2px solid #1a1a1a !important;
            padding-bottom: 8px !important;
          }
          
          .professional-info .company-name,
          .professional-info .customer-name {
            font-size: 20px !important;
            font-weight: bold !important;
            color: #1a1a1a !important;
            margin-bottom: 15px !important;
          }
          
          .professional-info p {
            margin-bottom: 8px !important;
            color: #333 !important;
            font-size: 13px !important;
          }
          
          .professional-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 40px !important;
            border: 2px solid #1a1a1a !important;
          }
          
          .professional-table th {
            background: #1a1a1a !important;
            color: white !important;
            padding: 18px 15px !important;
            text-align: center !important;
            font-weight: bold !important;
            font-size: 14px !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            border: 1px solid #1a1a1a !important;
          }
          
          .professional-table td {
            padding: 15px !important;
            border: 1px solid #1a1a1a !important;
            text-align: center !important;
            font-size: 13px !important;
            vertical-align: middle !important;
          }
          
          .professional-table .description {
            text-align: left !important;
          }
          
          .professional-table .product-name {
            font-weight: bold !important;
            color: #1a1a1a !important;
            margin-bottom: 5px !important;
          }
          
          .professional-table .product-sku {
            font-size: 11px !important;
            color: #666 !important;
            font-style: italic !important;
          }
          
          .professional-totals {
            display: flex !important;
            justify-content: flex-end !important;
            margin-top: 40px !important;
          }
          
          .professional-totals .totals-box {
            width: 400px !important;
            border: 2px solid #1a1a1a !important;
            background: #fafafa !important;
          }
          
          .professional-totals .total-row {
            display: flex !important;
            justify-content: space-between !important;
            padding: 15px 20px !important;
            border-bottom: 1px solid #ddd !important;
            font-size: 14px !important;
          }
          
          .professional-totals .total-row:last-child {
            border-bottom: none !important;
            background: #1a1a1a !important;
            color: white !important;
            font-weight: bold !important;
            font-size: 16px !important;
          }
          
          .professional-footer {
            margin-top: 50px !important;
            text-align: center !important;
            padding: 30px !important;
            border: 1px solid #ddd !important;
            background: #fafafa !important;
          }
          
          .professional-footer .signature-area {
            margin: 30px 0 !important;
            display: flex !important;
            justify-content: space-around !important;
          }
          
          .professional-footer .signature-box {
            text-align: center !important;
            width: 200px !important;
          }
          
          .professional-footer .signature-line {
            border-bottom: 1px solid #1a1a1a !important;
            height: 40px !important;
            margin-bottom: 10px !important;
          }
          
          .professional-footer p {
            margin-bottom: 8px !important;
            color: #666 !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div className="professional-invoice">
        {/* Header */}
        <div className="professional-header">
          <h1>INVOICE</h1>
          <div className="subtitle">Professional Business Document</div>
          <div className="invoice-number">
            {invoiceData.invoiceNumber}
          </div>
          <div className="date">
            Date: {moment(invoiceData.createdAt).format('MMMM DD, YYYY')}
          </div>
        </div>

        {/* Company and Customer Info */}
        <div className="professional-info">
          <div className="section">
            <h3>From</h3>
            <div className="company-name">
              {selectedStore?.storeName || 'Your Store'}
            </div>
            <p>{selectedStore?.address || '123 Business Street'}</p>
            <p>City, State 12345</p>
            <p>Phone: {selectedStore?.phone || '+91 9876543210'}</p>
            <p>Email: {selectedStore?.email || 'info@yourstore.com'}</p>
          </div>
          
          <div className="section">
            <h3>Bill To</h3>
            <div className="customer-name">
              {invoiceData.customer?.name || 'Walk-in Customer'}
            </div>
            {invoiceData.customer?.email && <p>Email: {invoiceData.customer.email}</p>}
            {invoiceData.customer?.phone && <p>Phone: {invoiceData.customer.phone}</p>}
            {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="professional-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Description</th>
              <th style={{ width: '15%' }}>Quantity</th>
              <th style={{ width: '20%' }}>Rate</th>
              <th style={{ width: '25%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items?.map((item, index) => (
              <tr key={index}>
                <td className="description">
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
        <div className="professional-totals">
          <div className="totals-box">
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
            <div className="total-row">
              <span>TOTAL AMOUNT:</span>
              <span>₹{invoiceData.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="professional-footer">
          <div className="signature-area">
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>Authorized Signature</p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>Customer Signature</p>
            </div>
          </div>
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p>Generated on {moment(invoiceData.createdAt).format('MMMM DD, YYYY [at] HH:mm')}</p>
        </div>
      </div>
    </>
  );
};

export default ProfessionalTemplate;
