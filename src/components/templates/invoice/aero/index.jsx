"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const AeroTemplate = ({ invoiceData, selectedStore }) => {
    return (
        <InvoiceContainer>
            <div className={styles.aeroInvoice} >
                {/* Header */}
                <div className={styles.aeroHeader}>
                    <div>
                        <div className={styles.storeName}>
                            {selectedStore?.storeName || "Your Store"}
                        </div>
                        <div className={styles.storeDetails}>
                            <p>{selectedStore?.address || "123 Market Street, City"}</p>
                            {selectedStore?.phone && <p>Phone: {selectedStore.phone}</p>}
                            {selectedStore?.email && <p>Email: {selectedStore.email}</p>}
                        </div>
                    </div>
                    <div className={styles.invoiceTitleBox}>
                        <h1 className={styles.invoiceTitle}>INVOICE</h1>
                        <div className={styles.invoiceMeta}>
                            <p>#{invoiceData.invoiceNumber}</p>
                            <p>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</p>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <h3>Bill To</h3>
                        <p>
                            <strong>
                                {invoiceData.customer?.name || "Walk-in Customer"}
                            </strong>
                        </p>
                        {invoiceData.customer?.address && (
                            <p>{invoiceData.customer.address}</p>
                        )}
                        {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
                    </div>

                    <div className={styles.infoCard}>
                        <h3>Payment Info</h3>
                        <p>
                            <strong>Mode:</strong> {invoiceData.paymentMode || "Cash"}
                        </p>
                        <p>
                            <strong>Status:</strong> {invoiceData.status || "Paid"}
                        </p>
                        <p>
                            <strong>Date:</strong>{" "}
                            {moment(invoiceData.createdAt).format("DD MMM YYYY")}
                        </p>
                    </div>
                </div>

                {/* Table */}
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
                                <td>
                                    <span className={styles.productName}>
                                        {item.product?.name || "Product"}
                                    </span>
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

                {/* Totals */}
                <div className={styles.totals}>
                    <div className={styles.totalsBox}>
                        <div className={styles.totalRow}>
                            <span>Subtotal:</span>
                            <span>₹{invoiceData.subtotal?.toLocaleString()}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>GST:</span>
                            <span>₹{invoiceData.gstAmount?.toLocaleString() || "0"}</span>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <span>Discount:</span>
                                <span>-₹{invoiceData.totalDiscount?.toLocaleString()}</span>
                            </div>
                        )}
                        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                            <span>Total:</span>
                            <span>₹{invoiceData.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your purchase!</p>
                    <p>
                        This invoice was generated on{" "}
                        {moment(invoiceData.createdAt).format("DD/MM/YYYY")}.
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default AeroTemplate;
