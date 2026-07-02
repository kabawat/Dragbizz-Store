"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useKhataLedger } from "@/hooks/khata/useKhataLedger";
import KhataBalanceCard from "@/components/khata/KhataBalanceCard";
import KhataLedgerList from "@/components/khata/KhataLedgerList";
import { KhataQuickEntry } from "@/components/khata/KhataQuickEntry";

const KhataPanel = ({
  storeId,
  customerId,
  customerName,
  customerAccountId,
  account,
  refreshKey = 0,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [showRecordDrawer, setShowRecordDrawer] = useState(false);
  const { can } = useModulePermissions("customer");
  const canEdit = can("edit");

  const { entries, loading, error } = useKhataLedger({
    storeId,
    customerId,
    refreshKey,
  });

  const handleRecordSuccess = () => {
    setShowRecordDrawer(false);
    onSuccess?.();
  };

  return (
    <div className="space-y-5">
      <KhataBalanceCard
        account={account}
        showRecordButton={canEdit}
        onRecordTransaction={() => setShowRecordDrawer(true)}
      />

      <KhataLedgerList
        entries={entries}
        loading={loading}
        error={error}
        title={t("khata.partyLedger")}
        className="min-h-[320px]"
      />

      <KhataQuickEntry
        open={showRecordDrawer}
        onClose={() => setShowRecordDrawer(false)}
        storeId={storeId}
        customerId={customerId}
        customerName={customerName}
        customerAccountId={customerAccountId}
        onSuccess={handleRecordSuccess}
      />
    </div>
  );
};

export default KhataPanel;
