"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Printer, Download, XCircle, QrCode, Clock, CheckCircle, Package, AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui";
import { CatalogQRModal } from "@/components/common";
import { salesOrderService } from "@/service/retailer";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

// Extracted Components
import {
  ActivityHistory,
  CustomerAndAddress,
  OrderActions,
  OrderItems,
  OrderNotes
} from "@/components/salesOrder";

const SALES_ORDER_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
});

const StatusBadge = ({ order, statusField = 'status' }) => {
  const status = order[statusField];
  const { t } = useTranslation();
  const styles = {
    PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    CONFIRMED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    SHIPPED: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    IN_TRANSIT: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    OUT_FOR_DELIVERY: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    DELIVERED: "bg-green-500/10 text-green-600 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
    PAID: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    UNPAID: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    PARTIAL: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    REFUNDED: "bg-gray-500/10 text-gray-600 border-gray-500/20"
  };

  const icons = {
    PENDING: Clock,
    CONFIRMED: CheckCircle,
    SHIPPED: Package,
    DELIVERED: CheckCircle,
    CANCELLED: XCircle,
    PAID: CheckCircle,
    UNPAID: AlertCircle,
    PARTIAL: Clock,
    REFUNDED: RotateCcw
  };

  const Icon = icons[status] || Clock;

  const getStatusLabel = (s) => {
    const key = s?.toLowerCase();
    if (order.orderSource === 'IN_STORE') {
      if (s === "SHIPPED" || s === "IN_TRANSIT" || s === "OUT_FOR_DELIVERY") return t("salesOrder.status.ready", { defaultValue: "ORDER READY" });
      if (s === "DELIVERED") return t("salesOrder.status.served", { defaultValue: "SERVED" });
    }
    return t(`salesOrder.status.${key}`, { defaultValue: s?.replace(/_/g, ' ') });
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      <Icon className="w-3.5 h-3.5" />
      {getStatusLabel(status)}
    </span>
  );
};

const ViewSellOrderPage = ({ orderId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  const {
    can,
    create: canCreate,
    edit: canEdit,
    loading: permissionsLoading
  } = useModulePermissions("sales_order");

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  const { execute: executeFetch } = useApiResponse();
  const { execute: executeUpdate, loading: updatingStatus } = useApiResponse();

  const fetchOrder = React.useCallback(async () => {
    if (!orderId || !storeId) return;
    try {
      const result = await executeFetch(
        salesOrderService.getSalesOrders({ id: orderId, store: storeId }),
        { showToast: false }
      );
      if (result?.success) {
        setOrder(result.data);
      }
    } catch (error) {
      showError("An unexpected error occurred while fetching order");
    }
  }, [orderId, storeId, showError, executeFetch]);

  const handleUpdateStatus = async (status, payload = {}) => {
    if (!orderId || !storeId) return;
    const result = await executeUpdate(
      salesOrderService.updateStatus(orderId, { status, ...payload }, { store: storeId }),
      { showToast: true, message: "Order updated successfully" }
    );

    if (result?.success) {
      await fetchOrder();
    }
  };

  useEffect(() => {
    if (!orderId || !storeId) return;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      await fetchOrder();
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchOrder, orderId, storeId]);

  if (loading || permissionsLoading) {
    return (
      <div className="flex h-screen relative w-full overflow-hidden bg-[rgb(var(--color-bg-secondary))]">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[rgb(var(--color-text-secondary))] animate-pulse font-medium">{t("common.loadingData")}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen relative w-full overflow-hidden bg-[rgb(var(--color-bg-secondary))]">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2">{t("common.error")}</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">{t("common.doesntExistOrRemoved", { item: "Order" })}</p>
          <Button onClick={() => router.push("/dashboard/sales-order")}>{t("salesOrder.backToOrders")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden bg-[rgb(var(--color-bg-secondary))]">
      {/* Sidebar */}
      <div className="no-print">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="h-full w-full flex flex-col main-content">
        {/* Header */}
        <div className="no-print">
          <Header
            title={t("salesOrder.viewOrder")}
            description={
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2">
                    <span>{t("common.details")} #{order.orderNumber}</span>
                  </span>
                  <StatusBadge order={order} />
                </div>
              </div>
            }
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <div className="max-w-8xl mx-auto w-full flex-1 flex flex-col min-h-0">

            {/* Navigation & Actions Bar */}
            <div className="mb-6 flex items-center justify-between no-print">
              <Link
                href="/dashboard/sales-order"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t("salesOrder.backToOrders")}</span>
              </Link>
              <div className="flex gap-3">
                {canCreate && selectedStore?.catalogId && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => setIsCatalogModalOpen(true)}
                      leftIcon={QrCode}
                      className="h-9 font-semibold"
                    >
                      {t("settings.publicCatalog")}
                    </Button>

                    <CatalogQRModal
                      isOpen={isCatalogModalOpen}
                      onClose={() => setIsCatalogModalOpen(false)}
                      store={selectedStore}
                    />
                  </>
                )}
                <Button variant="outline" leftIcon={Printer}>{t("common.print")}</Button>
                <Button variant="outline" leftIcon={Download}>{t("common.download")}</Button>
              </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0  overflow-hidden">

              {/* Left Column: Order Content View */}
              <div className="lg:col-span-2 flex flex-col min-h-0 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 space-y-6">
                <CustomerAndAddress order={order} />
                <OrderItems order={order} />

                {/* Additional Info Footer */}
                <div className="p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-transparent rounded-xl border border-[rgb(var(--color-border-primary)/0.5)] border-l-[4px] border-l-[rgb(var(--color-primary))]">
                  <h4 className="text-[10px] font-bold text-[rgb(var(--color-text-primary))] mb-2 uppercase tracking-[0.2em]">{t("salesOrder.termsConditions")}</h4>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed font-medium">{t("salesOrder.standardTerms")}</p>
                </div>
              </div>

              {/* Right Column: Actions & Status */}
              <div className="flex flex-col min-h-0 no-print">
                <div className="flex-1 overflow-y-auto px-1 space-y-6">
                  <OrderActions
                    order={order}
                    statusList={SALES_ORDER_STATUSES}
                    updatingStatus={updatingStatus}
                    onUpdateStatus={handleUpdateStatus}
                    canEdit={canEdit}
                  />
                  <div className="space-y-4">
                    <ActivityHistory order={order} />
                    <OrderNotes />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSellOrderPage;