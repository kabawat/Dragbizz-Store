"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { cashbookService } from "@/service/retailer/cashbook.service";
import useApiResponse from "@/hooks/useApiResponse";

export function CashbookDashboardCard({ storeId }) {
  const { t } = useTranslation();
  const { execute } = useApiResponse();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!storeId) return;
    let cancelled = false;
    execute(cashbookService.getAnalytics({ store: storeId }), { showToast: false })
      .then((result) => {
        if (!cancelled) setAnalytics(result?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setAnalytics(null);
      });
    return () => { cancelled = true; };
  }, [storeId, execute]);

  if (!storeId || !analytics?.today) return null;

  const { cashIn = 0, cashOut = 0, closingBalance = 0 } = analytics.today;

  return (
    <Link
      href="/dashboard/cashbook"
      className="block rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-4 hover:border-[rgb(var(--color-border-secondary))] transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="h-5 w-5 text-[rgb(var(--color-text-secondary))]" />
        <h3 className="font-semibold">{t("dashboard.cashbookToday")}</h3>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-[rgb(var(--color-text-secondary))]">{t("cashbook.cashIn")}</p>
          <p className="font-semibold text-green-600">₹{cashIn.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[rgb(var(--color-text-secondary))]">{t("cashbook.cashOut")}</p>
          <p className="font-semibold text-red-600">₹{cashOut.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[rgb(var(--color-text-secondary))]">{t("cashbook.closingBalance")}</p>
          <p className="font-semibold">₹{closingBalance.toLocaleString("en-IN")}</p>
        </div>
      </div>
    </Link>
  );
}
