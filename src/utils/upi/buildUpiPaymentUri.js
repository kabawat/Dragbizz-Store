export function sanitizePayeeName(name) {
  return (name || "Merchant").replace(/[^a-zA-Z0-9\s.-]/g, "").trim() || "Merchant";
}

export function formatUpiAmount(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num.toFixed(2);
}

export function buildUpiPaymentUri(upiId, payeeName, options = {}) {
  const params = new URLSearchParams();
  params.set("pa", upiId.trim().toLowerCase());
  params.set("pn", sanitizePayeeName(payeeName));
  params.set("cu", "INR");

  const formattedAmount = options.amount != null ? formatUpiAmount(options.amount) : null;
  if (formattedAmount) {
    params.set("am", formattedAmount);
  }

  if (options.transactionNote) {
    const note = String(options.transactionNote).trim().slice(0, 80);
    if (note) params.set("tn", note);
  }

  return `upi://pay?${params.toString()}`;
}
