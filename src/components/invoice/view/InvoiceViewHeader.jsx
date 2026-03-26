"use client";
import { ArrowLeft, Download, Plus, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";

const InvoiceViewHeader = ({
    invoiceData,
    invoiceId,
    showPaymentStatusModal,
    onUpdatePaymentStatus,
    onDownloadPDF,
    canCreate,
    t,
}) => {
    return (
        <div className="mb-4 no-print flex items-center justify-between">
            <Link
                href="/dashboard/invoices"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Invoices</span>
            </Link>
            <div className="flex items-center gap-3">
                {invoiceData?.invoiceStatus === "RELEASED" && invoiceData?.paymentStatus !== "PAID" && (
                    <Button
                        variant="outline"
                        onClick={onUpdatePaymentStatus}
                        leftIcon={CreditCard}
                        className="h-9"
                    >
                        {t("invoice.updatePaymentStatus")}
                    </Button>
                )}
                {invoiceData?.invoiceStatus !== "DRAFT" && (
                    <Button
                        variant="outline"
                        onClick={() => onDownloadPDF(invoiceData, invoiceId)}
                        leftIcon={Download}
                        className="h-9"
                    >
                        {t("invoice.downloadPDF")}
                    </Button>
                )}
                {canCreate && (
                    <Link href="/dashboard/invoices/add">
                        <Button variant="primary" leftIcon={Plus} className="h-9">
                            {t("invoice.createNewInvoice") || "Create New Invoice"}
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default InvoiceViewHeader;
