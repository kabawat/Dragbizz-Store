"use client";
import moment from "moment";
import { ReportFooter, ReportHeader } from "../analytics/common";
import styles from "../analytics/common/analyticsReport.module.scss";

const CustomerDetailsTemplate = ({ customerData, selectedStore }) => {
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
        title="CUSTOMER DETAILS REPORT"
        selectedStore={selectedStore}
      />

      <div>
        <section className={styles.details}>
          <h3>Basic Information</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td className={styles.label}>Customer Name:</td>
                  <td>{customerData?.name || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Phone Number:</td>
                  <td>{customerData?.phone || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Email Address:</td>
                  <td>{customerData?.email || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {customerData?.companyDetails && (
          <section className={styles.details}>
            <h3>Company Details</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  {customerData.companyDetails.companyName && (
                    <tr>
                      <td className={styles.label}>Company Name:</td>
                      <td>{customerData.companyDetails.companyName}</td>
                    </tr>
                  )}
                  {customerData.companyDetails.gstin && (
                    <tr>
                      <td className={styles.label}>GSTIN:</td>
                      <td>{customerData.companyDetails.gstin}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {customerData?.account && (
          <section className={styles.details}>
            <h3>Account Summary</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td className={styles.label}>Total Amount:</td>
                    <td className={styles.amount}>
                      {formatCurrency(customerData.account.totalAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.label}>Total Invoices:</td>
                    <td>{customerData.account.totalInvoices || 0}</td>
                  </tr>
                  <tr>
                    <td className={styles.label}>Items Purchased:</td>
                    <td>{customerData.account.totalItemsPurchased || 0}</td>
                  </tr>
                  <tr>
                    <td className={styles.label}>Total Paid:</td>
                    <td className={styles.amount}>
                      {formatCurrency(customerData.account.totalPaid)}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.label}>Total Due:</td>
                    <td className={styles.amount}>
                      {formatCurrency(customerData.account.totalDue)}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.label}>Total Profit:</td>
                    <td className={styles.amount}>
                      {formatCurrency(customerData.account.totalProfit)}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.label}>Account Status:</td>
                    <td>{customerData.account.accountStatus || "ACTIVE"}</td>
                  </tr>
                  {customerData.account.joinedAt && (
                    <tr>
                      <td className={styles.label}>Joined At:</td>
                      <td>{formatDate(customerData.account.joinedAt)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {customerData?.addresses &&
          (customerData.addresses.billing ||
            customerData.addresses.shipping) && (
            <section className={styles.details}>
              <h3>Addresses</h3>
              {customerData.addresses.billing && (
                <div className={styles.details}>
                  <h3>Billing Address</h3>
                  <table className={styles.table}>
                    <tbody>
                      <tr>
                        <td className={styles.label}>Address Line 1:</td>
                        <td>
                          {customerData.addresses.billing.addressLine1 || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>City:</td>
                        <td>{customerData.addresses.billing.city || "N/A"}</td>
                      </tr>
                      <tr>
                        <td className={styles.label}>State:</td>
                        <td>{customerData.addresses.billing.state || "N/A"}</td>
                      </tr>
                      <tr>
                        <td className={styles.label}>Pincode:</td>
                        <td>
                          {customerData.addresses.billing.pincode || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>Country:</td>
                        <td>
                          {customerData.addresses.billing.country || "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {customerData.addresses.shipping && (
                <div className={styles.details}>
                  <h3>Shipping Address</h3>
                  <table className={styles.table}>
                    <tbody>
                      <tr>
                        <td className={styles.label}>Address Line 1:</td>
                        <td>
                          {customerData.addresses.shipping.addressLine1 || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>City:</td>
                        <td>
                          {customerData.addresses.shipping.city || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>State:</td>
                        <td>
                          {customerData.addresses.shipping.state || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>Pincode:</td>
                        <td>
                          {customerData.addresses.shipping.pincode || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>Country:</td>
                        <td>
                          {customerData.addresses.shipping.country || "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
      </div>

      <ReportFooter reportType="customer details" />
    </div>
  );
};

export default CustomerDetailsTemplate;

