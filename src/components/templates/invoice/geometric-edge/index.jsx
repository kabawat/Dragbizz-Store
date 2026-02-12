"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const GeometricEdgeTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.geometricInvoice} id="invoice">
                {/* Header Section */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <div className={styles.metaInfo}>
                        <p>
                            Invoice No:{" "}
                            <span className={styles.valueBold}>
                                {invoiceData.invoiceNumber}
                            </span>
                        </p>
                        <p>
                            Date:{" "}
                            <span className={styles.valueBold}>
                                {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className={styles.infoSection}>
                    {/* Store/Biller Info */}
                    <div className={styles.infoBox}>
                        <div className={styles.label}>Billed By</div>
                        <span className={styles.storeName}>
                            {selectedStore?.storeName || "Geometric Billing Corp"}
                        </span>
                        <p className={styles.storeInfoText}>
                            {selectedStore?.address || "123 Structure Road, Business Park"}
                        </p>
                        <p className={styles.storeInfoText}>
                            {selectedStore?.phone && <span>Ph: {selectedStore.phone} | </span>}
                            {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                        </p>
                    </div>

                    {/* Customer/Bill To Info */}
                    <div className={styles.infoBox}>
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
                    <table className={styles.geometricTable}>
                        <thead>
                            <tr>
                                <th style={{ width: "50%" }}>Description</th>
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
                                            {item.product?.name || "Unnamed Item"}
                                        </div>
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
                                {formatCurrency(invoiceData.gstAmount || 0)}
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
                            <div className={styles.finalLabel}>TOTAL DUE:</div>
                            <div className={styles.finalAmount}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer & Signature */}
                <div className={styles.footer}>
                    <p>
                        Thank you for choosing Geometric Billing. All amounts are in INR.
                    </p>
                    <div className={styles.signatureLine}>Authorized Signature</div>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default GeometricEdgeTemplate;
