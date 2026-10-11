"use client";
import { UpiAddDrawerView } from "@dragorbit/features/integrations";

import { useState } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { createStoreUpi, getStoreUpi } from "@/store/slices/storeUpiSlice";
import { pickStoreId } from "@/utils/store.util";

const UPI_ID_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

const UpiAddDrawer = ({
  isOpen,
  storeId,
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
  const [isCreating, setIsCreating] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.upiId?.trim()) newErrors.upiId = t("settings.upi.upiIdRequired");
    else if (!UPI_ID_REGEX.test(form.upiId.trim().toLowerCase()))
      newErrors.upiId = t("settings.upi.invalidUpiFormat");
    if (!form.storeIds?.length)
      newErrors.storeIds = t("settings.upi.storeIdsRequired");
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
        storeIds: form.storeIds.map((id) =>
          typeof id === "string" ? id : id?.toString?.() || id,
        ),
        isDefault: form.isDefault,
      };
      await dispatch(createStoreUpi({ storeId, payload })).unwrap();
      await dispatch(
        getStoreUpi({ storeId, scope: "agency", forceRefresh: true }),
      ).unwrap();
      onSuccess?.(t("settings.upi.addedSuccess"));
      handleCancel();
    } catch (error) {
      onError?.(error?.message || error || "Failed to add UPI ID");
    } finally {
      setIsCreating(false);
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
    <UpiAddDrawerView
      model={{
        isOpen,
        handleCancel,
        t,
        isCreating,
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

export default UpiAddDrawer;
