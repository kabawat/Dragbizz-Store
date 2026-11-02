"use client";

import { useCallback, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { paymentCollectService } from "@/service";
import { copyToClipboard } from "@/utils/clipboard";
import { resolvePaymentLinkUrl } from "@/utils/payment/paymentCollect.util";

export function usePaymentCollect({ storeId }) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useGlobalToast();
  const { execute, loading } = useApiResponse();
  const [linkLoading, setLinkLoading] = useState(false);

  const copyPaymentLink = useCallback(
    async (link) => {
      const url = resolvePaymentLinkUrl(link);
      if (!url) {
        showError(t("errors.generic"));
        return null;
      }
      const copied = await copyToClipboard(url);
      if (copied) {
        showSuccess(t("khata.paymentLinkCopied"));
      } else {
        showError(t("errors.generic"));
      }
      return url;
    },
    [showError, showSuccess, t],
  );

  const createCollectLink = useCallback(
    async ({ customerId, amount, notes, description, allocateToInvoices = false }) => {
      if (!storeId || !customerId) return null;
      setLinkLoading(true);
      try {
        const response = await execute(
          paymentCollectService.createCollectLink(storeId, {
            customer: customerId,
            amount,
            notes,
            description,
            allocateToInvoices,
          }),
          { showToast: false },
        );
        const link = response?.data?.data ?? response?.data ?? null;
        if (link) {
          showSuccess(t("khata.linkCreated"));
          await copyPaymentLink(link);
        }
        return link;
      } catch (error) {
        showError(error?.message || t("errors.generic"));
        return null;
      } finally {
        setLinkLoading(false);
      }
    },
    [storeId, execute, showSuccess, showError, copyPaymentLink, t],
  );

  const createInvoicePaymentLink = useCallback(
    async (invoiceId) => {
      if (!storeId || !invoiceId) return null;
      setLinkLoading(true);
      try {
        const response = await execute(
          paymentCollectService.createInvoicePaymentLink(storeId, invoiceId),
          { showToast: false },
        );
        const link = response?.data?.data ?? response?.data ?? null;
        if (link) {
          showSuccess(t("khata.linkCreated"));
          await copyPaymentLink(link);
        }
        return link;
      } catch (error) {
        showError(error?.message || t("errors.generic"));
        return null;
      } finally {
        setLinkLoading(false);
      }
    },
    [storeId, execute, showSuccess, showError, copyPaymentLink, t],
  );

  return {
    createCollectLink,
    createInvoicePaymentLink,
    copyPaymentLink,
    loading: loading || linkLoading,
  };
}

export default usePaymentCollect;
