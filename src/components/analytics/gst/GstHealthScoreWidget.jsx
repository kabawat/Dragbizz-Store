"use client";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui";

const getScoreColor = (score) => {
  if (score >= 80) return "text-[rgb(var(--color-success))]";
  if (score >= 60) return "text-[rgb(var(--color-warning))]";
  return "text-[rgb(var(--color-danger))]";
};

const GstHealthScoreWidget = ({ healthScore, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="border-[var(--color-border-primary-light)]">
        <div className="p-6">
          <p className="text-sm text-[rgb(var(--color-text-tertiary))]">Loading health score...</p>
        </div>
      </Card>
    );
  }

  const score = healthScore?.score ?? 0;
  const breakdown = healthScore?.breakdown ?? {};

  return (
    <Card className="border-[var(--color-border-primary-light)]">
      <div className="p-4">
        <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[rgb(var(--color-primary))]" />
          GST Health Score
        </h3>
        <div className="flex items-center gap-4">
          <div
            className={`text-4xl font-bold ${getScoreColor(score)}`}
            aria-label={`GST health score: ${score} out of 100`}
          >
            {score}
          </div>
          <span className="text-sm text-[rgb(var(--color-text-tertiary))]">/ 100</span>
        </div>
        {breakdown.hsnCoveragePercent !== undefined && (
          <div className="mt-4 space-y-1 text-xs text-[rgb(var(--color-text-secondary))]">
            <p>HSN coverage: {breakdown.hsnCoveragePercent}%</p>
            <p>Mismatches: {breakdown.mismatchCount ?? 0}</p>
            <p>Period coverage: {breakdown.periodCoveragePercent}%</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GstHealthScoreWidget;
