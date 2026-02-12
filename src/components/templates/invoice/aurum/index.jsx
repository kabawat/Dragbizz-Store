"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const AurumTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) =>
        `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <InvoiceContainer>
            <div className={styles.aurumInvoice} >
                {/* Header */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <div className={styles.subtitle}>
                        {selectedStore?.storeName || "Your Store Name"}
                    </div>
                    <div className={styles.contactInfo}>
                        {selectedStore?.address && <span>{selectedStore.address} | </span>}
                        {selectedStore?.phone && <span>Ph: {selectedStore.phone} | </span>}
                        {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <div className={styles.infoBlock}>
                        <div className={styles.label}>Invoice Details</div>
                        <p>
                            Invoice #: <strong>{invoiceData.invoiceNumber}</strong>
                        </p>
                        <p>
                            Date: <strong>{moment(invoiceData.createdAt).format("DD MMM YYYY")}</strong>
                        </p>
                        {invoiceData.paymentMode && (
                            <p>
                                Payment: <strong>{invoiceData.paymentMode}</strong>
                            </p>
                        )}
                    </div>
                    <div className={styles.infoBlock}>
                        <div className={styles.label}>Bill To</div>
                        <p>
                            <strong>{invoiceData.customer?.name || "Walk-in Customer"}</strong>
                        </p>
                        {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
                        {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.invoiceTable}>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style={{ textAlign: "center" }}>Qty</th>
                                <th style={{ textAlign: "right" }}>Rate</th>
                                <th style={{ textAlign: "right" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.product?.name || "Product Name"}</td>
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
                <div className={styles.totalsSection}>
                    <div className={styles.totalCard}>
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Subtotal:</span>
                            <span>{formatCurrency(invoiceData.subtotal)}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>GST:</span>
                            <span>{formatCurrency(invoiceData.gstAmount)}</span>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Discount:</span>
                                <span style={{ color: "#ff4d4f" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </span>
                            </div>
                        )}
                        <div className={`${styles.totalRow} ${styles.finalRow}`}>
                            <span>Total Amount:</span>
                            <span>{formatCurrency(invoiceData.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your business!</p>
                    <div className={styles.timestamp}>
                        Generated on {moment().format("DD/MM/YYYY HH:mm:ss")}
                    </div>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default AurumTemplate;
