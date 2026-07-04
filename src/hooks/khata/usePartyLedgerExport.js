"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { customerAccountService } from "@/service";
import { useGlobalToast } from "@/contexts/ToastContext";
import { exportToCSV } from "@/utils/exportUtils";
import { ledgerExportToCsvRows } from "@/utils/khata/partyLedgerExport.utils";

const REPORT_ID = "party-ledger-report";

function unwrapExportData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

export function usePartyLedgerExport({ storeId, customerId, selectedStore }) {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const [exportData, setExportData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchExportData = useCallback(
    async ({ startDate, endDate }) => {
      if (!storeId || !customerId) {
        throw new Error(t("khata.noCustomer"));
      }
      const response = await customerAccountService.exportLedger(
        customerId,
        { startDate, endDate },
        storeId,
      );
      const data = unwrapExportData(response);
      if (!data) {
        throw new Error(t("khata.exportFailed"));
      }
      return data;
    },
    [storeId, customerId, t],
  );

  const downloadPdf = useCallback(
    async (data) => {
      setExportData(data);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const report = document.getElementById(REPORT_ID);
      if (!report) {
        showError(t("khata.exportFailed"));
        return;
      }

      try {
        const { default: html2canvas } = await import("html2canvas");
        const { default: jsPDF } = await import("jspdf");

        const canvas = await html2canvas(report, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.85);
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }

        const safeName = (data?.party?.name || "party").replace(/\s+/g, "-").toLowerCase();
        pdf.save(`${safeName}-ledger-${new Date().toISOString().split("T")[0]}.pdf`);
        showSuccess(t("khata.exportPdfSuccess"));
      } catch {
        showError(t("khata.exportFailed"));
      }
    },
    [showError, showSuccess, t],
  );

  const downloadCsv = useCallback(
    (data) => {
      const rows = ledgerExportToCsvRows(data, t);
      exportToCSV(rows, `${data?.party?.name || "party"}-ledger`, (msg) => showError(msg));
      showSuccess(t("khata.exportCsvSuccess"));
    },
    [showError, showSuccess, t],
  );

  const runExport = useCallback(
    async ({ startDate, endDate, format }) => {
      setIsExporting(true);
      try {
        const data = await fetchExportData({ startDate, endDate });
        if (format === "pdf") {
          await downloadPdf(data);
        } else {
          downloadCsv(data);
        }
        return data;
      } catch (error) {
        showError(error?.message || t("khata.exportFailed"));
        return null;
      } finally {
        setIsExporting(false);
      }
    },
    [downloadCsv, downloadPdf, fetchExportData, showError, t],
  );

  return {
    exportData,
    isExporting,
    runExport,
    selectedStore,
  };
}

export default usePartyLedgerExport;
