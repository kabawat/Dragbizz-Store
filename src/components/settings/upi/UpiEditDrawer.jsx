"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input, Modal, MultiSelect, Toggle } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { getStoreUpi, updateStoreUpi } from "@/store/slices/storeUpiSlice";
import { pickStoreId } from "@/utils/store.util";

const UPI_ID_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

const UpiEditDrawer = ({
  isOpen,
  storeId,
  editingUpi,
  stores = [],
  onClose,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    upiId: "",
    label: "",
    storeIds: [],
    isDefault: false,
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && editingUpi) {
      setForm({
        upiId: editingUpi.upiId || "",
        label: editingUpi.label || "",
        storeIds: editingUpi.storeIds?.map((id) => String(id)) || [],
        isDefault: Boolean(editingUpi.isDefault),
      });
      setErrors({});
    }
  }, [isOpen, editingUpi]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.upiId?.trim()) {
      newErrors.upiId = t("settings.upi.upiIdRequired");
    } else if (!UPI_ID_REGEX.test(form.upiId.trim().toLowerCase())) {
      newErrors.upiId = t("settings.upi.invalidUpiFormat");
    }
    if (!form.storeIds?.length) {
      newErrors.storeIds = t("settings.upi.storeIdsRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const upiDocId = editingUpi?.id;
    if (!validateForm() || !storeId || !upiDocId) return;

    try {
      setIsSaving(true);
      setErrors({});
      const payload = {
        upiId: form.upiId.trim().toLowerCase(),
        label: form.label?.trim() || undefined,
        storeIds: form.storeIds.map((id) =>
          typeof id === "string" ? id : id?.toString?.() || id
        ),
        isDefault: form.isDefault,
      };
      await dispatch(
        updateStoreUpi({ storeId, upiId: upiDocId, payload })
      ).unwrap();
      await dispatch(
        getStoreUpi({ storeId, scope: "agency", forceRefresh: true })
      ).unwrap();
      onSuccess?.(t("settings.upi.updatedSuccess"));
      handleCancel();
    } catch (error) {
      onError?.(error?.message || error || "Failed to update UPI ID");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ upiId: "", label: "", storeIds: [], isDefault: false });
    setErrors({});
    onClose?.();
  };

  const storeOptions = stores.map((store) => ({
    label: store.storeName,
    value: pickStoreId(store),
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={`${t("settings.upi.edit")} UPI`}
      size="md"
      closeOnOverlayClick={!isSaving}
      closeOnEscape={!isSaving}
      className="!shadow-none"
    >
      <div className="space-y-4">
        <p className="text-sm leading-5 text-[rgb(var(--color-text-secondary))]">
          {t("settings.upi.manageUpiDescription")}
        </p>
        <Input
          label={t("settings.upi.upiId")}
          placeholder="merchant@paytm"
          value={form.upiId}
          onChange={(val) => {
            setForm((p) => ({ ...p, upiId: val ?? "" }));
            if (errors.upiId) setErrors((p) => ({ ...p, upiId: null }));
          }}
          error={!!errors.upiId}
          errorMessage={errors.upiId}
        />
        <Input
          label={t("settings.upi.labelOptional")}
          placeholder="Primary, Backup..."
          value={form.label}
          onChange={(val) => setForm((p) => ({ ...p, label: val ?? "" }))}
        />
        <MultiSelect
          label={t("settings.upi.assignToStores")}
          placeholder={t("settings.upi.selectStores")}
          options={storeOptions}
          value={form.storeIds?.map((id) => String(id)) || []}
          onChange={(vals) => setForm((p) => ({ ...p, storeIds: vals || [] }))}
          error={!!errors.storeIds}
          errorMessage={errors.storeIds}
          clearable={false}
        />
        <Toggle
          label={t("settings.upi.setAsDefault")}
          checked={form.isDefault}
          onChange={(checked) => setForm((p) => ({ ...p, isDefault: checked }))}
        />
        <div className="flex justify-end gap-3 border-t border-[rgb(var(--color-border-primary))]/60 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            leftIcon={Save}
            onClick={handleSave}
            isLoading={isSaving}
          >
            {isSaving ? "Saving..." : t("common.save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UpiEditDrawer;
