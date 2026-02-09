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
    signatures,
    signaturesLoading,
    selectedSignature,
    setSelectedSignature,
    setShowSignatureDrawer,
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
            <div className="flex-1 overflow-y-auto ps-3 max-h-[calc(100vh-224px)]">
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

                    {/* Digital Signature Selection */}
                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2 rotate-[-45deg]" />
                            {t("invoice.digitalSignature") || "Digital Signature"}
                        </h4>
                        <div className="relative">
                            {signaturesLoading ? (
                                <div className="flex space-x-3 overflow-x-hidden">
                                    {[1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="flex-shrink-0 w-[calc(50%-6px)] h-20 bg-slate-100 animate-pulse rounded-xl"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                                    {/* Add New Signature Card */}
                                    <div
                                        onClick={() => setShowSignatureDrawer(true)}
                                        className="flex-shrink-0 w-[calc(50%-6px)] h-20 border-2 border-dashed border-[rgb(var(--color-border-primary))] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5 transition-all group snap-start"
                                    >
                                        <Plus className="w-5 h-5 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]" />
                                        <span className="text-[10px] font-medium mt-1 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]">
                                            {t("invoice.createSignature") || "Add New"}
                                        </span>
                                    </div>

                                    {/* Existing Signatures */}
                                    {signatures.map((sig) => (
                                        <div
                                            key={sig.id || sig._id}
                                            onClick={() => {
                                                const id = sig.id || sig._id;
                                                setSelectedSignature(selectedSignature === id ? "" : id);
                                            }}
                                            className={`flex-shrink-0 w-[calc(50%-6px)] h-20 border-2 rounded-xl flex items-center justify-center cursor-pointer transition-all relative overflow-hidden snap-start ${selectedSignature === (sig.id || sig._id)
                                                ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5 ring-1 ring-[rgb(var(--color-primary))]/20"
                                                : "border-[rgb(var(--color-border-primary))] bg-white hover:border-[rgb(var(--color-primary))]/50"
                                                }`}
                                        >
                                            <div className="relative w-full h-full p-2">
                                                <Image
                                                    src={sig.content}
                                                    alt="Signature"
                                                    fill
                                                    className={`object-contain ${themeVariant === 'dark' ? 'invert' : ''}`}
                                                />
                                            </div>
                                            {selectedSignature === (sig.id || sig._id) && (
                                                <div className="absolute top-1.5 right-1.5 bg-[rgb(var(--color-primary))] text-white rounded-full p-0.5">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!signaturesLoading && signatures.length === 0 && (
                                <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] mt-1 italic">
                                    {t("invoice.noSignaturesFound") ||
                                        "No signatures found. Add one to sign your invoices."}
                                </p>
                            )}
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
