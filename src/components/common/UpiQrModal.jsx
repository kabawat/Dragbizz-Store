"use client";
import React, { useEffect, useState } from "react";
import { Check, Copy, Download, Printer } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { copyToClipboard } from "@/utils/clipboard";
import { useGlobalToast } from "@/contexts/ToastContext";

const DEFAULT_LOGO_URL = "/icons/UPI.webp";
const QR_SIZE = 400;
const LOGO_RATIO = 0.22; // ~22% of QR - safe for ecc=H (30% recovery)

/**
 * Builds UPI payment URI for QR code.
 * Format: upi://pay?pa=UPI_ID&pn=PAYEE_NAME&cu=INR
 * Customer can enter amount when scanning.
 */
const buildUpiUri = (upiId, payeeName) => {
  const params = new URLSearchParams();
  params.set("pa", upiId.trim().toLowerCase());
  params.set("pn", (payeeName || "Merchant").replace(/[^a-zA-Z0-9\s.-]/g, "").trim() || "Merchant");
  params.set("cu", "INR");
  return `upi://pay?${params.toString()}`;
};

/**
 * Composes QR code with logo in center. Uses ecc=H (30% error correction) so QR remains scannable.
 */
const composeQrWithLogo = async (qrImageUrl, logoUrl = DEFAULT_LOGO_URL) => {
  const [qrImg, logoImg] = await Promise.all([
    loadImage(qrImageUrl),
    loadImage(logoUrl).catch(() => null),
  ]);

  const size = QR_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(qrImg, 0, 0, size, size);

  if (logoImg) {
    const logoSize = Math.floor(size * LOGO_RATIO);
    const padding = Math.floor(size * 0.04);
    const center = size / 2;
    const halfLogo = logoSize / 2 + padding;
    const x = center - halfLogo;
    const y = center - halfLogo;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, halfLogo * 2, halfLogo * 2);

    ctx.drawImage(logoImg, x + padding, y + padding, logoSize, logoSize);
  }

  return canvas.toDataURL("image/png");
};

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const COPIED_DURATION_MS = 2500;

const UpiQrModal = ({ isOpen, onClose, upiId, label, storeName, logoUrl }) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useGlobalToast();
  const [qrWithLogoUrl, setQrWithLogoUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const payeeName = storeName || label || "Merchant";
  const upiUri = upiId ? buildUpiUri(upiId, payeeName) : "";
  const qrCodeUrl = upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&ecc=H&data=${encodeURIComponent(upiUri)}`
    : "";

  useEffect(() => {
    if (!upiId || !qrCodeUrl) return;
    let cancelled = false;
    composeQrWithLogo(qrCodeUrl, logoUrl || DEFAULT_LOGO_URL)
      .then((url) => {
        if (!cancelled) setQrWithLogoUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrWithLogoUrl(qrCodeUrl);
      });
    return () => { cancelled = true; };
  }, [upiId, qrCodeUrl, logoUrl]);

  const displayUrl = qrWithLogoUrl || qrCodeUrl;

  if (!upiId) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(upiId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_DURATION_MS);
    }
  };

  const getBase64FromUrl = async (url) => {
    if (url.startsWith("data:")) return url;
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const imgData = await getBase64FromUrl(displayUrl);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.setFillColor(31, 41, 55);
      doc.rect(0, 0, 210, 45, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("DRAGBIZZ", 105, 25, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("YOUR DIGITAL BUSINESS PARTNER", 105, 33, { align: "center" });

      let y = 65;
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(payeeName, 105, y, { align: "center" });

      y += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);
      doc.text(upiId, 105, y, { align: "center" });

      y += 12;
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(50, y, 160, y);

      y += 15;
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(t("settings.upi.scanToPay").toUpperCase(), 105, y, { align: "center" });

      y += 12;
      doc.addImage(imgData, "PNG", 55, y, 100, 100);

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.text("Thank you for choosing DragBizz - Empowering Small Businesses", 105, 275, { align: "center" });
      doc.text("www.dragbizz.com", 105, 282, { align: "center" });

      doc.save(`upi-qr-${upiId.replace(/[@.]/g, "-")}.pdf`);
      showSuccess(t("settings.upi.qrDownloaded"));
    } catch (error) {
      console.error("PDF generation failed:", error);
      showError(t("settings.upi.qrDownloadFailed"));
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${t("settings.upi.upiQrCode")} - ${payeeName}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; text-align: center; }
            img { width: 280px; height: 280px; border: 1px solid #eee; padding: 12px; border-radius: 12px; }
            h1 { color: #1f2937; margin-bottom: 8px; font-size: 22px; }
            p { color: #4b5563; font-family: monospace; font-size: 14px; margin-top: 16px; }
            .hint { color: #6b7280; font-size: 12px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <h1>${payeeName}</h1>
          <p>${upiId}</p>
          <div class="hint">${t("settings.upi.scanToPay")}</div>
          <img src="${displayUrl}" alt="UPI QR Code" />
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("settings.upi.upiQrCode")} size="2xl">
      <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
        <div className="bg-white p-3 rounded-xl border border-[rgb(var(--color-border-primary))]/50 flex-shrink-0">
          <img
            src={displayUrl}
            alt="UPI QR Code"
            className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] block"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-4 text-center sm:text-left">
          {label && (
            <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
              {label}
            </p>
          )}
          <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-xl border border-[rgb(var(--color-border-primary))]/40">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[rgb(var(--color-text-tertiary))] block mb-1">
              {t("settings.upi.upiId")}
            </span>
            <code className="text-sm text-[rgb(var(--color-primary))] font-mono break-all">
              {upiId}
            </code>
          </div>

          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
            {t("settings.upi.scanToPay")}
          </p>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Button
              variant={copied ? "success" : "outline"}
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? Check : Copy}
              className={copied ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400" : ""}
            >
              {copied ? t("settings.upi.copied", "Copied") : t("common.copy")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              leftIcon={Download}
            >
              {t("common.download")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={Printer}
            >
              {t("common.print")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UpiQrModal;
