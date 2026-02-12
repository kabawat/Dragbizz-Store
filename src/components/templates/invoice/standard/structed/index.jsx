"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const StructuredTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.modernInvoice} >
                {/* Header - Invoice Title and Number/Date */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1>INVOICE</h1>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.invoiceDetail}>
                            Invoice #: <span>{invoiceData.invoiceNumber}</span>
                        </div>
                        <div className={styles.invoiceDetail}>
                            Date:{" "}
                            <span>
                                {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Company and Customer Address Info */}
                <div className={styles.addressInfo}>
                    <div className={styles.addressBlock}>
                        <h3>Billed From</h3>
                        <p style={{ fontWeight: 600 }}>
                            {selectedStore?.storeName || "Your Premium Store"}
                        </p>
                        <p>{selectedStore?.address || "456 Modern Avenue"}</p>
                        <p>
                            {selectedStore?.phone && <span>Phone: {selectedStore.phone}</span>}
                        </p>
                        <p>
                            {selectedStore?.email && <span>Email: {selectedStore.email}</span>}
                        </p>
                    </div>

                    <div className={styles.addressBlock}>
                        <h3>Billed To</h3>
                        <p style={{ fontWeight: 600 }}>
                            {invoiceData.customer?.name || "Walk-in Customer"}
                        </p>
                        {invoiceData.customer?.address && (
                            <p>{invoiceData.customer.address}</p>
                        )}
                        {invoiceData.customer?.phone && (
                            <p>Phone: {invoiceData.customer.phone}</p>
                        )}
                        {invoiceData.customer?.email && (
                            <p>Email: {invoiceData.customer.email}</p>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className={styles.tableContainer}>
                    <InvoiceItemsTable
                        items={invoiceData.items}
                        className={styles.structedTable}
                        columnWidths={{
                            product: "40%",
                            quantity: "12%",
                            unitPrice: "18%",
                            gst: "12%",
                            total: "18%",
                        }}
                        renderProductCell={(item) => (
                            <>
                                <span className={styles.productDetail}>
                                    {item.product?.name || "Unknown Product"}
                                </span>
                                {item.product?.sku && (
                                    <span className={styles.productSku}>SKU: {item.product.sku}</span>
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
                <div className={styles.totalsSummary}>
                    <div className={styles.totals}>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>Subtotal:</div>
                            <div className={styles.amount}>
                                {formatCurrency(invoiceData.subtotal)}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.totalLabel}>GST:</div>
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
                            <div className={styles.finalLabel}>Grand Total:</div>
                            <div className={styles.finalAmount}>
                                {formatCurrency(invoiceData.totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.termsNotes}>
                        <h4>Payment Terms & Notes</h4>
                        <p>
                            Payment is due within 7 days of the invoice date. Thank you for
                            choosing our services!
                        </p>
                        <p style={{ marginTop: "10px" }}>
                            Generated on{" "}
                            {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
                        </p>
                    </div>
                    <div className={styles.signature}>Authorized Signature</div>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default StructuredTemplate;
