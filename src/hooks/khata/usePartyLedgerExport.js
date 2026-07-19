"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { customerAccountService } from "@/service";
import { useGlobalToast } from "@/contexts/ToastContext";
import { exportToCSV, exportToXLSX } from "@/utils/exportUtils";
import { ledgerExportToCsvRows } from "@/utils/khata/partyLedgerExport.utils";

function unwrapExportData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

function buildExportFilename(partyName) {
  const safeName = (partyName || "party").replace(/\s+/g, "-").toLowerCase();
  return `${safeName}-ledger`;
}

export function usePartyLedgerExport({ storeId, customerId }) {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const [isExporting, setIsExporting] = useState(false);

  const fetchExportData = useCallback(
    async ({ startDate, endDate } = {}) => {
      if (!storeId || !customerId) {
        throw new Error(t("khata.noCustomer"));
      }
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await customerAccountService.exportLedger(
        customerId,
        params,
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

  const downloadCsv = useCallback(
    (data) => {
      const rows = ledgerExportToCsvRows(data, t);
      const filename = buildExportFilename(data?.party?.name);
      exportToCSV(rows, filename, (msg) => showError(msg));
      showSuccess(t("khata.exportCsvSuccess"));
    },
    [showError, showSuccess, t],
  );

  const downloadXlsx = useCallback(
    async (data) => {
      const rows = ledgerExportToCsvRows(data, t);
      const filename = buildExportFilename(data?.party?.name);
      await exportToXLSX(rows, filename, {
        sheetName: t("khata.partyLedger"),
        onError: () => showError(t("khata.exportFailed")),
      });
      showSuccess(t("khata.exportXlsxSuccess"));
    },
    [showError, showSuccess, t],
  );

  const runExport = useCallback(
    async ({ startDate, endDate, format }) => {
      setIsExporting(true);
      try {
        const data = await fetchExportData({ startDate, endDate });
        if (format === "xlsx") {
          await downloadXlsx(data);
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
    [downloadCsv, downloadXlsx, fetchExportData, showError, t],
  );

  return {
    isExporting,
    runExport,
  };
}

export default usePartyLedgerExport;
