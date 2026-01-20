"use client";
import React from 'react';
import moment from 'moment';

const ProductsReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const totals = analyticsData?.totals || {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .products-report { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
        body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif !important; font-size: 13px !important; line-height: 1.6 !important; color: #333333 !important; background-color: #f8faff !important; }
        body.print-mode-mini .products-report { width: 74mm !important; max-width: 74mm !important; padding: 6px !important; border: none !important; box-shadow: none !important; }
        body.print-mode-standard .products-report { max-width: 800px !important; padding: 40px !important; }
        .products-report { max-width: 850px !important; margin: 30px auto !important; padding: 30px !important; background: #ffffff !important; box-shadow: 0 8px 30px rgba(0, 50, 100, 0.08) !important; border-radius: 8px !important; border: none !important; }
        .products-header { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 25px 0 !important; margin-bottom: 30px !important; background: linear-gradient(90deg, #f0f8ff 0%, #ffffff 100%) !important; border-bottom: 3px solid #6699ff !important; }
        .products-header > div { padding: 0 15px !important; }
        .products-header .store-name { font-size: 24px !important; font-weight: 300 !important; color: #1e3a8a !important; letter-spacing: 1px !important; text-transform: uppercase !important; }
        .products-header .store-details p { font-size: 12px !important; color: #555555 !important; margin-top: 5px !important; line-height: 1.4 !important; }
        .products-header .report-title-box { text-align: right !important; }
        .products-header .report-title-box h1 { font-size: 30px !important; font-weight: 700 !important; color: #3b82f6 !important; margin: 0 !important; letter-spacing: 3px !important; text-transform: uppercase !important; }
        .products-header .report-title-box p { font-size: 14px !important; color: #666666 !important; margin: 4px 0 !important; }
        .products-summary { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; margin-bottom: 30px !important; }
        .products-summary .summary-card { padding: 20px !important; background: #fdfdff !important; border: none !important; border-radius: 4px !important; box-shadow: inset 0 0 5px rgba(150, 200, 255, 0.1) !important; }
        .products-summary .summary-card h3 { font-size: 14px !important; font-weight: 600 !important; color: #3b82f6 !important; margin-bottom: 10px !important; text-transform: uppercase !important; border-bottom: 1px solid #e0e7ff !important; padding-bottom: 12px !important; }
        .products-summary .summary-card .value { font-size: 24px !important; font-weight: 700 !important; color: #1e3a8a !important; margin: 10px 0 !important; }
        .products-summary .summary-card .change { font-size: 12px !important; color: #666666 !important; margin-top: 5px !important; }
        .products-details { margin-bottom: 30px !important; }
        .products-details h3 { font-size: 18px !important; font-weight: 600 !important; color: #1e3a8a !important; margin-bottom: 15px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; padding-bottom: 15px !important; }
        .products-table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 20px !important; }
        .products-table thead th { background: #e0f2ff !important; color: #1e3a8a !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; font-size: 12px !important; text-transform: uppercase !important; border-bottom: 2px solid #93c5fd !important; }
        .products-table td { padding: 10px 15px !important; border-bottom: 1px solid #f0f0f0 !important; font-size: 13px !important; color: #444444 !important; }
        .products-table .label { font-weight: 500 !important; color: #333333 !important; }
        .products-table .amount { text-align: right !important; font-weight: 600 !important; color: #1e3a8a !important; }
        .products-table tr:last-child td { border-bottom: 2px solid #f0f0f0 !important; }
        .products-footer { margin-top: 40px !important; text-align: center !important; padding-top: 20px !important; border-top: 1px solid #e0e7ff !important; font-size: 11px !important; color: #888888 !important; }
        body.print-mode-mini .products-summary { grid-template-columns: 1fr !important; }
        body.print-mode-mini .products-header { flex-direction: column-reverse !important; align-items: center !important; text-align: center !important; }
        body.print-mode-mini .products-header .report-title-box { text-align: center !important; }
        body.print-mode-mini .products-table thead th, body.print-mode-mini .products-table td { font-size: 10px !important; padding: 6px 8px !important; }
      `}</style>

      <div className="products-report">
        <div className="products-header">
          <div className="store-details">
            <div className="store-name">{selectedStore?.storeName || "STORE NAME"}</div>
            <p>
              {selectedStore?.address || "Store Address"} <br />
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`} <br />
              {selectedStore?.email && `Contact: ${selectedStore.email}`}
            </p>
          </div>
          <div className="report-title-box">
            <h1>PRODUCTS ANALYTICS</h1>
            <p>Report Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
          </div>
        </div>

        <div className="products-summary">
          <div className="summary-card">
            <h3>Total Products</h3>
            <div className="value">{formatNumber(totals.totalProducts)}</div>
            <div className="change">{formatNumber(totals.activeProducts)} active, {formatNumber(totals.inactiveProducts)} inactive</div>
          </div>
          <div className="summary-card">
            <h3>Active Products</h3>
            <div className="value">{formatNumber(totals.activeProducts)}</div>
            <div className="change">Currently active</div>
          </div>
          <div className="summary-card">
            <h3>Inactive Products</h3>
            <div className="value">{formatNumber(totals.inactiveProducts)}</div>
            <div className="change">Not active</div>
          </div>
          <div className="summary-card">
            <h3>Total Count</h3>
            <div className="value">{formatNumber(totals.totalProducts)}</div>
            <div className="change">All products</div>
          </div>
        </div>

        <div className="products-details">
          <h3>Products Breakdown</h3>
          <table className="products-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">Total Products</td>
                <td className="amount">{formatNumber(totals.totalProducts)}</td>
              </tr>
              <tr>
                <td className="label">Active Products</td>
                <td className="amount">{formatNumber(totals.activeProducts)}</td>
              </tr>
              <tr>
                <td className="label">Inactive Products</td>
                <td className="amount">{formatNumber(totals.inactiveProducts)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="products-footer">
          <p>This is an automated products analytics report generated by DragBizz.</p>
          <p>Report Generated on {moment().format("DD/MM/YYYY HH:mm:ss")}</p>
        </div>
      </div>
    </>
  );
};

export default ProductsReportTemplate;

