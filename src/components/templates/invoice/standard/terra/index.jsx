"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const TerraTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.terraInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.storeBlock}>
                        <h2>{selectedStore?.storeName || "ECO RETAIL"}</h2>
                        <p>{selectedStore?.address || "456 Green Boulevard, City"}</p>
                        <p>
                            {selectedStore?.phone && <span>{selectedStore.phone} | </span>}
                            {selectedStore?.email && <span>{selectedStore.email}</span>}
                        </p>
                    </div>
                    <div className={styles.titleBlock}>
                        <h1>INVOICE</h1>
                        <p>
                            Date: <strong>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</strong>
                        </p>
                    </div>
                </div>

                {/* Details Section */}
                <div className={styles.detailsGrid}>
                    <div className={styles.detailBox}>
                        <div className={styles.label}>Billed To</div>
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
                    <div className={styles.detailBox}>
                        <div className={styles.label}>Invoice Reference</div>
                        <div className={styles.value}>{invoiceData.invoiceNumber}</div>
                        <p>Issued By: {selectedStore?.storeName || "ECO RETAIL"}</p>
                        <p>
                            Due Date: <strong>{moment(invoiceData.createdAt)
                                .add(7, "days")
                                .format("MMMM DD, YYYY")}</strong>
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className={styles.tableContainer}>
                    <table className={styles.terraTable}>
                        <thead>
                            <tr>
                                <td className="font-bold" style={{ width: "50%" }}>Product / Service</td>
                                <td className="font-bold" style={{ width: "10%", textAlign: "center" }}>Qty</td>
                                <td className="font-bold" style={{ width: "20%", textAlign: "right" }}>Rate</td>
                                <td className="font-bold" style={{ width: "20%", textAlign: "right" }}>Amount</td>
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
                <div className={styles.totalsContainer}>
                    <div className={styles.totals}>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>Subtotal:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>GST:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.gstAmount || 0)}
                            </div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.row}>
                                <div className={styles.totalLabel}>Discount:</div>
                                <div className={styles.amount} style={{ color: "#2ecc71" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                        <div className={`${styles.row} ${styles.finalRow}`}>
                            <div className={styles.finalLabel}>TOTAL DUE:</div>
                            <div className={styles.finalAmount}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>
                        Thank you for supporting{" "}
                        {selectedStore?.storeName || "our business"}!
                    </p>
                    <p>
                        Generated on{" "}
                        {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default TerraTemplate;
