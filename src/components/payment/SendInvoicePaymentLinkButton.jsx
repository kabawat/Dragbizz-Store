"use client";

import { Link2, Loader2 } from "lucide-react";
import { memo, useCallback } from "react";
import { Button } from "@/components/ui";
import { usePaymentCollect } from "@/hooks/payment/usePaymentCollect";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { canSendInvoicePaymentLink } from "@/utils/payment/paymentCollect.util";

const SendInvoicePaymentLinkButton = ({
  storeId,
  invoice,
  className = "h-9",
}) => {
  const { t } = useTranslation();
  const { createInvoicePaymentLink, loading } = usePaymentCollect({ storeId });
  const invoiceId = invoice?.id ?? invoice?._id;

  const handleClick = useCallback(() => {
    if (invoiceId) createInvoicePaymentLink(invoiceId);
  }, [createInvoicePaymentLink, invoiceId]);

  if (!canSendInvoicePaymentLink(invoice)) return null;

  return (
    <Button
      variant="outline"
      className={className}
      leftIcon={loading ? Loader2 : Link2}
      disabled={loading}
      onClick={handleClick}
    >
      {t("khata.sendPaymentLink")}
    </Button>
  );
};

export default memo(SendInvoicePaymentLinkButton);
