import React from "react";
import { User } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const CustomerDetails = ({ customer, shipping }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.5)] p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">{t("salesOrder.contactDetails")}</h2>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">{t("salesOrder.manageWorkflow")}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/5 rounded-xl border border-[rgb(var(--color-border-primary)/0.5)]/30">
                    <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">{t("common.name")}</p>
                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{customer?.name || t("common.na")}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/5 dark:to-blue-500/2 rounded-xl border border-[rgb(var(--color-border-primary)/0.5)]/30">
                    <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">{t("common.phone")}</p>
                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{customer?.phone || shipping?.address?.phone || t("common.na")}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/5 dark:to-purple-500/2 rounded-xl border border-[rgb(var(--color-border-primary)/0.5)]/30">
                    <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">{t("common.email")}</p>
                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] break-all">{customer?.email || t("common.na")}</p>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;
