"use client";
import React from 'react';
import moment from 'moment';

const RevenueReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  const formatPercent = (num) => `${(num || 0).toFixed(2)}%`;

  const summary = analyticsData?.summary || {
    totalRevenue: 0,
    totalProfit: 0,
    totalDiscount: 0,
    totalGst: 0,
    profitMargin: 0
  };

  const today = analyticsData?.today || {
    revenue: 0,
    profit: 0,
    sales: 0
  };

  const change = analyticsData?.change || {
    revenue: 0,
    profit: 0,
    sales: 0,
    changeType: {
      revenue: "up",
      profit: "up",
      sales: "up"
    }
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
          .revenue-report {
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

        body.print-mode-mini .revenue-report {
          width: 74mm !important;
          max-width: 74mm !important;
          padding: 6px !important;
          border: none !important;
          box-shadow: none !important;
        }

        body.print-mode-standard .revenue-report {
          max-width: 800px !important;
          padding: 40px !important;
        }

        .revenue-report {
          max-width: 850px !important;
          margin: 30px auto !important;
          padding: 30px !important;
          background: #ffffff !important;
          box-shadow: 0 8px 30px rgba(0, 50, 100, 0.08) !important;
          border-radius: 8px !important;
          border: none !important;
        }

        .revenue-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;   
          padding: 25px 0 !important;
          margin-bottom: 30px !important;
          background: linear-gradient(90deg, #f0f8ff 0%, #ffffff 100%) !important;
          border-bottom: 3px solid #6699ff !important;
        }
        
        .revenue-header > div {
          padding: 0 15px !important;
        }

        .revenue-header .store-name {
          font-size: 24px !important;
          font-weight: 300 !important;
          color: #1e3a8a !important;
          letter-spacing: 1px !important;
          text-transform: uppercase !important;
        }

        .revenue-header .store-details p {
          font-size: 12px !important;
          color: #555555 !important;
          margin-top: 5px !important;
          line-height: 1.4 !important;
        }

        .revenue-header .report-title-box {
          text-align: right !important;
        }

        .revenue-header .report-title-box h1 {
          font-size: 30px !important;
          font-weight: 700 !important;
          color: #3b82f6 !important;
          margin: 0 !important;
          letter-spacing: 3px !important;
          text-transform: uppercase !important;
        }

        .revenue-header .report-title-box p {
          font-size: 14px !important;
          color: #666666 !important;
          margin: 4px 0 !important;
        }

        .revenue-summary {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 20px !important;
          margin-bottom: 30px !important;
        }

        .revenue-summary .summary-card {
          padding: 20px !important;
          background: #fdfdff !important;
          border: none !important;
          border-radius: 4px !important;
          box-shadow: inset 0 0 5px rgba(150, 200, 255, 0.1) !important;
        }
        
        .revenue-summary .summary-card h3 {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #3b82f6 !important;
          margin-bottom: 10px !important;
          text-transform: uppercase !important;
          border-bottom: 1px solid #e0e7ff !important;
          padding-bottom: 12px !important;
        }
        
        .revenue-summary .summary-card .value {
          font-size: 24px !important;
          font-weight: 700 !important;
          color: #1e3a8a !important;
          margin: 10px 0 !important;
        }

        .revenue-summary .summary-card .change {
          font-size: 12px !important;
          color: #666666 !important;
          margin-top: 5px !important;
        }

        .revenue-summary .summary-card .change.positive {
          color: #10b981 !important;
        }

        .revenue-summary .summary-card .change.negative {
          color: #ef4444 !important;
        }

        .revenue-details {
          margin-bottom: 30px !important;
        }

        .revenue-details h3 {
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #1e3a8a !important;
          margin-bottom: 15px !important;
          text-transform: uppercase !important;
          border-bottom: 2px solid #93c5fd !important;
          padding-bottom: 15px !important;
        }

        .revenue-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-bottom: 20px !important;
        }

        .revenue-table thead th {
          background: #e0f2ff !important;
          color: #1e3a8a !important;
          padding: 12px 15px !important;
          text-align: left !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          border-bottom: 2px solid #93c5fd !important;
        }
        
        .revenue-table td {
          padding: 10px 15px !important;
          border-bottom: 1px solid #f0f0f0 !important;
          font-size: 13px !important;
          color: #444444 !important;
        }

        .revenue-table .label {
          font-weight: 500 !important;
          color: #333333 !important;
        }

        .revenue-table .amount {
          text-align: right !important;
          font-weight: 600 !important;
          color: #1e3a8a !important;
        }
        
        .revenue-table tr:last-child td {
          border-bottom: 2px solid #f0f0f0 !important;
        }

        .today-performance {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 15px !important;
          margin-bottom: 30px !important;
        }

        .today-performance .performance-card {
          padding: 15px !important;
          background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%) !important;
          border: none !important;
          border-radius: 4px !important;
          text-align: center !important;
        }

        .today-performance .performance-card .label {
          font-size: 11px !important;
          color: #666666 !important;
          text-transform: uppercase !important;
          margin-bottom: 8px !important;
        }

        .today-performance .performance-card .value {
          font-size: 20px !important;
          font-weight: 700 !important;
          color: #3b82f6 !important;
          margin-bottom: 5px !important;
        }

        .today-performance .performance-card .sub-value {
          font-size: 12px !important;
          color: #888888 !important;
        }

        .revenue-footer {
          margin-top: 40px !important;
          text-align: center !important;
          padding-top: 20px !important;
          border-top: 1px solid #e0e7ff !important;
          font-size: 11px !important;
          color: #888888 !important;
        }

        body.print-mode-mini .revenue-summary {
          grid-template-columns: 1fr !important;
        }

        body.print-mode-mini .today-performance {
          grid-template-columns: 1fr !important;
        }

        body.print-mode-mini .revenue-header {
          flex-direction: column-reverse !important;
          align-items: center !important;
          text-align: center !important;
        }

        body.print-mode-mini .revenue-header .report-title-box {
          text-align: center !important;
        }

        body.print-mode-mini .revenue-table thead th,
        body.print-mode-mini .revenue-table td {
          font-size: 10px !important;
          padding: 6px 8px !important;
        }
      `}</style>

      <div className="revenue-report">
        <div className="revenue-header">
          <div className="store-details">
            <div className="store-name">{selectedStore?.storeName || "STORE NAME"}</div>
            <p>
              {selectedStore?.address || "Store Address"} <br />
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Contact: ${selectedStore.email}`}
            </p>
          </div>
          <div className="report-title-box">
            <h1>REVENUE ANALYTICS</h1>
            <p>Report Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
            {analyticsData?.lastSyncedAt && (
              <p>Data Synced: {moment(analyticsData.lastSyncedAt).format("DD/MM/YYYY HH:mm:ss")}</p>
            )}
          </div>
        </div>

        <div className="revenue-summary">
          <div className="summary-card">
            <h3>Total Revenue</h3>
            <div className="value">{formatCurrency(summary.totalRevenue)}</div>
            <div className={`change ${change.changeType?.revenue === 'up' ? 'positive' : 'negative'}`}>
              {change.changeType?.revenue === 'up' ? '↑' : '↓'} {Math.abs(change.revenue)}% from last period
            </div>
          </div>
          <div className="summary-card">
            <h3>Total Profit</h3>
            <div className="value">{formatCurrency(summary.totalProfit)}</div>
            <div className={`change ${change.changeType?.profit === 'up' ? 'positive' : 'negative'}`}>
              {change.changeType?.profit === 'up' ? '↑' : '↓'} {Math.abs(change.profit)}% from last period
            </div>
          </div>
          <div className="summary-card">
            <h3>Profit Margin</h3>
            <div className="value">{formatPercent(summary.profitMargin)}</div>
            <div className="change">Overall margin percentage</div>
          </div>
          <div className="summary-card">
            <h3>Total Sales</h3>
            <div className="value">{formatNumber(today.sales)}</div>
            <div className={`change ${change.changeType?.sales === 'up' ? 'positive' : 'negative'}`}>
              {change.changeType?.sales === 'up' ? '↑' : '↓'} {Math.abs(change.sales)}% from last period
            </div>
          </div>
        </div>

        <div className="revenue-details">
          <h3>Today's Performance</h3>
          <div className="today-performance">
            <div className="performance-card">
              <div className="label">Today's Revenue</div>
              <div className="value">{formatCurrency(today.revenue)}</div>
              <div className="sub-value">{formatNumber(today.sales)} sales</div>
            </div>
            <div className="performance-card">
              <div className="label">Today's Profit</div>
              <div className="value">{formatCurrency(today.profit)}</div>
              <div className="sub-value">From {formatNumber(today.sales)} sales</div>
            </div>
            <div className="performance-card">
              <div className="label">Total Sales</div>
              <div className="value">{formatNumber(today.sales)}</div>
              <div className="sub-value">Transactions today</div>
            </div>
          </div>
        </div>

        <div className="revenue-details">
          <h3>Financial Breakdown</h3>
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">Total Revenue</td>
                <td className="amount">{formatCurrency(summary.totalRevenue)}</td>
              </tr>
              <tr>
                <td className="label">Total Profit</td>
                <td className="amount">{formatCurrency(summary.totalProfit)}</td>
              </tr>
              <tr>
                <td className="label">Total Discount</td>
                <td className="amount">{formatCurrency(summary.totalDiscount)}</td>
              </tr>
              <tr>
                <td className="label">Total GST</td>
                <td className="amount">{formatCurrency(summary.totalGst)}</td>
              </tr>
              <tr>
                <td className="label">Profit Margin</td>
                <td className="amount">{formatPercent(summary.profitMargin)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="revenue-footer">
          <p>This is an automated revenue analytics report generated by DragBizz.</p>
          <p>Report Generated on {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
        </div>
      </div>
    </>
  );
};

export default RevenueReportTemplate;

