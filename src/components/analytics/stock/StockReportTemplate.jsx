"use client";
import React from 'react';
import moment from 'moment';

const StockReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const totals = analyticsData?.totals || {
    totalSkus: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    reservedQuantity: 0,
    soldQuantity: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  };

  const valueSummary = analyticsData?.valueSummary || {
    averageCost: 0,
    totalStockValue: 0
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .stock-report { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
        body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif !important; font-size: 13px !important; line-height: 1.6 !important; color: #333333 !important; background-color: #f8faff !important; }
        body.print-mode-mini .stock-report { width: 74mm !important; max-width: 74mm !important; padding: 6px !important; border: none !important; box-shadow: none !important; }
        body.print-mode-standard .stock-report { max-width: 800px !important; padding: 40px !important; }
        .stock-report { max-width: 850px !important; margin: 30px auto !important; padding: 30px !important; background: #ffffff !important; box-shadow: 0 8px 30px rgba(0, 50, 100, 0.08) !important; border-radius: 8px !important; border: none !important; }
        .stock-header { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 25px 0 !important; margin-bottom: 30px !important; background: linear-gradient(90deg, #f0f8ff 0%, #ffffff 100%) !important; border-bottom: 3px solid #6699ff !important; }
        .stock-header > div { padding: 0 15px !important; }
        .stock-header .store-name { font-size: 24px !important; font-weight: 300 !important; color: #1e3a8a !important; letter-spacing: 1px !important; text-transform: uppercase !important; }
        .stock-header .store-details p { font-size: 12px !important; color: #555555 !important; margin-top: 5px !important; line-height: 1.4 !important; }
        .stock-header .report-title-box { text-align: right !important; }
        .stock-header .report-title-box h1 { font-size: 30px !important; font-weight: 700 !important; color: #3b82f6 !important; margin: 0 !important; letter-spacing: 3px !important; text-transform: uppercase !important; }
        .stock-header .report-title-box p { font-size: 14px !important; color: #666666 !important; margin: 4px 0 !important; }
        .stock-summary { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; margin-bottom: 30px !important; }
        .stock-summary .summary-card { padding: 20px !important; background: #fdfdff !important; border: none !important; border-radius: 4px !important; box-shadow: inset 0 0 5px rgba(150, 200, 255, 0.1) !important; }
        .stock-summary .summary-card h3 { font-size: 14px !important; font-weight: 600 !important; color: #3b82f6 !important; margin-bottom: 10px !important; text-transform: uppercase !important; border-bottom: 1px solid #e0e7ff !important; padding-bottom: 12px !important; }
        .stock-summary .summary-card .value { font-size: 24px !important; font-weight: 700 !important; color: #1e3a8a !important; margin: 10px 0 !important; }
        .stock-summary .summary-card .change { font-size: 12px !important; color: #666666 !important; margin-top: 5px !important; }
        .stock-details { margin-bottom: 30px !important; }
        .stock-details h3 { font-size: 18px !important; font-weight: 600 !important; color: #1e3a8a !important; margin-bottom: 15px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; padding-bottom: 15px !important; }
        .stock-table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 20px !important; }
        .stock-table thead th { background: #e0f2ff !important; color: #1e3a8a !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; font-size: 12px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; }
        .stock-table td { padding: 10px 15px !important; border-bottom: 1px solid #f0f0f0 !important; font-size: 13px !important; color: #444444 !important; }
        .stock-table .label { font-weight: 500 !important; color: #333333 !important; }
        .stock-table .amount { text-align: right !important; font-weight: 600 !important; color: #1e3a8a !important; }
        .stock-table tr:last-child td { border-bottom: 2px solid #f0f0f0 !important; }
        .stock-footer { margin-top: 40px !important; text-align: center !important; padding-top: 20px !important; border-top: 1px solid #e0e7ff !important; font-size: 11px !important; color: #888888 !important; }
        body.print-mode-mini .stock-summary { grid-template-columns: 1fr !important; }
        body.print-mode-mini .stock-header { flex-direction: column-reverse !important; align-items: center !important; text-align: center !important; }
        body.print-mode-mini .stock-header .report-title-box { text-align: center !important; }
        body.print-mode-mini .stock-table thead th, body.print-mode-mini .stock-table td { font-size: 10px !important; padding: 6px 8px !important; }
      `}</style>

      <div className="stock-report">
        <div className="stock-header">
          <div className="store-details">
            <div className="store-name">{selectedStore?.storeName || "STORE NAME"}</div>
            <p>
              {selectedStore?.address || "Store Address"} <br />
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Contact: ${selectedStore.email}`}
            </p>
          </div>
          <div className="report-title-box">
            <h1>STOCK ANALYTICS</h1>
            <p>Report Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
          </div>
        </div>

        <div className="stock-summary">
          <div className="summary-card">
            <h3>Total SKUs</h3>
            <div className="value">{formatNumber(totals.totalSkus)}</div>
            <div className="change">{formatNumber(totals.availableQuantity)} available</div>
          </div>
          <div className="summary-card">
            <h3>Total Quantity</h3>
            <div className="value">{formatNumber(totals.totalQuantity)}</div>
            <div className="change">All items</div>
          </div>
          <div className="summary-card">
            <h3>Low Stock Items</h3>
            <div className="value">{formatNumber(totals.lowStockItems)}</div>
            <div className="change">Needs attention</div>
          </div>
          <div className="summary-card">
            <h3>Out of Stock</h3>
            <div className="value">{formatNumber(totals.outOfStockItems)}</div>
            <div className="change">Urgent action needed</div>
          </div>
        </div>

        <div className="stock-details">
          <h3>Stock Breakdown</h3>
          <table className="stock-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">Total SKUs</td>
                <td className="amount">{formatNumber(totals.totalSkus)}</td>
              </tr>
              <tr>
                <td className="label">Total Quantity</td>
                <td className="amount">{formatNumber(totals.totalQuantity)}</td>
              </tr>
              <tr>
                <td className="label">Available Quantity</td>
                <td className="amount">{formatNumber(totals.availableQuantity)}</td>
              </tr>
              <tr>
                <td className="label">Reserved Quantity</td>
                <td className="amount">{formatNumber(totals.reservedQuantity)}</td>
              </tr>
              <tr>
                <td className="label">Sold Quantity</td>
                <td className="amount">{formatNumber(totals.soldQuantity)}</td>
              </tr>
              <tr>
                <td className="label">Total Stock Value</td>
                <td className="amount">{formatCurrency(valueSummary.totalStockValue)}</td>
              </tr>
              <tr>
                <td className="label">Average Cost</td>
                <td className="amount">{formatCurrency(valueSummary.averageCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="stock-footer">
          <p>This is an automated stock analytics report generated by DragBizz.</p>
          <p>Report Generated on {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
        </div>
      </div>
    </>
  );
};

export default StockReportTemplate;

