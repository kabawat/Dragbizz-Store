"use client";
import { GatewayAddDrawerView } from "@dragorbit/features/integrations";

import { useState } from "react";
import { FormDrawer } from "@/components/common";

import {
  PAYMENT_GATEWAY_V1_TYPES,
  GATEWAY_MODES,
  GATEWAY_CREDENTIAL_UI,
  buildCredentialsPayload,
  gatewaySupportsWebhookSetup,
} from "@/constants/paymentGateway.config";
import {
  createStorePaymentGateway,
  getStorePaymentGateways,
} from "@/store/slices/storePaymentGatewaySlice";
import { useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { pickStoreId } from "@/utils/store.util";
import GatewayCredentialFields, {
  validateGatewayCredentials,
} from "./GatewayCredentialFields";
import GatewayWebhookSetup from "./GatewayWebhookSetup";

const emptyCredentialValues = (gatewayType) => {
  const values = {};
  const fields = GATEWAY_CREDENTIAL_UI[gatewayType]?.fields || [];
  for (const f of fields) values[f.key] = "";
  return values;
};

const GatewayAddDrawer = ({
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
    gatewayType: PAYMENT_GATEWAY_V1_TYPES[0],
    label: "",
    mode: "TEST",
    storeIds: [],
    isDefault: false,
    credentials: emptyCredentialValues(PAYMENT_GATEWAY_V1_TYPES[0]),
  });
  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [createdWebhookSetup, setCreatedWebhookSetup] = useState(null);

  const showingWebhookSetup = Boolean(createdWebhookSetup);

  const gatewayTypeOptions = PAYMENT_GATEWAY_V1_TYPES.map((type) => ({
    label: t(`settings.paymentGateway.types.${type}`, type),
    value: type,
  }));

  const modeOptions = GATEWAY_MODES.map((mode) => ({
    label:
      mode === "LIVE"
        ? t("settings.paymentGateway.modeLive")
        : t("settings.paymentGateway.modeTest"),
    value: mode,
  }));

  const validateForm = () => {
    const newErrors = {};
    if (!form.gatewayType)
      newErrors.gatewayType = t("settings.paymentGateway.gatewayTypeRequired");
    if (!form.storeIds?.length)
      newErrors.storeIds = t("settings.paymentGateway.storeIdsRequired");
    const credErrors = validateGatewayCredentials(
      form.gatewayType,
      form.credentials,
      {
        isEdit: false,
        t,
      },
    );
    Object.assign(newErrors, credErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (showingWebhookSetup) {
      handleCancel();
      return;
    }
    if (!validateForm() || !storeId) return;
    try {
      setIsCreating(true);
      setErrors({});
      const credentials = buildCredentialsPayload(
        form.gatewayType,
        form.credentials,
      );
      const payload = {
        gatewayType: form.gatewayType,
        label: form.label?.trim() || undefined,
        mode: form.mode,
        storeIds: form.storeIds.map((id) =>
          typeof id === "string" ? id : id?.toString?.() || id,
        ),
        isDefault: form.isDefault,
        credentials,
      };
      const result = await dispatch(
        createStorePaymentGateway({ storeId, payload }),
      ).unwrap();
      await dispatch(
        getStorePaymentGateways({
          storeId,
          scope: "agency",
          forceRefresh: true,
        }),
      ).unwrap();
      onSuccess?.(t("settings.paymentGateway.addedSuccess"));

      if (
        gatewaySupportsWebhookSetup(form.gatewayType) &&
        result?.data?.webhookSetup?.webhookSecret
      ) {
        setCreatedWebhookSetup(result.data.webhookSetup);
        return;
      }

      handleCancel();
    } catch (error) {
      onError?.(error?.message || error || "Failed to add payment gateway");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setCreatedWebhookSetup(null);
    setForm({
      gatewayType: PAYMENT_GATEWAY_V1_TYPES[0],
      label: "",
      mode: "TEST",
      storeIds: [],
      isDefault: false,
      credentials: emptyCredentialValues(PAYMENT_GATEWAY_V1_TYPES[0]),
    });
    setErrors({});
    onClose?.();
  };

  const handleGatewayTypeChange = (type) => {
    setForm((p) => ({
      ...p,
      gatewayType: type,
      credentials: emptyCredentialValues(type),
    }));
    setErrors({});
  };

  const storeOptions = stores.map((store) => ({
    label: store.storeName,
    value: pickStoreId(store),
  }));

  return (
    <GatewayAddDrawerView
      model={{
        FormDrawer,
        isOpen,
        handleCancel,
        showingWebhookSetup,
        t,
        handleSave,
        isCreating,
        GatewayWebhookSetup,
        createdWebhookSetup,
        gatewayTypeOptions,
        form,
        handleGatewayTypeChange,
        errors,
        setForm,
        modeOptions,
        storeOptions,
        GatewayCredentialFields,
        gatewaySupportsWebhookSetup,
      }}
    />
  );
};

export default GatewayAddDrawer;
