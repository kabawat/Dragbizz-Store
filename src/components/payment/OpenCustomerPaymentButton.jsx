"use client";
import { OpenCustomerPaymentButtonPresentation } from "@dragorbit/features/payments";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { openCustomerPaymentScreen } from "@/utils/payment/openCustomerPaymentScreen";

const OpenCustomerPaymentButton = ({
  variant = "outline",
  size = "sm",
  className = "",
  showIcon = true,
}) => {
  const { t } = useTranslation();

  return (
    <OpenCustomerPaymentButtonPresentation
      model={{
        variant,
        size,
        className,
        showIcon,
        openCustomerPaymentScreen,
        t,
      }}
    />
  );
};

export default OpenCustomerPaymentButton;
