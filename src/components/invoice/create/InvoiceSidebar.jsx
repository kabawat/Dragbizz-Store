"use client";
import React from "react";
import { ArrowLeft, Check, Plus, User, Receipt, Tag } from "lucide-react";
import { Button, Select } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { calculateInvoiceGST } from "@/utils/gstCalculator";

const InvoiceSidebar = ({
    t,
    router,
    formData,
    handleCustomerChange,
    customers,
    customersLoading,
    invoiceLoading,
    handleSubmit,
}) => {
    const themeVariant = useAppSelector((state) => state.theme.variant);

    // ── GST Calculation ──────────────────────────────────────────────
    const gstSummary = React.useMemo(() => {
        if (!formData.items || formData.items.length === 0) {
            return {
                subtotal: 0,
                gst: { total: 0, cgst: 0, sgst: 0, igst: 0, utgst: 0 },
                totalDiscount: 0,
                totalAmount: 0,
                netTaxable: 0,
            };
        }

        // Map items to gstCalculator format
        const mappedItems = formData.items.map((item) => ({
            price: item.price || 0,
            quantity: item.quantity || 1,
            gstRate: item.gstRate || item.gst?.rate || 0,
            isInclusive: item.isInclusive ?? item.gst?.isInclusive ?? false,
        }));

        return calculateInvoiceGST({
            items: mappedItems,
            totalDiscount: formData.totalDiscount || 0,
            discountMode: formData.discountMode || "PRE_TAX",
            supplierHasGst: true,
        });
    }, [formData.items, formData.totalDiscount, formData.discountMode]);

    const fmt = (num) => Number(num || 0).toFixed(2);

    const hasAnyGST = gstSummary.gst.total > 0;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto ps-3 min-h-0">
                <div className="space-y-4">

                    {/* ── Customer Information ── */}
                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {t("invoice.customerInformation")}
                        </h4>
                        <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("invoice.customer")}
                                <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                                    ({t("common.optional")} - defaults to walk-in)
                                </span>
                            </label>
                            <Select
                                value={formData.customer}
                                onChange={handleCustomerChange}
                                options={
                                    customersLoading
                                        ? [
                                            {
                                                value: "",
                                                label: t("invoice.loadingCustomers"),
                                            },
                                        ]
                                        : customers
                                }
                                disabled={customersLoading}
                                leftIcon={User}
                                size="sm"
                                searchable={true}
                                placeholder={t("invoice.searchCustomers")}
                            />
                        </div>
                    </div>

                    {/* ── Invoice Summary with GST Breakdown ── */}
                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                            <Receipt className="w-4 h-4 mr-2" />
                            {t("invoice.invoiceSummary")}
                        </h4>

                        <div className="space-y-2 text-sm">
                            {/* Gross Total (original MRP sum) */}
                            {gstSummary.originalTotal > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-secondary))]">
                                        {t("invoice.grossTotal") || "Gross Total"}:
                                    </span>
                                    <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                        ₹{fmt(gstSummary.originalTotal)}
                                    </span>
                                </div>
                            )}

                            {/* Discount */}
                            {(formData.totalDiscount > 0) && (
                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-secondary))] flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {t("invoice.discount")}:
                                    </span>
                                    <span className="font-medium text-green-500">
                                        - ₹{fmt(formData.totalDiscount)}
                                    </span>
                                </div>
                            )}

                            {/* Net Taxable */}
                            <div className="flex justify-between">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                    {t("invoice.netTaxable") || "Net Taxable"}:
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    ₹{fmt(gstSummary.subtotal)}
                                </span>
                            </div>

                            {/* Total GST — preview only, no breakdown */}
                            {hasAnyGST && (
                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-secondary))]">
                                        {t("invoice.totalGST") || "Total GST"}:
                                    </span>
                                    <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                        ₹{fmt(gstSummary.gst.total)}
                                    </span>
                                </div>
                            )}

                            {/* Grand Total */}
                            <div className="border-t border-[rgb(var(--color-border-primary))]/30 pt-2 mt-1">
                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                                        {t("invoice.total")}:
                                    </span>
                                    <span className="font-bold text-[rgb(var(--color-text-primary))] text-lg">
                                        ₹{fmt(gstSummary.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Item Count ── */}
                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                            {t("invoice.itemCount")}
                        </h4>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">
                                {formData.items.length}
                            </div>
                            <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                                {formData.items.length === 1
                                    ? t("invoice.item")
                                    : t("invoice.items")}
                            </div>
                        </div>
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <Button
                            variant="primary"
                            className="w-full md:flex-1"
                            onClick={handleSubmit}
                            loading={invoiceLoading}
                            leftIcon={Plus}
                            disabled={formData.items.length === 0}
                        >
                            {t("invoice.createInvoiceButton")}
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full md:flex-1"
                            onClick={() => router.push("/dashboard/invoices")}
                            disabled={invoiceLoading}
                        >
                            {t("common.cancel")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSidebar;
