"use client";
import { UpiEditDrawerView } from "@dragorbit/features/integrations";

import { useEffect, useState } from "react";

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
          typeof id === "string" ? id : id?.toString?.() || id,
        ),
        isDefault: form.isDefault,
      };
      await dispatch(
        updateStoreUpi({ storeId, upiId: upiDocId, payload }),
      ).unwrap();
      await dispatch(
        getStoreUpi({ storeId, scope: "agency", forceRefresh: true }),
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
    <UpiEditDrawerView
      model={{
        isOpen,
        handleCancel,
        t,
        isSaving,
        form,
        setForm,
        errors,
        setErrors,
        storeOptions,
        handleSave,
      }}
    />
  );
};

export default UpiEditDrawer;
