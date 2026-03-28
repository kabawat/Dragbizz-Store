"use client";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  Download,
  FileText,
  User,
} from "lucide-react";
import moment from "moment";
import { useCallback, useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { invoiceService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";
import styles from "./InvoiceView.module.scss";

// ── Helpers ──────────────────────────────────────────────────────────────────
const getStatusBadgeCommon = (status) => {
  const s = (status || "").toString().toUpperCase();

  const variantMap = {
    PAID: "success",
    RELEASED: "success",
    UNPAID: "danger",
    CANCELLED: "danger",
    PAY_LATER: "warning",
    PARTIAL: "warning",
    DRAFT: "warning",
  };

  const textMap = {
    PAID: "Paid",
    RELEASED: "Paid",
    UNPAID: "Unpaid",
    CANCELLED: "Cancelled",
    PAY_LATER: "Pending",
    PARTIAL: "Pending",
    DRAFT: "Pending",
  };

  const colorMap = {
    success: "background: rgba(16,185,129,0.08); color: #065f46; border: 1px solid rgba(16,185,129,0.18);",
    danger: "background: rgba(239,68,68,0.08); color: #7f1d1d; border: 1px solid rgba(239,68,68,0.18);",
    warning: "background: rgba(234,179,8,0.08); color: #7c2d12; border: 1px solid rgba(234,179,8,0.18);",
    primary: "background: rgba(41,128,185,0.08); color: #2980b9; border: 1px solid rgba(41,128,185,0.18);",
    secondary: "background: rgba(107,114,128,0.06); color: #374151; border: 1px solid rgba(107,114,128,0.12);",
  };

  const iconMap = {
    PAID: CheckCircle,
    RELEASED: CheckCircle,
    UNPAID: AlertTriangle,
    CANCELLED: AlertTriangle,
    PAY_LATER: Clock,
    PARTIAL: Clock,
    DRAFT: Clock,
  };

  const variant = variantMap[s] || "secondary";
  return {
    text: textMap[s] || status || "Unknown",
    style: colorMap[variant] || colorMap.secondary,
    Icon: iconMap[s] || Clock,
  };
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);

const formatDate = (d) => (d ? moment(d).format("D MMM, YYYY") : "-");

const formatAddress = (addr) => {
  if (!addr) return "N/A";
  if (typeof addr === "string") return addr;
  const { line1, line2, city, state, pincode, country, location, ...rest } = addr || {};
  const parts = [line1, line2, city, state, pincode, country, location].filter(Boolean);
  const extra = Object.values(rest || {}).filter(Boolean);
  return [...parts, ...extra].join(", ") || "N/A";
};

const parseStyle = (styleStr = "") => {
  const obj = {};
  styleStr.split(";").forEach((s) => {
    const [k, v] = s.split(":") || [];
    if (!k || !v) return;
    const key = k.trim().replace(/-([a-z])/g, (_m, p1) => p1.toUpperCase());
    obj[key] = v.trim();
  });
  return obj;
};

// ── Component ─────────────────────────────────────────────────────────────────
const ViewInvoiceStructured = ({ invoiceId }) => {
  const { execute, loading, data: invoice } = useApiResponse();

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;
    await execute(
      invoiceService.getPublicInvoice(invoiceId),
      { showToast: false }
    );
  }, [invoiceId, execute]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleDownload = () => {
    if (typeof window !== "undefined") window.print();
  };

  // ── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className={styles.spinner} />
          <h2>Loading Invoice...</h2>
        </div>
      </div>
    );
  }

  // ── Error / Not Found State ──────────────────────────────────────────────────
  if (!invoice) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <AlertTriangle />
          </div>
          <h2>Invoice Not Found</h2>
          <p>The invoice you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const paymentBadge = getStatusBadgeCommon(invoice.paymentStatus);
  const invoiceBadge = getStatusBadgeCommon(invoice.invoiceStatus);

  // ── Invoice View ────────────────────────────────────────────────────────────
  return (
    <ThemeProvider>
      <div className={`${styles.modernInvoice} ${styles.bgWhite}`}>
        {/* Header */}
        <div className={styles.modernHeader}>
          <div className={styles.left}>
            <div className={styles.brandCircle} aria-hidden>
              <FileText style={{ color: "white" }} />
            </div>
            <div>
              <h1>INVOICE</h1>
              <div className={styles.storeMeta}>
                <div className={styles.invoiceNum}>#{invoice.invoiceNumber || invoice.publicId || invoiceId}</div>
                <div className={styles.storeName}>{invoice.store?.name || "Store"}</div>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.invoiceDetail}>Invoice #: <span>{invoice.invoiceNumber || invoice.publicId || invoiceId}</span></div>
            <div className={styles.invoiceDetail}>Date: <span>{formatDate(invoice.createdAt || invoice.releasedAt)}</span></div>
            <div className={styles.invoiceDetail}>Released: <span>{invoice.releasedAt ? formatDate(invoice.releasedAt) : "-"}</span></div>
          </div>
        </div>

        {/* Status Badges */}
        <div className={styles.badgesRow}>
          <span className={styles.badge} style={parseStyle(invoiceBadge.style)}>
            <invoiceBadge.Icon style={{ width: 16, height: 16 }} />
            {invoiceBadge.text}
          </span>
          <span className={styles.badge} style={parseStyle(paymentBadge.style)}>
            <paymentBadge.Icon style={{ width: 16, height: 16 }} />
            {paymentBadge.text}
          </span>
        </div>

        {/* Store & Customer Info */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3><Building2 size={14} /> Store Information</h3>
            <p className={styles.bold}>{invoice.store?.name || "N/A"}</p>
            <p>{formatAddress(invoice.store?.address)}</p>
            <p>Phone: {invoice.store?.phone || "N/A"}</p>
            <p>Email: {invoice.store?.email || "N/A"}</p>
            {invoice.store?.gstNumber && <p>GST: {invoice.store.gstNumber}</p>}
          </div>
          <div className={styles.infoCard}>
            <h3><User size={14} /> Customer Information</h3>
            <p className={styles.bold}>{invoice.customer?.name || "Walk-in Customer"}</p>
            {invoice.customer?.address && <p>{invoice.customer.address}</p>}
            <p>Phone: {invoice.customer?.phone || "N/A"}</p>
            <p>Email: {invoice.customer?.email || "N/A"}</p>
            {invoice.releasedAt && <p>Released: {formatDate(invoice.releasedAt)}</p>}
          </div>
        </div>

        {/* Amount Summary Cards */}
        <div className={styles.amountsGrid}>
          {[
            { label: "Subtotal", value: invoice.subtotal },
            { label: "GST", value: invoice.gstAmount },
            { label: "Total Amount", value: invoice.totalAmount, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div className={styles.amountCard} key={label}>
              <div className={styles.label}>{label}</div>
              <div className={`${styles.value} ${highlight ? styles.highlight : ""}`}>
                {formatCurrency(value)}
              </div>
            </div>
          ))}
          <div className={styles.amountCard}>
            <div className={styles.label}>Paid / Due</div>
            <div className={styles.subItems}>
              <div className={styles.subItem}>Paid: {formatCurrency(invoice.paidAmount)}</div>
              <div className={styles.subItem}>Due: {formatCurrency(invoice.dueAmount)}</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className={styles.itemsTableWrap}>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th>Item</th><th>Qty</th><th>Price</th><th>GST</th><th>Discount</th><th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className={styles.itemName}>{item.name || item.product?.name || "Item"}</div>
                      {item.barcode && <div className={styles.barcode}>Barcode: {item.barcode}</div>}
                    </td>
                    <td>{item.quantity || 0}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{item.gstRate ? `${item.gstRate}%` : "0%"}</td>
                    <td>{item.discount ? `${item.discount}%` : "0%"}</td>
                    <td>{formatCurrency(item.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>No items available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className={styles.totals}>
          <div className={styles.box}>
            <div className={styles.totalRow}><div>Subtotal</div><div>{formatCurrency(invoice.subtotal)}</div></div>
            <div className={styles.totalRow}><div>GST</div><div>{formatCurrency(invoice.gstAmount)}</div></div>
            {invoice.totalDiscount > 0 && (
              <div className={styles.totalRow}>
                <div>Discount</div>
                <div className={styles.disValue}>- {formatCurrency(invoice.totalDiscount)}</div>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.final}`}><div>Grand Total</div><div>{formatCurrency(invoice.totalAmount)}</div></div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modernFooter}>
          <div className={styles.terms}>
            <h4>Payment Terms & Notes</h4>
            <p>Payment due within 7 days of invoice date. Thank you for choosing our services.</p>
            <p style={{ color: "#6b7280" }}>Generated on {moment(invoice.createdAt).format("MMMM DD, YYYY [at] HH:mm")}</p>
          </div>
          <div className={styles.signature}>Authorized Signature</div>
        </div>
      </div>

      {/* Download Button */}
      <div className={`${styles.modernInvoice} no-print`}>
        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button className={styles.printBtn} onClick={handleDownload}>
            <Download size={16} />
            Print / Download
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ViewInvoiceStructured;
