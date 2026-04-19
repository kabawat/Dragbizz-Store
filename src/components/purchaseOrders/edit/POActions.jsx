"use client";
import React from "react";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui";

const POActions = ({
  t,
  productsCount,
  onSaveDraft,
  onUpdatePO,
  isUpdating,
}) => {
  return (
    <div className="bg-[rgb(var(--color-bg-primary))] border-top border-[rgb(var(--color-border-primary))] px-6 py-4">
      <div className="flex items-center justify-between w-full mx-auto">
        <div className="text-sm text-[rgb(var(--color-text-secondary))]">
          {productsCount > 0 && (
            <span>
              {productsCount} {productsCount !== 1 ? t("purchaseOrders.items") : t("purchaseOrders.item")} {t("purchaseOrders.added")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onSaveDraft}
            type="button"
            variant="outline"
            leftIcon={Save}
            size="sm"
          >
            {t("common.save")}
          </Button>
          <Button
            onClick={onUpdatePO}
            disabled={isUpdating}
            loading={isUpdating}
            leftIcon={FileText}
            size="sm"
          >
            {t("purchaseOrders.editPO")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POActions;
