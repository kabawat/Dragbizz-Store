"use client";

import { Plus, Save } from "lucide-react";
import { useState } from "react";
import { FormDrawer } from "@/components/common";
import { Input, MultiSelect, Select, Toggle } from "@/components/ui";
import {
  PAYMENT_GATEWAY_V1_TYPES,
  GATEWAY_MODES,
  GATEWAY_CREDENTIAL_UI,
  buildCredentialsPayload,
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
    if (!form.gatewayType) newErrors.gatewayType = t("settings.paymentGateway.gatewayTypeRequired");
    if (!form.storeIds?.length) newErrors.storeIds = t("settings.paymentGateway.storeIdsRequired");
    const credErrors = validateGatewayCredentials(form.gatewayType, form.credentials, {
      isEdit: false,
      t,
    });
    Object.assign(newErrors, credErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !storeId) return;
    try {
      setIsCreating(true);
      setErrors({});
      const credentials = buildCredentialsPayload(form.gatewayType, form.credentials);
      const payload = {
        gatewayType: form.gatewayType,
        label: form.label?.trim() || undefined,
        mode: form.mode,
        storeIds: form.storeIds.map((id) => (typeof id === "string" ? id : id?.toString?.() || id)),
        isDefault: form.isDefault,
        credentials,
      };
      await dispatch(createStorePaymentGateway({ storeId, payload })).unwrap();
      await dispatch(
        getStorePaymentGateways({ storeId, scope: "agency", forceRefresh: true }),
      ).unwrap();
      onSuccess?.(t("settings.paymentGateway.addedSuccess"));
      handleCancel();
    } catch (error) {
      onError?.(error?.message || error || "Failed to add payment gateway");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
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
    <FormDrawer
      isOpen={isOpen}
      onClose={handleCancel}
      title={t("settings.paymentGateway.addGateway")}
      icon={Plus}
      description={t("settings.paymentGateway.manageDescription")}
      width="w-full md:w-[420px]"
      onSave={handleSave}
      onCancel={handleCancel}
      saveLabel={isCreating ? t("common.adding") : t("settings.paymentGateway.addGateway")}
      cancelLabel={t("common.cancel")}
      isSaving={isCreating}
      saveIcon={Save}
      saveVariant="primary"
    >
      <div className="space-y-4">
        <Select
          label={t("settings.paymentGateway.gatewayType")}
          options={gatewayTypeOptions}
          value={form.gatewayType}
          onChange={handleGatewayTypeChange}
          error={!!errors.gatewayType}
          errorMessage={errors.gatewayType}
        />
        <Input
          label={t("settings.paymentGateway.labelOptional")}
          placeholder={t("settings.paymentGateway.labelPlaceholder")}
          value={form.label}
          onChange={(val) => setForm((p) => ({ ...p, label: val ?? "" }))}
        />
        <Select
          label={t("settings.paymentGateway.mode")}
          options={modeOptions}
          value={form.mode}
          onChange={(val) => setForm((p) => ({ ...p, mode: val }))}
        />
        <MultiSelect
          label={t("settings.paymentGateway.assignToStores")}
          placeholder={t("settings.paymentGateway.selectStores")}
          options={storeOptions}
          value={form.storeIds?.map((id) => String(id)) || []}
          onChange={(vals) => setForm((p) => ({ ...p, storeIds: vals || [] }))}
          error={!!errors.storeIds}
          errorMessage={errors.storeIds}
          clearable={false}
        />
        <Toggle
          label={t("settings.paymentGateway.setAsDefault")}
          checked={form.isDefault}
          onChange={(checked) => setForm((p) => ({ ...p, isDefault: checked }))}
        />
        <GatewayCredentialFields
          gatewayType={form.gatewayType}
          values={form.credentials}
          errors={errors}
          onChange={(credentials) => setForm((p) => ({ ...p, credentials }))}
        />
      </div>
    </FormDrawer>
  );
};

export default GatewayAddDrawer;
