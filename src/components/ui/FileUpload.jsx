"use client";
import { AlertCircle, File, Image as ImageIcon, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/ui/useTranslation";

const FileUpload = ({
  label,
  value = [],
  onChange,
  accept = "image/*",
  multiple = true,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  error = false,
  errorMessage,
  helperText,
  dropZoneLabel,
  sizeLimitLabel,
  showFileList = true,
  disabled = false,
  required = false,
  variant = "default", // "default" or "compact"
  className = "",
  ...props
}) => {
  const { t } = useTranslation();
  const { currentVariant } = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const [_uploading, _setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      const fileArray = Array.from(files);
      const validFiles = [];
      const errors = [];

      fileArray.forEach((file) => {
        // Check file size
        if (file.size > maxSize) {
          errors.push(
            `${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
          );
          return;
        }

        // Check file type
        if (accept && !file.type.match(accept.replace("*", ".*"))) {
          errors.push(`${file.name} is not a valid file type`);
          return;
        }

        // Check if file already exists
        const exists = value.some(
          (existingFile) =>
            existingFile.name === file.name && existingFile.size === file.size
        );

        if (exists) {
          errors.push(`${file.name} is already uploaded`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
      }

      if (validFiles.length > 0) {
        const newFiles = multiple ? [...value, ...validFiles] : validFiles;
        onChange?.(newFiles.slice(0, maxFiles));
      }
    },
    [value, onChange, maxFiles, maxSize, accept, multiple]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [disabled, handleFiles]
  );

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e) => {
      const files = e.target.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index) => {
      const newFiles = value.filter((_, i) => i !== index);
      onChange?.(newFiles);
    },
    [value, onChange]
  );

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const _getFileIcon = (file) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const createPreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label - Only in default variant */}
      {variant !== "compact" && label && (
        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
          ${isDragOver
            ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)] scale-[0.98]"
            : "border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:shadow-md"
          }
          ${error ? "border-red-500 bg-red-50/50" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${variant === "compact" ? "aspect-square flex items-center justify-center p-2" : (value.length > 0 ? "mb-4 p-4" : "p-8")}
          ${className}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="text-center w-full">
          {variant === "compact" ? (
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className={`p-2 rounded-full transition-colors ${isDragOver ? "bg-[rgb(var(--color-primary))]/20" : "bg-[rgb(var(--color-bg-tertiary))]"}`}>
                <Upload
                  className={`w-5 h-5 ${isDragOver ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`}
                />
              </div>
              <span className="text-[11px] font-medium text-[rgb(var(--color-text-secondary))] truncate px-1">
                {t("common.add") || "Add More"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className={`p-4 rounded-full mb-3 mb-4 transition-transform duration-300 ${isDragOver ? "bg-[rgb(var(--color-primary))]/20 scale-110" : "bg-[rgb(var(--color-bg-tertiary))]"}`}>
                <Upload
                  className={`w-8 h-8 ${isDragOver ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`}
                />
              </div>
              <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                {isDragOver
                  ? t("common.dropFilesHere") || "Drop files here"
                  : dropZoneLabel || (value.length > 0 ? t("common.addMoreImages") || "Add more images" : t("common.clickToUploadOrDrag") || "Click to upload or drag and drop")}
              </p>
              {!value.length && (
                <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                  {sizeLimitLabel || (
                    <>
                      {accept.includes("image") ? "Images" : "Files"} up to{" "}
                      <span className="font-medium text-[rgb(var(--color-text-secondary))]">
                        {maxSize / (1024 * 1024)}MB
                      </span>
                      {multiple && ` • Max ${maxFiles} files`}
                    </>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          {...props}
        />
      </div>

      {/* File List */}
      {showFileList && value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]"
            >
              <div className="flex items-center space-x-4">
                {/* Large Image Preview */}
                {file.type.startsWith("image/") && (
                  <div className="w-16 h-16 rounded-lg border border-[rgb(var(--color-border-primary))] overflow-hidden flex-shrink-0">
                    <img
                      src={createPreviewUrl(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                    {formatFileSize(file.size)}
                  </p>
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="text-xs text-[rgb(var(--color-primary))] hover:underline mt-1"
                    disabled={disabled}
                  >
                    Change image
                  </button>
                </div>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className={`ml-2 p-2 cursor-pointer text-gray-500 hover:text-red-500 rounded-lg transition-colors duration-200 ${currentVariant === "dark"
                  ? "hover:bg-red-900/20"
                  : "hover:bg-red-500/20"
                  }`}
                disabled={disabled}
                title="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text / Error Message - Only in default variant */}
      {variant !== "compact" && (helperText || errorMessage) && (
        <div className="mt-2">
          {error && errorMessage && (
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
          {!error && helperText && (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
