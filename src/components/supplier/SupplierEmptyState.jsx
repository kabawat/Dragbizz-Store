"use client";
import React from "react";
import { Building, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";

const SupplierEmptyState = ({ searchValue = "" }) => {
    const { t } = useTranslation();
    const { isLoading } = useAppSelector((state) => state.suppliers);

    if (isLoading) return null;

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <Building className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("suppliers.noSuppliers")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md mb-4">
                    {searchValue ? t("common.noResults") : t("common.noData")}
                </p>
                <div className="pt-4">
                    <Button
                        variant="primary"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-add-supplier-drawer"))}
                        leftIcon={Plus}
                    >
                        {t("suppliers.addSupplier")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SupplierEmptyState;
