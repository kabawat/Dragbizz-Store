"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const CosmicReceiptTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.cosmicInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <h1>RECEIPT</h1>
                    <div className={styles.storeInfo}>
                        <p>
                            <span className={styles.storeName}>
                                {selectedStore?.storeName || "Cosmic Systems Ltd."}
                            </span>
                        </p>
                        <p>
                            {selectedStore?.address && <span>{selectedStore.address} | </span>}
                            {selectedStore?.phone && <span>Ph: {selectedStore.phone}</span>}
                        </p>
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <div className={styles.infoBlock}>
                        <div className={styles.label}>Transaction Meta</div>
                        <p>
                            Invoice #:{" "}
                            <span className={styles.valueBold}>
                                {invoiceData.invoiceNumber}
                            </span>
                        </p>
                        <p>
                            Date:{" "}
                            <span className={styles.valueBold}>
                                {moment(invoiceData.createdAt).format("YYYY-MM-DD")}
                            </span>
                        </p>
                    </div>

                    <div className={styles.infoBlock} style={{ textAlign: "right" }}>
                        <div className={styles.label}>Billed To</div>
                        <p className={styles.valueBold}>
                            {invoiceData.customer?.name || "Walk-in Customer"}
                        </p>
                        {invoiceData.customer?.email && (
                            <p>{invoiceData.customer.email}</p>
                        )}
                        {invoiceData.customer?.phone && (
                            <p>{invoiceData.customer.phone}</p>
                        )}
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.cosmicTable}>
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
                                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                                        {formatCurrency(item.quantity * item.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className={styles.totalsSection}>
                    <div className={styles.totalRow}>
                        <div className={styles.rowLabel}>Subtotal:</div>
                        <div className={styles.amount}>
                            {formatCurrency(invoiceData.subtotal)}
                        </div>
                    </div>
                    <div className={styles.totalRow}>
                        <div className={styles.rowLabel}>Tax (GST):</div>
                        <div className={styles.amount}>
                            {formatCurrency(invoiceData.gstAmount)}
                        </div>
                    </div>
                    {invoiceData.totalDiscount > 0 && (
                        <div className={styles.totalRow}>
                            <div className={styles.rowLabel}>Discount:</div>
                            <div className={styles.amount} style={{ color: "#ff5252" }}>
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

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Processing complete. Data stream verified.</p>
                    <p>Thank you for your transaction.</p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default CosmicReceiptTemplate;
