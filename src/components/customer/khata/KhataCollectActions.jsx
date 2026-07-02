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
    "h-10 px-4 rounded-xl border border-[rgb(var(--color-border-primary))] text-sm font-semibold text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] disabled:opacity-50 inline-flex items-center gap-2 transition-colors";

  const remindClass =
    "h-10 px-4 rounded-xl border border-amber-500/60 text-amber-600 dark:text-amber-400 text-sm font-semibold hover:bg-amber-500/10 disabled:opacity-50 inline-flex items-center gap-2 transition-colors";

  return (
    <>
      <div className={variant === "inline" ? "flex flex-wrap gap-2 pt-3" : "flex flex-wrap gap-2"}>
        <button
          type="button"
          disabled={!canCollect || upiLoading || noUpiConfigured || !defaultUpi?.upiId}
          onClick={() => setUpiModalOpen(true)}
          className={buttonClass}
        >
          <QrCode className="h-4 w-4" />
          {t("khata.showUpiQr")}
        </button>
        <button
          type="button"
          disabled={!canCollect || linkLoading}
          onClick={handleSendPaymentLink}
          className={buttonClass}
        >
          {linkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          {t("khata.paymentLink")}
        </button>
        <button
          type="button"
          disabled={!canCollect || reminderLoading || !canRemind}
          title={!canRemind ? t("khata.noCustomerEmail") : undefined}
          onClick={handleSendReminder}
          className={remindClass}
        >
          {reminderLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          {t("khata.remind")}
        </button>
      </div>

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
