"use client";
import { PaymentGridView } from "@dragorbit/features/payments";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  formatCurrency,
  formatDate,
  getPaymentMethodBadge,
  getPaymentTypeBadge,
  getStatusBadge,
} from "./utils";

const PaymentGrid = ({
  payments,
  isLoadingMore,
  selectedPayments,
  handlePaymentSelect,
  menuRefs,
  openMenuId,
  handleMenuToggle,
  handleMenuAction,
  canEdit,
  canDelete,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <PaymentGridView
      model={{
        payments,
        getStatusBadge,
        getPaymentMethodBadge,
        t,
        getPaymentTypeBadge,
        selectedPayments,
        handlePaymentSelect,
        menuRefs,
        handleMenuToggle,
        openMenuId,
        handleMenuAction,
        canEdit,
        canDelete,
        formatDate,
        formatCurrency,
        isLoadingMore,
        onRoute0: (value0) =>
          router.push("/dashboard/payments/" + String(value0) + ""),
        onRoute1: (value0) =>
          router.push("/dashboard/suppliers/" + String(value0) + ""),
      }}
    />
  );
};

export default PaymentGrid;
