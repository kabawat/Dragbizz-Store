import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const InventoryEmptyState = ({ onAddStock }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("common.noData")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {t("inventory.description")}
                </p>
                <div className="pt-4">
                    {onAddStock && (
                        <Button
                            variant="primary"
                            onClick={onAddStock}
                            leftIcon={Plus}
                        >
                            {t("inventory.addStock")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryEmptyState;
