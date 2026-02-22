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
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { invoiceService } from "@/service/retailer";
import logger from "@/utils/logger";

// Component to fetch and display public invoice
const accentColor = "#2980b9";

const getStatusBadgeCommon = (status, _type = "invoice") => {
  // minimal mapping similar to first component
  const s = (status || "").toString().toUpperCase();
  const config = {
    text: status || "Unknown",
    variant: "secondary",
  };

  if (s === "PAID" || s === "RELEASED") {
    config.variant = "success";
    config.text = "Paid";
  } else if (s === "UNPAID") {
    config.variant = "danger";
    config.text = "Unpaid";
  } else if (s === "PAY_LATER" || s === "PARTIAL" || s === "DRAFT") {
    config.variant = "warning";
    config.text = "Pending";
  } else if (s === "CANCELLED") {
    config.variant = "danger";
    config.text = "Cancelled";
  } else {
    config.variant = "primary";
  }

  const colorMap = {
    success: `background: rgba(16,185,129,0.08); color: #065f46; border: 1px solid rgba(16,185,129,0.18);`,
    danger: `background: rgba(239,68,68,0.08); color: #7f1d1d; border: 1px solid rgba(239,68,68,0.18);`,
    warning: `background: rgba(234,179,8,0.08); color: #7c2d12; border: 1px solid rgba(234,179,8,0.18);`,
    primary: `background: rgba(41,128,185,0.08); color: ${accentColor}; border: 1px solid rgba(41,128,185,0.18);`,
    secondary: `background: rgba(107,114,128,0.06); color: #374151; border: 1px solid rgba(107,114,128,0.12);`,
  };

  const iconMap = {
    PAID: CheckCircle,
    UNPAID: AlertTriangle,
    PAY_LATER: Clock,
    PARTIAL: Clock,
    RELEASED: CheckCircle,
    DRAFT: Clock,
    CANCELLED: AlertTriangle,
  };

  return {
    text: config.text,
    style: colorMap[config.variant] || colorMap.secondary,
    Icon: iconMap[s] || Clock,
  };
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    amount || 0
  );

const formatDate = (d) => (d ? moment(d).format("D MMM, YYYY") : "-");

const formatAddress = (addr) => {
  if (!addr) return "N/A";
  if (typeof addr === "string") return addr;
  const { line1, line2, city, state, pincode, country, location, ...rest } =
    addr || {};
  const parts = [line1, line2, city, state, pincode, country, location].filter(
    Boolean
  );
  const extra = Object.values(rest || {}).filter(Boolean);
  return [...parts, ...extra].join(", ") || "N/A";
};

