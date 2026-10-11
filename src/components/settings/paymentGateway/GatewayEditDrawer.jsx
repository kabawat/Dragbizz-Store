"use client";
import { GatewayEditDrawerView } from "@dragorbit/features/integrations";

import {
  GATEWAY_MODES,
  GATEWAY_CREDENTIAL_UI,
  buildCredentialsPayload,
  isMaskedCredentialField,
} from "@/constants/paymentGateway.config";
import {
  updateStorePaymentGateway,
  getStorePaymentGateways,
  rotateStorePaymentGatewayWebhookSecret,
} from "@/store/slices/storePaymentGatewaySlice";

import { useEffect, useState } from "react";
import { FormDrawer } from "@/components/common";
import { useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { pickStoreId } from "@/utils/store.util";
import GatewayCredentialFields, {
  validateGatewayCredentials,
} from "./GatewayCredentialFields";
import GatewayWebhookSetup from "./GatewayWebhookSetup";

const emptyCredentialsForType = (gatewayType) => {
  const fields = GATEWAY_CREDENTIAL_UI[gatewayType]?.fields || [];
  const values = {};
  for (const f of fields) values[f.key] = "";
  return values;
};

const GatewayEditDrawer = ({
  isOpen,
  storeId,
  editingGateway,
  stores = [],
  onClose,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    label: "",
    mode: "TEST",
    storeIds: [],
    isDefault: false,
    credentials: {},
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [webhookSetupView, setWebhookSetupView] = useState(null);
  const [isRegeneratingSecret, setIsRegeneratingSecret] = useState(false);

  const gatewayType = editingGateway?.gatewayType;

  useEffect(() => {
    if (isOpen && editingGateway) {
      setWebhookSetupView(editingGateway.webhookSetup || null);
      const config = GATEWAY_CREDENTIAL_UI[editingGateway.gatewayType];
      const credValues = emptyCredentialsForType(editingGateway.gatewayType);
      const maskedFields = editingGateway.credentials?.fields || {};
      for (const field of config?.fields || []) {
        if (isMaskedCredentialField(field)) continue;
        if (maskedFields[field.key])
          credValues[field.key] = maskedFields[field.key];
      }
      setForm({
        label: editingGateway.label || "",
        mode: editingGateway.mode || "TEST",
        storeIds: editingGateway.storeIds?.map((id) => String(id)) || [],
        isDefault: Boolean(editingGateway.isDefault),
        credentials: credValues,
      });
      setErrors({});
    }
  }, [isOpen, editingGateway]);

  const modeOptions = GATEWAY_MODES.map((mode) => ({
    label:
      mode === "LIVE"
        ? t("settings.paymentGateway.modeLive")
        : t("settings.paymentGateway.modeTest"),
    value: mode,
  }));

  const validateForm = () => {
    const newErrors = {};
    if (!form.storeIds?.length)
      newErrors.storeIds = t("settings.paymentGateway.storeIdsRequired");
    const credErrors = validateGatewayCredentials(
      gatewayType,
      form.credentials,
      {
        isEdit: true,
        t,
      },
    );
    Object.assign(newErrors, credErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const gatewayDocId = editingGateway?.id;
    if (!validateForm() || !storeId || !gatewayDocId) return;

    try {
      setIsSaving(true);
      setErrors({});
      const credentials = buildCredentialsPayload(
        gatewayType,
        form.credentials,
        { isEdit: true },
      );
      const payload = {
        label: form.label?.trim() || undefined,
        mode: form.mode,
        storeIds: form.storeIds.map((id) =>
          typeof id === "string" ? id : id?.toString?.() || id,
        ),
        isDefault: form.isDefault,
        ...(Object.keys(credentials).length > 0 ? { credentials } : {}),
      };
      await dispatch(
        updateStorePaymentGateway({
          storeId,
          gatewayId: gatewayDocId,
          payload,
        }),
      ).unwrap();
      await dispatch(
        getStorePaymentGateways({
          storeId,
          scope: "agency",
          forceRefresh: true,
        }),
      ).unwrap();
      onSuccess?.(t("settings.paymentGateway.updatedSuccess"));
      handleCancel();
    } catch (error) {
      onError?.(error?.message || error || "Failed to update payment gateway");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setWebhookSetupView(null);
    setForm({
      label: "",
      mode: "TEST",
      storeIds: [],
      isDefault: false,
      credentials: {},
    });
    setErrors({});
    onClose?.();
  };

  const handleRegenerateWebhookSecret = async () => {
    const gatewayDocId = editingGateway?.id;
    if (!storeId || !gatewayDocId) return;

    try {
      setIsRegeneratingSecret(true);
      const result = await dispatch(
        rotateStorePaymentGatewayWebhookSecret({
          storeId,
          gatewayId: gatewayDocId,
        }),
      ).unwrap();
      if (result?.data?.webhookSetup) {
        setWebhookSetupView(result.data.webhookSetup);
      }
      onSuccess?.(
        result.message || t("settings.paymentGateway.webhookSecretRegenerated"),
      );
    } catch (error) {
      onError?.(error?.message || error || "Failed to get webhook secret");
    } finally {
      setIsRegeneratingSecret(false);
    }
  };

  const storeOptions = stores.map((store) => ({
    label: store.storeName,
    value: pickStoreId(store),
  }));

  return (
    <GatewayEditDrawerView
      model={{
        FormDrawer,
        isOpen,
        handleCancel,
        t,
        handleSave,
        isSaving,
        gatewayType,
        form,
        setForm,
        modeOptions,
        storeOptions,
        errors,
        GatewayCredentialFields,
        webhookSetupView,
        GatewayWebhookSetup,
        handleRegenerateWebhookSecret,
        isRegeneratingSecret,
      }}
    />
  );
};

export default GatewayEditDrawer;
