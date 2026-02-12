"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const ModernTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.modernInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1>INVOICE</h1>
                        <div className={styles.subtitle}>
                            Professional Business Invoice
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.invoiceNumberValue}>{invoiceData.invoiceNumber}</div>
                        <div className={styles.dateText}>
                            {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className={styles.infoGrid}>
                    <div className={styles.infoSection}>
                        <h3>From</h3>
                        <div className={styles.entityName}>
                            {selectedStore?.storeName || "Your Store"}
                        </div>
                        <p>{selectedStore?.address || "123 Business Street"}</p>
                        {selectedStore?.phone && <p>Phone: {selectedStore.phone}</p>}
                        {selectedStore?.email && <p>Email: {selectedStore.email}</p>}
                    </div>

                    <div className={styles.infoSection}>
                        <h3>Bill To</h3>
                        <div className={styles.entityName}>
                            {invoiceData.customer?.name || "Walk-in Customer"}
                        </div>
                        {invoiceData.customer?.email && (
                            <p>Email: {invoiceData.customer.email}</p>
                        )}
                        {invoiceData.customer?.phone && (
                            <p>Phone: {invoiceData.customer.phone}</p>
                        )}
                        {invoiceData.customer?.address && (
                            <p>{invoiceData.customer.address}</p>
                        )}
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <InvoiceItemsTable
                        items={invoiceData.items}
                        className={styles.modernTable}
                        columnWidths={{
                            product: "40%",
                            quantity: "12%",
                            unitPrice: "18%",
                            gst: "12%",
                            total: "18%",
                        }}
                        renderProductCell={(item) => (
                            <>
                                <div className={styles.productName}>
                                    {item.product?.name || "Unknown Product"}
                                </div>
                                {item.product?.sku && (
                                    <div className={styles.productSku}>SKU: {item.product.sku}</div>
                                )}
                                {item.gstRate && item.gstRate > 0 && (
                                    <div className={styles.productSku}>
                                        GST: {item.gstRate}%
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

                {/* Totals Section */}
                <div className={styles.totalsArea}>
                    <div className={styles.totalsBox}>
                        <div className={styles.totalRow}>
                            <span>Subtotal:</span>
                            <span>{formatCurrency(invoiceData.subtotal)}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>GST:</span>
                            <span>{formatCurrency(invoiceData.gstAmount || 0)}</span>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <span>Discount:</span>
                                <span style={{ color: "#e74c3c" }}>-{formatCurrency(invoiceData.totalDiscount)}</span>
                            </div>
                        )}
                        <div className={`${styles.totalRow} ${styles.grandTotalRow}`}>
                            <span>TOTAL:</span>
                            <span>{formatCurrency(invoiceData.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your business!</p>
                    <p>
                        This is a computer-generated invoice and does not require a
                        signature.
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

export default ModernTemplate;
