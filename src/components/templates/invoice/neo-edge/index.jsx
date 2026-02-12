"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const NeoEdgeTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) =>
        `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <InvoiceContainer>
            <div className={styles.neoedgeInvoice} >
                {/* Header */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <div className={styles.storeInfo}>
                        <strong>{selectedStore?.storeName || "NeoEdge Solutions"}</strong>{" "}
                        | {selectedStore?.address || "G-45, Business Park, New Delhi"}
                        <br />
                        {selectedStore?.phone && <span>Ph: {selectedStore.phone} | </span>}
                        {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <div className={styles.card}>
                        <div className={styles.title}>Invoice Details</div>
                        <p>
                            Invoice #: <b>{invoiceData.invoiceNumber}</b>
                        </p>
                        <p>
                            Date:{" "}
                            <b>{moment(invoiceData.createdAt).format("DD MMM YYYY")}</b>
                        </p>
                        {invoiceData.paymentMode && (
                            <p>Payment: <b>{invoiceData.paymentMode}</b></p>
                        )}
                    </div>
                    <div className={styles.card}>
                        <div className={styles.title}>Customer</div>
                        <p>
                            <b>{invoiceData.customer?.name || "Walk-in Customer"}</b>
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
                    <table className={styles.neoedgeTable}>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style={{ textAlign: "center" }}>Qty</th>
                                <th style={{ textAlign: "right" }}>Rate</th>
                                <th style={{ textAlign: "right" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.product?.name || "Unnamed Item"}</td>
                                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                    <td style={{ textAlign: "right" }}>
                                        {formatCurrency(item.price)}
                                    </td>
                                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                                        {formatCurrency(item.quantity * item.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className={styles.totalsSection}>
                    <div className={styles.totalCard}>
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Subtotal:</span>
                            <span className={styles.amount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </span>
                        </div>
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Tax (GST):</span>
                            <span className={styles.amount}>
                                {formatCurrency(invoiceData.gstAmount || 0)}
                            </span>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Discount:</span>
                                <span
                                    className={styles.amount}
                                    style={{ color: "#dc2626" }}
                                >
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </span>
                            </div>
                        )}
                        <div className={styles.finalRow}>
                            <span className={styles.finalLabel}>Total Due:</span>
                            <span className={styles.finalAmount}>{formatCurrency(invoiceData.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your business — NeoEdge Billing Systems</p>
                    <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default NeoEdgeTemplate;
