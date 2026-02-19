"use client";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useUsageQuota } from "@/hooks/ui/useUsageQuota";

const QuotaProgressBar = ({
  featureKey = "product_management",
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

  if (isLoading || error || !quota) {
    return null; // Don't show anything if loading or error
  }

  // Handle unlimited quota
  const isUnlimited = quota.remaining === -1 || quota.limit === -1;
  const used = quota.used || 0;
  const limit = quota.limit || 0;
  const _remaining = quota.remaining || 0;
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

  // Get feature name based on featureKey
  const getFeatureName = () => {
    const featureNames = {
      product_management: t("products.productQuotaLabel"),
      invoice_management: t("products.invoiceQuota"),
      customer_management: t("products.customerQuota"),
      stock_management: t("products.stockQuota"),
      inventory_management: t("products.inventoryQuota"),
      expense_management: t("products.expenseQuota"),
    };
    return featureNames[featureKey] || t("products.productQuotaLabel");
  };

  // Get usage type label
  const getUsageTypeLabel = () => {
    if (isUnlimited) return "";
    const usageType = quota.usageType || "";
    if (usageType === "DAILY_FIXED" || usageType === "DAILY_ROLLING")
      return t("products.daily");
    if (usageType === "MONTHLY_TOTAL") return t("products.monthly");
    return "";
  };

  const featureName = getFeatureName();
  const usageTypeLabel = getUsageTypeLabel();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))] whitespace-nowrap">
        {usageTypeLabel ? `${featureName} ${usageTypeLabel}` : `${featureName}`}
      </span>
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="flex-1 bg-[rgb(var(--color-bg-tertiary))] rounded-full h-2 overflow-hidden">
          <div
            className={`${getProgressColor()} h-2 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] whitespace-nowrap">
          {isUnlimited ? "∞" : `${used}/${limit}`}
        </span>
      </div>
    </div>
  );
};

export default QuotaProgressBar;
