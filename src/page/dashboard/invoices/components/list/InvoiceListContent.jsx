"use client";
import { TableSkeleton } from "@dragorbit/ui";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  InvoiceCard,
  InvoiceDeleteConfirmModal,
  InvoiceTable,
  ReleaseInvoiceModal,
  UpdatePaymentStatusModal,
} from "../";
import { InvoicePrintModal } from "@dragorbit/features/invoices";
import { invoiceService } from "@/service";
import PaymentConfirmModal from "@/components/payment/PaymentConfirmModal";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";

const InvoiceListContent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Permission Management
  const { can } = useModulePermissions("invoice");
  const canEdit = can("edit");
  const canDelete = can("delete");
  const canRead = can("read");

  // Using Redux state instead of props
  const { invoices, viewMode, isLoading, isFetchingMore, pagination } =
    useAppSelector((state) => state.invoices);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // ─── Refs for stable IntersectionObserver callback ───────────────────────
  const sentinelRef = useRef(null);
  const isFetchingMoreRef = useRef(isFetchingMore);
  const storeIdRef = useRef(storeId);
  const paginationRef = useRef(pagination);
  isFetchingMoreRef.current = isFetchingMore;
  storeIdRef.current = storeId;
  paginationRef.current = pagination;

  // Local state for modals
  const [invoiceToUpdatePayment, setInvoiceToUpdatePayment] = useState(null);
  const [invoiceToRelease, setInvoiceToRelease] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState(null);
  const [printInvoiceId, setPrintInvoiceId] = useState(null);
  const signatures = useAppSelector((state) => state.signatures?.items || []);

  // ─── Infinite scroll via IntersectionObserver ─────────────────────────────
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
          dispatch(
            getInvoices({
              store: storeIdRef.current,
              nextCursor: paginationRef.current.nextCursor,
              isFreshLoad: false,
            })
          );
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dispatch, pagination.hasNextPage]);

  const handleEditInvoice = useCallback(
    (invoiceId) => {
      router.push(`/dashboard/invoices/${invoiceId}/edit`);
    },
    [router]
  );

  const handleViewInvoice = useCallback(
    (invoiceId) => {
      router.push(`/dashboard/invoices/${invoiceId}`);
    },
    [router]
  );

  const handlePrintInvoice = useCallback((invoiceId) => {
    setPrintInvoiceId(invoiceId);
  }, []);

  const handleReleaseInvoice = useCallback((invoice) => {
    if (invoice?.invoiceStatus === "DRAFT" && invoice?.id) {
      setPaymentInvoiceId(invoice.id);
      return;
    }
    setInvoiceToRelease(invoice);
  }, []);

  const handleUpdatePaymentStatus = useCallback((_invoiceId, invoice) => {
    setInvoiceToUpdatePayment(invoice);
  }, []);

  const handleDeleteInvoice = useCallback((invoice) => {
    setInvoiceToDelete(invoice);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setInvoiceToDelete(null);
  }, []);

  const handleCloseReleaseModal = useCallback(() => {
    setInvoiceToRelease(null);
  }, []);

  const handleClosePaymentConfirmModal = useCallback(() => {
    setPaymentInvoiceId(null);
  }, []);

  const handleCloseUpdatePaymentModal = useCallback(() => {
    setInvoiceToUpdatePayment(null);
  }, []);

  return (
    <>
      <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl overflow-hidden">
        <div>
          {viewMode === "table" ? (
            <div className="min-h-full">
              <InvoiceTable
                invoices={invoices}
                onEdit={canEdit ? handleEditInvoice : undefined}
                onDelete={canDelete ? handleDeleteInvoice : undefined}
                onViewDetails={canRead ? handleViewInvoice : undefined}
                onPrint={canRead ? handlePrintInvoice : undefined}
                onRelease={canEdit ? handleReleaseInvoice : undefined}
                onUpdatePaymentStatus={
                  canEdit ? handleUpdatePaymentStatus : undefined
                }
                loading={isLoading}
                emptyMessage={t("common.noResults")}
                hasMore={pagination?.hasNextPage}
              />
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                {invoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id || invoice._id}
                    invoice={invoice}
                    onEdit={canEdit ? handleEditInvoice : undefined}
                    onDelete={canDelete ? handleDeleteInvoice : undefined}
                    onViewDetails={canRead ? handleViewInvoice : undefined}
                    onPrint={canRead ? handlePrintInvoice : undefined}
                    onRelease={canEdit ? handleReleaseInvoice : undefined}
                    onUpdatePaymentStatus={
                      canEdit ? handleUpdatePaymentStatus : undefined
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sentinel — IntersectionObserver triggers load more */}
          {pagination.hasNextPage && (
            <div ref={sentinelRef} className="h-4 w-full" />
          )}

          {isFetchingMore && invoices.length > 0 && (
            <TableSkeleton compact rows={2} />
          )}
        </div>

        <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[rgb(var(--color-text-secondary))]">
              {pagination?.hasNextPage ? (
                <>
                  Showing{" "}
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                    {invoices.length}
                  </span>{" "}
                  {invoices.length === 1 ? "invoice" : "invoices"}
                  <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                    • Scroll down to load more
                  </span>
                </>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                    {invoices.length}
                  </span>{" "}
                  {invoices.length === 1 ? "invoice" : "invoices"}
                  <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                    • No more invoices
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {invoiceToDelete && (
        <InvoiceDeleteConfirmModal
          onClose={handleCloseDeleteModal}
          invoice={invoiceToDelete}
        />
      )}

      {/* Release confirmation modal */}
      {invoiceToRelease && (
        <ReleaseInvoiceModal
          onClose={handleCloseReleaseModal}
          invoice={invoiceToRelease}
          onCollectPayment={setPaymentInvoiceId}
        />
      )}

      <PaymentConfirmModal
        open={Boolean(paymentInvoiceId)}
        invoiceId={paymentInvoiceId}
        source="release"
        onClose={handleClosePaymentConfirmModal}
      />

      {/* Payment Status Update Modal */}
      {invoiceToUpdatePayment && (
        <UpdatePaymentStatusModal
          onClose={handleCloseUpdatePaymentModal}
          invoice={invoiceToUpdatePayment}
        />
      )}
      {/* Invoice Print & Preview Modal */}
      <InvoicePrintModal
        open={Boolean(printInvoiceId)}
        invoiceId={printInvoiceId}
        selectedStore={selectedStore}
        signatures={signatures}
        fetchInvoice={async (id) => {
          const res = await invoiceService.getInvoices({ id, store: storeId });
          const raw = res?.data ?? res;
          return raw?.data ?? raw;
        }}
        onClose={() => setPrintInvoiceId(null)}
        onCreateNew={() => router.push("/dashboard/invoices/add")}
        t={t}
      />
    </>
  );
};

export default memo(InvoiceListContent);
