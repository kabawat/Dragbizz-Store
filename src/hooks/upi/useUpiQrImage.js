import { useEffect, useMemo, useState } from "react";
import { buildUpiPaymentUri } from "@/utils/upi/buildUpiPaymentUri";
import { composeQrWithLogo, getQrCodeServiceUrl } from "@/utils/upi/upiQrImage";

export function useUpiQrImage({ upiId, payeeName, amount, logoUrl, transactionNote }) {
  const [qrWithLogoUrl, setQrWithLogoUrl] = useState(null);

  const upiUri = useMemo(() => {
    if (!upiId) return "";
    return buildUpiPaymentUri(upiId, payeeName, { amount, transactionNote });
  }, [upiId, payeeName, amount, transactionNote]);

  const qrCodeUrl = upiUri ? getQrCodeServiceUrl(upiUri) : "";

  useEffect(() => {
    if (!upiId || !qrCodeUrl) {
      setQrWithLogoUrl(null);
      return undefined;
    }

    let cancelled = false;
    composeQrWithLogo(qrCodeUrl, logoUrl)
      .then((url) => {
        if (!cancelled) setQrWithLogoUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrWithLogoUrl(qrCodeUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [upiId, qrCodeUrl, logoUrl]);

  return {
    upiUri,
    displayUrl: qrWithLogoUrl || qrCodeUrl,
  };
}
