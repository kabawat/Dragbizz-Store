"use client";
import {
  Check,
  Copy,
  Loader2,
  Pencil,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input, Modal, MultiSelect, SideDrawer } from "@/components/ui";
import { UpiQrModal } from "@/components/common";
import {
  getStoreUpi,
  createStoreUpi,
  updateStoreUpi,
  deleteStoreUpi,
} from "@/store/slices/storeUpiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/hooks/useTranslation";
import { copyToClipboard } from "@/utils/clipboard";

const MAX_UPI_PER_AGENCY = 50;

const StoreUpiDrawer = ({
  isOpen,
  store,
  stores = [],
  onClose,
  onSuccess,
  onError,
  showSuccess,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const storeId = store?._id || store?.id;

  const storeUpiData = useAppSelector(
    (state) => (storeId && state.storeUpi?.byStoreId?.[storeId]) || null
  );
  const upiList = storeUpiData?.upiIds || [];
  const isLoading = useAppSelector(
    (state) => state.storeUpi?.loadingStoreId === storeId && state.storeUpi?.isLoading
  );
  const storeUpiError = useAppSelector((state) => state.storeUpi?.error);

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ upiId: "", label: "", storeIds: [] });
  const [addErrors, setAddErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ upiId: "", label: "" });
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [qrModalItem, setQrModalItem] = useState(null);
  const [copiedUpiId, setCopiedUpiId] = useState(null);

  const COPIED_DURATION_MS = 2500;

  useEffect(() => {
    if (isOpen && storeId) {
      dispatch(getStoreUpi({ storeId }));
      const sid = typeof storeId === "string" ? storeId : storeId?.toString?.() || storeId;
      setAddForm({ upiId: "", label: "", storeIds: sid ? [sid] : [] });
      setAddErrors({});
      setEditingIndex(null);
    }
  }, [isOpen, storeId, dispatch]);

  useEffect(() => {
    if (storeUpiError) {
      onError?.(storeUpiError);
    }
  }, [storeUpiError, onError]);

  const validateUpiId = (v) => {
    if (!v || typeof v !== "string" || v.trim().length === 0) {
      return t("settings.upi.upiIdRequired");
    }
    const trimmed = v.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(trimmed)) {
      return t("settings.upi.invalidUpiFormat");
    }
    return null;
  };

  const handleAddUpi = async () => {
    const upiError = validateUpiId(addForm.upiId);
    if (upiError) {
      setAddErrors({ upiId: upiError });
      return;
    }
    const storeIdsToUse = addForm.storeIds?.length > 0 ? addForm.storeIds : [storeId];
    if (!storeIdsToUse.length) {
      setAddErrors({ storeIds: t("settings.upi.storeIdsRequired") });
      return;
    }
    setAddErrors({});
    try {
      setIsAdding(true);
      const payload = {
        upiId: addForm.upiId.trim().toLowerCase(),
        label: addForm.label?.trim() || undefined,
        storeIds: storeIdsToUse.map((id) => (typeof id === "string" ? id : id?.toString?.() || id)),
      };
      const result = await dispatch(
        createStoreUpi({ storeId, payload })
      ).unwrap();
      if (result) {
        setAddForm({
          upiId: "",
          label: "",
          storeIds: storeId ? [typeof storeId === "string" ? storeId : (storeId?.toString?.() || storeId)] : [],
        });
        showSuccess?.(t("settings.upi.addedSuccess"));
        onSuccess?.();
      }
    } catch (error) {
      onError?.(error || "Failed to add UPI ID");
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingIndex(item.id || item._id || item.index);
    setEditForm({
      upiId: item.upiId || "",
      label: item.label || "",
    });
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({ upiId: "", label: "" });
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    const upiError = validateUpiId(editForm.upiId);
    if (upiError) {
      setEditErrors({ upiId: upiError });
      return;
    }
    const editingItem = upiList.find((u) => u.id === editingIndex || u._id === editingIndex || u.index === editingIndex);
    const upiDocId = editingItem?.id || editingItem?._id;
    if (!upiDocId) {
      onError?.("UPI not found");
      return;
    }
    setEditErrors({});
    try {
      setIsSaving(true);
      const payload = {
        upiId: editForm.upiId.trim().toLowerCase(),
        label: editForm.label?.trim() || undefined,
      };
      await dispatch(updateStoreUpi({ storeId, upiId: upiDocId, payload })).unwrap();
      setEditingIndex(null);
      showSuccess?.(t("settings.upi.updatedSuccess"));
      onSuccess?.();
    } catch (error) {
      onError?.(error || "Failed to update UPI ID");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (item) => {
    setDeleteConfirmItem({ ...item, index: item.index, id: item.id || item._id });
  };

  const handleDeleteConfirmClose = () => {
    if (!deletingIndex) setDeleteConfirmItem(null);
  };

  const handleDeleteUpi = async () => {
    if (!deleteConfirmItem) return;
    const { index } = deleteConfirmItem; // index = agencyIndex from API
    try {
      setDeletingIndex(index);
      await dispatch(deleteStoreUpi({ storeId, payload: { index } })).unwrap();
      setDeleteConfirmItem(null);
      showSuccess?.(t("settings.upi.deletedSuccess"));
      onSuccess?.();
    } catch (error) {
      onError?.(error || "Failed to delete UPI ID");
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleCopyUpi = (upiId) => {
    copyToClipboard(upiId);
    showSuccess?.(t("settings.linkCopied"));
  };

  const handleShowQr = (item) => {
    setQrModalItem(item);
  };

  if (!isOpen) return null;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("settings.upi.manageUpi")}
      icon={QrCode}
      description={store?.name ? `${t("settings.upi.forStore")}: ${store.name}` : ""}
      width="w-full sm:w-[420px] md:w-[480px]"
    >
      <div className="p-4 space-y-6">
        {/* Add new UPI form */}
        <div className="rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-4 bg-[rgb(var(--color-bg-secondary))]/30">
          <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
            {t("settings.upi.addNewUpi")}
          </h4>
          <div className="space-y-3">
            <Input
              label={t("settings.upi.upiId")}
              placeholder="merchant@paytm"
              value={addForm.upiId}
              onChange={(val) => {
                setAddForm((p) => ({ ...p, upiId: val ?? "" }));
                if (addErrors.upiId) setAddErrors((p) => ({ ...p, upiId: null }));
              }}
              error={!!addErrors.upiId}
              errorMessage={addErrors.upiId}
            />
            <Input
              label={t("settings.upi.labelOptional")}
              placeholder="Primary, Backup..."
              value={addForm.label}
              onChange={(val) =>
                setAddForm((p) => ({ ...p, label: val ?? "" }))
              }
            />
            {(stores || []).length > 0 && (
              <MultiSelect
                label={t("settings.upi.assignToStores")}
                placeholder={t("settings.upi.selectStores")}
                options={(stores || []).map((s) => ({
                  label: s.name || s._id || s.id || String(s._id || s.id),
                  value: String(s._id || s.id),
                }))}
                value={addForm.storeIds?.map((id) => String(id)) || []}
                onChange={(vals) =>
                  setAddForm((p) => ({
                    ...p,
                    storeIds: vals || [],
                  }))
                }
                error={!!addErrors.storeIds}
                errorMessage={addErrors.storeIds}
                clearable={false}
              />
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={handleAddUpi}
              loading={isAdding}
              disabled={upiList.length >= 10}
            >
              {t("settings.upi.addUpi")}
            </Button>
            {upiList.length >= 10 && (
              <p className="text-xs text-amber-600">
                {t("settings.upi.maxReached")}
              </p>
            )}
          </div>
        </div>

        {/* UPI list */}
        <div>
          <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
            {t("settings.upi.savedUpiIds")} ({upiList.length}/{MAX_UPI_PER_AGENCY})
          </h4>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-primary))]" />
            </div>
          ) : upiList.length === 0 ? (
            <p className="text-sm text-[rgb(var(--color-text-secondary))] py-4 text-center">
              {t("settings.upi.noUpiAdded")}
            </p>
          ) : (
            <div className="space-y-2">
              {upiList.map((item, index) => (
                <div
                  key={item.id || item._id || `${item.upiId}-${index}`}
                  className="flex items-center gap-2 p-3 rounded-lg border border-[rgb(var(--color-border-primary))]/50 bg-[rgb(var(--color-bg-primary))]/30"
                >
                  {editingIndex === (item.index ?? item.id) ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="merchant@paytm"
                        value={editForm.upiId}
                        onChange={(val) => {
                          setEditForm((p) => ({ ...p, upiId: val ?? "" }));
                          if (editErrors.upiId)
                            setEditErrors((p) => ({ ...p, upiId: null }));
                        }}
                        error={!!editErrors.upiId}
                        errorMessage={editErrors.upiId}
                        size="sm"
                      />
                      <Input
                        placeholder={t("settings.upi.labelOptional")}
                        value={editForm.label}
                        onChange={(val) =>
                          setEditForm((p) => ({ ...p, label: val ?? "" }))
                        }
                        size="sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="xs"
                          onClick={handleSaveEdit}
                          loading={isSaving}
                        >
                          {t("common.save")}
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        {item.label && (
                          <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-0.5">
                            {item.label}
                          </p>
                        )}
                        <code className="text-sm text-[rgb(var(--color-primary))] break-all">
                          {item.upiId}
                        </code>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleShowQr(item)}
                          className="p-1.5 rounded hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] transition-colors cursor-pointer"
                          title={t("settings.upi.showQr")}
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyUpi(item.upiId, item.id || item._id)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            copiedUpiId === (item.id || item._id)
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "hover:bg-[rgb(var(--color-bg-secondary))]"
                          }`}
                          title={copiedUpiId === (item.id || item._id) ? t("settings.upi.copied", "Copied") : t("settings.upi.copy")}
                        >
                          {copiedUpiId === (item.id || item._id) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded hover:bg-[rgb(var(--color-bg-secondary))] transition-colors cursor-pointer"
                          title={t("settings.upi.edit")}
                        >
                          <Pencil className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(item)}
                          disabled={deletingIndex === item.index}
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                          title={t("settings.upi.delete")}
                        >
                          {deletingIndex === (item.index ?? item.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <UpiQrModal
        isOpen={!!qrModalItem}
        onClose={() => setQrModalItem(null)}
        upiId={qrModalItem?.upiId}
        label={qrModalItem?.label}
        storeName={store?.name}
        logoUrl={store?.logo}
      />

      {/* Delete confirmation modal - same pattern as BillDeleteConfirmModal */}
      <Modal
        isOpen={!!deleteConfirmItem}
        onClose={handleDeleteConfirmClose}
        title={t("settings.upi.deleteUpiTitle")}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[rgb(var(--color-text-secondary))]">
            {t("settings.upi.confirmDelete")}
          </p>
          {deleteConfirmItem && (
            <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-lg border border-[rgb(var(--color-border-primary))]">
              <p className="font-medium text-[rgb(var(--color-text-primary))]">
                {deleteConfirmItem.label ? (
                  <>
                    {deleteConfirmItem.label}:{" "}
                    <code className="text-[rgb(var(--color-primary))]">
                      {deleteConfirmItem.upiId}
                    </code>
                  </>
                ) : (
                  <code className="text-[rgb(var(--color-primary))]">
                    {deleteConfirmItem.upiId}
                  </code>
                )}
              </p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                {t("modals.deleteConfirmMessage")}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleDeleteConfirmClose}
              disabled={!!deletingIndex}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUpi}
              disabled={!!deletingIndex}
              leftIcon={Trash2}
              loading={!!deletingIndex}
            >
              {deletingIndex !== null ? t("common.deleting") : t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </SideDrawer>
  );
};

export default StoreUpiDrawer;