const ViewInvoiceStructured = ({ invoiceId }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      setError("Invoice ID is required");
      return;
    }
    let mounted = true;
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await invoiceService.getPublicInvoice(invoiceId);
        if (!mounted) return;
        if (res?.success && res?.data) {
          setInvoice(res.data);
        } else {
          setError(res?.message || "Invoice not found");
        }
      } catch (e) {
        logger.error("Error fetching invoice:", e);
        setError("Failed to load invoice");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchInvoice();
    return () => {
      mounted = false;
    };
  }, [invoiceId]);

  const handleDownload = () => {
    if (typeof window !== "undefined") window.print();
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "rgb(var(--color-bg-primary, 248 249 250))" }}
      >
        <div className="text-center">
          <div
            style={{
              width: 64,
              height: 64,
              border: "4px solid rgba(0,0,0,0.08)",
              borderTopColor: accentColor,
              borderRadius: "9999px",
            }}
            className="animate-spin mx-auto mb-4"
          />
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Loading Invoice...</h2>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "rgb(var(--color-bg-primary, 248 249 250))" }}
      >
        <div className="text-center p-8">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 9999,
              background: "rgba(239,68,68,0.08)",
            }}
            className="mx-auto mb-4 flex items-center justify-center"
          >
            <AlertTriangle style={{ color: "#dc2626" }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Invoice Not Found</h2>
          <p style={{ color: "#6b7280" }}>
            {error || "The invoice you are looking for does not exist."}
          </p>
        </div>
      </div>
    );
  }

  const paymentBadge = getStatusBadgeCommon(invoice.paymentStatus, "invoice");
  const invoiceBadge = getStatusBadgeCommon(invoice.invoiceStatus, "invoice");

  return (
    <ThemeProvider>
      <style jsx global>{`
          @media print {
            body {
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .modern-invoice { box-shadow: none !important; margin: 0 !important; }
          }

          body {
            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
            background: #f3f4f6 !important;
            color: #34495e !important;
          }

          .modern-invoice {
            width: 100%;
            max-width: 900px;
            margin: 32px auto;
            padding: 36px;
            border-radius: 12px;
          }
          .bg-white { background: white !important;
          box-shadow: 0 6px 30px rgba(16,24,40,0.06);
          }

          .modern-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 18px;
            border-bottom: 3px solid ${accentColor};
            gap: 16px;
          }

          .modern-header-left {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .brand-circle {
            width: 72px;
            height: 72px;
            border-radius: 9999px;
            background: ${accentColor};
            display:flex;
            align-items:center;
            justify-content:center;
            box-shadow: 0 6px 18px rgba(41,128,185,0.12);
          }

          .modern-header-left h1 {
            font-size: 28px;
            color: ${accentColor};
            margin: 0;
            font-weight: 700;
          }

          .modern-header-right { text-align: right; }
          .modern-header-right .invoice-detail { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
          .modern-header-right .invoice-detail span { font-weight: 400; color: #6b7280; margin-left: 8px; }

          .badges-row { display:flex; gap:12px; justify-content:center; margin:18px 0; flex-wrap:wrap; }

          .badge {
            display:inline-flex;
            align-items:center;
            gap:8px;
            padding:8px 12px;
            border-radius:999px;
            font-size:13px;
            font-weight:600;
            border:1px solid rgba(0,0,0,0.06);
          }

          .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:20px; }

          .info-card {
            background: #fafafa;
            padding:14px;
            border-radius:10px;
          }

          .info-card h3 {
            margin:0 0 8px 0;
            font-size:13px;
            color:${accentColor};
            text-transform:uppercase;
            letter-spacing:0.6px;
            border-bottom:1px solid #eef2f6;
            padding-bottom:6px;
          }

          .amounts-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:20px; }

          .amount-card {
            padding:14px;
            border-radius:10px;
            position:relative;
            overflow:hidden;
            background: linear-gradient(180deg, rgba(41,128,185,0.03), rgba(41,128,185,0.01));
          }

          .items-table-wrap {
            margin-top:18px;
            border-radius:10px;
            overflow:hidden;
            border:1px solid #eef2f6;
          }

          table.modern-table {
            width:100%;
            border-collapse: collapse;
          }
          table.modern-table thead th {
            padding:12px 10px;
            text-align:left;
            font-weight:700;
            font-size:12px;
            color:white;
            background:${accentColor};
            text-transform:uppercase;
          }
          table.modern-table td {
            padding:12px 10px;
            border-bottom:1px solid #eef2f6;
            font-size:14px;
          }
          table.modern-table tbody tr:nth-child(even) { background:#fbfcfd; }

          .totals {
            display:flex;
            justify-content:flex-end;
            margin-top:18px;
          }
          .totals .box {
            width:320px;
            background:transparent;
          }
          .total-row { display:flex; justify-content:space-between; padding:8px 0; font-size:15px; color:#34495e; }
          .total-row.final { border-top:2px solid ${accentColor}; padding-top:12px; margin-top:8px; font-weight:800; color:${accentColor}; font-size:18px; }

          .modern-footer { margin-top:28px; border-top:1px solid #eef2f6; padding-top:18px; display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
          .modern-footer .terms { width:65%; color:#6b7280; font-size:13px; }
          .modern-footer .signature { width:30%; text-align:right; color:#9ca3af; font-size:13px; border-top:1px dashed #d1d5db; padding-top:10px; }

          .print-btn { display:inline-flex; gap:8px; align-items:center; padding:8px 12px; border-radius:8px; background:${accentColor}; color:white; font-weight:700; border:none; cursor:pointer; }
        `}</style>

      <div className="modern-invoice bg-white">
        <div className="modern-header">
          <div className="modern-header-left">
            <div className="brand-circle" aria-hidden>
              <FileText style={{ color: "white" }} />
            </div>
            <div>
              <h1>INVOICE</h1>
              <div style={{ color: "#6b7280", marginTop: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  #{invoice.invoiceNumber || invoice.publicId || invoiceId}
                </div>
                <div style={{ fontSize: 13 }}>
                  {invoice.store?.name || "Store"}
                </div>
              </div>
            </div>
          </div>

          <div className="modern-header-right">
            <div className="invoice-detail">
              Invoice #:{" "}
              <span>
                {invoice.invoiceNumber || invoice.publicId || invoiceId}
              </span>
            </div>
            <div className="invoice-detail">
              Date:{" "}
              <span>{formatDate(invoice.createdAt || invoice.releasedAt)}</span>
            </div>
            <div className="invoice-detail">
              Released:{" "}
              <span>
                {invoice.releasedAt ? formatDate(invoice.releasedAt) : "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="badges-row">
          <span className="badge" style={{ ...parseStyle(invoiceBadge.style) }}>
            <invoiceBadge.Icon style={{ width: 16, height: 16 }} />
            {invoiceBadge.text}
          </span>
          <span className="badge" style={{ ...parseStyle(paymentBadge.style) }}>
            <paymentBadge.Icon style={{ width: 16, height: 16 }} />
            {paymentBadge.text}
          </span>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>
              <Building2 style={{ width: 14, height: 14, marginRight: 8 }} />{" "}
              Store Information
            </h3>
            <p style={{ fontWeight: 700 }}>{invoice.store?.name || "N/A"}</p>
            <p>{formatAddress(invoice.store?.address)}</p>
            <p>Phone: {invoice.store?.phone || "N/A"}</p>
            <p>Email: {invoice.store?.email || "N/A"}</p>
            {invoice.store?.gstNumber && <p>GST: {invoice.store.gstNumber}</p>}
          </div>

          <div className="info-card">
            <h3>
              <User style={{ width: 14, height: 14, marginRight: 8 }} />{" "}
              Customer Information
            </h3>
            <p style={{ fontWeight: 700 }}>
              {invoice.customer?.name || "Walk-in Customer"}
            </p>
            {invoice.customer?.address && <p>{invoice.customer.address}</p>}
            <p>Phone: {invoice.customer?.phone || "N/A"}</p>
            <p>Email: {invoice.customer?.email || "N/A"}</p>
            {invoice.releasedAt && (
              <p>Released: {formatDate(invoice.releasedAt)}</p>
            )}
          </div>
        </div>

        <div className="amounts-grid">
          <div className="amount-card">
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Subtotal
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
              {formatCurrency(invoice.subtotal)}
            </div>
          </div>
          <div className="amount-card">
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              GST
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
              {formatCurrency(invoice.gstAmount)}
            </div>
          </div>
          <div className="amount-card">
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Total Amount
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginTop: 8,
                color: accentColor,
              }}
            >
              {formatCurrency(invoice.totalAmount)}
            </div>
          </div>
          <div className="amount-card">
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Paid / Due
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                Paid: {formatCurrency(invoice.paidAmount)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                Due: {formatCurrency(invoice.dueAmount)}
              </div>
            </div>
          </div>
        </div>

        <div className="items-table-wrap">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>GST</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {item.name || item.product?.name || "Item"}
                      </div>
                      {item.barcode && (
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          Barcode: {item.barcode}
                        </div>
                      )}
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
                  <td
                    colSpan={6}
                    style={{
                      padding: 20,
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    No items available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="totals">
          <div className="box">
            <div className="total-row">
              <div className="label">Subtotal</div>
              <div>{formatCurrency(invoice.subtotal)}</div>
            </div>
            <div className="total-row">
              <div className="label">GST</div>
              <div>{formatCurrency(invoice.gstAmount)}</div>
            </div>
            {invoice.totalDiscount > 0 && (
              <div className="total-row">
                <div className="label">Discount</div>
                <div style={{ color: "#e11d48" }}>
                  - {formatCurrency(invoice.totalDiscount)}
                </div>
              </div>
            )}
            <div className="total-row final">
              <div className="label">Grand Total</div>
              <div>{formatCurrency(invoice.totalAmount)}</div>
            </div>
          </div>
        </div>

        <div className="modern-footer">
          <div className="terms">
            <h4 style={{ margin: 0, color: accentColor }}>
              Payment Terms & Notes
            </h4>
            <p style={{ marginTop: 8 }}>
              Payment due within 7 days of invoice date. Thank you for choosing
              our services.
            </p>
            <p style={{ marginTop: 8, color: "#6b7280" }}>
              Generated on{" "}
              {moment(invoice.createdAt).format("MMMM DD, YYYY [at] HH:mm")}
            </p>
          </div>
          <div className="signature">Authorized Signature</div>
        </div>
      </div>
      <div className="modern-invoice">
        <div style={{ marginTop: 24, textAlign: "right" }} className="no-print">
          <button className="print-btn" onClick={handleDownload}>
            <Download style={{ width: 16, height: 16 }} />
            Print / Download
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
};

// Helper to convert inline style string to object used above badges
function parseStyle(styleStr = "") {
  // styleStr like "background:...; color:...; border:..."
  const obj = {};
  styleStr.split(";").forEach((s) => {
    const [k, v] = s.split(":") || [];
    if (!k || !v) return;
    const key = k.trim().replace(/-([a-z])/g, (_m, p1) => p1.toUpperCase());
    obj[key] = v.trim();
  });
  return obj;
}

export default ViewInvoiceStructured;
