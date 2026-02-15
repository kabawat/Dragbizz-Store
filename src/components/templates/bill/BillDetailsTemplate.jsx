"use client";
import moment from "moment";
import { ReportFooter, ReportHeader } from "../analytics/common";
import styles from "../analytics/common/analyticsReport.module.scss";

import { useTranslation } from "@/hooks/useTranslation";

const BillDetailsTemplate = ({ billData, selectedStore }) => {
  const { t } = useTranslation();
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return moment(date).format("DD MMM YYYY");
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return moment(date).format("DD MMM YYYY h:mm A");
  };



  return (
    <div className={styles.report} style={{ border: 'none', padding: '10px 0', boxShadow: 'none' }}>
      {/* 1. Top Header: Brand & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px', borderBottom: '1.5px solid #000', paddingBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#1a1a1a', margin: 0, textTransform: 'uppercase' }}>
            {selectedStore?.name || "DRAGBIZZ STORE"}
          </h1>
          <p style={{ fontSize: '10px', color: '#666', marginTop: '1px' }}>
            {selectedStore?.address || t("bills.storeLocationNotAvailable")}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 3px 0', textTransform: 'uppercase', lineHeight: 1 }}>{t("bills.invoice")}</h2>
          <div style={{ fontSize: '11px', color: '#1a1a1a' }}>
            <p style={{ margin: '0 0 1px 0', fontWeight: '700' }}>
              <span style={{ color: '#64748b', fontWeight: '500', marginRight: '5px' }}>{t("bills.billNumberLabel")}</span>
              {billData?.billNumber}
            </p>
            <p style={{ margin: 0, fontWeight: '700' }}>
              <span style={{ color: '#64748b', fontWeight: '500', marginRight: '5px' }}>{t("bills.billDateLabel")}</span>
              {formatDate(billData?.billDate)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}></div>

      {/* 3. Ultra-Compact Supplier Info */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#1a1a1a', margin: 0, textTransform: 'uppercase' }}>
            {billData?.supplier?.name || "N/A"}
          </h3>

          <div style={{ display: 'flex', gap: '15px', fontSize: '10.5px', color: '#444' }}>
            {billData?.supplier?.address && <span>{billData.supplier.address}</span>}
            {billData?.supplier?.phone && <span><b style={{ color: '#94a3b8', fontWeight: '600' }}>{t("bills.supplierPhoneLabel")}</b> {billData.supplier.phone}</span>}
            {billData?.supplier?.email && <span><b style={{ color: '#94a3b8', fontWeight: '600' }}>{t("bills.supplierEmailLabel")}</b> {billData.supplier.email}</span>}
            {billData?.supplier?.gstNumber && <span style={{ color: '#1e3a8a', fontWeight: '700' }}><span style={{ color: '#94a3b8', fontWeight: '600' }}>{t("bills.gstin")}</span> {billData.supplier.gstNumber}</span>}
          </div>
        </div>
      </div>

      <div>

        {billData?.items && billData.items.length > 0 && (
          <section className={styles.details} style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1.5px solid #eee', paddingBottom: '4px' }}>
              {t("bills.particulars")}
            </h3>
            <table className={styles.table} style={{ fontSize: '10px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 10px', fontSize: '10px', textAlign: "left" }}>{t("bills.product")}</th>
                  <th style={{ padding: '8px 10px', fontSize: '10px', textAlign: "left" }}>{t("bills.hsn")}</th>
                  <th style={{ padding: '8px 10px', fontSize: '10px', textAlign: "left" }}>{t("bills.qty")}</th>
                  <th style={{ padding: '8px 10px', fontSize: '10px', textAlign: "left" }}>{t("bills.unitPrice")}</th>
                  <th style={{ padding: '8px 10px', fontSize: '10px', textAlign: "left" }}>{t("bills.gstPercentage")}</th>
                  <th style={{ padding: '8px 10px', fontSize: '10px', textAlign: "left" }}>{t("bills.lineTotal")}</th>
                </tr>
              </thead>
              <tbody>
                {billData.items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px 10px', textAlign: "left" }}>{item.productName || t("bills.unnamedProduct")}</td>
                    <td style={{ padding: '8px 10px', textAlign: "left" }}>{item.hsnCode || "-"}</td>
                    <td style={{ padding: '8px 10px', textAlign: "left" }}>{item.quantity || 0}</td>
                    <td style={{ padding: '8px 10px', textAlign: "left" }}>
                      {formatCurrency(item.unitPrice || 0)}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: "left" }}>
                      {item.gstRate ? `${item.gstRate}%` : "0%"}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: "left" }}>
                      {formatCurrency(item.totalAmount || (item.quantity || 0) * (item.unitPrice || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 4. Refined Summary Section */}
        <section style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '260px' }}>
            <div style={{ borderBottom: '1.5px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#1a1a1a', textTransform: 'uppercase', margin: 0, textAlign: 'right' }}>
                {t("bills.financialSummary")}
              </h3>
            </div>

            <div style={{ display: 'grid', gap: '6px' }}>
              {/* Intermediate Totals */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#444' }}>
                <span style={{ fontWeight: '600' }}>{t("bills.taxableValue")}</span>
                <span style={{ fontWeight: '700' }}>{formatCurrency(billData.subtotal || billData.taxableAmount || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#444' }}>
                <span style={{ fontWeight: '600' }}>{t("bills.totalGst")}</span>
                <span style={{ fontWeight: '700', color: '#3b82f6' }}>{formatCurrency(billData.gstAmount || 0)}</span>
              </div>

              {/* Grand Total Box */}
              <div style={{
                marginTop: '8px',
                padding: '10px',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #1e3a8a',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#1e3a8a', textTransform: 'uppercase' }}>{t("bills.grandTotal")}</span>
                <span style={{ fontSize: '14px', fontWeight: '900', color: '#1e3a8a' }}>{formatCurrency(billData.totalAmount || 0)}</span>
              </div>

              {/* Payment Info */}
              <div style={{ marginTop: '8px', display: 'grid', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                  <span>{t("bills.paidAmountColon")}</span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(billData.paidAmount || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span style={{ fontWeight: '800', color: '#000' }}>{t("bills.balanceDue")}</span>
                  <span style={{ fontWeight: '900', color: '#ef4444' }}>{formatCurrency(billData.dueAmount || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ReportFooter reportType={t("bills.billDetailsFooter")} />
    </div >
  );
};

export default BillDetailsTemplate;

