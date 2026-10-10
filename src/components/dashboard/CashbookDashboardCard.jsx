"use client";

import { CashbookSummaryCard } from "@dragorbit/features/dashboard";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { cashbookService } from "@/service/retailer/cashbook.service";

export function CashbookDashboardCard({ storeId }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { execute } = useApiResponse();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!storeId) return;
    let cancelled = false;
    execute(cashbookService.getAnalytics({ store: storeId }), {
      showToast: false,
    })
      .then((result) => {
        if (!cancelled) setAnalytics(result?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setAnalytics(null);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, execute]);

  if (!storeId || !analytics?.today) return null;

  return (
    <CashbookSummaryCard
      today={analytics.today}
      t={t}
      onClick={() => router.push("/dashboard/cashbook")}
    />
  );
}
