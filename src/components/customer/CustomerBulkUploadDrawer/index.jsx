import { BulkTemplateDownloadButton } from "@/components/ui";
("use client");
import { CustomerBulkUploadDrawerIndexPresentation } from "@dragorbit/features/customers";

import {
  AlertCircle,
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { customerService } from "@/service/retailer/customer.service";
import useApiResponse from "@/hooks/useApiResponse";
import { useAppSelector } from "@/store/hooks";

const CustomerBulkUploadDrawer = ({ isOpen, onClose, onSuccess }) => {
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
      showError(
        t(
          "customers.invalidFileType",
          "Please upload a valid CSV, XLSX, or JSON file.",
        ),
      );
      return false;
    }

    // Check size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError(
        t("customers.fileTooLarge", "File size should be less than 5MB."),
      );
      return false;
    }

    return true;
  };

  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0]; // only accept one file for bulk upload at a time
      if (validateFile(file)) {
        setSelectedFile(file);
        setUploadResult(null); // Reset result when new file is selected
        clearAll(); // Clear any previous API statuses
      }
    },
    [clearAll],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e) => {
      handleFiles(e.target.files);
    },
    [handleFiles],
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      showError(
        t("customers.pleaseSelectFile", "Please select a file to upload."),
      );
      return;
    }

    const storeId = selectedStore?.storeId;

    // Using execute with showToast: false because we want to run custom toast and success logic based on 'summary'
    const result = await execute(
      customerService.bulkUploadCustomers(selectedFile, storeId),
      { showToast: false },
    );

    if (result?.success && result?.data && result.data.summary) {
      setUploadResult({ data: result.data });

      if (result.data.summary.failed === 0) {
        showSuccess(
          t(
            "customers.bulkUploadSuccess",
            "Bulk upload completed successfully",
          ),
        );
      } else {
        showSuccess(
          t("customers.partialSuccess", "Bulk upload partially successful"),
        );
      }
      onSuccess?.();
    } else {
      // showError(result?.message || t("customers.uploadError", "Failed to upload customers"));
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".csv"))
      return <FileText className="w-8 h-8 text-blue-500" />;
    if (fileName.endsWith(".xlsx"))
      return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    if (fileName.endsWith(".json"))
      return <FileJson className="w-8 h-8 text-yellow-500" />;
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        {/* Summary Card */}
        <div className="rounded-xl overflow-hidden border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
          {/* Header */}
          <div className="p-4 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] flex items-center justify-between">
            <h4 className="font-semibold text-[rgb(var(--color-text-primary))] flex items-center gap-2">
              {allSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              {t("customers.uploadResults", "Upload Results")}
            </h4>
            <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] px-2.5 py-1 rounded-full bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
              {t("customers.totalRows", "Total Rows")}: {summary.total}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 divide-x divide-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col items-center justify-center py-5 gap-1">
              <span className="text-2xl font-bold text-green-500">
                {summary.created}
              </span>
              <span className="text-[0.6875rem] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                {t("customers.createdCount", "Created")}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-5 gap-1">
              <span className="text-2xl font-bold text-amber-500">
                {summary.skipped}
              </span>
              <span className="text-[0.6875rem] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                {t("customers.skippedCount", "Skipped")}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-5 gap-1">
              <span className="text-2xl font-bold text-red-500">
                {summary.failed}
              </span>
              <span className="text-[0.6875rem] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                {t("customers.failedCount", "Failed")}
              </span>
            </div>
          </div>
        </div>

        {/* Errors Section */}
        {errors && errors.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
            {/* Errors toggle header */}
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
              {showErrors ? (
                <ChevronUp className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
              )}
            </button>

            {showErrors && (
              <div className="max-h-[280px] overflow-y-auto divide-y divide-[rgb(var(--color-border-primary))] custom-scrollbar">
                {errors.map((error, idx) => (
                  <div
                    key={idx}
                    className="p-4 space-y-2.5 bg-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
                  >
                    {/* Row label + reason */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-[0.625rem] font-bold text-red-500 uppercase tracking-wider bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5 mb-1.5">
                          {t(
                            "customers.rowNumber",
                            { row: error.row },
                            `Row ${error.row}`,
                          )}
                        </span>
                        <p className="text-sm text-[rgb(var(--color-text-primary))] leading-snug">
                          {error.reason}
                        </p>
                      </div>
                    </div>

                    {/* Row data preview */}
                    {error.data && Object.keys(error.data).length > 0 && (
                      <div className="rounded-lg bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] p-2.5">
                        <p className="text-[0.625rem] font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-1.5">
                          {t("customers.rowData", "Data")}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                          {Object.entries(error.data).map(([key, val]) => (
                            <div
                              key={key}
                              className="flex gap-1.5 text-[0.6875rem] font-mono"
                            >
                              <span className="text-[rgb(var(--color-text-tertiary))] shrink-0">
                                {key}:
                              </span>
                              <span className="text-[rgb(var(--color-text-secondary))] truncate">
                                {val || "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <CustomerBulkUploadDrawerIndexPresentation
      model={{
        BulkTemplateDownloadButton,
        isOpen,
        handleClose,
        t,
        uploadResult,
        selectedFile,
        isDragOver,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        openFileDialog,
        fileInputRef,
        accept,
        handleFileInputChange,
        getFileIcon,
        formatFileSize,
        removeFile,
        renderResults,
        handleUpload,
        isUploading,
        resetUpload,
      }}
    />
  );
};

export default CustomerBulkUploadDrawer;
