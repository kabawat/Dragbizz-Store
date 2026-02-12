"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const RusticEleganceTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.rusticInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1>INVOICE</h1>
                        <p style={{ fontSize: 13, color: "#a1887f" }}>
                            {selectedStore?.storeName || "The Artisan Collective"}
                        </p>
                    </div>
                    <div className={styles.storeInfo}>
                        <p>{selectedStore?.address || "88 Serene Road, Old Town"}</p>
                        <p>
                            {selectedStore?.phone && <span>{selectedStore.phone} | </span>}
                            {selectedStore?.email && <span>{selectedStore.email}</span>}
                        </p>
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.infoRow}>
                    {/* Bill To Details */}
                    <div className={styles.block}>
                        <div className={styles.title}>Billed To</div>
                        <p className={styles.valueBold}>
                            {invoiceData.customer?.name || "Esteemed Patron"}
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

                    {/* Invoice Details */}
                    <div className={styles.block} style={{ textAlign: "right" }}>
                        <div className={styles.title}>Invoice Details</div>
                        <p>
                            Invoice #:{" "}
                            <span className={styles.invoiceNumberValue}>
                                {invoiceData.invoiceNumber}
                            </span>
                        </p>
                        <p>
                            Date Issued:{" "}
                            <span className={styles.valueBold}>
                                {moment(invoiceData.createdAt).format("DD MMM, YYYY")}
                            </span>
                        </p>
                        <p>
                            Due Date:{" "}
                            <span className={styles.valueBold}>Upon Receipt</span>
                        </p>
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.rusticTable}>
                        <thead>
                            <tr>
                                <td className="font-bold" style={{ width: "50%" }}>Item Description</td>
                                <td className="font-bold" style={{ width: "10%", textAlign: "center" }}>Qty</td>
                                <td className="font-bold" style={{ width: "20%", textAlign: "right" }}>Rate</td>
                                <td className="font-bold" style={{ width: "20%", textAlign: "right" }}>Total</td>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.productName}>
                                            {item.product?.name || "Handcrafted Item"}
                                        </div>
                                        {item.product?.sku && (
                                            <div style={{ fontSize: "11px", color: "#a1887f" }}>SKU: {item.product.sku}</div>
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
                    <div className={styles.totalsTable}>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>Subtotal:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>Tax (GST):</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.gstAmount || 0)}
                            </div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.row}>
                                <div className={styles.totalLabel}>Discount:</div>
                                <div className={styles.amount} style={{ color: "#2e7d32" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                        <div className={`${styles.row} ${styles.grandTotalRow}`}>
                            <div className={styles.finalLabel}>AMOUNT DUE</div>
                            <div className={styles.finalAmount}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for supporting our work. We value your business.</p>
                    <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default RusticEleganceTemplate;
