"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const SpectrumTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.spectrumInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.branding}>
                        <h1>INVOICE</h1>
                        <div className={styles.storeInfo}>
                            <p style={{ fontWeight: 700, color: "#34495e" }}>
                                {selectedStore?.storeName || "Spectrum Solutions"}
                            </p>
                            <p>{selectedStore?.address || "404 Innovation Street"}</p>
                            <p>
                                {selectedStore?.phone && <span>{selectedStore.phone} | </span>}
                                {selectedStore?.email && <span>{selectedStore.email}</span>}
                            </p>
                        </div>
                    </div>

                    {/* Key Invoice Details */}
                    <div className={styles.detailsBlock}>
                        <div className={styles.label}>Invoice Number</div>
                        <div className={styles.value}>{invoiceData.invoiceNumber}</div>
                        <div className={styles.label}>Date Issued</div>
                        <div className={styles.value}>
                            {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                        </div>

                        <div className={styles.customerInfo}>
                            <div className={styles.label}>Bill To:</div>
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
                    </div>
                </div>

                {/* Items Table */}
                <div className={styles.tableContainer}>
                    <InvoiceItemsTable
                        items={invoiceData.items}
                        className={styles.spectrumTable}
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
                        <div className={`${styles.row} ${styles.finalRow}`}>
                            <div className={styles.finalLabel}>TOTAL DUE:</div>
                            <div className={styles.finalAmount}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your business. Payment due within 7 days.</p>
                    <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default SpectrumTemplate;
