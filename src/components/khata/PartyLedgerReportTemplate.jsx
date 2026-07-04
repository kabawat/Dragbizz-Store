"use client";

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "₹0.00";
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PartyLedgerReportTemplate({ exportData, selectedStore, t }) {
  const party = exportData?.party ?? {};
  const period = exportData?.period ?? {};
  const entries = exportData?.entries ?? [];

  return (
    <div id="party-ledger-report" className="bg-white text-gray-900 p-6 w-[800px]">
      <div className="flex justify-between border-b border-gray-200 pb-4 mb-4">
        <div>
          <div className="text-lg font-bold">{selectedStore?.storeName || "Store"}</div>
          <p className="text-sm text-gray-600">{selectedStore?.address || ""}</p>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-bold">{t("khata.exportStatementTitle")}</h1>
          <p className="text-sm text-gray-600">
            {formatDate(period.startDate)} — {formatDate(period.endDate)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold">{party.name}</p>
        {party.phone ? <p className="text-sm text-gray-600">{party.phone}</p> : null}
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t("khata.openingBalance")}: </span>
            <span className="font-semibold">{formatCurrency(exportData?.openingBalance)}</span>
          </div>
          <div>
            <span className="text-gray-500">{t("khata.closingBalance")}: </span>
            <span className="font-semibold">{formatCurrency(exportData?.closingBalance)}</span>
          </div>
        </div>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2 border border-gray-200">{t("khata.colDate")}</th>
            <th className="px-3 py-2 border border-gray-200">{t("khata.colDescription")}</th>
            <th className="px-3 py-2 border border-gray-200 text-right">{t("khata.colDebit")}</th>
            <th className="px-3 py-2 border border-gray-200 text-right">{t("khata.colCredit")}</th>
            <th className="px-3 py-2 border border-gray-200 text-right">{t("khata.balance")}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-3 py-2 border border-gray-200">{formatDate(entry.date)}</td>
              <td className="px-3 py-2 border border-gray-200">
                {[entry.reference, entry.notes].filter(Boolean).join(" · ") || entry.type}
              </td>
              <td className="px-3 py-2 border border-gray-200 text-right">
                {entry.debit ? formatCurrency(entry.debit) : "—"}
              </td>
              <td className="px-3 py-2 border border-gray-200 text-right">
                {entry.credit ? formatCurrency(entry.credit) : "—"}
              </td>
              <td className="px-3 py-2 border border-gray-200 text-right">
                {entry.balance != null ? formatCurrency(entry.balance) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PartyLedgerReportTemplate;
