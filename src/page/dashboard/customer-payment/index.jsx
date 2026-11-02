"use client";

import CustomerPaymentDisplay from "@/components/payment/CustomerPaymentDisplay";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CustomerPaymentPage = () => {
  const router = useRouter();
  const { can, loading: permissionLoading } = useModulePermissions("invoice");
  const canCreate = can("create");

  useEffect(() => {
    if (!permissionLoading && !canCreate) {
      router.replace("/dashboard/invoices");
    }
  }, [canCreate, permissionLoading, router]);

  if (permissionLoading || !canCreate) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] bg-[rgb(var(--color-bg-primary))] flex flex-col">
      <CustomerPaymentDisplay />
    </div>
  );
};

export default CustomerPaymentPage;
