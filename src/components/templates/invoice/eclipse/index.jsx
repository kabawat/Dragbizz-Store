"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const EclipseTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) =>
        `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <InvoiceContainer>
            <div className={styles.eclipseInvoice} >
                {/* Header */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <p>{selectedStore?.storeName || "Your Store"}</p>
                    <p>Invoice No: {invoiceData.invoiceNumber}</p>
                    <p>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</p>
                </div>

                {/* Customer & Store Info */}
                <div className={styles.detailsSection}>
                    <div className={styles.block}>
                        <div className={styles.label}>Bill To</div>
                        <div className={styles.value}>
                            {invoiceData.customer?.name || "Walk-in Customer"}
                        </div>
                        {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
                        {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
                        {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
                    </div>

                    <div className={styles.block} style={{ textAlign: "right" }}>
                        <div className={styles.label}>From</div>
                        <div className={styles.value}>
                            {selectedStore?.storeName || "Your Store"}
                        </div>
                        {selectedStore?.email && <p>{selectedStore.email}</p>}
                        {selectedStore?.phone && <p>{selectedStore.phone}</p>}
                        {selectedStore?.address && <p>{selectedStore.address}</p>}
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.invoiceTable}>
                        <thead>
                            <tr>
                                <th style={{ width: "50%" }}>Item</th>
                                <th style={{ width: "15%", textAlign: "center" }}>Qty</th>
                                <th style={{ width: "20%", textAlign: "right" }}>Price</th>
                                <th style={{ width: "15%", textAlign: "right" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.productName}>
                                            {item.product?.name || "Unnamed Product"}
                                        </div>
                                        {item.product?.sku && (
                                            <span className={styles.productSku}>
                                                SKU: {item.product.sku}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurrency(item.price)}</td>
                                    <td style={{ textAlign: "right" }}>
                                        {formatCurrency(item.quantity * item.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className={styles.totals}>
                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Subtotal:</span>
                        <span className={styles.totalValue}>{formatCurrency(invoiceData.subtotal)}</span>
                    </div>
                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>GST:</span>
                        <span className={styles.totalValue}>{formatCurrency(invoiceData.gstAmount)}</span>
                    </div>
                    {invoiceData.totalDiscount > 0 && (
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Discount:</span>
                            <span className={styles.totalValue} style={{ color: "#ef4444" }}>
                                -{formatCurrency(invoiceData.totalDiscount)}
                            </span>
                        </div>
                    )}
                    <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                        <span className={styles.totalLabel}>Total:</span>
                        <span className={styles.totalValue}>{formatCurrency(invoiceData.totalAmount)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your business!</p>
                    <p>
                        Generated on{" "}
                        {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
                    </p>
                    <p>
                        This invoice was auto-generated and does not require a signature.
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default EclipseTemplate;
