"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const OrionTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.orionInvoice} >
                {/* Header */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <p>
                        Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
                    </p>
                </div>

                <div className={styles.content}>
                    {/* Store Info */}
                    <div className={styles.storeInfo}>
                        <h2>{selectedStore?.storeName || "Your Store"}</h2>
                        <p>{selectedStore?.address || "123 Business Street, City"}</p>
                        {selectedStore?.phone && <p>Ph: {selectedStore.phone}</p>}
                        {selectedStore?.email && <p>Email: {selectedStore.email}</p>}
                    </div>

                    {/* Details Bar */}
                    <div className={styles.details}>
                        <div className={styles.block}>
                            <div className={styles.label}>Bill To</div>
                            <div className={styles.value}>
                                {invoiceData.customer?.name || "Walk-in Customer"}
                            </div>
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
                        <div className={styles.block} style={{ textAlign: "right" }}>
                            <div className={styles.label}>Date</div>
                            <div className={styles.value}>
                                {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                            </div>
                            {invoiceData.paymentMode && (
                                <div style={{ marginTop: "10px" }}>
                                    <div className={styles.label}>Payment Mode</div>
                                    <div className={styles.value}>{invoiceData.paymentMode}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <td style={{ width: "50%" }}>Item</td>
                                <td style={{ width: "15%", textAlign: "center" }}>Qty</td>
                                <td style={{ width: "20%", textAlign: "right" }}>Rate</td>
                                <td style={{ width: "15%", textAlign: "right" }}>Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ width: "50%" }} className={styles.productName}>
                                        {item.product?.name || "Unnamed Product"}
                                        {item.product?.sku && (
                                            <div style={{ fontSize: "11px", fontWeight: "normal", color: "#7f8c8d" }}>
                                                SKU: {item.product.sku}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ width: "15%", textAlign: "center" }}>{item.quantity}</td>
                                    <td style={{ width: "20%", textAlign: "right" }}>{formatCurrency(item.price)}</td>
                                    <td style={{ width: "15%", textAlign: "right", fontWeight: 700 }}>
                                        {formatCurrency(item.quantity * item.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className={styles.totals}>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>Subtotal:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>Tax (GST):</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.gstAmount || 0)}
                            </div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.row}>
                                <div className={styles.totalLabel}>Discount:</div>
                                <div className={styles.amount} style={{ color: "#e74c3c" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                        <div className={`${styles.row} ${styles.finalRow}`}>
                            <div className={styles.totalLabel}>Total:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for shopping with us!</p>
                    <p>
                        Generated on{" "}
                        {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
                    </p>
                    <p>
                        This invoice is system-generated and doesn’t require a signature.
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default OrionTemplate;
