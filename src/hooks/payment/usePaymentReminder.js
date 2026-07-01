"use client";

import { useCallback, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { customerAccountService } from "@/service";

export function usePaymentReminder({ storeId }) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useGlobalToast();
  const { execute, loading } = useApiResponse();
  const [reminderLoading, setReminderLoading] = useState(false);

  const sendReminder = useCallback(
    async ({ customerId, notes, includePaymentLink = true }) => {
      if (!storeId || !customerId) return null;
      setReminderLoading(true);
      try {
        const response = await execute(
          customerAccountService.sendReminder(storeId, {
            customer: customerId,
            channel: "EMAIL",
            includePaymentLink,
            notes,
          }),
          { showToast: false },
        );
        showSuccess(t("khata.reminderSent"));
        return response?.data?.data ?? response?.data ?? null;
      } catch (error) {
        const message = error?.message || t("khata.reminderFailed");
        if (message.includes("cooldown") || message.includes("REMINDER_COOLDOWN")) {
          showError(t("khata.reminderCooldown"));
        } else if (message.includes("email") || message.includes("NO_CUSTOMER_EMAIL")) {
          showError(t("khata.noCustomerEmail"));
        } else {
          showError(message);
        }
        return null;
      } finally {
        setReminderLoading(false);
      }
    },
    [storeId, execute, showSuccess, showError, t],
  );

  return {
    sendReminder,
    loading: loading || reminderLoading,
  };
}

export default usePaymentReminder;
