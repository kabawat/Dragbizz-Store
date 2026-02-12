"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const ElitePaperTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.elitepaperInvoice} id="invoice">
                {/* Header Section */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <div className={styles.tagline}>
                        ElitePaper Billing Solutions
                    </div>
                    <div className={styles.storeInfo}>
                        <p>
                            <span className={styles.valueBold}>
                                {selectedStore?.storeName || "ElitePaper Global"}
                            </span>{" "}
                            | {selectedStore?.address || "789 Corporate Blvd"}
                        </p>
                        <p>
                            {selectedStore?.phone && <span>Ph: {selectedStore.phone} | </span>}
                            {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                        </p>
                    </div>
                </div>

                {/* Info Bar */}
                <div className={styles.infoSection}>
                    <div className={styles.infoBlock}>
                        <div className={styles.label}>Invoice Details</div>
                        <p>
                            Invoice #:{" "}
                            <span className={styles.valueBold}>
                                {invoiceData.invoiceNumber}
                            </span>
                        </p>
                        <p>
                            Date Issued:{" "}
                            <span className={styles.valueBold}>
                                {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                            </span>
                        </p>
                        {invoiceData.paymentMode && (
                            <p>
                                Payment: <span className={styles.valueBold}>{invoiceData.paymentMode}</span>
                            </p>
                        )}
                    </div>

                    <div className={styles.infoBlock}>
                        <div className={styles.label}>Bill To</div>
                        <p className={styles.valueBold}>
                            {invoiceData.customer?.name || "Walk-in Customer"}
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
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.elitepaperTable}>
                        <thead>
                            <tr>
                                <th style={{ width: "50%" }}>Description</th>
                                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                                <th style={{ width: "20%", textAlign: "right" }}>Rate</th>
                                <th style={{ width: "20%", textAlign: "right" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
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
                    <div className={styles.totalsTable}>
                        <div className={styles.totalRow}>
                            <div className={styles.totalLabel}>Subtotal:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </div>
                        </div>
                        <div className={styles.totalRow}>
                            <div className={styles.totalLabel}>Tax (GST):</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.gstAmount)}
                            </div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <div className={styles.totalLabel}>Discount:</div>
                                <div className={styles.amount} style={{ color: "#c0392b" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                        <div className={styles.finalRow}>
                            <div className={styles.finalLabel}>AMOUNT DUE:</div>
                            <div className={styles.finalAmount}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>
                        Thank you for choosing ElitePaper. All prices are inclusive of
                        applicable taxes.
                    </p>
                    <p>
                        Generated on {moment().format("YYYY-MM-DD [at] HH:mm:ss")}
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default ElitePaperTemplate;
