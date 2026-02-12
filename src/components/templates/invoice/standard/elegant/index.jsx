"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const ElegantTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) =>
        `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <InvoiceContainer>
            <div className={styles.elegantInvoice} >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.storeDetails}>
                        <div className={styles.storeName}>
                            {selectedStore?.storeName || "Your Store"}
                        </div>
                        <div className={styles.storeAddress}>
                            {selectedStore?.address && <p>{selectedStore.address}</p>}
                            {selectedStore?.phone && <p>Phone: {selectedStore.phone}</p>}
                            {selectedStore?.email && <p>Email: {selectedStore.email}</p>}
                        </div>
                    </div>
                    <div className={styles.invoiceDetails}>
                        <div className={styles.title}>INVOICE</div>
                        <p>{invoiceData.invoiceNumber}</p>
                        <p>{moment(invoiceData.createdAt).format("MMMM DD, YYYY")}</p>
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <div className={styles.infoBox}>
                        <h3>Bill To</h3>
                        <p>
                            <strong>
                                {invoiceData.customer?.name || "Walk-in Customer"}
                            </strong>
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
                    {invoiceData.paymentMode && (
                        <div className={styles.infoBox}>
                            <h3>Payment Info</h3>
                            <p><strong>Method:</strong> {invoiceData.paymentMode}</p>
                            <p><strong>Status:</strong> {invoiceData.status || "Paid"}</p>
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <div className={styles.tableContainer}>
                    <InvoiceItemsTable
                        items={invoiceData.items}
                        className={styles.elegantTable}
                        columnWidths={{
                            product: "35%",
                            quantity: "12%",
                            unitPrice: "18%",
                            gst: "15%",
                            total: "20%",
                        }}
                        renderQuantityCell={(item) => (
                            <div className={styles.alignCenter}>{item.quantity}</div>
                        )}
                        renderUnitPriceCell={(item) => (
                            <div className={styles.alignRight}>{formatCurrency(item.price)}</div>
                        )}
                        renderGstCell={(item) => {
                            const itemGst = item.calculatedGst || 0;
                            return (
                                <div className={styles.alignRight}>
                                    {itemGst > 0 ? formatCurrency(itemGst) : "-"}
                                </div>
                            );
                        }}
                        renderTotalCell={(item) => {
                            const total = item.calculatedTotal || (item.quantity * item.price);
                            return (
                                <div className={styles.alignRight}>{formatCurrency(total)}</div>
                            );
                        }}
                    />
                </div>

                {/* Totals Section */}
                <div className={styles.totalsSection}>
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
                                <span style={{ color: "#ff4d4f" }}>
                                    -{formatCurrency(invoiceData.totalDiscount)}
                                </span>
                            </div>
                        )}
                        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                            <span>Total:</span>
                            <span>{formatCurrency(invoiceData.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for shopping with us!</p>
                    <p>
                        Generated on{" "}
                        {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] hh:mm A")}
                    </p>
                    <p>
                        This is a system-generated invoice and does not require a signature.
                    </p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default ElegantTemplate;
