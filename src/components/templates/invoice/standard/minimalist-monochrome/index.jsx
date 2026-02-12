"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const MinimalistMonochromeTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.monoInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1>INVOICE</h1>
                        <p>{selectedStore?.storeName || "Minimalist Design Co."}</p>
                        <p>{selectedStore?.address || "789 White Space, Zen City"}</p>
                        {selectedStore?.phone && <p>{selectedStore.phone}</p>}
                    </div>

                    <div className={styles.headerRight}>
                        <div className={styles.title}>Invoice #</div>
                        <div className={styles.invoiceNumberValue}>
                            {invoiceData.invoiceNumber}
                        </div>
                    </div>
                </div>

                {/* Bill To & Date Block */}
                <div className={styles.addressBlock}>
                    {/* Bill To Details */}
                    <div className={styles.addressDetails}>
                        <div className={styles.blockTitle}>Bill To</div>
                        <p className={styles.customerName}>
                            {invoiceData.customer?.name || "Client"}
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

                    {/* Date Details */}
                    <div className={styles.addressDetails}>
                        <div className={styles.blockTitle} style={{ textAlign: "right" }}>
                            Date Issued
                        </div>
                        <p className={styles.dateIssued}>
                            {moment(invoiceData.createdAt).format("DD MMMM YYYY")}
                        </p>
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.monoTable}>
                        <thead>
                            <tr>
                                <th style={{ width: "55%" }}>Product/Service</th>
                                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                                <th style={{ width: "15%", textAlign: "right" }}>Rate</th>
                                <th style={{ width: "20%", textAlign: "right" }}>Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.productName}>
                                            {item.product?.name || "Item"}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                    <td style={{ textAlign: "right" }}>
                                        {formatCurrency(item.price)}
                                    </td>
                                    <td style={{ textAlign: "right", fontWeight: 500 }}>
                                        {formatCurrency(item.quantity * item.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className={styles.totalsTable}>
                    <div className={styles.totalRow}>
                        <div className={styles.totalLabel}>Subtotal</div>
                        <div className={styles.amount}>
                            {formatCurrency(invoiceData.subtotal)}
                        </div>
                    </div>
                    <div className={styles.totalRow}>
                        <div className={styles.totalLabel}>Tax (GST)</div>
                        <div className={styles.amount}>
                            {formatCurrency(invoiceData.gstAmount || 0)}
                        </div>
                    </div>
                    {invoiceData.totalDiscount > 0 && (
                        <div className={styles.totalRow}>
                            <div className={styles.totalLabel}>Discount</div>
                            <div className={styles.amount} style={{ color: "#888" }}>
                                -{formatCurrency(invoiceData.totalDiscount)}
                            </div>
                        </div>
                    )}
                    <div className={styles.finalRow}>
                        <div className={styles.totalLabel}>TOTAL</div>
                        <div className={styles.finalAmount}>
                            {formatCurrency(invoiceData.totalAmount)}
                        </div>
                    </div>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default MinimalistMonochromeTemplate;
