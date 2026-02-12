"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import styles from "./style.module.scss";

const VelocityLedgerTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.velocityInvoice} >
                {/* Header Band */}
                <div className={styles.headerBand}>
                    <h1>TAX INVOICE</h1>
                    <div className={styles.invoiceNumberBadge}>
                        INVOICE # {invoiceData.invoiceNumber}
                    </div>
                </div>

                {/* Store Info Block (Right-aligned) */}
                <div className={styles.storeInfoArea}>
                    <div className={styles.storeName}>
                        {selectedStore?.storeName || "Velocity Solutions Corp."}
                    </div>
                    <p>
                        {selectedStore?.address || "101 Commerce Tower, Business Park"}
                    </p>
                    <p>
                        {selectedStore?.phone && <span>Ph: {selectedStore.phone} | </span>}
                        {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                    </p>
                </div>

                {/* Info Bar - Invoice Meta and Customer */}
                <div className={styles.infoContainer}>
                    {/* Invoice Details Box */}
                    <div className={styles.detailBox}>
                        <div className={styles.title}>Invoice Date & Due</div>
                        <p>
                            Issued:{" "}
                            <span className={styles.valueBold}>
                                {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                            </span>
                        </p>
                        <p>
                            Due: <span className={styles.valueBold}>Upon Receipt</span>
                        </p>
                    </div>

                    {/* Bill To Box */}
                    <div className={styles.detailBox}>
                        <div className={styles.title}>Bill To / Customer</div>
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
                <div className={styles.tableArea}>
                    <table className={styles.velocityTable}>
                        <thead>
                            <tr>
                                <td className="font-bold" style={{ width: "45%" }}>Description</td>
                                <td className="font-bold" style={{ width: "15%", textAlign: "center" }}>Qty</td>
                                <td className="font-bold" style={{ width: "20%", textAlign: "right" }}>Rate</td>
                                <td className="font-bold" style={{ width: "20%", textAlign: "right" }}>Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.productName}>
                                            {item.product?.name || "Unnamed Item"}
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

                {/* Totals Area */}
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
                                <div className={styles.amount} style={{ color: "#e74c3c" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grand Total Footer Band */}
                <div className={styles.grandTotalHighlight}>
                    <div className={styles.finalLabel}>TOTAL AMOUNT DUE:</div>
                    <div className={styles.finalAmount}>
                        {formatCurrency(invoiceData.totalAmount)}
                    </div>
                </div>

                <div className={styles.electronicFooter}>
                    <p>
                        This invoice was generated electronically and is valid without a
                        signature. Thank you for your continued partnership.
                    </p>
                    <p style={{ marginTop: "5px", opacity: 0.8 }}>
                        Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default VelocityLedgerTemplate;
