"use client";

import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  GATEWAY_CREDENTIAL_UI,
  getRequiredCredentialFields,
  getRequiredSecretFields,
} from "@/constants/paymentGateway.config";
import { Input } from "@/components/ui";

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
    <div className="space-y-4">
      {config.fields.map((field) => {
        const labelKey = `settings.paymentGateway.fields.${gatewayType}.${field.key}`;
        const label = t(labelKey, field.key);
        const placeholder = field.secret
          ? isEdit
            ? t("settings.paymentGateway.leaveBlankToKeep")
            : t("settings.paymentGateway.enterSecret")
          : undefined;

        return (
          <Input
            key={field.key}
            label={
              field.optional
                ? `${label} (${t("settings.paymentGateway.optional")})`
                : label
            }
            type={field.secret ? "password" : "text"}
            placeholder={placeholder}
            value={values[field.key] ?? ""}
            onChange={(val) => handleFieldChange(field.key, val)}
            error={!!errors[field.key]}
            errorMessage={errors[field.key]}
            autoComplete="off"
          />
        );
      })}
    </div>
  );
};

export function validateGatewayCredentials(gatewayType, values, { isEdit = false, t }) {
  const errors = {};
  for (const key of getRequiredCredentialFields(gatewayType)) {
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
