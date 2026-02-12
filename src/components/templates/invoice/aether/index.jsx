"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const AetherTemplate = ({ invoiceData, selectedStore }) => {
    return (
        <InvoiceContainer style={{ padding: 0 }}>
            <div className={styles.aetherInvoice} >
                {/* Left Panel - Dark Sidebar */}
                <div className={styles.leftPanel}>
                    <div className={styles.storeInfo}>
                        <h2 className={styles.storeName}>
                            {selectedStore?.storeName || "Your Store"}
                        </h2>
                        <p>{selectedStore?.address || "123 Business Street"}</p>
                        <p>City, State 12345</p>
                        <p>{selectedStore?.phone || "+91 9876543210"}</p>
                        <p>{selectedStore?.email || "info@yourstore.com"}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: "10px", marginTop: "40px", opacity: 0.7 }}>
                            © {moment().format("YYYY")}{" "}
                            {selectedStore?.storeName || "Your Store"}
                        </p>
                    </div>
                </div>

                {/* Right Panel - Content */}
                <div className={styles.rightPanel}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>INVOICE</h1>
                            <div className={styles.date}>
                                {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p className={styles.invoiceNumber}>
                                Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Bill To & Issued By Info */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoBlock}>
                            <div className={styles.label}>Bill To</div>
                            <div className={styles.value}>
                                {invoiceData.customer?.name || "Walk-in Customer"}
                            </div>
                            {invoiceData.customer?.email && (
                                <p style={{ fontSize: "12px", color: "#7f8c8d" }}>
                                    {invoiceData.customer.email}
                                </p>
                            )}
                            {invoiceData.customer?.phone && (
                                <p style={{ fontSize: "12px", color: "#7f8c8d" }}>
                                    {invoiceData.customer.phone}
                                </p>
                            )}
                        </div>

                        <div className={styles.infoBlock}>
                            <div className={styles.label}>Issued By</div>
                            <div className={styles.value}>
                                {selectedStore?.storeName || "Your Store"}
                            </div>
                            <p style={{ fontSize: "12px", color: "#7f8c8d" }}>
                                {selectedStore?.email}
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: "45%" }}>Item</th>
                                <th style={{ width: "15%", textAlign: "center" }}>Qty</th>
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
                                            <span className={styles.productSku}>
                                                SKU: {item.product.sku}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                    <td style={{ textAlign: "right" }}>
                                        ₹{(item.price || 0).toLocaleString()}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        ₹{((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className={styles.totals}>
                        <div className={styles.totalRow}>
                            <div className={styles.totalLabel}>Subtotal:</div>
                            <div className={styles.totalAmount}>
                                ₹{invoiceData.subtotal?.toLocaleString()}
                            </div>
                        </div>
                        <div className={styles.totalRow}>
                            <div className={styles.totalLabel}>GST:</div>
                            <div className={styles.totalAmount}>
                                ₹{invoiceData.gstAmount?.toLocaleString() || "0"}
                            </div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <div className={styles.totalLabel}>Discount:</div>
                                <div className={styles.totalAmount} style={{ color: "#e74c3c" }}>
                                    -₹{invoiceData.totalDiscount?.toLocaleString()}
                                </div>
                            </div>
                        )}
                        <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                            <div className={styles.totalLabel}>Total:</div>
                            <div className={styles.totalAmount}>
                                ₹{invoiceData.totalAmount?.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <p>Thank you for your business!</p>
                        <p>
                            Generated on{" "}
                            {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
                        </p>
                        <p>This invoice does not require a signature.</p>
                    </div>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default AetherTemplate;
