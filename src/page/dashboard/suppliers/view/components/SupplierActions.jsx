"use client";
import { useState } from "react";
import { Building, Download, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { supplierService } from "@/service";
import DeleteModal from "./DeleteModal";
import DeleteSuccessModal from "./DeleteSuccessModal";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SupplierActions = ({
  supplierData,
  supplierId,
  storeId,
  onEdit,
  onDownload,
  fetching
}) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedSupplierName, setDeletedSupplierName] = useState("");
  const { showSuccess, showError } = useGlobalToast();
  const router = useRouter();

  const { can } = useModulePermissions("supplier");
  const canEdit = can("edit");
  const canDelete = can("delete");

  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!supplierId || !storeId) return;
    setIsDeleting(true);

    try {
      const result = await supplierService.deleteSupplier(supplierId, storeId);
      if (result.success) {
        setDeletedSupplierName(supplierData?.name || t("common.supplier"));
        showSuccess(t("suppliers.deleteSuccess") || "Supplier deleted successfully");
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        showError(result.message || t("errors.failedToDelete", { item: t("common.supplier") }));
        setShowDeleteModal(false);
      }
    } catch (_error) {
      showError(t("errors.failedToDeleteTryAgain", { item: t("common.supplier") }));
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSuccess = () => {
    setShowDeleteSuccessModal(false);
    router.push("/dashboard/suppliers");
  };

  useCommonHotkeys({
    onDelete: canDelete ? () => setShowDeleteModal(true) : undefined,
    onClose: () => {
      if (showDeleteModal) setShowDeleteModal(false);
      if (showDeleteSuccessModal) setShowDeleteSuccessModal(false);
    },
  });

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-0">
        <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                Quick Actions
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                Manage this supplier
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {canEdit && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={onEdit}
                leftIcon={Edit}
              >
                Edit
              </Button>
            )}

            {canDelete && (
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={Trash2}
              >
                Delete
              </Button>
            )}

            <Button
              variant="outline"
              className="flex-1"
              leftIcon={Download}
              onClick={() => onDownload(supplierData)}
              disabled={fetching || !supplierData}
            >
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>

          {supplierData.account && (
            <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                Quick Stats
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    Total Bills:
                  </span>
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    {supplierData.account.totalBills || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    Total Purchases:
                  </span>
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    ₹
                    {supplierData.account.totalPurchases?.toLocaleString(
                      "en-IN",
                      { maximumFractionDigits: 2 }
                    ) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    Total Due:
                  </span>
                  <span
                    className={`font-medium ${supplierData.account.dueAmount > 0 ? "text-orange-500" : "text-[rgb(var(--color-text-primary))]"}`}
                  >
                    ₹
                    {supplierData.account.dueAmount?.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    }) || "0.00"}
                  </span>
                </div>
                {supplierData.account.onTimePaymentRate !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">
                      On-Time Payment:
                    </span>
                    <span className="font-medium text-[rgb(var(--color-text-primary))]">
                      {supplierData.account.onTimePaymentRate || 0}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        supplierName={supplierData?.name}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <DeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        supplierName={deletedSupplierName}
        onClose={handleDeleteSuccess}
      />
    </div>
  );
};

export default SupplierActions;
