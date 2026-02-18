"use client";
import React from "react";
import Image from "next/image";
import { ArrowLeft, Check, Plus, User } from "lucide-react";
import { Button, Select } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";

const InvoiceSidebar = ({
    t,
    router,
    formData,
    handleCustomerChange,
    customers,
    customersLoading,
    quotaExceeded,
    quotaLoading,
    invoiceLoading,
    handleSubmit,
}) => {
    const themeVariant = useAppSelector((state) => state.theme.variant);

    const calculateSubtotal = () => {
        return formData.items.reduce((total, item) => {
            return total + (item.total || 0);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return Math.max(0, subtotal - (formData.totalDiscount || 0));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto ps-3 min-h-0">
                <div className="space-y-4">
                    {/* Customer Information */}
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

                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                            {t("invoice.invoiceSummary")}
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                    {t("invoice.subtotal")}:
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    ₹{calculateSubtotal().toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                    {t("invoice.discount")}:
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    ₹{formData.totalDiscount || "0"}
                                </span>
                            </div>
                            <div className="border-t border-[rgb(var(--color-border-primary))]/30 pt-2">
                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                        {t("invoice.total")}:
                                    </span>
                                    <span className="font-bold text-[rgb(var(--color-text-primary))] text-lg">
                                        ₹{calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

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

                    {/* Quota exceeded warning message */}
                    {quotaExceeded && !quotaLoading && (
                        <div className="mb-3">
                            <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
                                ⚠️ {t("invoice.quotaExceeded")}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-3">
                        <Button
                            variant="primary"
                            className="w-full md:flex-1"
                            onClick={handleSubmit}
                            loading={invoiceLoading}
                            leftIcon={Plus}
                            disabled={
                                formData.items.length === 0 || quotaExceeded || quotaLoading
                            }
                            title={quotaExceeded ? t("invoice.quotaExceededMessage") : ""}
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
