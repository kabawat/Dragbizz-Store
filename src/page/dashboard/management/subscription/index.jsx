"use client";
import { redirectToMainDomain } from "@dragorbit/core/domain";
import { SubscriptionScreen } from "@dragorbit/features/management";
import moment from "moment";
import { useRouter } from "next/navigation";
import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SubscriptionManagementPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  useDashboardHeader(t("subscription.title"), t("subscription.description"));
  const { subscription, isLoading, isKhataFree } = useSubscription();

  const planName = isKhataFree
    ? t("subscription.khataFree.title")
    : subscription?.packageId?.name ||
      subscription?.planType ||
      (subscription?.amount ? "Premium Plan" : t("subscription.trialPlan"));

  const onUpgrade = () => {
    redirectToMainDomain("/pricing");
  };

  const onViewBillingHistory = () => {
    router.push("/dashboard/management/subscription/billing-history");
  };

  const onViewUsage = () => {
    router.push("/dashboard/management/limits");
  };

  return (
    <SubscriptionScreen
      model={{
        isLoading,
        subscription,
        onUpgrade,
        onViewBillingHistory,
        onViewUsage,
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
