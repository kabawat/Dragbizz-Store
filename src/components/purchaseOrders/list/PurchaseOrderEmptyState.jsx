import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const PurchaseOrderEmptyState = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { can } = useModulePermissions("purchase_order");
    const canCreate = can("create");

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("purchaseOrders.noPurchaseOrders")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {t("common.noData")}
                </p>
                {canCreate && (
                    <div className="pt-4">
                        <Button
                            variant="primary"
                            onClick={() => router.push("/dashboard/purchase-orders/create")}
                        >
                            <Plus className="w-4 h-4 mr-2 text-white" />
                            {t("purchaseOrders.createPO")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrderEmptyState;
