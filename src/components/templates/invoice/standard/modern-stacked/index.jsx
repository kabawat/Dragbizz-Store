"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const ModernStackedTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.modernInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <div className={styles.storeInfo}>
                        <span className={styles.storeName}>
                            {selectedStore?.storeName || "Redline Solutions"}
                        </span>
                        <p>{selectedStore?.address || "101 Modern Street, High City"}</p>
                        <p>
                            {selectedStore?.phone && <span>Ph: {selectedStore.phone} | </span>}
                            {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                        </p>
                    </div>
                </div>

                {/* Info Blocks */}
                <div className={styles.infoContainer}>
                    {/* Bill To Details */}
                    <div className={`${styles.block} ${styles.customer}`}>
                        <div className={styles.title}>Bill To</div>
                        <p className={styles.valueLarge}>
                            {invoiceData.customer?.name || "Premium Customer"}
                        </p>
                        {invoiceData.customer?.email && (
                            <p>{invoiceData.customer.email}</p>
                        )}
                        {invoiceData.customer?.phone && (
                            <p>{invoiceData.customer.phone}</p>
                        )}
                        {invoiceData.customer?.address && (
                            <p>{invoiceData.customer.address}</p>
                        )}
                    </div>

                    {/* Invoice Details */}
                    <div className={`${styles.block} ${styles.invoiceDetails}`}>
                        <div className={styles.title}>Invoice Details</div>
                        <p>
                            Invoice #:{" "}
                            <span className={styles.valueLarge}>
                                {invoiceData.invoiceNumber}
                            </span>
                        </p>
                        <p>
                            Date Issued:{" "}
                            <span className={styles.valueLarge}>
                                {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                            </span>
                        </p>
                        {invoiceData.paymentMode && (
                            <p>
                                Payment: <span className={styles.valueLarge}>{invoiceData.paymentMode}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.modernTable}>
                        <thead>
                            <tr>
                                <th style={{ width: "50%" }}>Description (SKU)</th>
                                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                                <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                                <th style={{ width: "20%", textAlign: "right" }}>Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td className={styles.productInfo}>
                                        <div className={styles.productName}>
                                            {item.product?.name || "Unnamed Item"}
                                        </div>
                                        {item.product?.sku && (
                                            <div className={styles.productSku}>
                                                SKU: {item.product.sku}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                    <td style={{ textAlign: "right" }}>
                                        {formatCurrency(item.price)}
                                    </td>
                                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                                        {formatCurrency(item.quantity * item.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className={styles.totalsArea}>
                    <div className={styles.totalsTable}>
                        <div className={styles.totalRow}>
                            <div className={styles.label}>Subtotal:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </div>
                        </div>
                        <div className={styles.totalRow}>
                            <div className={styles.label}>Tax (GST):</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.gstAmount || 0)}
                            </div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <div className={styles.label}>Discount:</div>
                                <div className={styles.amount} style={{ color: "#2ecc71" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                        <div className={styles.finalRow}>
                            <div className={styles.finalLabel}>AMOUNT DUE</div>
                            <div className={styles.finalAmount}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>
                        Payment confirms acceptance of services. Invoice generated on{" "}
                        {moment().format("MMMM Do YYYY, h:mm a")}.
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default ModernStackedTemplate;
