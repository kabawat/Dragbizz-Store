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

  const collectActions = (
    <KhataCollectActions
      storeId={storeId}
      customerId={customerId}
      customerName={customerName}
      customerEmail={customerEmail}
      amount={account?.totalDue ?? 0}
      variant="embedded"
    />
  );

  return (
    <div className="space-y-5">
      <KhataBalanceCard account={account} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6 xl:items-start">
        <div className="xl:col-span-5">
          <KhataEntrySection
            storeId={storeId}
            customerId={customerId}
            customerName={customerName}
            customerAccountId={customerAccountId}
            onSuccess={handleSuccess}
            collectActions={collectActions}
          />
        </div>

        <div className="xl:col-span-7 xl:sticky xl:top-0 xl:max-h-[calc(100vh-240px)] xl:flex xl:flex-col">
          <KhataLedgerList
            entries={entries}
            loading={loading}
            error={error}
            title={t("khata.partyLedger")}
            className="xl:flex-1 xl:min-h-0 xl:overflow-y-auto custom-scrollbar"
          />
        </div>
      </div>
    </div>
  );
};

export default KhataPanel;
