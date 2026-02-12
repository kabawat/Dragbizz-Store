"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const VintageTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.vintageInvoice} >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.storeDetails}>
                        <div className={styles.storeName}>
                            {selectedStore?.storeName || "Your Store"}
                        </div>
                        <p>
                            {selectedStore?.address || "123 Market Road, City 12345"} <br />
                            {selectedStore?.phone && <span>Phone: {selectedStore.phone}</span>} <br />
                            {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                        </p>
                    </div>
                    <div className={styles.invoiceTitleBox}>
                        <h1>INVOICE</h1>
                        <p>{invoiceData.invoiceNumber}</p>
                        <p>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className={styles.infoGrid}>
                    <div className={styles.infoBox}>
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
                        {invoiceData.customer?.email && (
                            <p>Email: {invoiceData.customer.email}</p>
                        )}
                    </div>
                    <div className={styles.infoBox}>
                        <h3>Payment Info</h3>
                        <p>
                            <strong>Payment Mode:</strong> {invoiceData.paymentMode || "Cash"}
                        </p>
                        <p>
                            <strong>Invoice Date:</strong>{" "}
                            {moment(invoiceData.createdAt).format("DD MMM YYYY")}
                        </p>
                        <p>
                            <strong>Status:</strong> {invoiceData.status || "Paid"}
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className={styles.tableContainer}>
                    <table className={styles.vintageTable}>
                        <thead>
                            <tr>
                                <td className="font-bold">Description</td>
                                <td className="font-bold" style={{ textAlign: "center" }}>Qty</td>
                                <td className="font-bold" style={{ textAlign: "right" }}>Rate</td>
                                <td className="font-bold" style={{ textAlign: "right" }}>Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <span className={styles.productName}>
                                            {item.product?.name || "Product"}
                                        </span>
                                        {item.product?.sku && (
                                            <div style={{ fontSize: "11px", color: "#6d4c41", fontStyle: "italic" }}>SKU: {item.product.sku}</div>
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
                <div className={styles.totalsArea}>
                    <div className={styles.totalsBox}>
                        <div className={styles.row}>
                            <span>Subtotal:</span>
                            <span>{formatCurrency(invoiceData.subtotal)}</span>
                        </div>
                        <div className={styles.row}>
                            <span>GST:</span>
                            <span>{formatCurrency(invoiceData.gstAmount || 0)}</span>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.row}>
                                <span>Discount:</span>
                                <span style={{ color: "#2e7d32" }}>-{formatCurrency(invoiceData.totalDiscount)}</span>
                            </div>
                        )}
                        <div className={`${styles.row} ${styles.grandTotalRow}`}>
                            <span>Total:</span>
                            <span>{formatCurrency(invoiceData.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your business!</p>
                    <p>
                        This is a system-generated invoice. Generated on{" "}
                        {moment(invoiceData.createdAt).format("MM/DD/YYYY")}
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default VintageTemplate;
