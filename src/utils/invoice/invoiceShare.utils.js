function getPublicWebOrigin() {
  const configured = process.env.NEXT_PUBLIC_PUBLIC_WEB_URL;
  if (typeof configured === "string" && configured.trim()) {
    return configured.replace(/\/$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window.location?.origin &&
    !/localhost|127\.0\.0\.1/.test(window.location.origin)
  ) {
    return window.location.origin;
  }
  return "https://dragbizz.io";
}

export function buildInvoiceShareUrl(invoice) {
  const publicId = invoice?.publicId;
  if (!publicId) return null;
  return `${getPublicWebOrigin()}/view/invoice/${publicId}`;
}

export function buildInvoiceWhatsAppMessage(invoice, shareUrl, t) {
  const invoiceNumber =
    invoice?.invoiceNumber || invoice?.invoice_number || t?.("common.notAvailable") || "N/A";
  const customerName = invoice?.customer?.name || t?.("invoice.customer") || "Customer";
  const totalAmount = invoice?.totalAmount || invoice?.total_amount || 0;
  const storeName = invoice?.store?.name || "DragBizz Store";
  const storePhone = invoice?.store?.phone || "N/A";

  let message =
    t?.("invoice.whatsappShareMessage", { invoiceNumber, customerName, totalAmount }) ||
    `Invoice ${invoiceNumber} for ${customerName} — Total: ₹${totalAmount}`;

  if (shareUrl) {
    message += `\n\nLink: ${shareUrl}`;
  }

  message += `\n\n${storeName} | ${storePhone}\nSent using DragBizz (dragbizz.io)`;
  return message;
}

export function openWhatsAppShare(invoice, shareUrl, t) {
  const message = buildInvoiceWhatsAppMessage(invoice, shareUrl, t);
  const customerPhone = invoice?.customer?.phone;

  if (customerPhone) {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    const whatsappPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`, "_blank");
    return;
  }

  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
}

export function openInvoiceEmailShare(invoice, shareUrl) {
  const invoiceNumber = invoice?.invoiceNumber || "Invoice";
  const customerName = invoice?.customer?.name || "Customer";
  const totalAmount = invoice?.totalAmount || 0;
  const customerEmail = invoice?.customer?.email || "";

  const subject = encodeURIComponent(`Invoice ${invoiceNumber}`);
  const bodyLines = [
    `Hello ${customerName},`,
    "",
    `Please find your invoice ${invoiceNumber} (Total: ₹${totalAmount}).`,
  ];
  if (shareUrl) {
    bodyLines.push("", `View invoice: ${shareUrl}`);
  }
  bodyLines.push("", "Thank you for your business.");

  const body = encodeURIComponent(bodyLines.join("\n"));
  const mailto = customerEmail
    ? `mailto:${encodeURIComponent(customerEmail)}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;

  window.open(mailto, "_blank");
}

export async function copyInvoiceShareLink(shareUrl) {
  if (!shareUrl) return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    }
  } catch {
    // fallback below
  }

  const textarea = document.createElement("textarea");
  textarea.value = shareUrl;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}
