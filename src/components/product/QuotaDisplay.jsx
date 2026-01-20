"use client";
import { AlertCircle, Package, RefreshCw, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUsageQuota } from "@/hooks/useUsageQuota";

const QuotaDisplay = ({
  featureKey = "product_management",
  showRefresh = true,
  onRefreshRef,
}) => {
  const { t } = useTranslation();
  const { quota, isLoading, error, refresh } = useUsageQuota(featureKey);

  // Expose refresh function to parent component
  useEffect(() => {
    if (onRefreshRef && typeof onRefreshRef === "function") {
      onRefreshRef(refresh);
    }
  }, [refresh, onRefreshRef]);

  if (isLoading) {
    return (
      <div className="bg-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[rgb(var(--color-text-secondary))]" />
          <span className="text-sm text-[rgb(var(--color-text-secondary))]">
            {t("products.loadingQuota")}
          </span>
        </div>
      </div>
    );
  }

  if (error || !quota) {
    return (
      <div className="bg-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-4">
        <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{t("products.unableToLoadQuota")}</span>
        </div>
      </div>
    );
  }

  // Handle unlimited quota
  const isUnlimited = quota.remaining === -1 || quota.limit === -1;
  const used = quota.used || 0;
  const limit = quota.limit || 0;
  const remaining = isUnlimited
    ? t("products.unlimited")
    : quota.remaining || 0;
  const percentage = isUnlimited
    ? 0
    : limit > 0
      ? Math.round((used / limit) * 100)
      : 0;

  // Determine color based on usage
  const getProgressColor = () => {
    if (isUnlimited) return "bg-green-500";
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    return "bg-blue-500";
  };

  const getStatusText = () => {
    if (isUnlimited) return t("products.unlimited");
    if (remaining === 0) return t("products.quotaExceeded");
    if (percentage >= 90) return t("products.almostFull");
    if (percentage >= 75) return t("products.gettingFull");
    return t("products.available");
  };

  const getStatusColor = () => {
    if (isUnlimited) return "text-green-600 dark:text-green-400";
    if (remaining === 0) return "text-red-600 dark:text-red-400";
    if (percentage >= 90) return "text-red-600 dark:text-red-400";
    if (percentage >= 75) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="bg-gradient-to-br from-[rgb(var(--color-bg-primary))] to-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
              {t("products.productQuota")}
            </h3>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
              {getStatusText()}
            </p>
          </div>
        </div>
        {showRefresh && (
          <button
            onClick={refresh}
            className="p-1.5 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
            title={t("products.refreshQuota")}
          >
            <RefreshCw className="w-4 h-4 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]" />
          </button>
        )}
      </div>

      {/* Usage Stats */}
      <div className="space-y-3">
        {/* Progress Bar */}
        {!isUnlimited && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
                {t("products.usageProgress")}
              </span>
              <span className={`text-xs font-semibold ${getStatusColor()}`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-[rgb(var(--color-bg-tertiary))] rounded-full h-2.5 overflow-hidden">
              <div
                className={`${getProgressColor()} h-2.5 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Used */}
          <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 border border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[rgb(var(--color-text-secondary))]" />
              <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                {t("products.used")}
              </span>
            </div>
            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
              {isUnlimited ? "∞" : used}
            </p>
          </div>

          {/* Remaining */}
          <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 border border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center gap-1.5 mb-1">
              <Package className="w-3.5 h-3.5 text-[rgb(var(--color-text-secondary))]" />
              <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                {t("products.remaining")}
              </span>
            </div>
            <p
              className={`text-lg font-bold ${remaining === 0 ? "text-red-600 dark:text-red-400" : "text-[rgb(var(--color-text-primary))]"}`}
            >
              {isUnlimited ? "∞" : remaining}
            </p>
          </div>

          {/* Limit */}
          <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 border border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-[rgb(var(--color-text-secondary))]" />
              <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                {t("products.limit")}
              </span>
            </div>
            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
              {isUnlimited ? "∞" : limit}
            </p>
          </div>
        </div>

        {/* Usage Type Info */}
        {quota.usageType && quota.usageType !== "UNLIMITED" && (
          <div className="pt-2 border-t border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[rgb(var(--color-text-secondary))]">
                {t("products.usageType")}:
              </span>
              <span className="text-[rgb(var(--color-text-primary))] font-medium capitalize">
                {quota.usageType?.replace(/_/g, " ").toLowerCase()}
              </span>
            </div>
            {quota.dailyLimit && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("products.dailyLimit")}:
                </span>
                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                  {quota.dailyLimit}
                </span>
              </div>
            )}
            {quota.monthlyLimit && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("products.monthlyLimit")}:
                </span>
                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                  {quota.monthlyLimit} ({quota.monthlyUsed || 0}{" "}
                  {t("products.usedLabel")})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Warning Message */}
        {!isUnlimited && remaining === 0 && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400 text-center">
              {t("products.quotaExceededUpgrade")}
            </p>
          </div>
        )}
        {!isUnlimited && remaining > 0 && remaining <= 5 && (
          <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
              {t("products.onlyRemainingUpgrade", { remaining })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotaDisplay;
