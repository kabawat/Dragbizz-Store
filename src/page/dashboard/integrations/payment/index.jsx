"use client";

import ManagePaymentSettings from "@/components/settings/ManagePaymentSettings";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

const PaymentIntegrationsPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("sidebar.paymentGateway") || "Payment Gateway",
    t("settings.paymentGateway.manageDescription") || "Manage UPI and payment gateway integrations",
  );

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
      <div className="w-full h-full overflow-y-auto custom-scrollbar">
        <ManagePaymentSettings />
      </div>
    </div>
  );
};

export default PaymentIntegrationsPage;
