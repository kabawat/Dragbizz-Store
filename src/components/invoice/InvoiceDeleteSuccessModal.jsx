"use client";
import { CheckCircle } from "lucide-react";
import { Button } from "../ui";

const InvoiceDeleteSuccessModal = ({
  isOpen,
  onClose,
  invoiceNumber,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 mt-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Invoice Deleted Successfully!
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {invoiceNumber ? (
              <>
                Invoice{" "}
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                  "{invoiceNumber}"
                </span>{" "}
                has been removed from your invoice list.
              </>
            ) : (
              "The invoice has been removed from your invoice list."
            )}
          </p>
          <Button variant="primary" onClick={onClose}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDeleteSuccessModal;
