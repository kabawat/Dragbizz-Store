"use client";

import { Loader2, Save, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { FormDrawer } from "@/components/common";
import { Input, MultiSelect } from "@/components/ui";
import {
  updateStoreUpi,
  getStoreUpi,
} from "@/store/slices/storeUpiSlice";
import { useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";
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
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && editingUpi) {
      setForm({
        upiId: editingUpi.upiId || "",
        label: editingUpi.label || "",
        storeIds: editingUpi.storeIds?.map((id) => String(id)) || [],
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
      onError?.(
        error?.message || error || "Failed to update UPI ID"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ upiId: "", label: "", storeIds: [] });
    setErrors({});
    onClose?.();
  };

  const storeOptions = stores.map((store) => ({
    label: store.storeName,
    value: pickStoreId(store),
  }));

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={handleCancel}
      title={t("settings.upi.edit") + " UPI"}
      icon={Wallet}
      description={t("settings.upi.manageUpiDescription")}
      width="w-full md:w-[420px]"
      onSave={handleSave}
      onCancel={handleCancel}
      saveLabel={isSaving ? "Saving..." : t("common.save")}
      cancelLabel={t("common.cancel")}
      isSaving={isSaving}
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
          onChange={(vals) =>
            setForm((p) => ({ ...p, storeIds: vals || [] }))
          }
          error={!!errors.storeIds}
          errorMessage={errors.storeIds}
          clearable={false}
        />
      </div>
    </FormDrawer>
  );
};

export default UpiEditDrawer;
