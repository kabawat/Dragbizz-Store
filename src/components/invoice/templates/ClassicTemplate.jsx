"use client";
import React from "react";
import moment from "moment";
import styles from "./ClassicTemplate.module.scss";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";

const ClassicTemplate = ({ invoiceData, selectedStore }) => {
  return (
    <div className={`${styles.classicInvoice}`}>
      {/* Header */}
      <div className={styles.classicHeader}>
        <h1>INVOICE</h1>
        <div className={styles.invoiceNumber}>{invoiceData.invoiceNumber}</div>
        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          Date: {moment(invoiceData.createdAt).format("MMMM DD, YYYY")}
        </div>
      </div>

      {/* Company and Customer Info */}
      <div className={styles.classicInfo}>
        <div className={styles.companyInfo}>
          <h3>FROM:</h3>
          <p style={{ fontWeight: "bold", fontSize: "14px" }}>
            {selectedStore?.storeName || "Your Store"}
          </p>
          <p>{selectedStore?.address || "123 Business Street"}</p>
          <p>City, State 12345</p>
          <p>Phone: {selectedStore?.phone || "+91 9876543210"}</p>
          <p>Email: {selectedStore?.email || "info@yourstore.com"}</p>
        </div>

        <div className={styles.customerInfo}>
          <h3>BILL TO:</h3>
          <p style={{ fontWeight: "bold", fontSize: "14px" }}>
            {invoiceData.customer?.name || "Walk-in Customer"}
          </p>
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

      {/* Items Table */}
      <InvoiceItemsTable
        items={invoiceData.items}
        className={styles.classicTable}
        tdClassName={styles.description}
        columnWidths={{
          product: "40%",
          quantity: "15%",
          unitPrice: "20%",
          gst: "10%",
          total: "15%",
        }}
        renderProductCell={(item) => (
          <>
            <div style={{ fontWeight: "bold" }}>
              {item.product?.name || "Unknown Product"}
            </div>
            {item.product?.sku && (
              <div style={{ fontSize: "10px", color: "#666" }}>
                SKU: {item.product.sku}
              </div>
            )}
          </>
        )}
      />

      {/* Totals */}
      <div className={styles.classicTotals}>
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
      <div className={styles.classicFooter}>
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
  );
};

export default ClassicTemplate;
