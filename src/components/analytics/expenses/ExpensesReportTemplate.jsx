"use client";
import React from 'react';
import moment from 'moment';

const ExpensesReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const counts = analyticsData?.counts || {
    totalExpenses: 0,
    paidExpenses: 0,
    pendingExpenses: 0
  };

  const amounts = analyticsData?.amounts || {
    totalAmount: 0,
    netAmount: 0,
    gstAmount: 0
  };

  const categoryData = analyticsData?.byCategory || {};
  const paymentMethodData = analyticsData?.byPaymentMethod || {};

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .expenses-report { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
        body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif !important; font-size: 13px !important; line-height: 1.6 !important; color: #333333 !important; background-color: #f8faff !important; }
        body.print-mode-mini .expenses-report { width: 74mm !important; max-width: 74mm !important; padding: 6px !important; border: none !important; box-shadow: none !important; }
        body.print-mode-standard .expenses-report { max-width: 800px !important; padding: 40px !important; }
        .expenses-report { max-width: 850px !important; margin: 30px auto !important; padding: 30px !important; background: #ffffff !important; box-shadow: 0 8px 30px rgba(0, 50, 100, 0.08) !important; border-radius: 8px !important; border: none !important; }
        .expenses-header { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 25px 0 !important; margin-bottom: 30px !important; background: linear-gradient(90deg, #f0f8ff 0%, #ffffff 100%) !important; border-bottom: 3px solid #6699ff !important; }
        .expenses-header > div { padding: 0 15px !important; }
        .expenses-header .store-name { font-size: 24px !important; font-weight: 300 !important; color: #1e3a8a !important; letter-spacing: 1px !important; text-transform: uppercase !important; }
        .expenses-header .store-details p { font-size: 12px !important; color: #555555 !important; margin-top: 5px !important; line-height: 1.4 !important; }
        .expenses-header .report-title-box { text-align: right !important; }
        .expenses-header .report-title-box h1 { font-size: 30px !important; font-weight: 700 !important; color: #3b82f6 !important; margin: 0 !important; letter-spacing: 3px !important; text-transform: uppercase !important; }
        .expenses-header .report-title-box p { font-size: 14px !important; color: #666666 !important; margin: 4px 0 !important; }
        .expenses-summary { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; margin-bottom: 30px !important; }
        .expenses-summary .summary-card { padding: 20px !important; background: #fdfdff !important; border: none !important; border-radius: 4px !important; box-shadow: inset 0 0 5px rgba(150, 200, 255, 0.1) !important; }
        .expenses-summary .summary-card h3 { font-size: 14px !important; font-weight: 600 !important; color: #3b82f6 !important; margin-bottom: 10px !important; text-transform: uppercase !important; border-bottom: 1px solid #e0e7ff !important; padding-bottom: 12px !important; }
        .expenses-summary .summary-card .value { font-size: 24px !important; font-weight: 700 !important; color: #1e3a8a !important; margin: 10px 0 !important; }
        .expenses-summary .summary-card .change { font-size: 12px !important; color: #666666 !important; margin-top: 5px !important; }
        .expenses-details { margin-bottom: 30px !important; }
        .expenses-details h3 { font-size: 18px !important; font-weight: 600 !important; color: #1e3a8a !important; margin-bottom: 15px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; padding-bottom: 15px !important; }
        .expenses-table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 20px !important; }
        .expenses-table thead th { background: #e0f2ff !important; color: #1e3a8a !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; font-size: 12px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; }
        .expenses-table td { padding: 10px 15px !important; border-bottom: 1px solid #f0f0f0 !important; font-size: 13px !important; color: #444444 !important; }
        .expenses-table .label { font-weight: 500 !important; color: #333333 !important; }
        .expenses-table .amount { text-align: right !important; font-weight: 600 !important; color: #1e3a8a !important; }
        .expenses-table tr:last-child td { border-bottom: 2px solid #f0f0f0 !important; }
        .expenses-footer { margin-top: 40px !important; text-align: center !important; padding-top: 20px !important; border-top: 1px solid #e0e7ff !important; font-size: 11px !important; color: #888888 !important; }
        body.print-mode-mini .expenses-summary { grid-template-columns: 1fr !important; }
        body.print-mode-mini .expenses-header { flex-direction: column-reverse !important; align-items: center !important; text-align: center !important; }
        body.print-mode-mini .expenses-header .report-title-box { text-align: center !important; }
        body.print-mode-mini .expenses-table thead th, body.print-mode-mini .expenses-table td { font-size: 10px !important; padding: 6px 8px !important; }
      `}</style>

      <div className="expenses-report">
        <div className="expenses-header">
          <div className="store-details">
            <div className="store-name">{selectedStore?.storeName || "STORE NAME"}</div>
            <p>
              {selectedStore?.address || "Store Address"} <br />
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Contact: ${selectedStore.email}`}
            </p>
          </div>
          <div className="report-title-box">
            <h1>EXPENSES ANALYTICS</h1>
            <p>Report Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
          </div>
        </div>

        <div className="expenses-summary">
          <div className="summary-card">
            <h3>Total Expenses</h3>
            <div className="value">{formatNumber(counts.totalExpenses)}</div>
            <div className="change">{formatNumber(counts.paidExpenses)} paid, {formatNumber(counts.pendingExpenses)} pending</div>
          </div>
          <div className="summary-card">
            <h3>Paid Expenses</h3>
            <div className="value">{formatNumber(counts.paidExpenses)}</div>
            <div className="change">Total: {formatCurrency(amounts.totalAmount)}</div>
          </div>
          <div className="summary-card">
            <h3>Pending Expenses</h3>
            <div className="value">{formatNumber(counts.pendingExpenses)}</div>
            <div className="change">Pending payment</div>
          </div>
          <div className="summary-card">
            <h3>Total Amount</h3>
            <div className="value">{formatCurrency(amounts.totalAmount)}</div>
            <div className="change">All expenses</div>
          </div>
        </div>

        <div className="expenses-details">
          <h3>Financial Breakdown</h3>
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">Total Amount</td>
                <td className="amount">{formatCurrency(amounts.totalAmount)}</td>
              </tr>
              <tr>
                <td className="label">Net Amount</td>
                <td className="amount">{formatCurrency(amounts.netAmount)}</td>
              </tr>
              <tr>
                <td className="label">GST Amount</td>
                <td className="amount">{formatCurrency(amounts.gstAmount)}</td>
              </tr>
              <tr>
                <td className="label">Paid Expenses</td>
                <td className="amount">{formatNumber(counts.paidExpenses)}</td>
              </tr>
              <tr>
                <td className="label">Pending Expenses</td>
                <td className="amount">{formatNumber(counts.pendingExpenses)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="expenses-footer">
          <p>This is an automated expenses analytics report generated by DragBizz.</p>
          <p>Report Generated on {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
        </div>
      </div>
    </>
  );
};

export default ExpensesReportTemplate;

