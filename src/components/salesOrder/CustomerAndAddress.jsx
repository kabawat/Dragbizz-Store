import React from "react";
import { User, MapPin, Phone, Mail } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const CustomerAndAddress = ({ order }) => {
    const { t } = useTranslation();
    const customer = order.customer;
    const shipping = order.shipping;
    const address = shipping?.address || customer?.address;

    return (
        <div className="w-full">
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.5)] overflow-hidden">
                {/* Section Header */}
                <div className="px-6 py-4 border-b border-[rgb(var(--color-border-primary)/0.5)] bg-[rgb(var(--color-bg-secondary))]/30">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">{t("salesOrder.customerShippingInfo")}</h2>
                            <p className="text-[11px] text-[rgb(var(--color-text-secondary))] font-medium uppercase tracking-wider">{t("salesOrder.manageWorkflow")}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[rgb(var(--color-border-primary)/0.5)]">
                    {/* Contact Details */}
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                            <span className="text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-widest">{t("salesOrder.contactDetails")}</span>
                        </div>

                        <div className="space-y-4">
                            <div className="group">
                                <p className="text-[10px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest mb-1 group-hover:text-[rgb(var(--color-primary))] transition-colors">{t("salesOrder.customerName")}</p>
                                <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{customer?.name || t("common.na")}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg border border-[rgb(var(--color-border-primary)/0.2)]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Phone className="w-3 h-3 text-[rgb(var(--color-text-tertiary))]" />
                                        <p className="text-[9px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest">{t("common.phone")}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{customer?.phone || address?.phone || t("common.na")}</p>
                                </div>
                                <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg border border-[rgb(var(--color-border-primary)/0.2)]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Mail className="w-3 h-3 text-[rgb(var(--color-text-tertiary))]" />
                                        <p className="text-[9px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest">{t("common.email")}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] break-all">{customer?.email || t("common.na")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="p-6 bg-[rgb(var(--color-bg-secondary))]/10">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                            <span className="text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-widest">{t("salesOrder.shippingAddress")}</span>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/[0.03] to-[rgb(var(--color-primary))]/[0.08] rounded-xl border border-[rgb(var(--color-border-primary)/0.5)] min-h-[120px] flex flex-col justify-center">
                            <p className="text-sm font-bold text-[rgb(var(--color-text-primary))] mb-1">{address?.name || customer?.name}</p>
                            <div className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">
                                {address?.line1 && <p>{address.line1}</p>}
                                <p>
                                    {address?.city ? `${address.city}` : ""}
                                    {address?.state ? `, ${address.state}` : ""}
                                    {address?.pincode ? ` - ${address.pincode}` : ""}
                                </p>
                            </div>
                            {address?.phone && (
                                <div className="mt-3 pt-3 border-t border-[rgb(var(--color-border-primary)/0.5)] flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-[rgb(var(--color-primary))]/60 uppercase tracking-wider">{t("salesOrder.contactAtSite")}:</span>
                                    <span className="text-xs font-semibold text-[rgb(var(--color-text-primary))]">{address.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerAndAddress;
