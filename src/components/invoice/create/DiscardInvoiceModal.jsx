"use client";
import { memo } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button, Modal } from "@/components/ui";

const DiscardInvoiceModal = ({
  isOpen,
  onClose,
  onDiscard,
  onSaveDraft,
  isSaving = false,
  isEdit = false,
  mode = isEdit ? "edit" : "create",
  saveButtonText,
  title,
  description,
  t,
}) => {
  if (!isOpen) return null;

  const isEditMode = mode === "edit";

  const modalTitle =
    title ||
    (isEditMode
      ? t("invoice.discardChangesTitle") || "Discard Changes?"
      : t("invoice.discardInvoiceTitle") || "Discard Added Items?");

  const modalDescription =
    description ||
    (isEditMode
      ? t("invoice.discardChangesDescription") ||
        "You have unsaved changes in this invoice. Are you sure you want to discard them, or would you like to update the invoice?"
      : t("invoice.discardInvoiceDescription") ||
        "You have added items in this invoice. Are you sure you want to discard them, or would you like to save them as a draft?");

  const actionText =
    saveButtonText ||
    (isEditMode
      ? t("invoice.update") || t("common.update") || "Update"
      : t("invoice.saveAsDraft") || "Save as Draft");

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSaving ? () => {} : onClose}
      size="md"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-4 py-1">
        {/* Title & Description (No empty header, warning icon removed) */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            {modalTitle}
          </h3>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">
            {modalDescription}
          </p>
        </div>

        {/* 3 Action Buttons: Cancel, Yes Discard, Save as Draft / Update */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-[rgb(var(--color-border-primary))]/30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto min-w-[80px] justify-center"
          >
            {t("common.cancel") || "Cancel"}
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            leftIcon={Trash2}
            className="w-full sm:w-auto min-w-[110px] justify-center"
          >
            {t("invoice.yesDiscard") || "Yes, Discard"}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onSaveDraft}
            loading={isSaving}
            leftIcon={Save}
            className="w-full sm:w-auto min-w-[115px] justify-center"
          >
            {actionText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default memo(DiscardInvoiceModal);
