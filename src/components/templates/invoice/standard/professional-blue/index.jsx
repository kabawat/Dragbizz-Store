"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const ProfessionalBlueTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.blueInvoice} >
                {/* Header Grid Section */}
                <div className={styles.headerGrid}>
                    {/* Store Info - Left */}
                    <div className={styles.storeInfo}>
                        <h2>{selectedStore?.storeName || "Corporate Solutions Inc."}</h2>
                        <p>{selectedStore?.address || "123 Business Park, Metro City"}</p>
                        <p>
                            {selectedStore?.phone && <span>Ph: {selectedStore.phone} | </span>}
                            {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                        </p>
                    </div>

                    {/* Invoice Details - Right */}
                    <div className={styles.invoiceDetails}>
                        <h1>INVOICE</h1>
                        <div className={styles.detailRow}>
                            {/* <div className={styles.detailLabel}>Invoice #</div> */}
                            <div className={styles.invoiceNumberValue}>
                                {invoiceData.invoiceNumber}
                            </div>
                        </div>
                        <div className={styles.detailRow}>
                            <div className={styles.detailLabel}>Date Issued</div>
                            <div>
                                {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill To Section */}
                <div className={styles.billTo}>
                    <div className={styles.billToTitle}>Bill To</div>
                    <p className={styles.billToName}>
                        {invoiceData.customer?.name || "Valued Client Name"}
                    </p>
                    {invoiceData.customer?.email && <p>{invoiceData.customer.email}</p>}
                    {invoiceData.customer?.phone && <p>{invoiceData.customer.phone}</p>}
                    {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <table className={styles.blueTable}>
                        <thead>
                            <tr>
                                <th style={{ width: "45%" }}>Item Description</th>
                                <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                                <th style={{ width: "15%", textAlign: "right" }}>Unit Price</th>
                                <th style={{ width: "10%", textAlign: "right" }}>Tax %</th>
                                <th style={{ width: "20%", textAlign: "right" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.productName}>
                                            {item.product?.name || "Service Rendered"}
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
                                    <td style={{ textAlign: "right" }}>{item.taxRate || 0}%</td>
                                    <td className={styles.tableTotalCell}>
                                        {formatCurrency(
                                            item.quantity *
                                            item.price *
                                            (1 + (item.taxRate || 0) / 100)
                                        )}
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
                            <div className={styles.totalLabel}>Total Tax:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.gstAmount || 0)}
                            </div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.row}>
                                <div className={styles.totalLabel}>Total Discount:</div>
                                <div className={styles.amount} style={{ color: "#e74c3c" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                        <div className={`${styles.row} ${styles.finalRow}`}>
                            <div className={styles.totalLabel}>AMOUNT DUE:</div>
                            <div className={`${styles.amount} ${styles.finalAmount}`}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for choosing us. Please pay within 30 days.</p>
                    <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default ProfessionalBlueTemplate;
