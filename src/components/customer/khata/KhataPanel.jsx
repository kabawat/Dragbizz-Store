"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useKhataLedger } from "@/hooks/khata/useKhataLedger";
import { usePartyLedgerExport } from "@/hooks/khata/usePartyLedgerExport";
import KhataBalanceCard from "@/components/khata/KhataBalanceCard";
import KhataLedgerList from "@/components/khata/KhataLedgerList";
import PartyLedgerDownloadDrawer from "@/components/khata/PartyLedgerDownloadDrawer";
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
  const [showExportDrawer, setShowExportDrawer] = useState(false);
  const { can } = useModulePermissions("customer");
  const canEdit = can("edit");

  const { entries, loading, error } = useKhataLedger({
    storeId,
    customerId,
    refreshKey,
  });

  const { isExporting, runExport } = usePartyLedgerExport({
    storeId,
    customerId,
  });

  const handleRecordSuccess = () => {
    setShowRecordDrawer(false);
    onSuccess?.();
  };

  const handleExport = async (params) => {
    const result = await runExport(params);
    if (result) {
      setShowExportDrawer(false);
    }
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
        onDownload={() => setShowExportDrawer(true)}
      />

      <PartyLedgerDownloadDrawer
        isOpen={showExportDrawer}
        onClose={() => setShowExportDrawer(false)}
        onExport={handleExport}
        isExporting={isExporting}
        partyName={customerName}
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
