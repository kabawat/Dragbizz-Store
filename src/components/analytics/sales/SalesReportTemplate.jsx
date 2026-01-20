"use client";
import React from 'react';
import moment from 'moment';

const SalesReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const counts = analyticsData?.counts || {
    totalInvoices: 0,
    releasedInvoices: 0,
    draftInvoices: 0,
    cancelledInvoices: 0
  };

  const amounts = analyticsData?.amounts || {
    totalAmount: 0,
    averageOrderValue: 0
  };

  const today = analyticsData?.today || {
    totalInvoices: 0,
    releasedInvoices: 0
  };

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
          .sales-report {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
        }

        body {
          font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif !important;
          font-size: 13px !important;
          line-height: 1.6 !important;
          color: #333333 !important;
          background-color: #f8faff !important;
        }

        body.print-mode-mini .sales-report {
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 6px !important;
          border: none !important;
          box-shadow: none !important;
        }

        body.print-mode-standard .sales-report {
          max-width: 800px !important;
          padding: 40px !important;
        }

        .sales-report {
          max-width: 850px !important;
          margin: 30px auto !important;
          padding: 30px !important;
          background: #ffffff !important;
          box-shadow: 0 8px 30px rgba(0, 50, 100, 0.08) !important;
          border-radius: 8px !important;
          border: none !important;
        }

        .sales-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 25px 0 !important;
          margin-bottom: 30px !important;
          background: linear-gradient(90deg, #f0f8ff 0%, #ffffff 100%) !important;
          border-bottom: 3px solid #6699ff !important;
        }
        
        .sales-header > div {
          padding: 0 15px !important;
        }

        .sales-header .store-name {
          font-size: 24px !important;
          font-weight: 300 !important;
          color: #1e3a8a !important;
          letter-spacing: 1px !important;
          text-transform: uppercase !important;
        }

        .sales-header .store-details p {
          font-size: 12px !important;
          color: #555555 !important;
          margin-top: 5px !important;
          line-height: 1.4 !important;
        }

        .sales-header .report-title-box {
          text-align: right !important;
        }

        .sales-header .report-title-box h1 {
          font-size: 30px !important;
          font-weight: 700 !important;
          color: #3b82f6 !important;
          margin: 0 !important;
          letter-spacing: 3px !important;
          text-transform: uppercase !important;
        }

        .sales-header .report-title-box p {
          font-size: 14px !important;
          color: #666666 !important;
          margin: 4px 0 !important;
        }

        .sales-summary {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 20px !important;
          margin-bottom: 30px !important;
        }

        .sales-summary .summary-card {
          padding: 20px !important;
          background: #fdfdff !important;
          border: none !important;
          border-radius: 4px !important;
          box-shadow: inset 0 0 5px rgba(150, 200, 255, 0.1) !important;
        }
        
        .sales-summary .summary-card h3 {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #3b82f6 !important;
          margin-bottom: 10px !important;
          text-transform: uppercase !important;
          border-bottom: 1px solid #e0e7ff !important;
          padding-bottom: 12px !important;
        }
        
        .sales-summary .summary-card .value {
          font-size: 24px !important;
          font-weight: 700 !important;
          color: #1e3a8a !important;
          margin: 10px 0 !important;
        }

        .sales-summary .summary-card .change {
          font-size: 12px !important;
          color: #666666 !important;
          margin-top: 5px !important;
        }

        .sales-details {
          margin-bottom: 30px !important;
        }

        .sales-details h3 {
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #1e3a8a !important;
          margin-bottom: 15px !important;
          text-transform: uppercase !important;
          border-bottom: 2px solid #93c5fd !important;
          padding-bottom: 15px !important;
        }

        .sales-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-bottom: 20px !important;
        }

        .sales-table thead th {
          background: #e0f2ff !important;
          color: #1e3a8a !important;
          padding: 12px 15px !important;
          text-align: left !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          border-bottom: 2px solid #93c5fd !important;
        }
        
        .sales-table td {
          padding: 10px 15px !important;
          border-bottom: 1px solid #f0f0f0 !important;
          font-size: 13px !important;
          color: #444444 !important;
        }

        .sales-table .label {
          font-weight: 500 !important;
          color: #333333 !important;
        }

        .sales-table .amount {
          text-align: right !important;
          font-weight: 600 !important;
          color: #1e3a8a !important;
        }
        
        .sales-table tr:last-child td {
          border-bottom: 2px solid #f0f0f0 !important;
        }

        .sales-footer {
          margin-top: 40px !important;
          text-align: center !important;
          padding-top: 20px !important;
          border-top: 1px solid #e0e7ff !important;
          font-size: 11px !important;
          color: #888888 !important;
        }

        body.print-mode-mini .sales-summary {
          grid-template-columns: 1fr !important;
        }

        body.print-mode-mini .sales-header {
          flex-direction: column-reverse !important;
          align-items: center !important;
          text-align: center !important;
        }

        body.print-mode-mini .sales-header .report-title-box {
          text-align: center !important;
        }

        body.print-mode-mini .sales-table thead th,
        body.print-mode-mini .sales-table td {
          font-size: 10px !important;
          padding: 6px 8px !important;
        }
      `}</style>

      <div className="sales-report">
        <div className="sales-header">
          <div className="store-details">
            <div className="store-name">{selectedStore?.storeName || "STORE NAME"}</div>
            <p>
              {selectedStore?.address || "Store Address"} <br />
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Contact: ${selectedStore.email}`}
            </p>
          </div>
          <div className="report-title-box">
            <h1>SALES ANALYTICS</h1>
            <p>Report Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
          </div>
        </div>

        <div className="sales-summary">
          <div className="summary-card">
            <h3>Total Invoices</h3>
            <div className="value">{formatNumber(counts.totalInvoices)}</div>
            <div className="change">{formatNumber(counts.releasedInvoices)} released, {formatNumber(counts.draftInvoices)} draft</div>
          </div>
          <div className="summary-card">
            <h3>Released Invoices</h3>
            <div className="value">{formatNumber(counts.releasedInvoices)}</div>
            <div className="change">Total: {formatCurrency(amounts.totalAmount)}</div>
          </div>
          <div className="summary-card">
            <h3>Draft Invoices</h3>
            <div className="value">{formatNumber(counts.draftInvoices)}</div>
            <div className="change">Pending release</div>
          </div>
          <div className="summary-card">
            <h3>Cancelled Invoices</h3>
            <div className="value">{formatNumber(counts.cancelledInvoices)}</div>
            <div className="change">Cancelled</div>
          </div>
        </div>

        <div className="sales-details">
          <h3>Today's Performance</h3>
          <div className="sales-summary">
            <div className="summary-card">
              <h3>Today's Invoices</h3>
              <div className="value">{formatNumber(today.totalInvoices)}</div>
              <div className="change">{formatNumber(today.releasedInvoices)} released</div>
            </div>
            <div className="summary-card">
              <h3>Average Order Value</h3>
              <div className="value">{formatCurrency(amounts.averageOrderValue)}</div>
              <div className="change">Per invoice</div>
            </div>
          </div>
        </div>

        <div className="sales-details">
          <h3>Invoice Breakdown</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">Total Invoices</td>
                <td className="amount">{formatNumber(counts.totalInvoices)}</td>
              </tr>
              <tr>
                <td className="label">Released Invoices</td>
                <td className="amount">{formatNumber(counts.releasedInvoices)}</td>
              </tr>
              <tr>
                <td className="label">Draft Invoices</td>
                <td className="amount">{formatNumber(counts.draftInvoices)}</td>
              </tr>
              <tr>
                <td className="label">Cancelled Invoices</td>
                <td className="amount">{formatNumber(counts.cancelledInvoices)}</td>
              </tr>
              <tr>
                <td className="label">Total Amount</td>
                <td className="amount">{formatCurrency(amounts.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sales-footer">
          <p>This is an automated sales analytics report generated by DragBizz.</p>
          <p>Report Generated on {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
        </div>
      </div>
    </>
  );
};

export default SalesReportTemplate;

