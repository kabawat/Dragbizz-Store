"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const LumosTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.lumosInvoice} >
                {/* Header Section */}
                <div className={styles.header}>
                    <div>
                        <h1>INVOICE</h1>
                        <p style={{ fontSize: "12px", marginTop: "5px" }}>
                            Invoice No: <strong>{invoiceData.invoiceNumber}</strong>
                        </p>
                    </div>
                    <div className={styles.storeInfo}>
                        <strong>{selectedStore?.storeName || "Your Store"}</strong>
                        <p>{selectedStore?.address || "123 Business Street"}</p>
                        <p>
                            {selectedStore?.phone && <span>Ph: {selectedStore.phone}</span>}
                            {selectedStore?.email && <span> | Email: {selectedStore.email}</span>}
                        </p>
                    </div>
                </div>

                {/* Body Section */}
                <div className={styles.invoiceBody}>
                    <div className={styles.summary}>
                        <div>
                            <strong>Date:</strong>{" "}
                            {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                        </div>
                        <div>
                            <strong>Customer:</strong>{" "}
                            {invoiceData.customer?.name || "Walk-in Customer"}
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.infoBlock}>
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
                            {invoiceData.customer?.address && (
                                <p>{invoiceData.customer.address}</p>
                            )}
                        </div>
                        <div className={styles.infoBlock} style={{ textAlign: "right" }}>
                            <div className={styles.label}>Issued By</div>
                            <div className={styles.value}>
                                {selectedStore?.storeName || "Your Store"}
                            </div>
                            {selectedStore?.email && <p>{selectedStore.email}</p>}
                            {invoiceData.paymentMode && (
                                <p>Payment: {invoiceData.paymentMode}</p>
                            )}
                        </div>
                    </div>

                    {/* Product Table */}
                    <div className={styles.tableContainer}>
                        <InvoiceItemsTable
                            items={invoiceData.items}
                            className={styles.lumosTable}
                            tdClassName={styles.productName}
                            columnWidths={{
                                product: "40%",
                                quantity: "15%",
                                unitPrice: "20%",
                                gst: "10%",
                                total: "15%",
                            }}
                            renderUnitPriceCell={(item) => formatCurrency(item.price)}
                            renderTotalCell={(item) => {
                                const total = item.calculatedTotal || (item.quantity * item.price);
                                return formatCurrency(total);
                            }}
                            renderGstCell={(item) => {
                                const gst = item.calculatedGst || 0;
                                return gst > 0 ? formatCurrency(gst) : "-";
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
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>
                        Thank you for choosing {selectedStore?.storeName || "our store"}!
                    </p>
                    <p>
                        Generated on{" "}
                        {moment(invoiceData.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
                    </p>
                    <p>This is a system-generated invoice and requires no signature.</p>
                </div>
            </div>
        </InvoiceContainer>
    );
};

export default LumosTemplate;
