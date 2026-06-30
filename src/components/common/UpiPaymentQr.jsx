"use client";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useUpiQrImage } from "@/hooks/upi/useUpiQrImage";
import { formatUpiAmount } from "@/utils/upi/buildUpiPaymentUri";

const DEFAULT_LOGO_URL = "/icons/UPI.webp";

const UpiPaymentQr = ({
  upiId,
  payeeName,
  amount,
  logoUrl = DEFAULT_LOGO_URL,
  size = 160,
}) => {
  const { t } = useTranslation();
  const { displayUrl } = useUpiQrImage({ upiId, payeeName, amount, logoUrl });
  const formattedAmount = formatUpiAmount(amount);

  if (!upiId || !formattedAmount) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
        {t("pos.upiQr.scanToPay")}
      </p>
      <div className="bg-white p-2 rounded-xl border border-[rgb(var(--color-border-primary))]/50">
        <img
          src={displayUrl}
          alt="UPI QR Code"
          className="block"
          style={{ width: size, height: size }}
        />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-[rgb(var(--color-primary))] tabular-nums">
          {t("pos.upiQr.amount")}: ₹{formattedAmount}
        </p>
        <code className="text-xs text-[rgb(var(--color-text-secondary))] font-mono break-all">
          {upiId}
        </code>
      </div>
    </div>
  );
};

export default UpiPaymentQr;
