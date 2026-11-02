"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Math.abs(Number(amount) || 0));
}

export function KhataDueBadge({ totalDue = 0, className = "" }) {
  const { t } = useTranslation();
  const amount = Number(totalDue) || 0;
  if (amount === 0) return null;

  if (amount < 0) {
    return (
      <Badge variant="success" size="sm" className={`tabular-nums ${className}`}>
        {t("khata.advanceBadge", { amount: formatAmount(amount) })}
      </Badge>
    );
  }

  return (
    <Badge variant="warning" size="sm" className={`tabular-nums ${className}`}>
      {t("khata.dueBadge", { amount: formatAmount(amount) })}
    </Badge>
  );
}

export default KhataDueBadge;
