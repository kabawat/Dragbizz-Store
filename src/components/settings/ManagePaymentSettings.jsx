"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import ManageUpiSettings from "./ManageUpiSettings";
import { ManagePaymentGatewaySettings } from "./paymentGateway";

const PAYMENT_SUB_TABS = [
  { id: "upi", icon: Wallet },
  { id: "gateway", icon: CreditCard },
];

const ManagePaymentSettings = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSubTab = useMemo(() => {
    const sub = searchParams.get("sub");
    return sub === "gateway" ? "gateway" : "upi";
  }, [searchParams]);

  const handleSubTabChange = useCallback(
    (subId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tab");
      if (subId === "upi") {
        params.delete("sub");
      } else {
        params.set("sub", subId);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-[rgb(var(--color-border-primary))]/50 pb-1">
        {PAYMENT_SUB_TABS.map(({ id, icon: Icon }) => {
          const isActive = activeSubTab === id;
          const label =
            id === "upi"
              ? t("settings.paymentSubTabs.subTabUpi")
              : t("settings.paymentSubTabs.subTabGateway");
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSubTabChange(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                isActive
                  ? "text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))] -mb-[1px]"
                  : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {activeSubTab === "upi" ? <ManageUpiSettings /> : <ManagePaymentGatewaySettings />}
    </div>
  );
};

export default ManagePaymentSettings;
