"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const RoyalEdgeTemplate = ({ invoiceData = {}, selectedStore = {} }) => {
    const formatCurrency = (amount) =>
        `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <InvoiceContainer>
            <div className={styles.royalInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>R</div>
                        <div>
                            <div className={styles.storeTitle}>
                                {selectedStore?.storeName || "RoyalEdge"}
                            </div>
                            <div className={styles.tagline}>
                                {selectedStore?.tagline || "Premium Billing & Invoicing"}
                            </div>
                        </div>
                    </div>

                    <div className={styles.meta}>
                        <div className={styles.metaRow}>Invoice</div>
                        <div className={styles.metaStrong}>
                            {invoiceData.invoiceNumber || "—"}
                        </div>
                        <div className={styles.metaRow}>
                            {moment(invoiceData.createdAt).format("DD MMM YYYY")}
                        </div>
                    </div>
                </div>

                {/* Body Grid */}
                <div className={styles.bodyGrid}>
                    {/* Left column: store & items */}
                    <div>
                        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                            <div style={{ flex: 1 }} className={styles.card}>
                                <div className={styles.infoTitle}>From</div>
                                <div className={styles.infoVal}>
                                    {selectedStore?.storeName || "RoyalEdge Billing"}
                                </div>
                                <div className={styles.small}>
                                    {selectedStore?.address || "Suite 100, Central Avenue"}
                                </div>
                                <div className={styles.small} style={{ marginTop: 8 }}>
                                    {selectedStore?.phone && <span>Phone: {selectedStore.phone}</span>}
                                </div>
                                <div className={styles.small}>
                                    {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                                </div>
                            </div>

                            <div style={{ flex: 1 }} className={styles.card}>
                                <div className={styles.infoTitle}>Bill To</div>
                                <div className={styles.infoVal}>
                                    {invoiceData.customer?.name || "Walk-in Customer"}
                                </div>
                                {invoiceData.customer?.email && (
                                    <div className={styles.small}>{invoiceData.customer.email}</div>
                                )}
                                {invoiceData.customer?.phone && (
                                    <div className={styles.small}>
                                        Phone: {invoiceData.customer.phone}
                                    </div>
                                )}
                                {invoiceData.customer?.address && (
                                    <div className={styles.small}>{invoiceData.customer.address}</div>
                                )}
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className={styles.card}>
                            <div className={styles.infoTitle} style={{ marginBottom: 10 }}>
                                Items
                            </div>
                            <table className={styles.itemsTable}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "52%" }}>Description</th>
                                        <th style={{ width: "12%", textAlign: "center" }}>Qty</th>
                                        <th style={{ width: "18%", textAlign: "right" }}>Rate</th>
                                        <th style={{ width: "18%", textAlign: "right" }}>Total</th>
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
                                                {formatCurrency((item.quantity || 0) * (item.price || 0))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right column: totals, notes */}
                    <div className={styles.rightStack}>
                        <div className={`${styles.card} ${styles.totals}`}>
                            <div className={styles.infoTitle}>Summary</div>
                            <div className={styles.row}>
                                <div>Subtotal</div>
                                <div className={styles.val}>{formatCurrency(invoiceData.subtotal)}</div>
                            </div>
                            <div className={styles.row}>
                                <div>Tax (GST)</div>
                                <div className={styles.val}>{formatCurrency(invoiceData.gstAmount || 0)}</div>
                            </div>
                            {invoiceData.totalDiscount > 0 && (
                                <div className={styles.row}>
                                    <div>Discount</div>
                                    <div className={styles.val} style={{ color: "#e74c3c" }}>
                                        -{formatCurrency(invoiceData.totalDiscount)}
                                    </div>
                                </div>
                            )}
                            <div className={styles.grand}>
                                <div>Amount Due</div>
                                <div>{formatCurrency(invoiceData.totalAmount)}</div>
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <div className={styles.infoTitle}>Payment</div>
                                <div className={styles.small}>
                                    Mode: {invoiceData.paymentMode || "Not specified"}
                                </div>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.infoTitle}>Notes</div>
                            <div className={styles.notes}>
                                {invoiceData.notes || "Thank you for your business. Please make payment within the agreed terms."}
                            </div>
                        </div>

                        <div className={`${styles.card} ${styles.signatureBox}`}>
                            <div>
                                <div className={styles.infoTitle}>Prepared By</div>
                                <div className={styles.small}>
                                    {selectedStore?.preparedBy || "Accounts Team"}
                                </div>
                            </div>
                            <div>
                                <div style={{ textAlign: "center", fontSize: 10, color: "#6b7280" }}>
                                    Signature
                                </div>
                                <div className={styles.signatureLine} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div>Generated on {moment(invoiceData.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>
                    <div className={styles.icons}>
                        <div className={styles.icon}>★</div>
                        <div className={styles.icon}>☎</div>
                        <div className={styles.icon}>✉</div>
                    </div>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default RoyalEdgeTemplate;
