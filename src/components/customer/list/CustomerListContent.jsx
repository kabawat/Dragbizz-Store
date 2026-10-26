"use client";
import { ConfirmDialog, EmptyState, TableSkeleton } from "@dragorbit/ui";
import { Bell, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CustomerCard,
  CustomerTable,
  EditCustomer,
} from "@/components/customer";
import KhataQuickEntry from "@/components/khata/KhataQuickEntry";
import { SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { usePaymentReminder } from "@/hooks/payment/usePaymentReminder";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCustomers } from "@/store/slices/customers/customerSlice";
import { formatCurrency } from "@/utils/currencyFormatter";
import { filterCustomersByBalance } from "@/utils/customer/customerKhataBalance.util";
import { buildCustomerListParams } from "@/utils/customer/customerList.util";
import CustomerDeleteModal from "./CustomerDeleteModal";

function findCustomerQuickEntryTarget(customers, customerId) {
  const customer = customers.find(
    (item) => item.id === customerId || item._id === customerId
  );
  if (!customer) return null;

  return {
    customerId: customer.id ?? customer._id,
    customerName: customer.name ?? "",
    customerAccountId: customer.account?.id ?? customer.account?._id ?? null,
  };
}

const CustomerListContent = ({
  searchValue = "",
  isActive = "",
  source = "",
  startDate = "",
  endDate = "",
  balanceFilter = "",
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { customers, viewMode, isLoading, isFetchingMore, pagination } =
    useAppSelector((state) => state.customers);

  const visibleCustomers = useMemo(() => {
    return filterCustomersByBalance(customers, balanceFilter);
  }, [customers, balanceFilter]);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const { can } = useModulePermissions("customer");
  const { hasAccess } = useSubscriptionAccess();
  const canEdit = can("edit");
  const canDelete = can("delete");
  const canManageKhata = can("read");
  const canQuickKhataEntry = canEdit;
  const canRemindByPlan = hasAccess("payment_reminder");
  const canRemindByPermission = can("create");
  const canRemind = canRemindByPlan && canRemindByPermission;

  const [reminderTarget, setReminderTarget] = useState(null);
  const { sendReminder, loading: reminderLoading } = usePaymentReminder({
    storeId,
  });
  const { showError } = useGlobalToast();

  const handleSendReminder = useCallback(
    (customerId) => {
      const customer = visibleCustomers.find(
        (c) => (c.id || c._id) === customerId
      );
      if (!customer) return;

      const dueAmount = Number(customer.totalDue) || 0;
      if (dueAmount <= 0) {
        showError(
          t("khata.noDueBalance") ||
            "Customer has no outstanding balance to remind"
        );
        return;
      }

      if (!customer.email?.trim()) {
        showError(
          t("khata.noCustomerEmail") ||
            "Customer email is required to send a reminder"
        );
        return;
      }

      setReminderTarget(customer);
    },
    [visibleCustomers, showError, t]
  );

  const handleConfirmSendReminder = useCallback(async () => {
    if (!reminderTarget) return;
    const customerId = reminderTarget.id || reminderTarget._id;
    const result = await sendReminder({
      customerId,
      includePaymentLink: true,
    });
    if (result) {
      setReminderTarget(null);
    }
  }, [reminderTarget, sendReminder]);

  const goToDetails = (id) => router.push(`/dashboard/customers/${id}`);
  const goToKhata = (id) => router.push(`/dashboard/customers/${id}?tab=khata`);

  const refreshCustomers = useCallback(() => {
    if (!storeId) return;
    const {
      searchValue: search,
      isActive: active,
      source: src,
      startDate: start,
      endDate: end,
    } = filtersRef.current;
    dispatch(
      getCustomers(
        buildCustomerListParams({
          storeId,
          search,
          isActive: active,
          source: src,
          startDate: start,
          endDate: end,
          isFreshLoad: true,
        })
      )
    );
  }, [dispatch, storeId]);

  const openQuickKhataEntry = useCallback(
    (customerId) => {
      const target = findCustomerQuickEntryTarget(visibleCustomers, customerId);
      if (target) setQuickEntryTarget(target);
    },
    [visibleCustomers]
  );

  const filtersRef = useRef({
    searchValue,
    isActive,
    source,
    startDate,
    endDate,
  });
  filtersRef.current = { searchValue, isActive, source, startDate, endDate };

  // ─── Refs for stable IntersectionObserver callback ───────────────────────
  const sentinelRef = useRef(null);
  const isFetchingMoreRef = useRef(isFetchingMore);
  const storeIdRef = useRef(storeId);
  const paginationRef = useRef(pagination);
  isFetchingMoreRef.current = isFetchingMore;
  storeIdRef.current = storeId;
  paginationRef.current = pagination;

  // ─── Edit drawer state ────────────────────────────────────────────────────
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [quickEntryTarget, setQuickEntryTarget] = useState(null);

  // ─── Delete modal ref (self-contained) ───────────────────────────────────
  const deleteModalRef = useRef(null);

  // ─── Infinite scroll via IntersectionObserver ─────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reattach when switching views or remounting the table and its sentinel.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !pagination.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isFetchingMoreRef.current &&
          storeIdRef.current
        ) {
          const {
            searchValue: search,
            isActive: active,
            source: src,
            startDate: start,
            endDate: end,
          } = filtersRef.current;
          dispatch(
            getCustomers(
              buildCustomerListParams({
                storeId: storeIdRef.current,
                search,
                isActive: active,
                source: src,
                startDate: start,
                endDate: end,
                nextCursor: paginationRef.current.nextCursor,
                isFreshLoad: false,
              })
            )
          );
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    dispatch,
    pagination.hasNextPage,
    viewMode,
    isLoading,
    visibleCustomers.length,
  ]);

  useEffect(() => {
    if (
      !balanceFilter ||
      visibleCustomers.length > 0 ||
      !pagination.hasNextPage
    )
      return;
    if (isFetchingMore || isLoading || !storeIdRef.current) return;

    const {
      searchValue: search,
      isActive: active,
      source: src,
      startDate: start,
      endDate: end,
    } = filtersRef.current;
    dispatch(
      getCustomers(
        buildCustomerListParams({
          storeId: storeIdRef.current,
          search,
          isActive: active,
          source: src,
          startDate: start,
          endDate: end,
          nextCursor: paginationRef.current.nextCursor,
          isFreshLoad: false,
        })
      )
    );
  }, [
    dispatch,
    balanceFilter,
    visibleCustomers.length,
    pagination.hasNextPage,
    isFetchingMore,
    isLoading,
  ]);

  useCommonHotkeys({
    onClose: () => {
      if (editCustomerId) setEditCustomerId(null);
    },
  });

  if (!isLoading && customers.length === 0) return null;

  if (!isLoading && balanceFilter && visibleCustomers.length === 0) {
    if (pagination.hasNextPage || isFetchingMore) {
      return <TableSkeleton />;
    }

    return (
      <EmptyState
        fullHeight
        title={t("common.noResults")}
        description={t("khata.balanceFilter")}
      />
    );
  }

  if (!isLoading && visibleCustomers.length === 0) return null;

  const scrollFooter = (
    <>
      {/* Sentinel — IntersectionObserver triggers load more */}
      {pagination.hasNextPage && (
        <div ref={sentinelRef} className="h-4 w-full" />
      )}

      {isFetchingMore && visibleCustomers.length > 0 && (
        <TableSkeleton compact rows={2} />
      )}
    </>
  );

  return (
    <>
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.6)] overflow-hidden">
        <div
          className={
            viewMode === "table" ? "" : "h-[calc(100vh-210px)] overflow-y-auto"
          }
        >
          {viewMode === "table" ? (
            <div className="h-auto">
              <CustomerTable
                customers={visibleCustomers}
                scrollFooter={scrollFooter}
                loading={isLoading && visibleCustomers.length === 0}
                onEdit={canEdit ? setEditCustomerId : undefined}
                onDelete={
                  canDelete
                    ? (id) => deleteModalRef.current?.open(id)
                    : undefined
                }
                onViewDetails={goToDetails}
                onManageKhata={canManageKhata ? goToKhata : undefined}
                onQuickKhataEntry={
                  canQuickKhataEntry ? openQuickKhataEntry : undefined
                }
                onSendReminder={canRemind ? handleSendReminder : undefined}
                canEdit={canEdit}
                canDelete={canDelete}
                canManageKhata={canManageKhata}
                canQuickKhataEntry={canQuickKhataEntry}
                canRemind={canRemind}
              />
            </div>
          ) : (
            <div className="h-auto">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={canEdit ? setEditCustomerId : undefined}
                    onDelete={
                      canDelete
                        ? (id) => deleteModalRef.current?.open(id)
                        : undefined
                    }
                    onViewDetails={goToDetails}
                    onManageKhata={canManageKhata ? goToKhata : undefined}
                    onQuickKhataEntry={
                      canQuickKhataEntry ? openQuickKhataEntry : undefined
                    }
                    onSendReminder={canRemind ? handleSendReminder : undefined}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canManageKhata={canManageKhata}
                    canQuickKhataEntry={canQuickKhataEntry}
                    canRemind={canRemind}
                  />
                ))}
              </div>
            </div>
          )}

          {viewMode !== "table" && scrollFooter}
        </div>

        {/* Footer */}
        <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
          <div className="text-sm text-[rgb(var(--color-text-secondary))]">
            {t("common.showing") || "Showing"}{" "}
            <span className="font-semibold text-[rgb(var(--color-text-primary))]">
              {visibleCustomers.length}
            </span>{" "}
            {t("customers.title").toLowerCase()}
            {pagination.hasNextPage && (
              <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                • {t("common.scrollToLoadMore") || "Scroll down to load more"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete modal — fully self-contained via ref */}
      <CustomerDeleteModal ref={deleteModalRef} />

      <KhataQuickEntry
        open={Boolean(quickEntryTarget)}
        onClose={() => setQuickEntryTarget(null)}
        storeId={storeId}
        customerId={quickEntryTarget?.customerId}
        customerName={quickEntryTarget?.customerName}
        customerAccountId={quickEntryTarget?.customerAccountId}
        onSuccess={refreshCustomers}
      />

      {/* Edit Customer Drawer */}
      <SideDrawer
        isOpen={!!editCustomerId}
        onClose={() => setEditCustomerId(null)}
        title={t("customers.editCustomer") || "Edit Customer"}
        icon={Users}
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-6 h-full">
          {editCustomerId && (
            <EditCustomer
              customerId={editCustomerId}
              onSuccess={() => setEditCustomerId(null)}
              onCancel={() => setEditCustomerId(null)}
              showCancelButton={true}
              mode="drawer"
            />
          )}
        </div>
      </SideDrawer>

      {/* Payment Reminder Confirmation Dialog */}
      {reminderTarget && (
        <ConfirmDialog
          isOpen={Boolean(reminderTarget)}
          onClose={() => {
            if (!reminderLoading) setReminderTarget(null);
          }}
          onConfirm={handleConfirmSendReminder}
          busy={reminderLoading}
          icon={Bell}
          variant="primary"
          title={t("khata.sendReminder") || "Send Payment Reminder"}
          description={
            <span>
              {t("khata.reminderConfirmText") ||
                "Are you sure you want to send a payment reminder to"}{" "}
              <strong className="font-semibold text-[rgb(var(--color-text-primary))]">
                {reminderTarget?.name}
              </strong>
              {Number(reminderTarget?.totalDue) > 0 && (
                <>
                  {" "}
                  {t("khata.forDueAmount") || "for outstanding balance of"}{" "}
                  <strong className="text-orange-600 font-semibold">
                    {formatCurrency(reminderTarget?.totalDue)}
                  </strong>
                </>
              )}
              ?
            </span>
          }
          confirmLabel={t("khata.sendReminder") || "Send Reminder"}
          cancelLabel={t("common.cancel") || "Cancel"}
        />
      )}
    </>
  );
};

export default CustomerListContent;
