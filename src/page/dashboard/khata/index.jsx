"use client";

import { BookOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useCustomerPicker } from "@/hooks/khata/useCustomerPicker";
import { useKhataLedger } from "@/hooks/khata/useKhataLedger";
import KhataBalanceCard from "@/components/khata/KhataBalanceCard";
import KhataCustomerPicker from "@/components/khata/KhataCustomerPicker";
import KhataEntrySection from "@/components/khata/KhataEntrySection";
import KhataLedgerList from "@/components/khata/KhataLedgerList";

function resolveCustomerId(customer) {
  return customer?.id ?? customer?._id ?? null;
}

function resolveAccountId(customer) {
  const account = customer?.account ?? null;
  return account?.id ?? account?._id ?? null;
}

export default function KhataPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  useDashboardHeader(t("khata.title"), t("khata.subtitle"));

  const { can, loading: permissionLoading } = useModulePermissions("customer");
  const canRead = can("read");

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledgerRefreshKey, setLedgerRefreshKey] = useState(0);

  const { customers, loading: pickerLoading, reload: reloadCustomers } = useCustomerPicker({
    storeId,
    search,
    limit: 30,
  });

  const customerId = resolveCustomerId(selectedCustomer);
  const customerName = selectedCustomer?.name ?? "";
  const customerAccountId = resolveAccountId(selectedCustomer);
  const totalDue = selectedCustomer?.account?.totalDue ?? selectedCustomer?.totalDue ?? 0;

  const { entries, loading: ledgerLoading, error: ledgerError } = useKhataLedger({
    storeId,
    customerId,
    refreshKey: ledgerRefreshKey,
  });

  const pageCustomers = useMemo(() => {
    if (!selectedCustomer) return customers;
    const selectedId = resolveCustomerId(selectedCustomer);
    const exists = customers.some((row) => resolveCustomerId(row) === selectedId);
    return exists ? customers : [selectedCustomer, ...customers];
  }, [customers, selectedCustomer]);

  const handleSuccess = async () => {
    setLedgerRefreshKey((key) => key + 1);
    await reloadCustomers();
  };

  if (!permissionLoading && !canRead) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-[480px] space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[rgb(var(--color-text-secondary))]" />
          <h2 className="font-semibold">{t("khata.quickEntry")}</h2>
        </div>

        <KhataCustomerPicker
          customers={pageCustomers}
          selectedCustomer={selectedCustomer}
          onSelect={setSelectedCustomer}
          search={search}
          onSearchChange={setSearch}
          loading={pickerLoading}
        />

        {selectedCustomer ? (
          <>
            <KhataBalanceCard totalDue={totalDue} label={t("khata.balance")} />
            <KhataEntrySection
              storeId={storeId}
              customerId={customerId}
              customerName={customerName}
              customerAccountId={customerAccountId}
              onSuccess={handleSuccess}
              autoFocusAmount
            />
            <KhataLedgerList
              entries={entries}
              loading={ledgerLoading}
              error={ledgerError}
              title={t("khata.recentEntries")}
            />
          </>
        ) : (
          <p className="text-sm text-center text-[rgb(var(--color-text-secondary))] py-8">
            {t("khata.noCustomer")}
          </p>
        )}
      </div>
    </div>
  );
}
