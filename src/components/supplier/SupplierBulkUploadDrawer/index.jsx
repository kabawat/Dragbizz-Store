"use client";
import { AlertCircle, CheckCircle2, FileDown, FileJson, FileSpreadsheet, FileText, Upload, X, ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button, SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { supplierService } from "@/service/retailer/supplier.service";
import useApiResponse from "@/hooks/useApiResponse";
import { useAppSelector } from "@/store/hooks";

const SupplierBulkUploadDrawer = ({ isOpen, onClose, onSuccess }) => {
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
  // Convert standard extensions to actual mime types for validation if needed, or just check extensions
  const validExtensions = ["csv", "xlsx", "json"];

  const validateFile = (file) => {
    if (!file) return false;

    // Check extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(extension)) {
      showError(t("suppliers.invalidFileType", "Please upload a valid CSV, XLSX, or JSON file."));
      return false;
    }

    // Check size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError(t("suppliers.fileTooLarge", "File size should be less than 5MB."));
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
    [clearAll]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
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
    [handleFiles]
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
      showError(t("suppliers.pleaseSelectFile", "Please select a file to upload."));
      return;
    }

    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    // Using execute with showToast: false because we want to run custom toast and success logic based on 'summary'
    const result = await execute(supplierService.bulkUploadSuppliers(selectedFile, storeId), { showToast: false });

    if (result?.success && result?.data && result.data.summary) {
      setUploadResult({ data: result.data });

      if (result.data.summary.failed === 0) {
        showSuccess(t("suppliers.bulkUploadSuccess", "Bulk upload completed successfully"));
      } else {
        showSuccess(t("suppliers.partialSuccess", "Bulk upload partially successful"));
      }
      onSuccess?.();
    } else {
      // showError(result?.message || t("suppliers.uploadError", "Failed to upload suppliers"));
    }
  };

  const handleDownloadSample = () => {
    // Mock sample download
    showSuccess(t("suppliers.sampleDownloaded", "Sample file downloading..."));
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

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] flex items-center justify-between">
            <h4 className="font-semibold text-[rgb(var(--color-text-primary))] flex items-center gap-2">
              {summary.failed === 0 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
              {t("suppliers.uploadResults", "Upload Results")}
            </h4>
            <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] px-2 py-1 rounded-full bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
              {t("suppliers.totalRows", "Total Rows")}: {summary.total}
            </span>
          </div>

          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summary.created}</p>
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">{t("suppliers.createdCount", "Created")}</p>
            </div>
            <div className="text-center border-x border-[rgb(var(--color-border-primary))]">
              <p className="text-2xl font-bold text-amber-500">{summary.skipped}</p>
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">{t("suppliers.skippedCount", "Skipped")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{summary.failed}</p>
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">{t("suppliers.failedCount", "Failed")}</p>
            </div>
          </div>
        </div>

        {errors && errors.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setShowErrors(!showErrors)}
              className="flex items-center justify-between w-full p-3 bg-red-50 rounded-lg border border-red-100 text-red-700 font-medium text-sm transition-all hover:bg-red-100"
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {t("suppliers.errorsFound", "Errors Found")} ({errors.length})
              </span>
              {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showErrors && (
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {errors.map((error, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white border border-red-100 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-red-600 uppercase mb-1">
                          {t("suppliers.rowNumber", { row: error.row }, `Row ${error.row}`)}
                        </p>
                        <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                          {error.reason}
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded bg-red-50 text-[10px] font-bold text-red-600">
                        {t("suppliers.failedCount", "FAILED")}
                      </div>
                    </div>

                    {error.data && (
                      <div className="bg-gray-50 rounded p-2 text-[11px] font-mono text-gray-600 border border-gray-100">
                        <p className="font-bold mb-1">{t("suppliers.rowData", "Data")}:</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(error.data).map(([key, val]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-gray-400">{key}:</span>
                              <span className="truncate">{val || "-"}</span>
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
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={t("suppliers.bulkUploadTitle", "Bulk Upload Suppliers")}
      icon={Upload}
      description={t("suppliers.bulkUploadDesc", "Upload a CSV, XLSX, or JSON file to add multiple suppliers at once.")}
      width="w-full md:w-[600px] lg:w-[600px]"
    >
      <div className="p-4 sm:p-6 h-full flex flex-col">
        <div className="space-y-6 flex-1 overflow-y-auto">
          {!uploadResult ? (
            <>
              {/* Information Section */}
              <div className="bg-[rgb(var(--color-primary)/0.1)] rounded-lg border border-[rgb(var(--color-primary)/0.2)] p-4">
                <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("suppliers.instructions", "Instructions")}
                </h4>
                <ul className="list-disc pl-5 text-sm text-[rgb(var(--color-text-secondary))] space-y-1 mb-4">
                  <li>{t("suppliers.instruction1", "Ensure file format is either .csv, .xlsx, or .json")}</li>
                  <li>{t("suppliers.instruction2", "Maximum allowed file size is 5MB. ")}</li>
                  <li>{t("suppliers.instruction3", "Make sure required fields (e.g., name) are present.")}</li>
                </ul>
                <Button
                  size="sm"
                  onClick={handleDownloadSample}
                  className="flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  {t("suppliers.downloadSample", "Download Sample File")}
                </Button>
              </div>

              {/* Upload Area */}
              {!selectedFile ? (
                <div
                  className={`
                    relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
                    ${isDragOver
                      ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] bg-opacity-5"
                      : "border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                    }
                  `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={openFileDialog}
                >
                  <div className="p-8 text-center">
                    <Upload
                      className={`w-10 h-10 mx-auto mb-3 ${isDragOver ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"
                        }`}
                    />
                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                      {t("suppliers.dropZoneLabel", "Click to upload or drag and drop")}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                      {t("suppliers.supportedFormats", "Supported formats: CSV, XLSX, JSON")}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Selected File Card */
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] flex items-center justify-center flex-shrink-0">
                        {getFileIcon(selectedFile.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 cursor-pointer text-gray-500 hover:text-red-500 rounded-lg transition-colors duration-200 hover:bg-red-500/10"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            renderResults()
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-[rgb(var(--color-border-primary))] pt-4 mt-6 flex justify-start gap-3">
          {!uploadResult ? (
            <>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                loading={isUploading}
              >
                {isUploading ? t("suppliers.uploading", "Uploading...") : t("suppliers.upload", "Upload File")}
              </Button>
              <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
                {t("common.cancel", "Cancel")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" onClick={handleClose}>
                {t("suppliers.done", "Done")}
              </Button>
              <Button variant="secondary" onClick={resetUpload}>
                {t("suppliers.uploadAnother", "Upload Another")}
              </Button>
            </>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default SupplierBulkUploadDrawer;
