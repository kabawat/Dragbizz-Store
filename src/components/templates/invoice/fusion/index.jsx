"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const FusionTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.fusionInvoice} id="invoice">
                {/* Header Section */}
                <div className={styles.headerSection}>
                    <div className={styles.brandingBlock}>
                        <h2>{selectedStore?.storeName || "FUSION INC."}</h2>
                        <p>{selectedStore?.address || "101 Tech Center, City"}</p>
                        {selectedStore?.phone && <p>{selectedStore.phone}</p>}
                        {selectedStore?.email && <p>{selectedStore.email}</p>}
                    </div>
                    <div className={styles.invoiceInfo}>
                        <h1>INVOICE</h1>
                        <div>
                            <span style={{ color: "#bdc3c7" }}>No:</span>
                            <span className={styles.tag}>{invoiceData.invoiceNumber}</span>
                        </div>
                        <div style={{ marginTop: "10px" }}>
                            <span style={{ color: "#bdc3c7" }}>Date:</span>
                            <span className={styles.tag}>
                                {moment(invoiceData.createdAt).format("DD-MMM-YYYY")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className={styles.detailsSection}>
                    <div className={styles.detailsBlock}>
                        <div className={styles.label}>Bill To</div>
                        <div className={styles.value}>
                            {invoiceData.customer?.name || "Walk-in Customer"}
                        </div>
                        {invoiceData.customer?.email && (
                            <p>{invoiceData.customer.email}</p>
                        )}
                        {invoiceData.customer?.phone && (
                            <p>{invoiceData.customer.phone}</p>
                        )}
                    </div>
                    <div className={styles.detailsBlock}>
                        <div className={styles.label}>Issued By</div>
                        <div className={styles.value}>
                            {selectedStore?.storeName || "FUSION INC."}
                        </div>
                        {invoiceData.paymentMode && (
                            <p>Payment Mode: <b>{invoiceData.paymentMode}</b></p>
                        )}
                        <p>Reference: {invoiceData.invoiceNumber}</p>
                    </div>
                </div>

                {/* Table Selection */}
                <div className={styles.tableContainer}>
                    <InvoiceItemsTable
                        items={invoiceData.items}
                        className={styles.fusionTable}
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
                            <div className={styles.rowLabel}>Subtotal:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </div>
                        </div>
                        <div className={styles.totalRow}>
                            <div className={styles.rowLabel}>GST:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.gstAmount || 0)}
                            </div>
                        </div>
                        {invoiceData.totalDiscount > 0 && (
                            <div className={styles.totalRow}>
                                <div className={styles.rowLabel}>Discount:</div>
                                <div className={styles.amount} style={{ color: "#e74c3c" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </div>
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
                        Thank you for your business. We look forward to serving you again!
                    </p>
                    <p>Generated on {moment().format("YYYY-MM-DD HH:mm:ss")}</p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default FusionTemplate;
