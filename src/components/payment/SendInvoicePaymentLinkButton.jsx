"use client";

import { Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { usePaymentCollect } from "@/hooks/payment/usePaymentCollect";
import { canSendInvoicePaymentLink } from "@/utils/payment/paymentCollect.util";

const SendInvoicePaymentLinkButton = ({ storeId, invoice, className = "h-9" }) => {
  const { t } = useTranslation();
  const { createInvoicePaymentLink, loading } = usePaymentCollect({ storeId });
  const invoiceId = invoice?.id ?? invoice?._id;

  if (!canSendInvoicePaymentLink(invoice)) return null;

  return (
    <Button
      variant="outline"
      className={className}
      leftIcon={loading ? Loader2 : Link2}
      disabled={loading}
      onClick={() => createInvoicePaymentLink(invoiceId)}
    >
      {t("khata.sendPaymentLink")}
    </Button>
  );
};

export default SendInvoicePaymentLinkButton;
