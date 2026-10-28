"use client";
import { GatewayWebhookSetupView } from "@dragorbit/features/integrations";
import { Tooltip as SharedTooltip } from "@dragorbit/ui";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import {
  GATEWAY_WEBHOOK_META,
  gatewaySupportsDragbizzWebhookSecret,
} from "@/constants/paymentGateway.config";
import { useTranslation } from "@/hooks/ui/useTranslation";

const CopyField = ({ label, value, mono = true }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
        {label}
      </p>
      <div className="flex items-start gap-2">
        <p
          className={`flex-1 text-sm text-[rgb(var(--color-text-primary))] break-all rounded-lg border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/40 px-3 py-2 ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
        <SharedTooltip content={t("settings.paymentGateway.copyValue")}><button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-[rgb(var(--color-border-primary))]/60 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors cursor-pointer"

        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
          )}
        </button></SharedTooltip>
      </div>
    </div>
  );
};

const GatewayWebhookSetup = ({
  webhookSetup,
  showSecret = false,
  compact = false,
  onRegenerateSecret,
  isRegenerating = false,
  gatewayType,
  isLiveSetup = false,
  hideInnerTitle = false,
}) => {
  const { t } = useTranslation();

  if (!webhookSetup?.url) return null;

  const currentGatewayType = gatewayType || webhookSetup.gatewayType;
  const meta = currentGatewayType
    ? GATEWAY_WEBHOOK_META[currentGatewayType]
    : null;

  const hasSecret = Boolean(webhookSetup.webhookSecret);
  const secretConfigured =
    webhookSetup.secretGeneratedBy === "DRAGBIZZ" ||
    (webhookSetup.secretsConfigured || []).includes("webhookSecret");

  const instructionsKey = currentGatewayType
    ? `settings.paymentGateway.webhookInstructions.${currentGatewayType}`
    : "settings.paymentGateway.webhookSetupDescription";
  const instructions = t(instructionsKey);

  let secretNote = null;
  if (isLiveSetup && currentGatewayType) {
    if (gatewaySupportsDragbizzWebhookSecret(currentGatewayType)) {
      secretNote = t("settings.paymentGateway.webhookSecretAutoGenerateNote");
    } else {
      secretNote = t("settings.paymentGateway.webhookSignatureManagedNote");
    }
  }

  return (
    <GatewayWebhookSetupView
      model={{
        compact,
        t,
        CopyField,
        webhookSetup,
        showSecret,
        hasSecret,
        secretConfigured,
        onRegenerateSecret,
        isRegenerating,
        gatewayType: currentGatewayType,
        isLiveSetup,
        events: meta?.events || [],
        instructions,
        secretNote,
        hideInnerTitle,
      }}
    />
  );
};

export default GatewayWebhookSetup;
