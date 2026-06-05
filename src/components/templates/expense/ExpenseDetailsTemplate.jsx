"use client";
import moment from "moment";
import { ReportFooter, ReportHeader } from "../analytics/common";
import styles from "../analytics/common/analyticsReport.module.scss";
import {
  getCategoryLabel,
  getPaymentMethodLabel,
  getStatusLabel,
} from "@/data/constants/expenses";

const ExpenseDetailsTemplate = ({ expenseData, selectedStore }) => {
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

  return (
    <div className={styles.report}>
      <ReportHeader
        title="EXPENSE DETAILS REPORT"
        selectedStore={selectedStore}
      />

      <div>
        <section className={styles.details}>
          <h3>Basic Information</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td className={styles.label}>Expense Title:</td>
                  <td>{expenseData?.title || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Bill Number:</td>
                  <td>{expenseData?.billNumber || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Date:</td>
                  <td>{formatDate(expenseData?.date)}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Amount:</td>
                  <td className={styles.amount}>
                    {formatCurrency(expenseData?.amount)}
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>Status:</td>
                  <td>
                    {expenseData?.status ? getStatusLabel(expenseData.status) : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.details}>
          <h3>Category & Vendor</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td className={styles.label}>Category:</td>
                  <td>
                    {expenseData?.category?.name ? getCategoryLabel(expenseData.category?.name) : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>Vendor:</td>
                  <td>
                    {expenseData?.vendor?.name || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>Payment Method:</td>
                  <td>
                    {expenseData?.paymentMethod ? getPaymentMethodLabel(expenseData.paymentMethod) : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {expenseData?.description && (
          <section className={styles.details}>
            <h3>Description</h3>
            <div className={styles.details}>
              <p style={{ padding: "10px 0", whiteSpace: "pre-wrap" }}>
                {expenseData.description}
              </p>
            </div>
          </section>
        )}
      </div>

      <ReportFooter reportType="expense details" />
    </div>
  );
};

export default ExpenseDetailsTemplate;

