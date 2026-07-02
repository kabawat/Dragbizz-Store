"use client";
import { useState } from "react";
import { Download, Edit, Trash2, User, Crown } from "lucide-react";
import { Button } from "@/components/ui";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { customerService } from "@/service";
import DeleteModal from "@/components/customer/view/components/DeleteModal";
import KhataCollectActions from "@/components/customer/khata/KhataCollectActions";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";

const CustomerActions = ({
  customerData,
  customerId,
  storeId,
  onEdit,
  onDownloadPDF,
}) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useGlobalToast();
  const router = useRouter();

  const { can } = useModulePermissions("customer");
  const { hasAccess, withAccess } = useSubscriptionAccess();

  const canEdit = can("edit");
  const canDelete = can("delete");
  const isReportLocked = !hasAccess("customer", false, true);

  const handleDownloadClick = withAccess(
    "customer",
    () => onDownloadPDF(customerData),
    false,
    true
  );

  const handleConfirmDelete = async () => {
    if (!customerId || !storeId) return;
    setIsDeleting(true);
    try {
      const result = await customerService.deleteCustomer(customerId, storeId);
      if (result.success) {
        showSuccess(
          t("modals.deletedSuccessfully", { item: t("common.customer") })
        );
        router.push("/dashboard/customers");
      } else {
        showError(
          result.message ||
          t("errors.failedToDelete", { item: t("common.customer") })
        );
      }
    } catch (_error) {
      showError(
        t("errors.failedToDeleteTryAgain", { item: t("common.customer") })
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  useCommonHotkeys({
    onDelete: canDelete ? () => setShowDeleteModal(true) : undefined,
    onClose: () => {
      if (showDeleteModal) setShowDeleteModal(false);
    },
  });

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-0 space-y-4">
        <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                {t("khata.quickActions")}
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {t("khata.manageThisCustomer")}
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

            {onDownloadPDF && (
              <Button
                variant="outline"
                className="flex-1 relative"
                onClick={handleDownloadClick}
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Download</span>
                {isReportLocked && (
                  <div className="absolute -top-1 -right-1 bg-[#f59e0b] text-white rounded-full p-0.5 shadow-sm">
                    <Crown size={8} className="fill-white/20" />
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>

        {customerData.account && (
          <KhataCollectActions
            storeId={storeId}
            customerId={customerId}
            customerName={customerData.name}
            customerEmail={customerData.email}
            amount={customerData.account.totalDue ?? 0}
            variant="embedded"
          />
        )}

      </div>
      <DeleteModal
        isOpen={showDeleteModal}
        customerName={customerData?.name}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CustomerActions;
