"use client";

import { Activity, ShieldCheck } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const GST_SAFE_SCORE_THRESHOLD = 80;

const getScoreColor = (score) => {
  if (score >= 80) return "text-[rgb(var(--color-success))]";
  if (score >= 60) return "text-[rgb(var(--color-warning))]";
  return "text-[rgb(var(--color-danger))]";
};

const GstHealthScoreWidget = ({ healthScore, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="border-[var(--color-border-primary-light)]">
        <div className="p-6">
          <p className="text-sm text-[rgb(var(--color-text-tertiary))]">{t("common.loading")}</p>
        </div>
      </Card>
    );
  }

  const score = healthScore?.score ?? 0;
  const breakdown = healthScore?.breakdown ?? {};
  const isGstSafe = score >= GST_SAFE_SCORE_THRESHOLD;

  return (
    <Card className="border-[var(--color-border-primary-light)]">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] flex items-center gap-2">
            <Activity className="h-4 w-4 text-[rgb(var(--color-primary))]" />
            {t("gst.gstHealthScore")}
          </h3>
          {isGstSafe ? (
            <Badge variant="success" className="flex items-center gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" />
              {t("gst.gstSafeShopBadge")}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`text-4xl font-bold ${getScoreColor(score)}`}
            aria-label={`GST health score: ${score} out of 100`}
          >
            {score}
          </div>
          <span className="text-sm text-[rgb(var(--color-text-tertiary))]">/ 100</span>
        </div>
        {isGstSafe ? (
          <p className="mt-2 text-xs text-[rgb(var(--color-text-secondary))]">
            {t("gst.gstSafeShopHint")}
          </p>
        ) : null}
        {breakdown.hsnCoveragePercent !== undefined && (
          <div className="mt-4 space-y-1 text-xs text-[rgb(var(--color-text-secondary))]">
            <p>{t("gst.hsnCoverage")}: {breakdown.hsnCoveragePercent}%</p>
            <p>{t("gst.mismatchCount")}: {breakdown.mismatchCount ?? 0}</p>
            <p>{t("gst.periodCoverage")}: {breakdown.periodCoveragePercent}%</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GstHealthScoreWidget;
