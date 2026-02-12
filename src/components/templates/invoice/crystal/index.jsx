"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

export default function CrystalTemplate({ invoiceData, selectedStore }) {
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "₹0.00";
        return `₹${Number(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.crystalInvoice} id="invoice">
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.storeDetails}>
                        <div className={styles.storeName}>
                            {selectedStore?.storeName || "CRYSTAL VENTURES"}
                        </div>
                        <div className={styles.storeInfo}>
                            <p>
                                {selectedStore?.address || "900 Prism Tower, Azure City 67890"}
                            </p>
                            <p>
                                {selectedStore?.phone && <span>Tel: {selectedStore.phone} | </span>}
                                {selectedStore?.email && <span>Contact: {selectedStore.email}</span>}
                            </p>
                        </div>
                    </div>
                    <div className={styles.invoiceTitleBox}>
                        <h1>INVOICE</h1>
                        <p>Ref: {invoiceData.invoiceNumber}</p>
                        <p>Date: {moment(invoiceData.createdAt).format("DD/MM/YYYY")}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className={styles.infoSection}>
                    <div className={styles.infoBox}>
                        <h3>Billed To</h3>
                        <p>
                            <strong>{invoiceData.customer?.name || "Customer Name"}</strong>
                        </p>
                        {invoiceData.customer?.address && (
                            <p>{invoiceData.customer.address}</p>
                        )}
                        {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
                    </div>
                    <div className={styles.infoBox}>
                        <h3>Ship To</h3>
                        <p>
                            <strong>{invoiceData.customer?.name || "Customer Name"}</strong>
                        </p>
                        <p>Same as Billing Address</p>
                    </div>
                    <div className={styles.infoBox}>
                        <h3>Invoice Details</h3>
                        <p>
                            <strong>Payment Mode:</strong>{" "}
                            {invoiceData.paymentMode || "Bank Transfer"}
                        </p>
                        <p>
                            <strong>Invoice Status:</strong>{" "}
                            {invoiceData.status || "Approved"}
                        </p>
                        <p>
                            <strong>Terms:</strong> Net 30 Days
                        </p>
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.crystalTable}>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style={{ textAlign: "center", width: "10%" }}>Qty</th>
                                <th style={{ textAlign: "right", width: "15%" }}>Rate</th>
                                <th style={{ textAlign: "right", width: "15%" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <span className={styles.productName}>
                                            {item.product?.name || "Crystal Product"}
                                        </span>
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
                    <div className={styles.totalsBox}>
                        <div className={styles.totalRow}>
                            <span>Subtotal:</span>
                            <span>{formatCurrency(invoiceData.subtotal)}</span>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <span>Discount:</span>
                                <span style={{ color: "#ef4444" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </span>
                            </div>
                        )}
                        <div className={styles.totalRow}>
                            <span>GST:</span>
                            <span>{formatCurrency(invoiceData.gstAmount)}</span>
                        </div>

                        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                            <span>BALANCE DUE:</span>
                            <span>{formatCurrency(invoiceData.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>
                        We appreciate your valuable business. All sales are final after 30
                        days.
                    </p>
                    <p>System Generated on {moment().format("HH:mm:ss, DD/MM/YYYY")}</p>
                </div>
            </div>
        </InvoiceContainer>
    );
}
