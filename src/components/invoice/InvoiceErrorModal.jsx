"use client";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui";

const InvoiceErrorModal = ({
  isOpen,
  onClose,
  title = "Error",
  message = "Something went wrong",
  details = "",
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 mt-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            {title}
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            {message}
          </p>
          {details && (
            <div className="bg-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-3 mb-4">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {details}
              </p>
            </div>
          )}
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceErrorModal;
