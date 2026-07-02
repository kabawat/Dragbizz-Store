"use client";

import { Receipt } from "lucide-react";
import { SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import KhataEntrySection from "./KhataEntrySection";

export function KhataQuickEntry({
  open,
  onClose,
  storeId,
  customerId,
  customerName,
  customerAccountId,
  onSuccess,
}) {
  const { t } = useTranslation();

  return (
    <SideDrawer
      isOpen={open}
      onClose={onClose}
      title={customerName || t("khata.recordTransaction")}
      description={t("khata.recordTransactionHint")}
      icon={Receipt}
      width="w-full max-w-md"
      closeOnOutsideClick={false}
      draggable
      resizable
      autoHeight
    >
      <div className="min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-5">
        {open && customerId ? (
          <KhataEntrySection
            storeId={storeId}
            customerId={customerId}
            customerName={customerName}
            customerAccountId={customerAccountId}
            hideHeader
            variant="embedded"
            autoFocusAmount
            onSuccess={onSuccess}
          />
        ) : null}
      </div>
    </SideDrawer>
  );
}

export default KhataQuickEntry;
