"use client";
import { ArrowLeft, CheckCircle, CreditCard, Edit, Plus, Printer, Settings } from "lucide-react";
import Link from "next/link";
import OpenCustomerPaymentButton from "@/components/payment/OpenCustomerPaymentButton";
import SendInvoicePaymentLinkButton from "@/components/payment/SendInvoicePaymentLinkButton";
import InvoiceShareMenu from "@/components/invoice/InvoiceShareMenu";
import { Button } from "@/components/ui";

const InvoiceViewHeader = ({
    invoiceData,
    invoiceId,
    storeId,
    showPaymentStatusModal,
    onUpdatePaymentStatus,
    onDownloadPDF,
    onEdit,
    onRelease,
    onPrint,
    canCreate,
    t,
}) => {
    return (
        <div className="mb-4 no-print flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
                href="/dashboard/invoices"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Invoices</span>
            </Link>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                <OpenCustomerPaymentButton className="h-9" />
                {invoiceData?.invoiceStatus === "DRAFT" && onEdit && (
                    <Button variant="outline" onClick={onEdit} leftIcon={Edit} className="h-9">
                        {t("invoices.editInvoice")}
                    </Button>
                )}
                {invoiceData?.invoiceStatus === "DRAFT" && onRelease && (
                    <Button variant="success" onClick={onRelease} leftIcon={CheckCircle} className="h-9">
                        {t("invoices.releaseInvoice")}
                    </Button>
                )}
                {invoiceData?.invoiceStatus !== "DRAFT" && (
                    <>
                        <Link href="/dashboard/invoices/print-preview">
                            <Button variant="outline" leftIcon={Settings} className="h-9">
                                {t("invoices.templateSettings")}
                            </Button>
                        </Link>
                        {onPrint && (
                            <Button variant="primary" onClick={onPrint} leftIcon={Printer} className="h-9">
                                {t("invoices.print")}
                            </Button>
                        )}
                    </>
                )}
                {invoiceData?.invoiceStatus === "RELEASED" && invoiceData?.paymentStatus !== "PAID" && (
                    <>
                        <SendInvoicePaymentLinkButton storeId={storeId} invoice={invoiceData} className="h-9" />
                        <Button
                            variant="outline"
                            onClick={onUpdatePaymentStatus}
                            leftIcon={CreditCard}
                            className="h-9"
                        >
                            {t("invoice.updatePaymentStatus")}
                        </Button>
                    </>
                )}
                {invoiceData?.invoiceStatus !== "DRAFT" && (
                    <InvoiceShareMenu
                        invoice={invoiceData}
                        onDownloadPDF={() => onDownloadPDF(invoiceData, invoiceId)}
                        t={t}
                    />
                )}
                {canCreate && (
                    <Link href="/dashboard/invoices/create">
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
