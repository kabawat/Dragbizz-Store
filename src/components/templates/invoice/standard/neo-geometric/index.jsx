"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const NeoGeometricTemplate = ({ invoiceData = {}, selectedStore = {} }) => {
    const formatCurrency = (amount) =>
        `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <InvoiceContainer>
            <div className={styles.neoInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>N</div>
                        <div>
                            <div className={styles.storeTitle}>
                                {selectedStore?.storeName || "NeoGeometric"}
                            </div>
                            <div className={styles.tagline}>
                                {selectedStore?.tagline || "Precision Invoice Design"}
                            </div>
                        </div>
                    </div>

                    <div className={styles.meta}>
                        Invoice
                        <strong>{invoiceData.invoiceNumber || "—"}</strong>
                        <div>{moment(invoiceData.createdAt).format("DD MMM YYYY")}</div>
                    </div>
                </div>

                {/* Body Section */}
                <div className={styles.grid}>
                    <div>
                        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                            <div className={styles.card}>
                                <div className={styles.title}>From</div>
                                <div className={styles.val}>
                                    {selectedStore?.storeName || "NeoGeometric Billing"}
                                </div>
                                <div className={styles.sub}>
                                    {selectedStore?.address || "Suite 100, Central Avenue"}
                                </div>
                                {selectedStore?.phone && (
                                    <div className={styles.sub}>Phone: {selectedStore.phone}</div>
                                )}
                                {selectedStore?.email && (
                                    <div className={styles.sub}>Email: {selectedStore.email}</div>
                                )}
                            </div>

                            <div className={styles.card}>
                                <div className={styles.title}>Bill To</div>
                                <div className={styles.val}>
                                    {invoiceData.customer?.name || "Walk-in Customer"}
                                </div>
                                {invoiceData.customer?.email && (
                                    <div className={styles.sub}>{invoiceData.customer.email}</div>
                                )}
                                {invoiceData.customer?.phone && (
                                    <div className={styles.sub}>
                                        Phone: {invoiceData.customer.phone}
                                    </div>
                                )}
                                {invoiceData.customer?.address && (
                                    <div className={styles.sub}>{invoiceData.customer.address}</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.title}>Items</div>
                            <div className={styles.itemsContainer}>
                                <table className={styles.itemsTable}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "50%" }}>Description</th>
                                            <th style={{ width: "12%", textAlign: "center" }}>Qty</th>
                                            <th style={{ width: "18%", textAlign: "right" }}>Rate</th>
                                            <th style={{ width: "20%", textAlign: "right" }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(invoiceData.items && invoiceData.items.length > 0
                                            ? invoiceData.items
                                            : [
                                                {
                                                    product: { name: "No items" },
                                                    quantity: 0,
                                                    price: 0,
                                                },
                                            ]
                                        ).map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>
                                                        {item.product?.name || "Unnamed Item"}
                                                    </div>
                                                    {item.product?.sku && (
                                                        <div className={styles.sub}>SKU: {item.product.sku}</div>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td style={{ textAlign: "right", fontWeight: 700 }}>
                                                    {formatCurrency((item.quantity || 0) * (item.price || 0))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column Summary */}
                    <div className={`${styles.card} ${styles.summary}`}>
                        <div className={styles.title}>Summary</div>
                        <div className={styles.row}>
                            <div>Subtotal</div>
                            <div className={styles.totalVal}>{formatCurrency(invoiceData.subtotal)}</div>
                        </div>
                        <div className={styles.row}>
                            <div>Tax (GST)</div>
                            <div className={styles.totalVal}>{formatCurrency(invoiceData.gstAmount || 0)}</div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.row}>
                                <div>Discount</div>
                                <div className={styles.totalVal} style={{ color: "#e74c3c" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                        <div className={styles.grand}>
                            <div>Amount Due</div>
                            <div>{formatCurrency(invoiceData.totalAmount)}</div>
                        </div>
                        <div style={{ marginTop: 20 }}>
                            <div className={styles.title}>Payment Information</div>
                            <div className={styles.sub}>
                                Mode: {invoiceData.paymentMode || "Not specified"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className={styles.footer}>
                    <div>Generated on {moment(invoiceData.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>
                    <div>
                        © {new Date().getFullYear()} {selectedStore?.storeName || "NeoGeometric"}
                    </div>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default NeoGeometricTemplate;
