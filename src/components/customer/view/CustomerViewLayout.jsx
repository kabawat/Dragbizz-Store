"use client";
import React, { useState } from "react";
import CustomerBasicInfo from "@/page/dashboard/customers/view/components/CustomerBasicInfo";
import CompanyDetails from "@/page/dashboard/customers/view/components/CompanyDetails";
import AccountDetails from "@/page/dashboard/customers/view/components/AccountDetails";
import Addresses from "@/page/dashboard/customers/view/components/Addresses";
import CustomerActions from "@/page/dashboard/customers/view/components/CustomerActions";
import DeleteModal from "@/page/dashboard/customers/view/components/DeleteModal";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { customerService } from "@/service";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";

const CustomerViewLayout = ({
    customerData,
    customerId,
    storeId,
    onEdit,
    onDownloadPDF,
    t,
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { showSuccess, showError } = useGlobalToast();
    const router = useRouter();

    const handleConfirmDelete = async () => {
        if (!customerId || !storeId) return;
        setIsDeleting(true);
        try {
            const result = await customerService.deleteCustomer(customerId, storeId);
            if (result.success) {
                showSuccess(t("modals.deletedSuccessfully", { item: t("common.customer") }));
                router.push("/dashboard/customers");
            } else {
                showError(result.message || t("errors.failedToDelete", { item: t("common.customer") }));
            }
        } catch (_error) {
            showError(t("errors.failedToDeleteTryAgain", { item: t("common.customer") }));
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    useCommonHotkeys({
        onDelete: () => setShowDeleteModal(true),
        onClose: () => {
            if (showDeleteModal) setShowDeleteModal(false);
        }
    });

    if (!customerData) return null;

    return (
        <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            style={{ height: "calc(100vh - 300px)" }}
        >
            <div className="lg:col-span-2 flex flex-col h-full">
                <div
                    className="overflow-y-auto pe-3 space-y-6"
                    style={{
                        height: "calc(100vh - 200px)",
                        maxHeight: "calc(100vh - 200px)",
                    }}
                >
                    <CustomerBasicInfo customerData={customerData} />
                    <CompanyDetails companyDetails={customerData.companyDetails} />
                    <AccountDetails account={customerData.account} />
                    <Addresses addresses={customerData.addresses} />
                </div>
            </div>

            <CustomerActions
                customerData={customerData}
                onEdit={onEdit}
                onDelete={() => setShowDeleteModal(true)}
                onDownloadPDF={onDownloadPDF}
            />

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

export default CustomerViewLayout;
