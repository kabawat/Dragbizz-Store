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

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle file generation and download
  useEffect(() => {
    if (!data || !selectedFormat) return;

    // Support both direct fields and nested module fields
    const fields = data?.fields || data?.[module]?.fields;

    if (!fields || !Array.isArray(fields)) {
      showError(t("bulkUpload.templateFetchError", "Failed to resolve template structure."));
      setSelectedFormat(null);
      return;
    }

    const headers = fields.map((f) => f.name);
    const exampleRow = fields.map((f) => f.example ?? "");
    const baseFileName = fileName?.split(".")[0] || `${module}_template`;

    let objectUrl = null;

    try {
      if (selectedFormat === "xlsx") {
        const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName || module);
        XLSX.writeFile(wb, `${baseFileName}.xlsx`);
      } else {
        let blob;
        if (selectedFormat === "csv") {
          const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
          const csv = XLSX.utils.sheet_to_csv(ws);
          blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        } else if (selectedFormat === "json") {
          const jsonData = headers.reduce((acc, header, idx) => {
            acc[header] = exampleRow[idx];
            return acc;
          }, {});
          blob = new Blob([JSON.stringify([jsonData], null, 2)], { type: "application/json" });
        }

        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = objectUrl;
          link.download = `${baseFileName}.${selectedFormat}`;
          link.click();
        }
      }

      showSuccess(t("bulkUpload.templateDownloaded", { format: selectedFormat.toUpperCase() }, "Template downloaded successfully!"));
    } catch (err) {
      console.error("Template Download Error:", err);
      showError(t("bulkUpload.downloadError", "Error generating template file."));
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setSelectedFormat(null);
      setIsOpen(false);
    }
  }, [data, selectedFormat, module, fileName, sheetName, showError, showSuccess, t]);

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
        isLoading={loading}
        className="flex items-center gap-2 pr-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FileDown className="w-4 h-4" />
        <span>{t("common.downloadSample", "Download Sample")}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-2 w-52 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl shadow-xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200"
          role="menu"
        >
          <div className="py-1.5">
            {formats.map((format) => (
              <button
                key={format.id}
                role="menuitem"
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
