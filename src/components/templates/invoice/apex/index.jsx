"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const ApexTemplate = ({ invoiceData, selectedStore }) => {
    // Helper function to safely format currency
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const ACCENT_COLOR = "#e74c3c"; // Deep Red for a bold, corporate look

    return (
        <InvoiceContainer>
            <div className={styles.apexInvoice} id="invoice">
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>INVOICE</h1>
                        <p className={styles.dateText}>
                            Date: {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                        </p>
                    </div>
                    <div className={styles.storeInfo}>
                        <h2>{selectedStore?.storeName || "Your Store"}</h2>
                        <p>{selectedStore?.address || "123 Corporate Tower"}</p>
                        <p>{selectedStore?.phone || "+91 9876543210"}</p>
                        <p>{selectedStore?.email || "info@yourstore.com"}</p>
                    </div>
                </div>

                {/* Details Section */}
                <div className={styles.detailsSection}>
                    <div className={styles.infoBlock}>
                        <div className="label">Invoice Number</div>
                        <div className="value">{invoiceData.invoiceNumber}</div>
                        <div className="label">Bill To</div>
                        <p className="value">
                            {invoiceData.customer?.name || "Walk-in Customer"}
                        </p>
                        {invoiceData.customer?.email && (
                            <p>{invoiceData.customer.email}</p>
                        )}
                        {invoiceData.customer?.phone && (
                            <p>{invoiceData.customer.phone}</p>
                        )}
                    </div>
                    <div className={`${styles.infoBlock} ${styles.rightAlign}`}>
                        <div className="label">Payment Status</div>
                        <div className="value" style={{ color: ACCENT_COLOR }}>
                            {invoiceData.paymentStatus || "PAID"}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <InvoiceItemsTable
                    items={invoiceData.items}
                    className={styles.table}
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
                                <span className={styles.productSku}>
                                    SKU: {item.product.sku}
                                </span>
                            )}
                        </>
                    )}
                    renderUnitPriceCell={(item) => formatCurrency(item.price)}
                    renderTotalCell={(item) => {
                        const total = item.calculatedTotal || item.quantity * item.price;
                        return formatCurrency(total);
                    }}
                />

                {/* Totals Section */}
                <div className={styles.totalsSection}>
                    <div className={styles.totals}>
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Subtotal:</span>
                            <span className={styles.totalAmount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </span>
                        </div>
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>GST:</span>
                            <span className={styles.totalAmount}>
                                {formatCurrency(invoiceData.gstAmount)}
                            </span>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Discount:</span>
                                <span
                                    className={styles.totalAmount}
                                    style={{ color: ACCENT_COLOR, fontWeight: 700 }}
                                >
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Total Bar */}
                <div className={styles.finalBar}>
                    <span>TOTAL AMOUNT DUE:</span>
                    <span>{formatCurrency(invoiceData.totalAmount)}</span>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>
                        Thank you for your business. We appreciate your prompt payment.
                    </p>
                    <p>
                        This document is computer-generated and requires no signature.
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default ApexTemplate;
