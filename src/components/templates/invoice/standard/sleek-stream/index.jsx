"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

export default function SleekStreamTemplate({ invoiceData, selectedStore }) {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.sleekInvoice} id="invoice">
                <div className={styles.splitHeader}>
                    <div className={styles.metaSidebar}>
                        <h1>INVOICE</h1>
                        <div className={styles.metaDetail}>Invoice Number:</div>
                        <div className={styles.metaValue}>{invoiceData.invoiceNumber}</div>
                        <div className={styles.metaDetail}>Date Issued:</div>
                        <div className={styles.metaValue}>
                            {moment(invoiceData.createdAt).format("DD MMMM, YYYY")}
                        </div>
                    </div>

                    <div className={styles.storeCustomerInfo}>
                        <div className={styles.infoBlock}>
                            <div className={styles.title}>From</div>
                            <p className={styles.storeName}>{selectedStore?.storeName || "Sleek Stream Services"}</p>
                            <p className={styles.storeAddress}>{selectedStore?.address}</p>
                            {selectedStore?.phone && <p className={styles.storeAddress}>Ph: {selectedStore.phone}</p>}
                            {selectedStore?.email && <p className={styles.storeAddress}>{selectedStore.email}</p>}
                        </div>

                        <div className={styles.infoBlock}>
                            <div className={styles.title}>Bill To</div>
                            <p className={styles.valueBold}>{invoiceData.customer?.name || "Walk-in Customer"}</p>
                            {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
                            {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
                        </div>
                    </div>
                </div>

                <div className={styles.tableArea}>
                    <table className={styles.sleekTable}>
                        <thead>
                            <tr>
                                <td className={styles.tableHeader} style={{ width: "50%" }}>Description</td>
                                <td className={styles.tableHeader} style={{ width: "10%", textAlign: "center" }}>Qty</td>
                                <td className={styles.tableHeader} style={{ width: "20%", textAlign: "right" }}>Rate</td>
                                <td className={styles.tableHeader} style={{ width: "20%", textAlign: "right" }}>Total</td>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.productName}>{item.product?.name}</div>
                                        {item.product?.sku && <div className={styles.productSku}>SKU: {item.product.sku}</div>}
                                    </td>
                                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurrency(item.price)}</td>
                                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                                        {formatCurrency(item.quantity * item.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={styles.totalsArea}>
                    <div className={styles.totalsTable}>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>Subtotal:</div>
                            <div className={styles.amount}>{formatCurrency(invoiceData.subtotal)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>GST:</div>
                            <div className={styles.amount}>{formatCurrency(invoiceData.gstAmount || 0)}</div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.row}>
                                <div className={styles.totalLabel}>Discount:</div>
                                <div className={styles.amount} style={{ color: "#e74c3c" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                        <div className={styles.finalRow}>
                            <div className={styles.finalLabel}>AMOUNT DUE</div>
                            <div className={styles.finalAmount}>{formatCurrency(invoiceData.totalAmount)}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <p>Thank you for your business!</p>
                    <p style={{ opacity: 0.7, fontSize: "10px", marginTop: "8px" }}>
                        System Generated Invoice • {moment().format("DD/MM/YYYY HH:mm")}
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
}
