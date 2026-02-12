"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import styles from "./style.module.scss";

const MatrixLedgerTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.matrixInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <h1>TAX INVOICE / RECEIPT</h1>
                    <div className={styles.storeInfo}>
                        <p>
                            {selectedStore?.storeName || "Matrix Ledger Systems"} |{" "}
                            {selectedStore?.address || "Data Center, Ledger Street"}
                        </p>
                        <p>
                            {selectedStore?.phone && <span>Ph: {selectedStore.phone} | </span>}
                            {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                        </p>
                    </div>
                </div>

                {/* Info Bar */}
                <div className={styles.infoBar}>
                    <div className={styles.metaBlock}>
                        <div className={styles.title}>Transaction Data</div>
                        <p>
                            Invoice #:{" "}
                            <span className={`${styles.valueBold} ${styles.invoiceNumber}`}>
                                {invoiceData.invoiceNumber}
                            </span>
                        </p>
                        <p>
                            Date Issued:{" "}
                            <span className={styles.valueBold}>
                                {moment(invoiceData.createdAt).format("YYYY-MM-DD")}
                            </span>
                        </p>
                    </div>

                    <div className={styles.metaBlock} style={{ textAlign: "right" }}>
                        <div className={styles.title}>Bill To Entity</div>
                        <p className={styles.valueBold}>
                            {invoiceData.customer?.name || "Walk-in Customer"}
                        </p>
                        {invoiceData.customer?.phone && (
                            <p>Ph: {invoiceData.customer.phone}</p>
                        )}
                        {invoiceData.customer?.email && (
                            <p>Email: {invoiceData.customer.email}</p>
                        )}
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.matrixTable}>
                        <thead>
                            <tr>
                                <th style={{ width: "50%" }}>ITEM DESCRIPTION</th>
                                <th style={{ width: "10%", textAlign: "center" }}>QTY</th>
                                <th style={{ width: "20%", textAlign: "right" }}>UNIT PRICE</th>
                                <th style={{ width: "20%", textAlign: "right" }}>LINE TOTAL</th>
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
                                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                                        {formatCurrency(item.quantity * item.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className={styles.totalsTable}>
                    <div className={styles.totalRow}>
                        <div className={styles.label}>Subtotal:</div>
                        <div className={styles.amount}>
                            {formatCurrency(invoiceData.subtotal)}
                        </div>
                    </div>
                    <div className={styles.totalRow}>
                        <div className={styles.label}>Tax (GST):</div>
                        <div className={styles.amount}>
                            {formatCurrency(invoiceData.gstAmount || 0)}
                        </div>
                    </div>
                    {invoiceData.totalDiscount > 0 && (
                        <div className={styles.totalRow} style={{ color: "#c0392b" }}>
                            <div className={styles.label}>DISCOUNT:</div>
                            <div className={styles.amount}>
                                -{formatCurrency(invoiceData.totalDiscount)}
                            </div>
                        </div>
                    )}
                    <div className={styles.finalRow}>
                        <div className={styles.finalLabel}>AMOUNT:</div>
                        <div className={styles.finalAmount}>
                            {formatCurrency(invoiceData.totalAmount)}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>E&OE. This transaction record is digitally generated.</p>
                    <p>Audit Stamp: {moment().format("YYYYMMDDHHmmss")}</p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default MatrixLedgerTemplate;
