"use client";

import { Plus, Save } from "lucide-react";
import { useState } from "react";
import { FormDrawer } from "@/components/common";
import { Input, MultiSelect } from "@/components/ui";
import { createStoreUpi, getStoreUpi } from "@/store/slices/storeUpiSlice";
import { useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";

const UPI_ID_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

const UpiAddDrawer = ({ isOpen, storeId, stores = [], onClose, onSuccess, onError }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({ upiId: "", label: "", storeIds: [] });
  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.upiId?.trim()) newErrors.upiId = t("settings.upi.upiIdRequired");
    else if (!UPI_ID_REGEX.test(form.upiId.trim().toLowerCase())) newErrors.upiId = t("settings.upi.invalidUpiFormat");
    if (!form.storeIds?.length) newErrors.storeIds = t("settings.upi.storeIdsRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !storeId) return;
    try {
      setIsCreating(true);
      setErrors({});
      const payload = {
        upiId: form.upiId.trim().toLowerCase(),
        label: form.label?.trim() || undefined,
        storeIds: form.storeIds.map((id) => (typeof id === "string" ? id : id?.toString?.() || id)),
      };
      await dispatch(createStoreUpi({ storeId, payload })).unwrap();
      await dispatch(getStoreUpi({ storeId, scope: "agency", forceRefresh: true })).unwrap();
      onSuccess?.(t("settings.upi.addedSuccess"));
      handleCancel();
    } catch (error) {
      onError?.(error?.message || error || "Failed to add UPI ID");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setForm({ upiId: "", label: "", storeIds: [] });
    setErrors({});
    onClose?.();
  };

  const storeOptions = (stores || []).map((s) => ({
    label: s.name || s._id || s.id || String(s._id || s.id),
    value: String(s._id || s.id),
  }));

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={handleCancel}
      title={t("settings.upi.addNewUpi")}
      icon={Plus}
      description={t("settings.upi.manageUpiDescription")}
      width="w-full md:w-[420px]"
      onSave={handleSave}
      onCancel={handleCancel}
      saveLabel={isCreating ? "Adding..." : t("settings.upi.addUpi")}
      cancelLabel={t("common.cancel")}
      isSaving={isCreating}
      saveIcon={Save}
      saveVariant="primary"
    >
      <div className="space-y-4">
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
      </div>
    </FormDrawer>
  );
};

export default UpiAddDrawer;
