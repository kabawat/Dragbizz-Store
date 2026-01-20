"use client";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

const DeleteSuccessModal = ({ isOpen, supplierName, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            {t("modals.deletedSuccessfully", {
              item: t("common.supplier"),
            })}
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {t("common.hasBeenRemovedFromList", {
              name: supplierName,
              item: t("common.suppliers"),
            })}
          </p>
          <Button variant="primary" onClick={onClose}>
            Back to Suppliers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSuccessModal;
