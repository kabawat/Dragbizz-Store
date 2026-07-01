"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import CollectPaymentPreloader from "@/components/payment/CollectPaymentPreloader";
import InvoicePaymentPanel from "@/components/payment/InvoicePaymentPanel";
import { Button } from "@/components/ui";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import useInvoiceCollectPayment from "@/hooks/payment/useInvoiceCollectPayment";

const CollectPaymentPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.invoiceId;
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "create";
  const [preloaderStep, setPreloaderStep] = useState(0);

  useDashboardHeader(t("invoice.collectPayment.pageTitle"), t("invoice.collectPayment.pageDescription"));

  const { can, loading: permissionLoading } = useModulePermissions("invoice");
  const canCreate = can("create");

  useEffect(() => {
    if (!permissionLoading && !canCreate) {
      router.replace("/dashboard/invoices");
    }
  }, [canCreate, permissionLoading, router]);

  const {
    invoice,
    invoiceNumber,
    grandTotal,
    customerName,
    storeName,
    pageState,
    fetching,
    isProcessing,
    defaultUpi,
    upiLoading,
    missingDefault,
    noUpiConfigured,
    onlineGatewayAvailable,
    handleManualRelease,
    handleOnlinePay,
    handleUnpaidRelease,
    loadInvoice,
  } = useInvoiceCollectPayment({ invoiceId, source });

  useEffect(() => {
    if (pageState !== "loading") return;
    const timers = [
      setTimeout(() => setPreloaderStep(1), 300),
      setTimeout(() => setPreloaderStep(2), 600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [pageState]);

  const handleBack = () => {
    if (source === "pos") {
      router.push("/dashboard/pos");
      return;
    }
    if (invoiceId) {
      router.push(`/dashboard/invoices/${invoiceId}`);
      return;
    }
    router.push("/dashboard/invoices");
  };

  if (permissionLoading || !canCreate) {
    return null;
  }

  if (pageState === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
          {t("invoice.collectPayment.success")}
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          {t("invoice.collectPayment.redirecting")}
        </p>
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <p className="text-[rgb(var(--color-text-secondary))] mb-4">
          {t("invoice.collectPayment.loadError")}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBack}>
            {t("common.back")}
          </Button>
          <Button variant="primary" onClick={loadInvoice}>
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const showPreloader = pageState === "loading" || (fetching && !invoice);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link
        href={source === "pos" ? "/dashboard/pos" : "/dashboard/invoices"}
        className="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("common.back")}
      </Link>

      {showPreloader ? (
        <CollectPaymentPreloader
          invoiceNumber={invoiceNumber}
          grandTotal={grandTotal}
          step={preloaderStep}
        />
      ) : (
        <InvoicePaymentPanel
          invoiceNumber={invoiceNumber}
          grandTotal={grandTotal}
          customerName={customerName}
          loading={isProcessing}
          defaultUpi={defaultUpi}
          storeName={storeName}
          upiLoading={upiLoading}
          missingDefault={missingDefault}
          noUpiConfigured={noUpiConfigured}
          onlineGatewayAvailable={onlineGatewayAvailable}
          onConfirm={handleManualRelease}
          onOnlinePay={handleOnlinePay}
          onBack={handleBack}
        />
      )}

      {!showPreloader && pageState === "ready" && (
        <div className="max-w-lg mx-auto mt-4 text-center">
          <button
            type="button"
            onClick={handleUnpaidRelease}
            disabled={isProcessing}
            className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] underline underline-offset-2 disabled:opacity-50"
          >
            {t("invoice.collectPayment.releaseUnpaid")}
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectPaymentPage;
