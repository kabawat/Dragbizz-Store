"use client";
import { ManagePaymentSettingsView } from "@dragorbit/features/integrations";

import { CreditCard, Wallet } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
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
    <ManagePaymentSettingsView
      model={{
        PAYMENT_SUB_TABS,
        activeSubTab,
        t,
        handleSubTabChange,
        ManageUpiSettings,
        ManagePaymentGatewaySettings,
      }}
    />
  );
};

export default ManagePaymentSettings;
