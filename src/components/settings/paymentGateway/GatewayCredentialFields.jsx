"use client";
import { GatewayCredentialFieldsView } from "@dragorbit/features/integrations";

import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  GATEWAY_CREDENTIAL_UI,
  getRequiredCredentialFields,
  getRequiredSecretFields,
  isMaskedCredentialField,
} from "@/constants/paymentGateway.config";

const GatewayCredentialFields = ({
  gatewayType,
  values = {},
  errors = {},
  onChange,
  isEdit = false,
}) => {
  const { t } = useTranslation();
  const config = GATEWAY_CREDENTIAL_UI[gatewayType];
  if (!config) return null;

  const handleFieldChange = (key, val) => {
    onChange?.({ ...values, [key]: val ?? "" });
  };

  return (
    <GatewayCredentialFieldsView
      model={{
        config,
        gatewayType,
        t,
        isMaskedCredentialField,
        isEdit,
        values,
        handleFieldChange,
        errors,
      }}
    />
  );
};

export function validateGatewayCredentials(
  gatewayType,
  values,
  { isEdit = false, t },
) {
  const errors = {};
  for (const key of getRequiredCredentialFields(gatewayType, isEdit)) {
    if (!String(values[key] ?? "").trim()) {
      errors[key] = t("settings.paymentGateway.fieldRequired");
    }
  }
  for (const key of getRequiredSecretFields(gatewayType, isEdit)) {
    if (!String(values[key] ?? "").trim()) {
      errors[key] = t("settings.paymentGateway.fieldRequired");
    }
  }
  return errors;
}

export default GatewayCredentialFields;
