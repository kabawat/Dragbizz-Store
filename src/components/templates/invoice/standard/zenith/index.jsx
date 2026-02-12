"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const ZenithTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.zenithInvoice} >
                {/* Left Sidebar */}
                <div className={styles.sidebar}>
                    <div>
                        <h2>{selectedStore?.storeName || "Your Store"}</h2>
                        <p>{selectedStore?.address || "123 Business Avenue"}</p>
                        {selectedStore?.phone && <p>{selectedStore.phone}</p>}
                        {selectedStore?.email && <p>{selectedStore.email}</p>}
                    </div>

                    <div>
                        <p style={{ fontSize: "11px", opacity: 0.9, marginTop: "40px" }}>
                            © {moment().format("YYYY")}{" "}
                            {selectedStore?.storeName || "Your Store"}
                        </p>
                    </div>
                </div>

                {/* Right Main */}
                <div className={styles.main}>
                    <div className={styles.header}>
                        <h1>INVOICE</h1>
                        <div className={styles.headerRight}>
                            <p>
                                Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
                            </p>
                            <p>
                                Date: {moment(invoiceData.createdAt).format("MMM DD, YYYY")}
                            </p>
                        </div>
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.card}>
                            <h4>Bill To</h4>
                            <p>{invoiceData.customer?.name || "Walk-in Customer"}</p>
                            {invoiceData.customer?.phone && (
                                <p>{invoiceData.customer.phone}</p>
                            )}
                            {invoiceData.customer?.email && (
                                <p>{invoiceData.customer.email}</p>
                            )}
                            {invoiceData.customer?.address && (
                                <p>{invoiceData.customer.address}</p>
                            )}
                        </div>

                        <div className={styles.card}>
                            <h4>From</h4>
                            <p>{selectedStore?.storeName || "Your Store"}</p>
                            <p>{selectedStore?.email}</p>
                            <p>{selectedStore?.phone}</p>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <InvoiceItemsTable
                            items={invoiceData.items}
                            className={styles.zenithTable}
                            columnWidths={{
                                product: "40%",
                                quantity: "15%",
                                unitPrice: "20%",
                                gst: "10%",
                                total: "15%",
                            }}
                            renderProductCell={(item) => (
                                <>
                                    <div className={styles.productName}>{item.product?.name}</div>
                                    {item.product?.sku && (
                                        <div className={styles.productSku}>
                                            SKU: {item.product.sku}
                                        </div>
                                    )}
                                </>
                            )}
                            renderUnitPriceCell={(item) => formatCurrency(item.price)}
                            renderTotalCell={(item) => {
                                const total = item.calculatedTotal || item.quantity * item.price;
                                return formatCurrency(total);
                            }}
                        />
                    </div>

                    <div className={styles.totalsArea}>
                        <div className={styles.totalsBox}>
                            <div className={styles.totalsRow}>
                                <span className={styles.totalsLabel}>Subtotal:</span>
                                <span className={styles.totalsValue}>
                                    {formatCurrency(invoiceData.subtotal)}
                                </span>
                            </div>
                            <div className={styles.totalsRow}>
                                <span className={styles.totalsLabel}>GST:</span>
                                <span className={styles.totalsValue}>
                                    {formatCurrency(invoiceData.gstAmount || 0)}
                                </span>
                            </div>
                            {invoiceData.totalDiscount > 0 && (
                                <div className={styles.totalsRow}>
                                    <span className={styles.totalsLabel}>Discount:</span>
                                    <span className={styles.totalsValue} style={{ color: "#e74c3c" }}>
                                        -{formatCurrency(invoiceData.totalDiscount)}
                                    </span>
                                </div>
                            )}
                            <div className={`${styles.totalsRow} ${styles.finalTotalRow}`}>
                                <span className={styles.totalsLabel}>Total:</span>
                                <span className={styles.totalsValue}>
                                    {formatCurrency(invoiceData.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <p>Thank you for choosing us!</p>
                        <p>
                            Generated on{" "}
                            {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
                        </p>
                        <p>
                            This invoice is system-generated and does not require a signature.
                        </p>
                    </div>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default ZenithTemplate;
