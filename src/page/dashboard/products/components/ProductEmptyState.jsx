"use client";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

const ProductEmptyState = ({ searchValue = "" }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { isLoading } = useAppSelector((state) => state.products);

    if (isLoading) return null;

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl">
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("products.noProducts")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {searchValue ? t("common.noResults") : t("products.description")}
                </p>
                <div className="pt-4">
                    <Button
                        variant="primary"
                        onClick={() => router.push("/dashboard/products/create")}
                        leftIcon={Plus}
                    >
                        {t("products.addProduct")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductEmptyState;
