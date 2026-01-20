"use client";
import React from 'react';
import moment from 'moment';

const BillsReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const counts = analyticsData?.counts || {
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    overdueBills: 0
  };

  const amounts = analyticsData?.amounts || {
    totalPayable: 0,
    totalPaid: 0,
    totalDue: 0
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .bills-report { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
        body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif !important; font-size: 13px !important; line-height: 1.6 !important; color: #333333 !important; background-color: #f8faff !important; }
        body.print-mode-mini .bills-report { width: 74mm !important; max-width: 74mm !important; padding: 6px !important; border: none !important; box-shadow: none !important; }
        body.print-mode-standard .bills-report { max-width: 800px !important; padding: 40px !important; }
        .bills-report { max-width: 850px !important; margin: 30px auto !important; padding: 30px !important; background: #ffffff !important; box-shadow: 0 8px 30px rgba(0, 50, 100, 0.08) !important; border-radius: 8px !important; border: none !important; }
        .bills-header { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 25px 0 !important; margin-bottom: 30px !important; background: linear-gradient(90deg, #f0f8ff 0%, #ffffff 100%) !important; border-bottom: 3px solid #6699ff !important; }
        .bills-header > div { padding: 0 15px !important; }
        .bills-header .store-name { font-size: 24px !important; font-weight: 300 !important; color: #1e3a8a !important; letter-spacing: 1px !important; text-transform: uppercase !important; }
        .bills-header .store-details p { font-size: 12px !important; color: #555555 !important; margin-top: 5px !important; line-height: 1.4 !important; }
        .bills-header .report-title-box { text-align: right !important; }
        .bills-header .report-title-box h1 { font-size: 30px !important; font-weight: 700 !important; color: #3b82f6 !important; margin: 0 !important; letter-spacing: 3px !important; text-transform: uppercase !important; }
        .bills-header .report-title-box p { font-size: 14px !important; color: #666666 !important; margin: 4px 0 !important; }
        .bills-summary { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; margin-bottom: 30px !important; }
        .bills-summary .summary-card { padding: 20px !important; background: #fdfdff !important; border: none !important; border-radius: 4px !important; box-shadow: inset 0 0 5px rgba(150, 200, 255, 0.1) !important; }
        .bills-summary .summary-card h3 { font-size: 14px !important; font-weight: 600 !important; color: #3b82f6 !important; margin-bottom: 10px !important; text-transform: uppercase !important; border-bottom: 1px solid #e0e7ff !important; padding-bottom: 12px !important; }
        .bills-summary .summary-card .value { font-size: 24px !important; font-weight: 700 !important; color: #1e3a8a !important; margin: 10px 0 !important; }
        .bills-summary .summary-card .change { font-size: 12px !important; color: #666666 !important; margin-top: 5px !important; }
        .bills-details { margin-bottom: 30px !important; }
        .bills-details h3 { font-size: 18px !important; font-weight: 600 !important; color: #1e3a8a !important; margin-bottom: 15px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; padding-bottom: 15px !important; }
        .bills-table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 20px !important; }
        .bills-table thead th { background: #e0f2ff !important; color: #1e3a8a !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; font-size: 12px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; }
        .bills-table td { padding: 10px 15px !important; border-bottom: 1px solid #f0f0f0 !important; font-size: 13px !important; color: #444444 !important; }
        .bills-table .label { font-weight: 500 !important; color: #333333 !important; }
        .bills-table .amount { text-align: right !important; font-weight: 600 !important; color: #1e3a8a !important; }
        .bills-table tr:last-child td { border-bottom: 2px solid #f0f0f0 !important; }
        .bills-footer { margin-top: 40px !important; text-align: center !important; padding-top: 20px !important; border-top: 1px solid #e0e7ff !important; font-size: 11px !important; color: #888888 !important; }
        body.print-mode-mini .bills-summary { grid-template-columns: 1fr !important; }
        body.print-mode-mini .bills-header { flex-direction: column-reverse !important; align-items: center !important; text-align: center !important; }
        body.print-mode-mini .bills-header .report-title-box { text-align: center !important; }
        body.print-mode-mini .bills-table thead th, body.print-mode-mini .bills-table td { font-size: 10px !important; padding: 6px 8px !important; }
      `}</style>

      <div className="bills-report">
        <div className="bills-header">
          <div className="store-details">
            <div className="store-name">{selectedStore?.storeName || "STORE NAME"}</div>
            <p>
              {selectedStore?.address || "Store Address"} <br />
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Contact: ${selectedStore.email}`}
            </p>
          </div>
          <div className="report-title-box">
            <h1>BILLS ANALYTICS</h1>
            <p>Report Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
          </div>
        </div>

        <div className="bills-summary">
          <div className="summary-card">
            <h3>Total Bills</h3>
            <div className="value">{formatNumber(counts.totalBills)}</div>
            <div className="change">{formatNumber(counts.paidBills)} paid, {formatNumber(counts.pendingBills)} pending</div>
          </div>
          <div className="summary-card">
            <h3>Paid Bills</h3>
            <div className="value">{formatNumber(counts.paidBills)}</div>
            <div className="change">Total: {formatCurrency(amounts.totalPaid)}</div>
          </div>
          <div className="summary-card">
            <h3>Pending Bills</h3>
            <div className="value">{formatNumber(counts.pendingBills)}</div>
            <div className="change">Amount: {formatCurrency(amounts.totalDue)}</div>
          </div>
          <div className="summary-card">
            <h3>Overdue Bills</h3>
            <div className="value">{formatNumber(counts.overdueBills)}</div>
            <div className="change">Urgent action needed</div>
          </div>
        </div>

        <div className="bills-details">
          <h3>Financial Breakdown</h3>
          <table className="bills-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">Total Payable</td>
                <td className="amount">{formatCurrency(amounts.totalPayable)}</td>
              </tr>
              <tr>
                <td className="label">Total Paid</td>
                <td className="amount">{formatCurrency(amounts.totalPaid)}</td>
              </tr>
              <tr>
                <td className="label">Total Due</td>
                <td className="amount">{formatCurrency(amounts.totalDue)}</td>
              </tr>
              <tr>
                <td className="label">Paid Bills</td>
                <td className="amount">{formatNumber(counts.paidBills)}</td>
              </tr>
              <tr>
                <td className="label">Pending Bills</td>
                <td className="amount">{formatNumber(counts.pendingBills)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bills-footer">
          <p>This is an automated bills analytics report generated by DragBizz.</p>
          <p>Report Generated on {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
        </div>
      </div>
    </>
  );
};

export default BillsReportTemplate;

