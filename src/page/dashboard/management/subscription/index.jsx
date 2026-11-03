"use client";
import { SubscriptionScreen } from "@dragorbit/features/management";

import moment from "moment";

import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useRouter } from "next/navigation";
import { redirectToMainDomain } from "@dragorbit/core/domain";

const SubscriptionManagementPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  useDashboardHeader(t("subscription.title"), t("subscription.description"));
  const { subscription, isLoading, isKhataFree } = useSubscription();

  const planName = isKhataFree
    ? t("subscription.khataFree.title")
    : subscription?.packageId?.name || t("subscription.trialPlan");

  const onUpgrade = () => {
    redirectToMainDomain("/pricing");
  };

  const onViewBillingHistory = () => {
    router.push("/dashboard/management/subscription/billing-history");
  };

  return (
    <SubscriptionScreen
      model={{
        isLoading,
        subscription,
        onUpgrade,
        onViewBillingHistory,
        t,
        planName,
        isKhataFree,
        moment,
        ManagementShortcuts,
      }}
    />
  );
};

export default SubscriptionManagementPage;
