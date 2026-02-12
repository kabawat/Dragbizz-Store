"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const AuraTemplate = ({ invoiceData, selectedStore }) => {
    // Helper function to safely format currency
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const TEXT_COLOR = "#2c3e50"; // Dark text color

    return (
        <InvoiceContainer>
            <div className={styles.auraInvoice} >
                {/* Top Bar for Invoice Number and Date */}
                <div className={styles.topBar}>
                    <span>
                        Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
                    </span>
                    <span>
                        Date Issued:{" "}
                        <strong>
                            {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                        </strong>
                    </span>
                </div>

                {/* Header Section */}
                <div className={styles.header}>
                    <div>
                        <h1>INVOICE</h1>
                    </div>
                    <div className={styles.storeInfo}>
                        <h2>{selectedStore?.storeName || "PREMIUM SOLUTIONS"}</h2>
                        <p>{selectedStore?.address || "789 Corporate Drive"}</p>
                        <p>{selectedStore?.phone || "+91 9876543210"}</p>
                        <p>{selectedStore?.email || "contact@premium.com"}</p>
                    </div>
                </div>

                {/* Billing and Customer Info */}
                <div className={styles.infoSection}>
                    <div className={styles.infoBlock}>
                        <div className="label">Bill To</div>
                        <div className="value">
                            {invoiceData.customer?.name || "Walk-in Customer"}
                        </div>
                        {invoiceData.customer?.email && (
                            <p>{invoiceData.customer.email}</p>
                        )}
                        {invoiceData.customer?.phone && (
                            <p>{invoiceData.customer.phone}</p>
                        )}
                    </div>
                    <div className={`${styles.infoBlock} ${styles.rightAlign}`}>
                        <div className="label">Payment Status</div>
                        <div className="value" style={{ color: TEXT_COLOR }}>
                            {invoiceData.paymentStatus || "PAID"}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: "50%" }}>Item Description</th>
                            <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                            <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                            <th style={{ width: "20%", textAlign: "right" }}>Amount</th>
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
                                        <div className={styles.productSku}>
                                            SKU: {item.product.sku}
                                        </div>
                                    )}
                                </td>
                                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                <td style={{ textAlign: "right" }}>
                                    {formatCurrency(item.price)}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    {formatCurrency(item.quantity * item.price)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals Section */}
                <div className={styles.totalsContainer}>
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
                                {formatCurrency(invoiceData.gstAmount)}
                            </span>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Discount:</span>
                                <span className={styles.totalAmount} style={{ color: "#e74c3c" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </span>
                            </div>
                        )}
                        <div className={`${styles.totalRow} ${styles.finalRow}`}>
                            <span className={styles.finalLabel}>TOTAL DUE:</span>
                            <span className={styles.finalAmount}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your business. Please make payments promptly.</p>
                    <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default AuraTemplate;
