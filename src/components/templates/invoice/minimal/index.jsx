"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const MinimalTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.minimalInvoice} >
                {/* Header */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <div className={styles.invoiceNumber}>{invoiceData.invoiceNumber}</div>
                    <div className={styles.date}>
                        {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <div className={styles.section}>
                        <div className={styles.label}>From</div>
                        <div className={styles.companyName}>
                            {selectedStore?.storeName || "Your Store"}
                        </div>
                        <p>{selectedStore?.address || "123 Business Street"}</p>
                        <p>
                            {selectedStore?.phone && <span>Ph: {selectedStore.phone}</span>}
                        </p>
                        <p>
                            {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                        </p>
                    </div>

                    <div className={styles.section} style={{ textAlign: "right" }}>
                        <div className={styles.label}>Bill To</div>
                        <div className={styles.customerName}>
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
                </div>

                {/* Items Table */}
                <div className={styles.tableContainer}>
                    <InvoiceItemsTable
                        items={invoiceData.items}
                        className={styles.minimalTable}
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
                            </>
                        )}
                        renderUnitPriceCell={(item) => formatCurrency(item.price)}
                        renderTotalCell={(item) => {
                            const total = item.calculatedTotal || (item.quantity * item.price);
                            return formatCurrency(total);
                        }}
                    />
                </div>

                {/* Totals */}
                <div className={styles.totals}>
                    <div className={styles.totalRow}>
                        <div className={styles.label}>Subtotal:</div>
                        <div className={styles.amount}>
                            {formatCurrency(invoiceData.subtotal)}
                        </div>
                    </div>
                    <div className={styles.totalRow}>
                        <div className={styles.label}>GST:</div>
                        <div className={styles.amount}>
                            {formatCurrency(invoiceData.gstAmount || 0)}
                        </div>
                    </div>
                    {invoiceData.totalDiscount > 0 && (
                        <div className={styles.totalRow}>
                            <div className={styles.label}>Discount:</div>
                            <div className={styles.amount} style={{ color: "#e74c3c" }}>
                                -{formatCurrency(invoiceData.totalDiscount)}
                            </div>
                        </div>
                    )}
                    <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                        <div className={styles.label}>Total:</div>
                        <div className={styles.amount}>
                            {formatCurrency(invoiceData.totalAmount)}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your business</p>
                    <p>
                        This is a computer-generated invoice and does not require a
                        signature
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

export default MinimalTemplate;
