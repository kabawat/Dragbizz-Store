import { useEffect, useMemo, useState } from "react";
import { buildUpiPaymentUri } from "./buildUpiPaymentUri";
import { composeQrWithLogo, getQrCodeServiceUrl } from "./upiQrImage";

export function useUpiQrImage({ upiId, payeeName, amount, logoUrl }) {
  const [qrWithLogoUrl, setQrWithLogoUrl] = useState(null);

  const upiUri = useMemo(() => {
    if (!upiId) return "";
    return buildUpiPaymentUri(upiId, payeeName, { amount });
  }, [upiId, payeeName, amount]);

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
