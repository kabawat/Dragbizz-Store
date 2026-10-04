"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { customerAccountService } from "@/service";
import { exportToCSV, exportToXLSX } from "@/utils/exportUtils";
import { ledgerExportToCsvRows } from "@/utils/khata/partyLedgerExport.utils";

const FORMAT_LABEL = {
  csv: "CSV",
  xlsx: "XLSX",
  json: "JSON",
};

function collectDownloads(toolResults) {
  const seen = new Set();
  const rows = [];
  for (const tool of toolResults || []) {
    if (tool?.success === false) continue;
    const list = tool?.data?.downloads;
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const customerId = item?.customerId;
      if (!customerId || seen.has(customerId)) continue;
      const formats = Array.isArray(item.formats)
        ? item.formats.filter((format) => format in FORMAT_LABEL)
        : ["csv", "xlsx", "json"];
      if (formats.length === 0) continue;
      seen.add(customerId);
      rows.push({
        customerId,
        name: item.name || "customer",
        formats,
      });
    }
  }
  return rows;
}

function unwrapExportData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

function saveJsonFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `${filename}_${stamp}.json`;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function fileStem(partyName) {
  return (partyName || "customer").replace(/\s+/g, "-").toLowerCase();
}

export default function KhataDownloadButtons({ toolResults, storeId }) {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const [busyKey, setBusyKey] = useState("");
  const downloads = collectDownloads(toolResults);

  if (!storeId || downloads.length === 0) return null;

  const download = async (row, format) => {
    const key = `${row.customerId}:${format}`;
    setBusyKey(key);
    try {
      const response = await customerAccountService.exportLedger(
        row.customerId,
        {},
        storeId,
      );
      const data = unwrapExportData(response);
      if (!data) {
        showError(t("voice.downloadFailed"));
        return;
      }
      const stem = `${fileStem(data?.party?.name || row.name)}-ledger`;
      if (format === "json") {
        saveJsonFile(data, stem);
      } else if (format === "xlsx") {
        await exportToXLSX(ledgerExportToCsvRows(data, t), stem, {
          sheetName: t("khata.partyLedger"),
          onError: () => showError(t("voice.downloadFailed")),
        });
      } else {
        exportToCSV(ledgerExportToCsvRows(data, t), stem, (message) =>
          showError(message || t("voice.downloadFailed")),
        );
      }
      showSuccess(t("voice.downloadReady"));
    } catch (error) {
      showError(error?.message || t("voice.downloadFailed"));
    } finally {
      setBusyKey("");
    }
  };

  return (
    <div className="mt-3 space-y-2 border-t border-[rgb(var(--color-border-primary))]/50 pt-3">
      {downloads.map((row) => (
        <div key={row.customerId}>
          <p className="text-[12px] leading-4 text-[rgb(var(--color-text-secondary))]">
            {t("voice.downloadKhata")}
            {": "}
            <span className="font-medium text-[rgb(var(--color-text-primary))]">
              {row.name}
            </span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {row.formats.map((format) => (
              <button
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[rgb(var(--color-border-primary))] px-2.5 py-1.5 text-[12px] font-medium text-[rgb(var(--color-text-primary))] transition-colors hover:bg-[rgb(var(--color-bg-primary))] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busyKey !== ""}
                key={format}
                onClick={() => download(row, format)}
                type="button"
              >
                <Download className="h-3.5 w-3.5" />
                {FORMAT_LABEL[format]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
