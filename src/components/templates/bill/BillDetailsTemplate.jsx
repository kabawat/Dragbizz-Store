"use client";
import moment from "moment";
import { ReportFooter, ReportHeader } from "../analytics/common";
import styles from "../analytics/common/analyticsReport.module.scss";

const BillDetailsTemplate = ({ billData, selectedStore }) => {
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

  const getPaymentStatusText = (status, isOverdue) => {
    if (isOverdue) return "Overdue";
    const statusMap = {
      PAID: "Paid",
      PARTIAL: "Partial",
      UNPAID: "Pending",
    };
    return statusMap[status] || status || "N/A";
  };

  return (
    <div className={styles.report}>
      <ReportHeader
        title="BILL DETAILS REPORT"
        selectedStore={selectedStore}
      />

      <div>
        <section className={styles.details}>
          <h3>Bill Information</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td className={styles.label}>Bill Number:</td>
                  <td>{billData?.billNumber || "N/A"}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Payment Status:</td>
                  <td>
                    {getPaymentStatusText(
                      billData?.paymentStatus,
                      billData?.isOverdue
                    )}
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>Bill Date:</td>
                  <td>{formatDate(billData?.billDate)}</td>
                </tr>
                <tr>
                  <td className={styles.label}>Due Date:</td>
                  <td>{formatDate(billData?.dueDate)}</td>
                </tr>
                {billData?.purchaseOrder && (
                  <tr>
                    <td className={styles.label}>Purchase Order:</td>
                    <td>
                      {billData.purchaseOrder.poNumber ||
                        billData.purchaseOrder ||
                        "N/A"}
                    </td>
                  </tr>
                )}
                {billData?.goodsReceived !== undefined && (
                  <tr>
                    <td className={styles.label}>Goods Received:</td>
                    <td>{billData.goodsReceived ? "Yes" : "No"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {billData?.supplier && (
          <section className={styles.details}>
            <h3>Supplier Information</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td className={styles.label}>Name:</td>
                    <td>{billData.supplier.name || "N/A"}</td>
                  </tr>
                  {billData.supplier.email && (
                    <tr>
                      <td className={styles.label}>Email:</td>
                      <td>{billData.supplier.email}</td>
                    </tr>
                  )}
                  {billData.supplier.phone && (
                    <tr>
                      <td className={styles.label}>Phone:</td>
                      <td>{billData.supplier.phone}</td>
                    </tr>
                  )}
                  {billData.supplier.address && (
                    <tr>
                      <td className={styles.label}>Address:</td>
                      <td>{billData.supplier.address}</td>
                    </tr>
                  )}
                  {billData.supplier.gstNumber && (
                    <tr>
                      <td className={styles.label}>GST Number:</td>
                      <td>{billData.supplier.gstNumber}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {billData?.items && billData.items.length > 0 && (
          <section className={styles.details}>
            <h3>Items</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "right" }}>Quantity</th>
                    <th style={{ textAlign: "right" }}>Unit Price</th>
                    <th style={{ textAlign: "right" }}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {billData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName || "Unnamed Product"}</td>
                      <td style={{ textAlign: "right" }}>
                        {item.quantity || 0}
                      </td>
                      <td style={{ textAlign: "right" }} className={styles.amount}>
                        {formatCurrency(item.unitPrice || 0)}
                      </td>
                      <td style={{ textAlign: "right" }} className={styles.amount}>
                        {formatCurrency(
                          (item.quantity || 0) * (item.unitPrice || 0)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {billData?.itemsSummary && (
          <section className={styles.details}>
            <h3>Summary</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <tbody>
                  {billData.itemsSummary.subtotal !== undefined && (
                    <tr>
                      <td className={styles.label}>Subtotal:</td>
                      <td className={styles.amount}>
                        {formatCurrency(billData.itemsSummary.subtotal)}
                      </td>
                    </tr>
                  )}
                  {billData.itemsSummary.gstAmount !== undefined && (
                    <tr>
                      <td className={styles.label}>GST:</td>
                      <td className={styles.amount}>
                        {formatCurrency(billData.itemsSummary.gstAmount)}
                      </td>
                    </tr>
                  )}
                  {billData.itemsSummary.itemCount !== undefined && (
                    <tr>
                      <td className={styles.label}>Total Items:</td>
                      <td>{billData.itemsSummary.itemCount}</td>
                    </tr>
                  )}
                  {billData.itemsSummary.totalValue !== undefined && (
                    <tr>
                      <td className={styles.label}>Total Amount:</td>
                      <td className={styles.amount}>
                        {formatCurrency(billData.itemsSummary.totalValue)}
                      </td>
                    </tr>
                  )}
                  {billData.totalAmount !== undefined && (
                    <tr>
                      <td className={styles.label}>Total Amount:</td>
                      <td className={styles.amount}>
                        {formatCurrency(billData.totalAmount)}
                      </td>
                    </tr>
                  )}
                  {billData.paidAmount !== undefined && (
                    <tr>
                      <td className={styles.label}>Paid Amount:</td>
                      <td className={styles.amount}>
                        {formatCurrency(billData.paidAmount)}
                      </td>
                    </tr>
                  )}
                  {billData.dueAmount !== undefined && (
                    <tr>
                      <td className={styles.label}>Due Amount:</td>
                      <td className={styles.amount}>
                        {formatCurrency(billData.dueAmount)}
                      </td>
                    </tr>
                  )}
                  {billData.overdueDays !== undefined && billData.overdueDays > 0 && (
                    <tr>
                      <td className={styles.label}>Overdue Days:</td>
                      <td>{billData.overdueDays} days</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {billData?.batches && billData.batches.length > 0 && (
          <section className={styles.details}>
            <h3>Product Batches</h3>
            <div className={styles.details}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Batch Number</th>
                    <th>Product</th>
                    <th style={{ textAlign: "right" }}>Quantity</th>
                    <th style={{ textAlign: "right" }}>Purchase Price</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {billData.batches.map((batch, index) => (
                    <tr key={index}>
                      <td>{batch.batchNo || `Batch ${index + 1}`}</td>
                      <td>
                        {batch.product?.name || batch.productName || "N/A"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {batch.quantity || 0}
                      </td>
                      <td style={{ textAlign: "right" }} className={styles.amount}>
                        {formatCurrency(batch.purchasePrice || 0)}
                      </td>
                      <td>
                        {batch.expiryDate
                          ? formatDate(batch.expiryDate)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {billData?.notes && (
          <section className={styles.details}>
            <h3>Notes</h3>
            <div className={styles.details}>
              <p>{billData.notes}</p>
            </div>
          </section>
        )}

        <section className={styles.details}>
          <h3>Meta Information</h3>
          <div className={styles.details}>
            <table className={styles.table}>
              <tbody>
                {billData?.createdAt && (
                  <tr>
                    <td className={styles.label}>Created:</td>
                    <td>{formatDateTime(billData.createdAt)}</td>
                  </tr>
                )}
                {billData?.updatedAt && (
                  <tr>
                    <td className={styles.label}>Updated:</td>
                    <td>{formatDateTime(billData.updatedAt)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <ReportFooter reportType="bill details" />
    </div>
  );
};

export default BillDetailsTemplate;

