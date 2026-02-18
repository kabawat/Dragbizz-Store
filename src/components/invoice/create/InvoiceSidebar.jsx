import React from "react";
import { Plus, User } from "lucide-react";
import { Button, Select } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { calculateGst } from "@/utils/gstCalculator";

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
    const { selectedStore } = useAppSelector((state) => state.profile);
    const { customers: allCustomersData } = useAppSelector((state) => state.customers);

    // 1. Prepare Data for Calculator with Discount Apportionment
    const currentCustomer = allCustomersData.find(c => c._id === formData.customer) || {};
    let remainingDiscount = Number(formData.totalDiscount) || 0;

    const calculationItems = formData.items.map(item => {
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.gstRate) || 0;
        const price = Number(item.price) || 0;
        const isInclusive = !!item.isInclusive;

        // Determine taxable value to apportion discount correctly
        let unitTaxablePrice = price;
        if (isInclusive && rate > 0) {
            unitTaxablePrice = price / (1 + (rate / 100));
        }
        const itemTaxableValue = unitTaxablePrice * qty;

        const itemDiscountToApply = Math.min(remainingDiscount, itemTaxableValue);
        remainingDiscount -= itemDiscountToApply;

        return {
            ...item,
            gstRate: rate,
            isInclusive: isInclusive,
            discountValue: itemDiscountToApply
        };
    });

    // Calculate gross subtotal for display
    const grossTaxableValue = formData.items.reduce((acc, item) => {
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.gstRate) || 0;
        const price = Number(item.price) || 0;
        const isInclusive = !!item.isInclusive;
        let unitTaxable = price;
        if (isInclusive && rate > 0) {
            unitTaxable = price / (1 + (rate / 100));
        }
        return acc + (unitTaxable * qty);
    }, 0);

    // Fallback logic for state codes
    const storeState = selectedStore?.address?.state || selectedStore?.state || "";
    const customerState = currentCustomer?.address?.state || currentCustomer?.state || storeState;

    const calculation = calculateGst({
        items: calculationItems,
        supplier: {
            stateCode: storeState,
            hasGst: !!(selectedStore?.gstNumber || selectedStore?.gstInfo?.gstNumber),
            isUnionTerritory: false
        },
        buyer: {
            stateCode: customerState,
            hasGst: !!currentCustomer?.gstNumber,
            isUnionTerritory: false
        },
        isRcmApplicable: false
    });

    const finalTotal = calculation.totalAmount;

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
                            {currentCustomer?.gstNumber && (
                                <div className="mt-2 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-600 font-medium">
                                    B2B: {currentCustomer.gstNumber}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                            {t("invoice.invoiceSummary")}
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                    {t("invoice.grossTaxable")}:
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    ₹{grossTaxableValue.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between text-orange-500">
                                <span className="">
                                    {t("invoice.discount")}:
                                </span>
                                <span className="font-medium">
                                    - ₹{(Number(formData.totalDiscount) || 0).toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between border-b border-dashed border-[rgb(var(--color-border-primary))]/30 pb-2">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                    {t("invoice.netTaxable")}:
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    ₹{calculation.subtotal.toFixed(2)}
                                </span>
                            </div>

                            {/* Detailed GST Breakdown */}
                            {calculation.gst.cgst > 0 && (
                                <div className="flex justify-between text-[11px] italic">
                                    <span className="text-[rgb(var(--color-text-tertiary))]">CGST:</span>
                                    <span className="text-[rgb(var(--color-text-secondary))]">₹{calculation.gst.cgst.toFixed(2)}</span>
                                </div>
                            )}
                            {calculation.gst.sgst > 0 && (
                                <div className="flex justify-between text-[11px] italic">
                                    <span className="text-[rgb(var(--color-text-tertiary))]">SGST:</span>
                                    <span className="text-[rgb(var(--color-text-secondary))]">₹{calculation.gst.sgst.toFixed(2)}</span>
                                </div>
                            )}
                            {calculation.gst.igst > 0 && (
                                <div className="flex justify-between text-[11px] italic">
                                    <span className="text-[rgb(var(--color-text-tertiary))]">IGST:</span>
                                    <span className="text-[rgb(var(--color-text-secondary))]">₹{calculation.gst.igst.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                    {t("invoice.totalGst")}:
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    + ₹{calculation.gst.total.toFixed(2)}
                                </span>
                            </div>

                            <div className="border-t border-[rgb(var(--color-border-primary))]/30 pt-2">
                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                        {t("invoice.payableAmount")}:
                                    </span>
                                    <span className="font-bold text-[rgb(var(--color-text-primary))] text-lg">
                                        ₹{finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30 text-center">
                        <h4 className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 uppercase tracking-wider">
                            {t("invoice.itemCount")}
                        </h4>
                        <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">
                            {formData.items.length}
                        </div>
                    </div>

                    <div className="flex justify-start pt-2">
                        <Button
                            variant="primary"
                            className="px-8 min-w-[180px]"
                            onClick={handleSubmit}
                            loading={invoiceLoading}
                            leftIcon={Plus}
                            disabled={formData.items.length === 0}
                        >
                            {t("invoice.createInvoiceButton")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSidebar;
