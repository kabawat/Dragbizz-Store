"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import KhataCollectActions from "@/components/customer/khata/KhataCollectActions";
import { useKhataLedger } from "@/hooks/khata/useKhataLedger";
import KhataBalanceCard from "@/components/khata/KhataBalanceCard";
import KhataEntrySection from "@/components/khata/KhataEntrySection";
import KhataLedgerList from "@/components/khata/KhataLedgerList";

const KhataPanel = ({
  storeId,
  customerId,
  customerName,
  customerEmail,
  customerAccountId,
  account,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [ledgerRefreshKey, setLedgerRefreshKey] = useState(0);

  const { entries, loading, error } = useKhataLedger({
    storeId,
    customerId,
    refreshKey: ledgerRefreshKey,
  });

  const handleSuccess = () => {
    setLedgerRefreshKey((key) => key + 1);
    onSuccess?.();
  };

  return (
    <div className="space-y-4">
      <KhataBalanceCard totalDue={account?.totalDue ?? 0} label={t("khata.balance")} />
      <KhataEntrySection
        storeId={storeId}
        customerId={customerId}
        customerName={customerName}
        customerAccountId={customerAccountId}
        onSuccess={handleSuccess}
      />
      <KhataCollectActions
        storeId={storeId}
        customerId={customerId}
        customerName={customerName}
        customerEmail={customerEmail}
        amount={account?.totalDue ?? 0}
      />
      <KhataLedgerList
        entries={entries}
        loading={loading}
        error={error}
        title={t("khata.partyLedger")}
      />
    </div>
  );
};

export default KhataPanel;
