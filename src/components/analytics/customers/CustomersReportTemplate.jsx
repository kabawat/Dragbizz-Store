"use client";
import React from 'react';
import moment from 'moment';

const CustomersReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const newCustomers = analyticsData?.newCustomers || {
    last1Day: 0,
    last7Days: 0,
    last15Days: 0,
    last30Days: 0,
    last3Months: 0,
    last6Months: 0,
    last12Months: 0
  };

  const totalCustomers = analyticsData?.totalCustomers || 0;

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .customers-report { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
        body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif !important; font-size: 13px !important; line-height: 1.6 !important; color: #333333 !important; background-color: #f8faff !important; }
        body.print-mode-mini .customers-report { width: 74mm !important; max-width: 74mm !important; padding: 6px !important; border: none !important; box-shadow: none !important; }
        body.print-mode-standard .customers-report { max-width: 800px !important; padding: 40px !important; }
        .customers-report { max-width: 850px !important; margin: 30px auto !important; padding: 30px !important; background: #ffffff !important; box-shadow: 0 8px 30px rgba(0, 50, 100, 0.08) !important; border-radius: 8px !important; border: none !important; }
        .customers-header { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 25px 0 !important; margin-bottom: 30px !important; background: linear-gradient(90deg, #f0f8ff 0%, #ffffff 100%) !important; border-bottom: 3px solid #6699ff !important; }
        .customers-header > div { padding: 0 15px !important; }
        .customers-header .store-name { font-size: 24px !important; font-weight: 300 !important; color: #1e3a8a !important; letter-spacing: 1px !important; text-transform: uppercase !important; }
        .customers-header .store-details p { font-size: 12px !important; color: #555555 !important; margin-top: 5px !important; line-height: 1.4 !important; }
        .customers-header .report-title-box { text-align: right !important; }
        .customers-header .report-title-box h1 { font-size: 30px !important; font-weight: 700 !important; color: #3b82f6 !important; margin: 0 !important; letter-spacing: 3px !important; text-transform: uppercase !important; }
        .customers-header .report-title-box p { font-size: 14px !important; color: #666666 !important; margin: 4px 0 !important; }
        .customers-summary { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; margin-bottom: 30px !important; }
        .customers-summary .summary-card { padding: 20px !important; background: #fdfdff !important; border: none !important; border-radius: 4px !important; box-shadow: inset 0 0 5px rgba(150, 200, 255, 0.1) !important; }
        .customers-summary .summary-card h3 { font-size: 14px !important; font-weight: 600 !important; color: #3b82f6 !important; margin-bottom: 10px !important; text-transform: uppercase !important; border-bottom: 1px solid #e0e7ff !important; padding-bottom: 12px !important; }
        .customers-summary .summary-card .value { font-size: 24px !important; font-weight: 700 !important; color: #1e3a8a !important; margin: 10px 0 !important; }
        .customers-summary .summary-card .change { font-size: 12px !important; color: #666666 !important; margin-top: 5px !important; }
        .customers-details { margin-bottom: 30px !important; }
        .customers-details h3 { font-size: 18px !important; font-weight: 600 !important; color: #1e3a8a !important; margin-bottom: 15px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; padding-bottom: 15px !important; }
        .customers-table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 20px !important; }
        .customers-table thead th { background: #e0f2ff !important; color: #1e3a8a !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; font-size: 12px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; }
        .customers-table td { padding: 10px 15px !important; border-bottom: 1px solid #f0f0f0 !important; font-size: 13px !important; color: #444444 !important; }
        .customers-table .label { font-weight: 500 !important; color: #333333 !important; }
        .customers-table .amount { text-align: right !important; font-weight: 600 !important; color: #1e3a8a !important; }
        .customers-table tr:last-child td { border-bottom: 2px solid #f0f0f0 !important; }
        .customers-footer { margin-top: 40px !important; text-align: center !important; padding-top: 20px !important; border-top: 1px solid #e0e7ff !important; font-size: 11px !important; color: #888888 !important; }
        body.print-mode-mini .customers-summary { grid-template-columns: 1fr !important; }
        body.print-mode-mini .customers-header { flex-direction: column-reverse !important; align-items: center !important; text-align: center !important; }
        body.print-mode-mini .customers-header .report-title-box { text-align: center !important; }
        body.print-mode-mini .customers-table thead th, body.print-mode-mini .customers-table td { font-size: 10px !important; padding: 6px 8px !important; }
      `}</style>

      <div className="customers-report">
        <div className="customers-header">
          <div className="store-details">
            <div className="store-name">{selectedStore?.storeName || "STORE NAME"}</div>
            <p>
              {selectedStore?.address || "Store Address"} <br />
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Contact: ${selectedStore.email}`}
            </p>
          </div>
          <div className="report-title-box">
            <h1>CUSTOMERS ANALYTICS</h1>
            <p>Report Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
          </div>
        </div>

        <div className="customers-summary">
          <div className="summary-card">
            <h3>Total Customers</h3>
            <div className="value">{formatNumber(totalCustomers)}</div>
            <div className="change">All customers</div>
          </div>
          <div className="summary-card">
            <h3>Today's Customers</h3>
            <div className="value">{formatNumber(newCustomers.last1Day)}</div>
            <div className="change">New today</div>
          </div>
          <div className="summary-card">
            <h3>Last 7 Days</h3>
            <div className="value">{formatNumber(newCustomers.last7Days)}</div>
            <div className="change">New customers</div>
          </div>
          <div className="summary-card">
            <h3>Last 30 Days</h3>
            <div className="value">{formatNumber(newCustomers.last30Days)}</div>
            <div className="change">New customers</div>
          </div>
        </div>

        <div className="customers-details">
          <h3>Customer Growth Breakdown</h3>
          <table className="customers-table">
            <thead>
              <tr>
                <th>Period</th>
                <th style={{ textAlign: "right" }}>New Customers</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">Last 1 Day</td>
                <td className="amount">{formatNumber(newCustomers.last1Day)}</td>
              </tr>
              <tr>
                <td className="label">Last 7 Days</td>
                <td className="amount">{formatNumber(newCustomers.last7Days)}</td>
              </tr>
              <tr>
                <td className="label">Last 15 Days</td>
                <td className="amount">{formatNumber(newCustomers.last15Days)}</td>
              </tr>
              <tr>
                <td className="label">Last 30 Days</td>
                <td className="amount">{formatNumber(newCustomers.last30Days)}</td>
              </tr>
              <tr>
                <td className="label">Last 3 Months</td>
                <td className="amount">{formatNumber(newCustomers.last3Months)}</td>
              </tr>
              <tr>
                <td className="label">Last 6 Months</td>
                <td className="amount">{formatNumber(newCustomers.last6Months)}</td>
              </tr>
              <tr>
                <td className="label">Last 12 Months</td>
                <td className="amount">{formatNumber(newCustomers.last12Months)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="customers-footer">
          <p>This is an automated customers analytics report generated by DragBizz.</p>
          <p>Report Generated on {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
        </div>
      </div>
    </>
  );
};

export default CustomersReportTemplate;

