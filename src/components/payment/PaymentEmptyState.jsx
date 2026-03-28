"use client";
import React from "react";
import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useRouter } from "next/navigation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const PaymentEmptyState = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { can } = useModulePermissions("billing");
    const canCreate = can("create");

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("payments.noPayments")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {t("common.noData")}
                </p>
                {canCreate && (
                    <div className="pt-4">
                        <Button
                            variant="primary"
                            onClick={() => router.push("/dashboard/payments/create")}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t("payments.createPayment")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentEmptyState;
