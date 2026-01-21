"use client";
import moment from "moment";
import { ReportFooter, ReportHeader } from "../analytics/common";
import styles from "../analytics/common/analyticsReport.module.scss";

const InventoryDetailsTemplate = ({ inventoryData, selectedStore }) => {
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
        title="INVENTORY DETAILS REPORT"
        selectedStore={selectedStore}
      />

      <div>
        <section className={styles.details}>
          <h3>Product Information</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td className={styles.label}>Product Name:</td>
                  <td>{inventoryData?.product?.name || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Brand:</td>
                  <td>{inventoryData?.product?.brand || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Category:</td>
                  <td>{inventoryData?.product?.category || "N/A"}</td>
                </tr>
                {inventoryData?.product?.sku && (
                  <tr>
                    <td className={styles.label}>SKU:</td>
                    <td>{inventoryData.product.sku}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {inventoryData?.stockSummary && (
          <section className={styles.details}>
            <h3>Stock Information</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td className={styles.label}>Total Quantity:</td>
                    <td>{inventoryData.stockSummary.totalQuantity || 0}</td>
                  </tr>
                  <tr>
                    <td className={styles.label}>Available Quantity:</td>
                    <td>
                      {inventoryData.stockSummary.availableQuantity || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.label}>Reserved Quantity:</td>
                    <td>{inventoryData.stockSummary.reservedQuantity || 0}</td>
                  </tr>
                  <tr>
                    <td className={styles.label}>Sold Quantity:</td>
                    <td>{inventoryData.stockSummary.soldQuantity || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {inventoryData?.batchSummary && (
          <section className={styles.details}>
            <h3>Batch Summary</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td className={styles.label}>Total Batches:</td>
                    <td>{inventoryData.batchSummary.totalBatches || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {inventoryData?.pricingSummary && (
          <section className={styles.details}>
            <h3>Pricing Information</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  {inventoryData.pricingSummary.averagePurchasePrice !==
                    undefined && (
                    <tr>
                      <td className={styles.label}>Avg Purchase Price:</td>
                      <td className={styles.amount}>
                        {formatCurrency(
                          inventoryData.pricingSummary.averagePurchasePrice
                        )}
                      </td>
                    </tr>
                  )}
                  {inventoryData.pricingSummary.averageSellingPrice !==
                    undefined && (
                    <tr>
                      <td className={styles.label}>Avg Selling Price:</td>
                      <td className={styles.amount}>
                        {formatCurrency(
                          inventoryData.pricingSummary.averageSellingPrice
                        )}
                      </td>
                    </tr>
                  )}
                  {inventoryData.pricingSummary.totalPurchaseValue !==
                    undefined && (
                    <tr>
                      <td className={styles.label}>Total Purchase Value:</td>
                      <td className={styles.amount}>
                        {formatCurrency(
                          inventoryData.pricingSummary.totalPurchaseValue
                        )}
                      </td>
                    </tr>
                  )}
                  {inventoryData.pricingSummary.totalSellingValue !==
                    undefined && (
                    <tr>
                      <td className={styles.label}>Total Selling Value:</td>
                      <td className={styles.amount}>
                        {formatCurrency(
                          inventoryData.pricingSummary.totalSellingValue
                        )}
                      </td>
                    </tr>
                  )}
                  {inventoryData.pricingSummary.totalProfit !== undefined && (
                    <tr>
                      <td className={styles.label}>Total Profit:</td>
                      <td className={styles.amount}>
                        {formatCurrency(
                          inventoryData.pricingSummary.totalProfit
                        )}
                      </td>
                    </tr>
                  )}
                  {inventoryData.pricingSummary.profitMargin !== undefined && (
                    <tr>
                      <td className={styles.label}>Profit Margin:</td>
                      <td>
                        {inventoryData.pricingSummary.profitMargin?.toFixed(1) ||
                          0}
                        %
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {inventoryData?.paymentSummary && (
          <section className={styles.details}>
            <h3>Payment Summary</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  {inventoryData.paymentSummary.totalPaid !== undefined && (
                    <tr>
                      <td className={styles.label}>Total Paid:</td>
                      <td className={styles.amount}>
                        {formatCurrency(
                          inventoryData.paymentSummary.totalPaid
                        )}
                      </td>
                    </tr>
                  )}
                  {inventoryData.paymentSummary.totalDue !== undefined && (
                    <tr>
                      <td className={styles.label}>Total Due:</td>
                      <td className={styles.amount}>
                        {formatCurrency(
                          inventoryData.paymentSummary.totalDue
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {inventoryData?.batches && inventoryData.batches.length > 0 && (
          <section className={styles.details}>
            <h3>Batch Details</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Batch Number</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>Expiry Date</th>
                    <th>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.batches.map((batch, index) => (
                    <tr key={index}>
                      <td>{batch.batchNumber || `Batch ${index + 1}`}</td>
                      <td>{batch.quantity || 0}</td>
                      <td className={styles.amount}>
                        {formatCurrency(batch.purchasePrice)}
                      </td>
                      <td>
                        {batch.expiryDate
                          ? formatDate(batch.expiryDate)
                          : "N/A"}
                      </td>
                      <td>
                        {batch.supplier?.name || batch.supplier || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <ReportFooter reportType="inventory details" />
    </div>
  );
};

export default InventoryDetailsTemplate;

