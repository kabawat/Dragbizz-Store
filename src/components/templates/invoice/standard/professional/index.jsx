"use client";
import moment from "moment";
import InvoiceContainer from "../../InvoiceContainer";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import styles from "./style.module.scss";

const ProfessionalTemplate = ({ invoiceData, selectedStore }) => {
    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <InvoiceContainer>
            <div className={styles.professionalInvoice} >
                {/* Header */}
                <div className={styles.header}>
                    <h1>INVOICE</h1>
                    <div className={styles.subtitle}>Professional Business Document</div>
                    <div className={styles.invoiceNumberLabel}>{invoiceData.invoiceNumber}</div>
                    <div className={styles.date}>
                        Date: {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
                    </div>
                </div>

                {/* Info Grid */}
                <div className={styles.infoGrid}>
                    <div className={styles.section}>
                        <h3>From</h3>
                        <div className={styles.companyName}>
                            {selectedStore?.storeName || "Your Store"}
                        </div>
                        <p>{selectedStore?.address || "123 Business Street"}</p>
                        <p>Phone: {selectedStore?.phone || "+91 9876543210"}</p>
                        <p>Email: {selectedStore?.email || "info@yourstore.com"}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Bill To</h3>
                        <div className={styles.customerName}>
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
                        className={styles.professionalTable}
                        tdClassName={styles.descriptionCell}
                        columnWidths={{
                            product: "35%",
                            quantity: "12%",
                            unitPrice: "18%",
                            gst: "15%",
                            total: "20%",
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
                        <div className={styles.totalRow}>
                            <span>TOTAL AMOUNT:</span>
                            <span>{formatCurrency(invoiceData.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.signatureArea}>
                        <div className={styles.signatureBox}>
                            <div className={styles.signatureLine}></div>
                            <p>Authorized Signature</p>
                        </div>
                        <div className={styles.signatureBox}>
                            <div className={styles.signatureLine}></div>
                            <p>Customer Signature</p>
                        </div>
                    </div>
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

export default ProfessionalTemplate;
