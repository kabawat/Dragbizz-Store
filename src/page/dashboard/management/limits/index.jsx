"use client";
import { PlanLimitsScreen } from "@dragorbit/features/management";

import React from "react";
import {
  Activity,
  Users,
  FileText,
  ShoppingBag,
  Store,
  Package,
  Zap,
} from "lucide-react";

import { useSubscription } from "@/contexts/SubscriptionContext";
import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useRouter } from "next/navigation";
import { redirectToMainDomain } from "@dragorbit/core/domain";

const UsageLimitsPage = () => {
  const { t } = useTranslation();
  const [selectedFeature, setSelectedFeature] = React.useState(null);

  useDashboardHeader(t("limits.title"), t("limits.description"));
  const router = useRouter();
  const {
    isLoading,
    subscription: subscriptionData,
    isKhataFree,
  } = useSubscription();
  const KHATA_FIRST_ORDER = [
    "customer",
    "payment_reminder",
    "cashbook",
    "invoice",
    "product",
    "store",
  ];
  const MODULE_CONFIG = {
    customer: {
      name: t("limits.modules.customer"),
      icon: Users,
      color: "#6366f1",
    },
    payment_reminder: {
      name: t("limits.modules.payment_reminder") || "Payment Reminders",
      icon: Zap,
      color: "#22c55e",
    },
    cashbook: {
      name: t("limits.modules.cashbook") || "Cashbook",
      icon: Zap,
      color: "#0ea5e9",
    },
    invoice: {
      name: t("limits.modules.invoice"),
      icon: FileText,
      color: "#f59e0b",
    },
    billing: {
      name: t("limits.modules.billing"),
      icon: Activity,
      color: "#3b82f6",
    },
    product: {
      name: t("limits.modules.product"),
      icon: Package,
      color: "#10b981",
    },
    supplier: {
      name: t("limits.modules.supplier"),
      icon: Store,
      color: "#8b5cf6",
    },
    purchase_order: {
      name: t("limits.modules.purchase_order"),
      icon: ShoppingBag,
      color: "#ec4899",
    },
    expense: { name: t("limits.modules.expense"), icon: Zap, color: "#f43f5e" },
  };

  const features = [...(subscriptionData?.features || [])].sort((a, b) => {
    const ai = KHATA_FIRST_ORDER.indexOf(a.module);
    const bi = KHATA_FIRST_ORDER.indexOf(b.module);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const stats = features.map((feature) => {
    const config = MODULE_CONFIG[feature.module] || {
      name: feature.module,
      icon: Activity,
      color: "#888888",
    };
    return {
      name: config.name,
      icon: config.icon,
      limit:
        feature.usageType === "UNLIMITED"
          ? Infinity
          : (feature.maxLimit ?? Infinity),
      used: feature.currentUsage ?? 0,
      color: config.color,
      usageType: feature.usageType,
      hasAnalytics: feature.analytics,
    };
  });

  const onUpgrade = () => {
    redirectToMainDomain("/pricing");
  };
  return (
    <PlanLimitsScreen
      model={{
        t,
        isKhataFree,
        isLoading,
        subscriptionData,
        onUpgrade,
        stats,
        setSelectedFeature,
        ManagementShortcuts,
        selectedFeature,
      }}
    />
  );
};

export default UsageLimitsPage;
