"use client";
import { GstHealthScoreWidgetView } from "@dragorbit/features/analytics";

import { Card } from "@/components/ui";
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
          <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
            {t("common.loading")}
          </p>
        </div>
      </Card>
    );
  }

  const score = healthScore?.score ?? 0;
  const breakdown = healthScore?.breakdown ?? {};
  const isGstSafe = score >= GST_SAFE_SCORE_THRESHOLD;

  return (
    <GstHealthScoreWidgetView
      model={{ t, isGstSafe, getScoreColor, score, breakdown }}
    />
  );
};

export default GstHealthScoreWidget;
