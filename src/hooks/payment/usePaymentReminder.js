"use client";

import { useCallback, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { customerAccountService } from "@/service";

function mapReminderError(message, t) {
  if (message.includes("cooldown") || message.includes("REMINDER_COOLDOWN")) {
    return t("khata.reminderCooldown");
  }
  if (message.includes("email") || message.includes("NO_CUSTOMER_EMAIL")) {
    return t("khata.noCustomerEmail");
  }
  if (message.includes("NO_DUE_BALANCE") || message.includes("outstanding balance")) {
    return t("khata.noDueBalance") || message;
  }
  return message || t("khata.reminderFailed");
}

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
        const result = await execute(
          customerAccountService.sendReminder(storeId, {
            customer: customerId,
            channel: "EMAIL",
            includePaymentLink,
            notes,
          }),
          { showToast: false },
        );

        if (!result?.success) {
          showError(mapReminderError(result?.message, t));
          return null;
        }

        const reminder = result?.data;
        if (reminder?.status === "FAILED" || reminder?.status === "SKIPPED") {
          showError(reminder?.errorMessage || mapReminderError(result?.message, t));
          return null;
        }

        showSuccess(t("khata.reminderSent"));
        return reminder ?? null;
      } catch (error) {
        showError(mapReminderError(error?.message, t));
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
