import React from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const OrderNotes = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.5)] p-5 transition-all">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">{t("salesOrder.orderNotes")}</h4>
                <button className="text-[rgb(var(--color-primary))] text-xs font-bold hover:underline">{t("common.addNew")}</button>
            </div>
            <div className="bg-[rgb(var(--color-bg-secondary))]/80 p-3 rounded-lg border border-[rgb(var(--color-border-primary)/0.5)]/50 text-sm text-[rgb(var(--color-text-secondary))] italic leading-relaxed">
                "{t("salesOrder.exampleNote")}"
            </div>
        </div>
    );
};

export default OrderNotes;
