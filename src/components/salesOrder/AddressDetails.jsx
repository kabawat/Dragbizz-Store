import React from "react";
import { Package } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const AddressDetails = ({ order }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.5)] p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">{t("salesOrder.shippingAddress")}</h2>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">{t("salesOrder.manageWorkflow")}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">{t("salesOrder.shippingAddress")}</p>
                    <div className="text-sm font-medium text-[rgb(var(--color-text-primary))] leading-relaxed">
                        <p className="font-semibold">{order.shipping?.address?.name || order.customer?.name}</p>
                        {(order.shipping?.address?.line1 || order.customer?.address?.line1) && (
                            <p>{order.shipping?.address?.line1 || order.customer?.address?.line1}</p>
                        )}
                        <p>
                            {order.shipping?.address?.city || order.customer?.address?.city ? `${order.shipping?.address?.city || order.customer?.address?.city}` : ""}
                            {order.shipping?.address?.state || order.customer?.address?.state ? `, ${order.shipping?.address?.state || order.customer?.address?.state}` : ""}
                            {order.shipping?.address?.pincode || order.customer?.address?.pincode ? ` - ${order.shipping?.address?.pincode || order.customer?.address?.pincode}` : ""}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[rgb(var(--color-text-secondary))]">
                            <span className="text-[10px] font-bold uppercase tracking-wider">{t("common.phone")}:</span>
                            {order.shipping?.address?.phone || order.customer?.phone || t("common.na")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressDetails;
