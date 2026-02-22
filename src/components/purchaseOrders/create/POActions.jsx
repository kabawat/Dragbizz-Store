"use client";
import React from "react";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui";

const POActions = ({ t, formData, isCreating, handleSaveDraft, handleSubmit }) => {
    return (
        <div className="bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
            <div className="flex items-center justify-between w-full mx-auto">
                <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {formData.products.length > 0 && (
                        <span>
                            {formData.products.length}{" "}
                            {formData.products.length !== 1 ? t("purchaseOrders.items") : t("purchaseOrders.item")}{" "}
                            {t("purchaseOrders.added")}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSaveDraft}
                        type="button"
                        variant="outline"
                        leftIcon={Save}
                        size="sm"
                    >
                        {t("purchaseOrders.saveDraft")}
                    </Button>
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={isCreating}
                        loading={isCreating}
                        leftIcon={FileText}
                        size="sm"
                    >
                        {t("purchaseOrders.createPurchaseOrder")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default POActions;
