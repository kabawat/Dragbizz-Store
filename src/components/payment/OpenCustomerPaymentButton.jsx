"use client";

import { Monitor } from "lucide-react";
import { Button } from "@/components/ui";
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
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      leftIcon={showIcon ? Monitor : undefined}
      onClick={openCustomerPaymentScreen}
    >
      {t("invoice.customerPayment.openDisplay")}
    </Button>
  );
};

export default OpenCustomerPaymentButton;
