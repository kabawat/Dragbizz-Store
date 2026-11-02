"use client";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button, BulkTemplateDownloadButton, SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { customerAccountService } from "@/service/retailer/customerAccount.service";
import useApiResponse from "@/hooks/useApiResponse";
import { useAppSelector } from "@/store/hooks";

function downloadErrorsCsv(errors) {
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = "row,phone,name,openingDue,reason";
  const lines = errors.map((error) => [
    error.row,
    error.data?.phone,
    error.data?.name,
    error.data?.openingDue,
    error.reason,
  ].map(escape).join(","));
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "opening_balance_import_errors.csv";
  link.click();
  URL.revokeObjectURL(url);
}

const OpeningBalanceImportDrawer = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [showErrors, setShowErrors] = useState(true);
  const fileInputRef = useRef(null);

  const { execute, loading: isUploading, clearAll } = useApiResponse();

  const accept = ".csv, .xlsx, .json";
  const validExtensions = ["csv", "xlsx", "json"];

  const validateFile = (file) => {
    if (!file) return false;
    const extension = file.name.split(".").pop().toLowerCase();
    if (!validExtensions.includes(extension)) {
      showError(t("customers.invalidFileType", "Please upload a valid CSV, XLSX, or JSON file."));
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError(t("customers.fileTooLarge", "File size should be less than 5MB."));
      return false;
    }
    return true;
  };

  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setUploadResult(null);
        clearAll();
      }
    },
    [clearAll, showError, t],
  );

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      showError(t("customers.pleaseSelectFile", "Please select a file to upload."));
      return;
    }

    const storeId = selectedStore?.storeId;
    const result = await execute(
      customerAccountService.importOpeningBalance(selectedFile, storeId),
      { showToast: false },
    );

    if (result?.success && result?.data?.summary) {
      setUploadResult({ data: result.data });
      if (result.data.summary.failed === 0) {
        showSuccess(t("customers.openingBalanceImportSuccess", "Opening balance import completed"));
      } else {
        showSuccess(t("customers.openingBalancePartialSuccess", "Import partially successful"));
      }
      onSuccess?.();
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".csv")) return <FileText className="w-8 h-8 text-blue-500" />;
    if (fileName.endsWith(".xlsx")) return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    if (fileName.endsWith(".json")) return <FileJson className="w-8 h-8 text-yellow-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetUpload();
    onClose();
  };

  const renderResults = () => {
    if (!uploadResult) return null;
    const { summary, errors } = uploadResult.data;
    const allSuccess = summary.failed === 0;

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="rounded-xl overflow-hidden border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
          <div className="p-4 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] flex items-center justify-between">
            <h4 className="font-semibold text-[rgb(var(--color-text-primary))] flex items-center gap-2">
              {allSuccess ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
              {t("customers.openingBalanceResults", "Import Results")}
            </h4>
            <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] px-2.5 py-1 rounded-full bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
              {t("customers.totalRows", "Total Rows")}: {summary.total}
            </span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col items-center justify-center py-5 gap-1">
              <span className="text-2xl font-bold text-green-500">{summary.imported}</span>
              <span className="text-[0.6875rem] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                {t("customers.importedCount", "Imported")}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-5 gap-1">
              <span className="text-2xl font-bold text-amber-500">{summary.skipped}</span>
              <span className="text-[0.6875rem] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                {t("customers.skippedCount", "Skipped")}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-5 gap-1">
              <span className="text-2xl font-bold text-red-500">{summary.failed}</span>
              <span className="text-[0.6875rem] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                {t("customers.failedCount", "Failed")}
              </span>
            </div>
          </div>
        </div>

        {errors && errors.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
            <button
              onClick={() => setShowErrors(!showErrors)}
              className="flex items-center justify-between w-full p-4 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-secondary)/0.8)] transition-colors text-left"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                <AlertCircle className="w-4 h-4 text-red-500" />
                {t("customers.errorsFound", "Errors Found")}
                <span className="ml-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                  {errors.length}
                </span>
              </span>
              {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showErrors && (
              <div className="max-h-[280px] overflow-y-auto divide-y divide-[rgb(var(--color-border-primary))]">
                {errors.map((error, idx) => (
                  <div key={idx} className="p-4 space-y-2">
                    <span className="text-[0.625rem] font-bold text-red-500 uppercase">{t("customers.rowNumber", { row: error.row })}</span>
                    <p className="text-sm">{error.reason}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="p-4 border-t border-[rgb(var(--color-border-primary))]">
              <Button variant="secondary" onClick={() => downloadErrorsCsv(errors)} leftIcon={Download}>
                {t("customers.downloadErrorsCsv", "Download errors CSV")}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={t("customers.openingBalanceImportTitle", "Import Opening Balance")}
      icon={Upload}
      description={t("customers.openingBalanceImportDesc", "Upload udhari for existing customers. Customers are matched by phone number.")}
      width="w-full md:w-[600px] lg:w-[600px]"
    >
      <div className="p-4 sm:p-6 h-full flex flex-col">
        <div className="space-y-6 flex-1 overflow-y-auto">
          {!uploadResult ? (
            <>
              <div className="bg-[rgb(var(--color-primary)/0.1)] rounded-lg border border-[rgb(var(--color-primary)/0.2)] p-4">
                <h4 className="text-sm font-medium mb-2">{t("customers.instructions", "Instructions")}</h4>
                <ul className="list-disc pl-5 text-sm text-[rgb(var(--color-text-secondary))] space-y-1 mb-4">
                  <li>{t("customers.openingBalanceInstruction1", "Customers must already exist — matched by phone.")}</li>
                  <li>{t("customers.openingBalanceInstruction2", "Required columns: phone, openingDue.")}</li>
                  <li>{t("customers.instruction2", "Maximum allowed file size is 5MB.")}</li>
                </ul>
                <BulkTemplateDownloadButton
                  module="opening_balance"
                  fileName="opening_balance_import_template.xlsx"
                  sheetName="OpeningBalance"
                />
              </div>
              {!selectedFile ? (
                <div
                  className={`relative border-2 border-dashed rounded-lg cursor-pointer ${isDragOver ? "border-[rgb(var(--color-primary))]" : "border-[rgb(var(--color-border-primary))]"}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={openFileDialog}
                >
                  <div className="p-8 text-center">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-[rgb(var(--color-text-tertiary))]" />
                    <p className="text-sm font-medium">{t("customers.dropZoneLabel", "Click to upload or drag and drop")}</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileInputChange} className="hidden" />
                </div>
              ) : (
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeFile} className="p-2 hover:text-red-500"><X className="w-5 h-5" /></button>
                </div>
              )}
            </>
          ) : (
            renderResults()
          )}
        </div>
        <div className="border-t pt-4 mt-6 flex gap-3">
          {!uploadResult ? (
            <>
              <Button variant="primary" onClick={handleUpload} disabled={!selectedFile || isUploading} loading={isUploading}>
                {isUploading ? t("customers.uploading", "Uploading...") : t("customers.importOpeningBalance", "Import")}
              </Button>
              <Button variant="secondary" onClick={handleClose} disabled={isUploading}>{t("common.cancel", "Cancel")}</Button>
            </>
          ) : (
            <>
              <Button variant="primary" onClick={handleClose}>{t("customers.done", "Done")}</Button>
              <Button variant="secondary" onClick={resetUpload}>{t("customers.uploadAnother", "Upload Another")}</Button>
            </>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default OpeningBalanceImportDrawer;
