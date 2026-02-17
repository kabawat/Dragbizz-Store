"use client";
import { Users } from "lucide-react";
import { Button } from "@/components/ui";

const CustomerEmptyState = ({
    isLoading,
    customersCount,
    error,
    searchValue,
    onClearSearch,
    onAddCustomer,
    t,
}) => {
    if (isLoading || customersCount > 0) return null;

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("customers.noCustomers")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {error
                        ? `${t("common.error")}: ${error}`
                        : searchValue
                            ? t("common.noResults")
                            : t("customers.description")}
                </p>
                <div className="pt-4 flex gap-3">
                    {searchValue && (
                        <Button variant="outline" onClick={onClearSearch}>
                            {t("common.clear")}
                        </Button>
                    )}
                    <Button variant="primary" onClick={onAddCustomer}>
                        {t("customers.addCustomer")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CustomerEmptyState;
