"use client";
import { PaymentIntegrationsScreen } from "@dragorbit/features/integrations";

import ManagePaymentSettings from "@/components/settings/ManagePaymentSettings";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

const PaymentIntegrationsPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("sidebar.paymentGateway") || "Payment Gateway",
    t("settings.paymentGateway.manageDescription") ||
      "Manage UPI and payment gateway integrations",
  );

  return <PaymentIntegrationsScreen model={{ ManagePaymentSettings }} />;
};

export default PaymentIntegrationsPage;
