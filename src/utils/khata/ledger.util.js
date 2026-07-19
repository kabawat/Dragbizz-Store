export const KHATA_PAYMENT_MODES = [
  { value: "CASH", labelKey: "khata.cash" },
  { value: "UPI", labelKey: "khata.upi" },
  { value: "BANK_TRANSFER", labelKey: "khata.bankTransfer" },
];

/** Frontend-only quick labels for notes auto-fill (not sent as a separate API field). */
export const KHATA_NOTE_PRESETS = [
  { id: "creditSale", labelKey: "khata.notePresetCreditSale", noteKey: "khata.noteDetailCreditSale" },
  { id: "paymentReceived", labelKey: "khata.notePresetPaymentReceived", noteKey: "khata.noteDetailPaymentReceived" },
  { id: "advance", labelKey: "khata.notePresetAdvance", noteKey: "khata.noteDetailAdvance" },
  { id: "openingBalance", labelKey: "khata.notePresetOpeningBalance", noteKey: "khata.noteDetailOpeningBalance" },
  { id: "settlement", labelKey: "khata.notePresetSettlement", noteKey: "khata.noteDetailSettlement" },
  { id: "adjustment", labelKey: "khata.notePresetAdjustment", noteKey: "khata.noteDetailAdjustment" },
];

export function toLedgerEntry(item, kind) {
  if (kind === "transaction") {
    const isDebit = item.type === "DEBIT" || item.type === "CREDIT";
    return {
      id: item.id ?? item.localId ?? item._id,
      kind: "transaction",
      date: item.transactionDate ?? item.createdAt,
      label: isDebit ? "youGave" : "youGot",
      amount: Number(item.amount) || 0,
      paymentMode: item.paymentMode,
      notes: item.notes,
      runningBalance: item.runningBalance,
      reference: item.transactionNumber ?? item.reference,
      syncStatus: item.syncStatus ?? null,
    };
  }

  return {
    id: item.id ?? item.localId ?? item._id,
    kind: "payment",
    date: item.paymentDate ?? item.createdAt,
    label: "youGot",
    amount: Number(item.totalAmount) || 0,
    paymentMode: item.paymentMethod,
    notes: item.notes,
    runningBalance: item.runningBalance ?? null,
    reference: item.paymentNumber,
    syncStatus: item.syncStatus ?? null,
  };
}

export function mergeLedgerEntries(transactions = [], payments = []) {
  const paymentRefs = new Set(
    transactions
      .filter((tx) => tx.type === "PAYMENT" && tx.reference)
      .map((tx) => tx.reference),
  );

  const pendingPayments = payments.filter(
    (payment) =>
      payment.syncStatus === "pending" || !paymentRefs.has(payment.paymentNumber),
  );

  const entries = [
    ...transactions.map((item) => toLedgerEntry(item, "transaction")),
    ...pendingPayments.map((item) => toLedgerEntry(item, "payment")),
  ];

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
