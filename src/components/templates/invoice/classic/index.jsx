"use client";
import moment from "moment";
import InvoiceContainer from "../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const ClassicTemplate = ({ invoiceData, selectedStore }) => {
    return (
        <InvoiceContainer>
            <div className={styles.classicInvoice} id="invoice">
                {/* Header */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <div className={styles.invoiceNumber}>{invoiceData.invoiceNumber}</div>
                    <p>
                        Date: {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                    </p>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <div className={styles.infoBlock}>
                        <h3>FROM:</h3>
                        <p><strong>{selectedStore?.storeName || "Your Store"}</strong></p>
                        <p>{selectedStore?.address || "123 Business Street"}</p>
                        {selectedStore?.phone && <p>Phone: {selectedStore.phone}</p>}
                        {selectedStore?.email && <p>Email: {selectedStore.email}</p>}
                    </div>

                    <div className={styles.infoBlock}>
                        <h3>BILL TO:</h3>
                        <p><strong>{invoiceData.customer?.name || "Walk-in Customer"}</strong></p>
                        {invoiceData.customer?.email && <p>Email: {invoiceData.customer.email}</p>}
                        {invoiceData.customer?.phone && <p>Phone: {invoiceData.customer.phone}</p>}
                        {invoiceData.customer?.address && <p>{invoiceData.customer.address}</p>}
                    </div>
                </div>

                {/* Table Section */}
                <div className={styles.tableContainer}>
                    <InvoiceItemsTable
                        items={invoiceData.items}
                        className={styles.classicTable}
                        columnWidths={{
                            product: "40%",
                            quantity: "15%",
                            unitPrice: "20%",
                            gst: "10%",
                            total: "15%",
                        }}
                        renderProductCell={(item) => (
                            <div className={styles.productCell}>
                                <div className={styles.productName}>
                                    {item.product?.name || "Product Name"}
                                </div>
                                {item.product?.sku && (
                                    <div className={styles.productSku}>
                                        SKU: {item.product.sku}
                                    </div>
                                )}
                            </div>
                        )}
                        renderUnitPriceCell={(item) => `₹${(item.price || 0).toLocaleString()}`}
                        renderTotalCell={(item) => `₹${((item.quantity || 0) * (item.price || 0)).toLocaleString()}`}
                    />
                </div>

                {/* Totals Section */}
                <div className={styles.totalsSection}>
                    <div className={styles.totalRow}>
                        <span>Subtotal:</span>
                        <span>₹{invoiceData.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className={styles.totalRow}>
                        <span>GST:</span>
                        <span>₹{invoiceData.gstAmount?.toLocaleString() || "0"}</span>
                    </div>
                    {invoiceData.totalDiscount > 0 && (
                        <div className={styles.totalRow}>
                            <span>Discount:</span>
                            <span>-₹{invoiceData.totalDiscount?.toLocaleString()}</span>
                        </div>
                    )}
                    <div className={`${styles.totalRow} ${styles.final}`}>
                        <span>TOTAL:</span>
                        <span>₹{invoiceData.totalAmount?.toLocaleString()}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for your business!</p>
                    <p>
                        This is a computer-generated invoice and does not require a signature.
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

export default ClassicTemplate;
