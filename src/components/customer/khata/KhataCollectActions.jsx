"use client";

import { Bell, Link2, Loader2, QrCode } from "lucide-react";
import { useMemo, useState } from "react";
import { UpiQrModal } from "@/components/common";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useStoreDefaultUpi } from "@/hooks/store/useStoreDefaultUpi";
import { usePaymentCollect } from "@/hooks/payment/usePaymentCollect";
import { usePaymentReminder } from "@/hooks/payment/usePaymentReminder";
import { buildKhataUpiNote } from "@/utils/payment/paymentCollect.util";
import { useAppSelector } from "@/store/hooks";

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
  const storeName = selectedStore?.storeName || "";
  const collectAmount = Math.max(0, Number(amount) || 0);
  const canCollect = collectAmount > 0 && !disabled;
  const canRemind = Boolean(customerEmail?.trim());

  const { defaultUpi, isLoading: upiLoading, noUpiConfigured } = useStoreDefaultUpi(storeId, {
    enabled: Boolean(storeId),
  });
  const { createCollectLink, loading: linkLoading } = usePaymentCollect({ storeId });
  const { sendReminder, loading: reminderLoading } = usePaymentReminder({ storeId });

  const transactionNote = useMemo(() => buildKhataUpiNote(customerName), [customerName]);

  const handleSendPaymentLink = async () => {
    if (!canCollect || !customerId) return;
    await createCollectLink({
      customerId,
      amount: collectAmount,
      description: transactionNote,
    });
  };

  const handleSendReminder = async () => {
    if (!canCollect || !customerId || !canRemind) return;
    await sendReminder({
      customerId,
      notes: transactionNote,
      includePaymentLink: true,
    });
  };

  const buttonClass =
    "h-11 px-3 rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] text-sm font-medium text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] disabled:opacity-50 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition-colors w-full";

  const actions = (
    <>
      <button
        type="button"
        disabled={!canCollect || upiLoading || noUpiConfigured || !defaultUpi?.upiId}
        onClick={() => setUpiModalOpen(true)}
        className={buttonClass}
      >
        <QrCode className="h-4 w-4 shrink-0" />
        <span>{t("khata.showUpiQr")}</span>
      </button>
      <button
        type="button"
        disabled={!canCollect || linkLoading}
        onClick={handleSendPaymentLink}
        className={buttonClass}
      >
        {linkLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Link2 className="h-4 w-4 shrink-0" />}
        <span>{t("khata.paymentLink")}</span>
      </button>
      <button
        type="button"
        disabled={!canCollect || reminderLoading || !canRemind}
        title={!canRemind ? t("khata.noCustomerEmail") : undefined}
        onClick={handleSendReminder}
        className={`${buttonClass} border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10`}
      >
        {reminderLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Bell className="h-4 w-4 shrink-0" />}
        <span>{t("khata.remind")}</span>
      </button>
    </>
  );

  return (
    <>
      {variant === "embedded" ? (
        <div className="rounded-xl border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/30 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
              {t("khata.collectPayment")}
            </p>
            <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">
              {t("khata.collectPaymentHint")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{actions}</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-3">{actions}</div>
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
