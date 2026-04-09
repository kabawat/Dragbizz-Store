"use client";
import { useEffect, useState, useRef } from "react";
import { FileDown, ChevronDown, FileText, FileSpreadsheet, FileJson } from "lucide-react";
import * as XLSX from "xlsx";
import Button from "./Button";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import publicTemplateService from "@/service/public/template.service";
import useApiResponse from "@/hooks/useApiResponse";

const BulkTemplateDownloadButton = ({ module, fileName, sheetName, className = "" }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const { execute, loading, data } = useApiResponse();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const menuRef = useRef(null);

  const formats = [
    { id: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet, color: "text-green-600" },
    { id: "csv", label: "CSV (.csv)", icon: FileText, color: "text-blue-600" },
    { id: "json", label: "JSON (.json)", icon: FileJson, color: "text-amber-600" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!data || !selectedFormat) return;

    const fields = data?.fields ?? data?.[module]?.fields;

    if (!fields || !Array.isArray(fields)) {
      showError(t("bulkUpload.templateFetchError", "Failed to fetch template fields."));
      setSelectedFormat(null);
      return;
    }

    const headers = fields.map((f) => f.name);
    const exampleRow = fields.map((f) => f.example ?? "");
    const baseFileName = fileName?.split('.')[0] ?? `${module}_bulk_upload_template`;

    try {
      if (selectedFormat === "xlsx") {
        const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName ?? module);
        XLSX.writeFile(wb, `${baseFileName}.xlsx`);
      }
      else if (selectedFormat === "csv") {
        const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${baseFileName}.csv`;
        link.click();
      }
      else if (selectedFormat === "json") {
        const jsonData = headers.reduce((acc, header, idx) => {
          acc[header] = exampleRow[idx];
          return acc;
        }, {});
        const blob = new Blob([JSON.stringify([jsonData], null, 2)], { type: 'application/json' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${baseFileName}.json`;
        link.click();
      }

      showSuccess(t("bulkUpload.templateDownloaded", `${selectedFormat.toUpperCase()} Template downloaded successfully!`));
    } catch (err) {
      showError(t("bulkUpload.downloadError", "Error generating file."));
    } finally {
      setSelectedFormat(null);
      setIsOpen(false);
    }
  }, [data, selectedFormat]);

  const handleDownload = (format) => {
    setSelectedFormat(format);
    execute(publicTemplateService.getTemplate(module), { showToast: false });
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 pr-2"
      >
        <FileDown className="w-4 h-4" />
        <span>{loading ? t("common.loading", "Loading...") : t("customers.downloadSample", "Download Sample File")}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl shadow-xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="py-1.5">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleDownload(format.id)}
                className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors group cursor-pointer"
              >
                <format.icon className={`w-4 h-4 ${format.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{format.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkTemplateDownloadButton;
