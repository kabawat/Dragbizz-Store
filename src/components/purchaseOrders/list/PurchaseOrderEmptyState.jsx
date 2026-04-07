"use client";
import React from "react";
import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const PurchaseOrderEmptyState = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { can } = useModulePermissions("purchase_order");
    const canCreate = can("create");

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
            <EmptyState
                title={t("purchaseOrders.noPurchaseOrders") || "No Purchase Orders"}
                description={t("common.noData") || "No data available at the moment."}
                icon={FileText}
                actionButton={canCreate ? {
                    label: t("purchaseOrders.createPO"),
                    icon: Plus,
                    onClick: () => router.push("/dashboard/purchase-orders/create"),
                } : null}
            />
        </div>
    );
};

export default PurchaseOrderEmptyState;
