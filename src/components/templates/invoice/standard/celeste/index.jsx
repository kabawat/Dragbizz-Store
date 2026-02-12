"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const CelesteTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.celesteInvoice} >
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <p>
                        Invoice No: <strong>{invoiceData.invoiceNumber}</strong> | Date:{" "}
                        {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                    </p>
                </div>

                {/* Business and Customer Info */}
                <div className={styles.infoGrid}>
                    <div className={styles.infoBlock}>
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
                    <div className={styles.infoBlock}>
                        <div className={styles.label}>Issued By</div>
                        <div className={styles.value}>
                            {selectedStore?.storeName || "Your Store Name"}
                        </div>
                        <p>{selectedStore?.address || "123 Business Street"}</p>
                        <p>
                            {selectedStore?.phone && <span>Ph: {selectedStore.phone} | </span>}
                            {selectedStore?.email && <span>{selectedStore.email}</span>}
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className={styles.tableContainer}>
                    <InvoiceItemsTable
                        items={invoiceData.items}
                        className={styles.celesteTable}
                        headerClassName="table-header"
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
                                    {item.product?.name || "Unnamed Product"}
                                </div>
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

                {/* Totals Section */}
                <div className={styles.totalsContainer}>
                    <div className={styles.totals}>
                        <div className={styles.totalRow}>
                            <div className={styles.totalLabel}>Subtotal:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </div>
                        </div>
                        <div className={styles.totalRow}>
                            <div className={styles.totalLabel}>GST:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.gstAmount)}
                            </div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <div className={styles.totalLabel}>Discount:</div>
                                <div className={styles.amount} style={{ color: "#ff4d4f" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
                            </div>
                        )}
                        <div className={`${styles.totalRow} ${styles.finalRow}`}>
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
                        Thank you for choosing {selectedStore?.storeName || "Our Store"}!
                    </p>
                    <p>
                        Generated on{" "}
                        {moment(invoiceData.createdAt).format(
                            "MMMM DD, YYYY [at] h:mm A"
                        )}
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default CelesteTemplate;
