"use client";
import moment from "moment";
import { ReportFooter, ReportHeader } from "../analytics/common";
import styles from "../analytics/common/analyticsReport.module.scss";

const PurchaseOrderDetailsTemplate = ({ purchaseOrderData, selectedStore }) => {
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

  const totalItems = (purchaseOrderData?.items || []).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const itemsReceived = (purchaseOrderData?.items || []).reduce(
    (sum, item) => sum + (item.receivedQuantity || 0),
    0
  );

  const pendingItems = Math.max(totalItems - itemsReceived, 0);

  return (
    <div className={styles.report}>
      <ReportHeader
        title="PURCHASE ORDER DETAILS REPORT"
        selectedStore={selectedStore}
      />

      <div>
        <section className={styles.details}>
          <h3>Purchase Order Information</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td className={styles.label}>PO Number:</td>
                  <td>{purchaseOrderData?.poNumber || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Status:</td>
                  <td>{purchaseOrderData?.status || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Approval Status:</td>
                  <td>{purchaseOrderData?.approvalStatus || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>PO Date:</td>
                  <td>{formatDate(purchaseOrderData?.poDate)}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Expected Delivery:</td>
                  <td>
                    {formatDate(purchaseOrderData?.expectedDeliveryDate)}
                  </td>
                </tr>
                {purchaseOrderData?.paymentTerms && (
                  <tr>
                    <td className={styles.label}>Payment Terms:</td>
                    <td>{purchaseOrderData.paymentTerms}</td>
                  </tr>
                )}
                {purchaseOrderData?.completionPercentage !== undefined && (
                  <tr>
                    <td className={styles.label}>Completion:</td>
                    <td>{purchaseOrderData.completionPercentage}%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {purchaseOrderData?.supplier && (
          <section className={styles.details}>
            <h3>Supplier Information</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td className={styles.label}>Name:</td>
                    <td>{purchaseOrderData.supplier.name || "N/A"}</td>
                  </tr>
                  {purchaseOrderData.supplier.email && (
                    <tr>
                      <td className={styles.label}>Email:</td>
                      <td>{purchaseOrderData.supplier.email}</td>
                    </tr>
                  )}
                  {purchaseOrderData.supplier.phone && (
                    <tr>
                      <td className={styles.label}>Phone:</td>
                      <td>{purchaseOrderData.supplier.phone}</td>
                    </tr>
                  )}
                  {purchaseOrderData.supplier.address && (
                    <tr>
                      <td className={styles.label}>Address:</td>
                      <td>{purchaseOrderData.supplier.address}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {purchaseOrderData?.items && purchaseOrderData.items.length > 0 && (
          <section className={styles.details}>
            <h3>Items</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th style={{ textAlign: "right" }}>Ordered</th>
                    <th style={{ textAlign: "right" }}>Received</th>
                    <th style={{ textAlign: "right" }}>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrderData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.name || "N/A"}</td>
                      <td>{item.product?.sku || "N/A"}</td>
                      <td style={{ textAlign: "right" }}>
                        {item.quantity || 0}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {item.receivedQuantity || 0}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {item.pendingQuantity ??
                          Math.max(
                            (item.quantity || 0) - (item.receivedQuantity || 0),
                            0
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className={styles.details}>
          <h3>Summary</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td className={styles.label}>Total Items:</td>
                  <td>{totalItems}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Items Received:</td>
                  <td>{itemsReceived}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Pending Items:</td>
                  <td>{pendingItems}</td>
                </tr>
                {purchaseOrderData?.advanceAmount !== undefined && (
                  <tr>
                    <td className={styles.label}>Advance Paid:</td>
                    <td className={styles.amount}>
                      {formatCurrency(purchaseOrderData.advanceAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {(purchaseOrderData?.notes ||
          purchaseOrderData?.internalNotes ||
          purchaseOrderData?.supplierNotes) && (
          <section className={styles.details}>
            <h3>Notes</h3>
            <div className={styles.details}>
              {purchaseOrderData.notes && (
                <div>
                  <p className={styles.label}>General Notes:</p>
                  <p>{purchaseOrderData.notes}</p>
                </div>
              )}
              {purchaseOrderData.internalNotes && (
                <div>
                  <p className={styles.label}>Internal Notes:</p>
                  <p>{purchaseOrderData.internalNotes}</p>
                </div>
              )}
              {purchaseOrderData.supplierNotes && (
                <div>
                  <p className={styles.label}>Supplier Notes:</p>
                  <p>{purchaseOrderData.supplierNotes}</p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className={styles.details}>
          <h3>Meta Information</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                {purchaseOrderData?.createdAt && (
                  <tr>
                    <td className={styles.label}>Created:</td>
                    <td>{formatDateTime(purchaseOrderData.createdAt)}</td>
                  </tr>
                )}
                {purchaseOrderData?.updatedAt && (
                  <tr>
                    <td className={styles.label}>Updated:</td>
                    <td>{formatDateTime(purchaseOrderData.updatedAt)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <ReportFooter reportType="purchase order details" />
    </div>
  );
};

export default PurchaseOrderDetailsTemplate;

