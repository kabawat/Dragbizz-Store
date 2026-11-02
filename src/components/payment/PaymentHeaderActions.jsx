"use client";
import { PaymentListHeaderView } from "@dragorbit/features/payments";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useRouter } from "next/navigation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const PaymentHeaderActions = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { can, loading } = useModulePermissions("billing");
  const canCreate = can("create");

  if (loading)
    return (
      <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />
    );

  return (
    <PaymentListHeaderView
      model={{
        t,
        searchValue: searchTerm,
        onSearchChange,
        viewMode,
        onViewModeChange,
        canCreate,
        onCreate: () => router.push("/dashboard/payments/create"),
      }}
    />
  );
};

export default PaymentHeaderActions;
