"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
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
      <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">{label}</p>
      <div className="flex items-start gap-2">
        <p
          className={`flex-1 text-sm text-[rgb(var(--color-text-primary))] break-all rounded-lg border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/40 px-3 py-2 ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-[rgb(var(--color-border-primary))]/60 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors cursor-pointer"
          title={t("settings.paymentGateway.copyValue")}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
          )}
        </button>
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
}) => {
  const { t } = useTranslation();

  if (!webhookSetup?.url) return null;

  const hasSecret = Boolean(webhookSetup.webhookSecret);
  const secretConfigured =
    webhookSetup.secretGeneratedBy === "DRAGBIZZ" ||
    (webhookSetup.secretsConfigured || []).includes("webhookSecret");

  return (
    <div
      className={`rounded-lg border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/20 ${compact ? "p-3 space-y-3" : "p-4 space-y-4"}`}
    >
      <div>
        <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
          {t("settings.paymentGateway.webhookSetupTitle")}
        </h4>
        <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
          {t("settings.paymentGateway.webhookSetupDescription")}
        </p>
      </div>

      <CopyField label={t("settings.paymentGateway.webhookUrl")} value={webhookSetup.url} />

      {showSecret && hasSecret ? (
        <CopyField
          label={t("settings.paymentGateway.webhookSecretDragbizz")}
          value={webhookSetup.webhookSecret}
        />
      ) : secretConfigured ? (
        <div className="space-y-2">
          <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
            {t("settings.paymentGateway.webhookSecretConfigured")}
          </p>
          {onRegenerateSecret ? (
            <>
              <button
                type="button"
                onClick={onRegenerateSecret}
                disabled={isRegenerating}
                className="text-xs font-medium text-[rgb(var(--color-primary))] hover:underline disabled:opacity-50 cursor-pointer"
              >
                {isRegenerating
                  ? t("settings.paymentGateway.webhookSecretGenerating")
                  : t("settings.paymentGateway.webhookSecretGetForRazorpay")}
              </button>
              <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                {t("settings.paymentGateway.webhookSecretRegenerateHint")}
              </p>
            </>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
        {showSecret && hasSecret
          ? t("settings.paymentGateway.webhookSetupInstructions")
          : t("settings.paymentGateway.webhookSetupInstructionsExisting")}
      </p>
    </div>
  );
};

export default GatewayWebhookSetup;
