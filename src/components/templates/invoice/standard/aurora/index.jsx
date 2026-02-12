"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const AuroraTemplate = ({ invoiceData, selectedStore }) => {
    // Helper function to safely format currency
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.auroraInvoice} >
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>INVOICE</h1>
                        <p>{selectedStore?.storeName || "Your Store"}</p>
                    </div>
                    <div className={styles.headerRight}>
                        <p>
                            Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
                        </p>
                        <p>Date: {moment(invoiceData.createdAt).format("MMM DD, YYYY")}</p>
                    </div>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoBox}>
                            <h4>Bill To</h4>
                            <p>{invoiceData.customer?.name || "Walk-in Customer"}</p>
                            {invoiceData.customer?.phone && (
                                <p>{invoiceData.customer.phone}</p>
                            )}
                            {invoiceData.customer?.email && (
                                <p>{invoiceData.customer.email}</p>
                            )}
                        </div>

                        <div className={styles.infoBox}>
                            <h4>From</h4>
                            <p>{selectedStore?.storeName || "Your Store"}</p>
                            <p>{selectedStore?.email || "info@yourstore.com"}</p>
                            <p>{selectedStore?.phone || "+91 9876543210"}</p>
                        </div>
                    </div>

                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: "50%" }}>Item</th>
                                <th style={{ width: "15%" }}>Qty</th>
                                <th style={{ width: "20%" }}>Price</th>
                                <th style={{ width: "15%" }}>Total</th>
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
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.price)}</td>
                                    <td>{formatCurrency(item.quantity * item.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className={styles.totalsSection}>
                        <div className={styles.totals}>
                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Subtotal:</span>
                                <span className={styles.totalAmount}>
                                    {formatCurrency(invoiceData.subtotal)}
                                </span>
                            </div>
                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>GST:</span>
                                <span className={styles.totalAmount}>
                                    {formatCurrency(invoiceData.gstAmount || 0)}
                                </span>
                            </div>
                            {invoiceData.totalDiscount > 0 && (
                                <div className={styles.totalRow}>
                                    <span className={styles.totalLabel}>Discount:</span>
                                    <span className={styles.totalAmount} style={{ color: "#ef4444" }}>
                                        -{formatCurrency(invoiceData.totalDiscount)}
                                    </span>
                                </div>
                            )}
                            <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                                <span className={styles.totalLabel}>Total:</span>
                                <span className={styles.totalAmount}>
                                    {formatCurrency(invoiceData.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your purchase!</p>
                    <p>
                        Generated on{" "}
                        {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default AuroraTemplate;
