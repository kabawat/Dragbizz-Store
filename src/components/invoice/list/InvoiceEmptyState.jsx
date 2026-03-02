"use client";
import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";

const InvoiceEmptyState = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { error } = useAppSelector((state) => state.invoices);

    const handleAddInvoice = () => {
        router.push("/dashboard/invoices/add");
    };

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("common.noResults")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {error ? `${t("common.error")}: ${error}` : t("common.noData")}
                </p>
                <div className="pt-4 flex gap-3">
                    <Button
                        variant="primary"
                        onClick={handleAddInvoice}
                        leftIcon={Plus}
                    >
                        {t("invoice.createInvoice")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceEmptyState;
