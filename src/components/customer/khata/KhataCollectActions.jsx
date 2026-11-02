"use client";

import { Tooltip as SharedTooltip } from "@dragorbit/ui";
import { Bell, Link2, Loader2, QrCode } from "lucide-react";
import { useMemo, useState } from "react";
import { UpiQrModal } from "@/components/common";
import { usePaymentCollect } from "@/hooks/payment/usePaymentCollect";
import { usePaymentReminder } from "@/hooks/payment/usePaymentReminder";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";
import { useStoreDefaultUpi } from "@/hooks/store/useStoreDefaultUpi";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";
import { buildKhataUpiNote } from "@/utils/payment/paymentCollect.util";

const KhataCollectActions = ({
  storeId,
  customerId,
  customerName,
  customerEmail,
  amount,
  disabled = false,
  variant = "inline",
}) => {
  const { t } = useTranslation();
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { can } = useModulePermissions("customer");
  const { hasAccess, withAccess } = useSubscriptionAccess();
  const storeName = selectedStore?.storeName || "";
  const collectAmount = Math.max(0, Number(amount) || 0);
  const canCollect = collectAmount > 0 && !disabled;
  const canRemindByPlan = hasAccess("payment_reminder");
  const canRemindByPermission = can("create");
  const canRemind = Boolean(customerEmail?.trim()) && canRemindByPlan && canRemindByPermission && canCollect;

  const { defaultUpi, isLoading: upiLoading, noUpiConfigured } = useStoreDefaultUpi(storeId, {
    enabled: Boolean(storeId),
  });
  const { createCollectLink, loading: linkLoading } = usePaymentCollect({ storeId });
  const { sendReminder, loading: reminderLoading } = usePaymentReminder({ storeId });

  const transactionNote = useMemo(() => buildKhataUpiNote(customerName), [customerName]);

  const canShowQr = !disabled && Boolean(defaultUpi?.upiId) && !upiLoading;
  const qrDisabledReason = upiLoading
    ? "Loading UPI configuration..."
    : noUpiConfigured || !defaultUpi?.upiId
    ? "No default UPI ID configured for this store"
    : undefined;

  const linkDisabledReason = !canCollect
    ? "No outstanding due balance"
    : undefined;

  const remindDisabledReason = !customerEmail?.trim()
    ? t("khata.noCustomerEmail") || "Customer email is not provided"
    : !canRemindByPermission
    ? t("khata.reminderPermissionDenied") || "Permission denied"
    : !canRemindByPlan
    ? t("khata.reminderPlanRequired") || "Plan upgrade required"
    : !canCollect
    ? "No outstanding due balance"
    : undefined;

  const handleSendPaymentLink = async () => {
    if (!canCollect || !customerId) return;
    await createCollectLink({
      customerId,
      amount: collectAmount,
      description: transactionNote,
    });
  };

  const handleSendReminder = withAccess(
    "payment_reminder",
    async () => {
      if (!canCollect || !customerId || !customerEmail?.trim() || !canRemindByPermission) return;
      await sendReminder({
        customerId,
        notes: transactionNote,
        includePaymentLink: true,
      });
    },
  );

  const actions = (
    <>
      <SharedTooltip content={qrDisabledReason}>
        <button
          type="button"
          disabled={!canShowQr}
          onClick={() => setUpiModalOpen(true)}
          className="h-11 px-4 rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 text-sm font-semibold transition-all w-full"
        >
          <QrCode className="h-4 w-4 shrink-0" />
          <span>{t("khata.showUpiQr") || "Show UPI QR"}</span>
        </button>
      </SharedTooltip>

      <SharedTooltip content={linkDisabledReason}>
        <button
          type="button"
          disabled={!canCollect || linkLoading}
          onClick={handleSendPaymentLink}
          className="h-11 px-4 rounded-xl border border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 text-sm font-semibold transition-all w-full"
        >
          {linkLoading ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <Link2 className="h-4 w-4 shrink-0" />
          )}
          <span>{t("khata.paymentLink") || "Payment Link"}</span>
        </button>
      </SharedTooltip>

      <SharedTooltip content={remindDisabledReason}>
        <button
          type="button"
          disabled={!canRemind || reminderLoading}
          onClick={handleSendReminder}
          className="h-11 px-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 text-sm font-semibold transition-all w-full"
        >
          {reminderLoading ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <Bell className="h-4 w-4 shrink-0" />
          )}
          <span>{t("khata.remind") || "Send Reminder"}</span>
        </button>
      </SharedTooltip>
    </>
  );

  return (
    <>
      {variant === "embedded" ? (
        <div className="rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                  {t("khata.collectPayment") || "Collect Payment"}
                </p>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                  {t("khata.collectPaymentHint") || "UPI QR & payment links"}
                </p>
              </div>
            </div>
            {collectAmount > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Due: ₹{collectAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2.5">{actions}</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5 pt-3">{actions}</div>
      )}

      <UpiQrModal
        isOpen={upiModalOpen}
        onClose={() => setUpiModalOpen(false)}
        upiId={defaultUpi?.upiId}
        label={customerName}
        storeName={storeName || defaultUpi?.label}
        amount={collectAmount}
        transactionNote={transactionNote}
      />
    </>
  );
};

export default KhataCollectActions;
