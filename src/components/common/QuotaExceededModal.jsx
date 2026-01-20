"use client";
import { AlertTriangle, Clock, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

// Modal component for displaying quota exceeded messages
const QuotaExceededModal = ({
  isOpen,
  onClose,
  message,
  quota = null,
  resetTime = null,
  canUpgrade = false,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const getUsageInfo = () => {
    if (!quota) return null;

    return {
      used: quota.used || 0,
      limit: quota.limit || 0,
      remaining: quota.remaining || 0,
      usageType: quota.usageType || "UNKNOWN",
      percentage:
        quota.limit > 0 ? Math.round((quota.used / quota.limit) * 100) : 0,
    };
  };

  const usageInfo = getUsageInfo();

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] bg-black/50 flex items-center justify-center z-[9999] transition-all duration-300">
      <div className="bg-gradient-to-br from-[rgb(var(--color-bg-primary))] to-[rgb(var(--color-bg-secondary))] rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-500">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {t("quota.quotaExceeded")}
                </h2>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {t("quota.dailyLimitReached")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Message */}
          <div className="mb-6">
            <p className="text-[rgb(var(--color-text-primary))] mb-4 text-base">
              {message || t("invoice.quotaExceededMessage")}
            </p>

            {/* Usage Stats */}
            {usageInfo && (
              <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))] mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                    {t("quota.usageToday")}
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {usageInfo.used} / {usageInfo.limit}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[rgb(var(--color-bg-primary))] rounded-full h-2.5 mb-3">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(usageInfo.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[rgb(var(--color-text-secondary))]">
                  <span>
                    {t("quota.remaining")}: {usageInfo.remaining}
                  </span>
                  <span>
                    {usageInfo.percentage}% {t("quota.used")}
                  </span>
                </div>
              </div>
            )}

            {/* Reset Time Info */}
            {resetTime && (
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))] mb-4">
                <Clock className="w-4 h-4" />
                <span>{t("quota.limitWillReset", { time: resetTime })}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t("common.close")}
            </Button>
            {canUpgrade && (
              <Link href="/dashboard/subscription" className="flex-1">
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  {t("quota.upgradePlan")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] rounded-b-2xl">
          <p className="text-xs text-[rgb(var(--color-text-tertiary))] text-center">
            {t("quota.upgradeMessage")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotaExceededModal;
