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
}) => {
  const { t } = useTranslation();
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeName = selectedStore?.storeName || "";
  const collectAmount = Math.max(0, Number(amount) || 0);
  const canCollect = collectAmount > 0 && !disabled;

  const { defaultUpi, isLoading: upiLoading, noUpiConfigured } = useStoreDefaultUpi(storeId, {
    enabled: canCollect,
  });
  const { createCollectLink, loading: linkLoading } = usePaymentCollect({ storeId });
  const { sendReminder, loading: reminderLoading } = usePaymentReminder({ storeId });

  const transactionNote = useMemo(() => buildKhataUpiNote(customerName), [customerName]);
  const canRemind = Boolean(customerEmail?.trim());

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

  if (!canCollect) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={upiLoading || noUpiConfigured || !defaultUpi?.upiId}
          onClick={() => setUpiModalOpen(true)}
          className="h-10 px-4 rounded-xl border border-[rgb(var(--color-border-primary))] text-sm font-semibold text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] disabled:opacity-50 inline-flex items-center gap-2"
        >
          <QrCode className="h-4 w-4" />
          {t("khata.showUpiQr")}
        </button>
        <button
          type="button"
          disabled={linkLoading}
          onClick={handleSendPaymentLink}
          className="h-10 px-4 rounded-xl bg-[rgb(var(--color-primary))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {linkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          {t("khata.sendPaymentLink")}
        </button>
        <button
          type="button"
          disabled={reminderLoading || !canRemind}
          title={!canRemind ? t("khata.noCustomerEmail") : undefined}
          onClick={handleSendReminder}
          className="h-10 px-4 rounded-xl border border-amber-500 text-amber-700 text-sm font-semibold hover:bg-amber-50 disabled:opacity-50 inline-flex items-center gap-2"
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
