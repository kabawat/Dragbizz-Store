"use client";
import { SubscriptionNotice } from "@dragorbit/ui/app";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { redirectToMainDomain } from "@/utils/helper/domain";
export default function SubscriptionUpgradeModal(props) {
  const { t } = useTranslation();
  return (
    <SubscriptionNotice
      {...props}
      t={t}
      onUpgrade={() => redirectToMainDomain("/pricing")}
    />
  );
}
