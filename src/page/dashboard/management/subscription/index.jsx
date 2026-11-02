"use client";
import { SubscriptionScreen } from "@dragorbit/features/management";

import moment from "moment";

import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { redirectToMainDomain } from "@dragorbit/core/domain";

const SubscriptionManagementPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(t("subscription.title"), t("subscription.description"));
  const { subscription, isLoading, isKhataFree } = useSubscription();

  const planName = isKhataFree
    ? t("subscription.khataFree.title")
    : subscription?.packageId?.name || t("subscription.trialPlan");

  const onUpgrade = () => {
    redirectToMainDomain("/pricing");
  };
  return (
    <SubscriptionScreen
      model={{
        isLoading,
        subscription,
        onUpgrade,
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
