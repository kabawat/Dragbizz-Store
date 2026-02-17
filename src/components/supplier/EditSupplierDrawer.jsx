"use client";
import { Building2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import SupplierForm from "./SupplierForm";
import { Button, SideDrawer } from "@/components/ui";
import useErrorHandling from "@/hooks/useErrorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { useGstVerification } from "@/hooks/useGstVerification";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";

const EditSupplierDrawer = ({ isOpen, onClose, onSuccess, supplierId }) => {
    const { t } = useTranslation();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId =
        selectedStore?.storeId || selectedStore?._id || selectedStore?.id || "";

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const {
        handleApiError,
        handleApiResult,
        fieldErrors,
        setFieldErrors,
        clearFieldErrors,
    } = useErrorHandling();

    // GST Verification Hook
    const gstVerification = useGstVerification({
        onNameAutoFill: (name) => {
            setFormData((prev) => ({
                ...prev,
                agency: name,
            }));
        },
        ongstDetailChange: (id) => {
            setFormData((prev) => ({
                ...prev,
                gstDetail: id,
            }));
        },
    });

    // Initial form data
    const getInitialFormData = useCallback(() => ({
        store: storeId,
        name: "",
        agency: "",
        gstNumber: "",
        gstDetail: "",
        phone: "",
        email: "",
    }), [storeId]);

    const [formData, setFormData] = useState(getInitialFormData());

    // Reset form when drawer opens/closes
    useEffect(() => {
        const fetchSupplierData = async () => {
            if (!supplierId || !storeId || !isOpen) return;

            try {
                setFetching(true);
                clearFieldErrors();

                const result = await supplierService.getSuppliers({
                    id: supplierId,
                    store: storeId,
                });

                if (result.success && result.data) {
                    const supplierData = result.data;
                    setFormData({
                        store: storeId,
                        name: supplierData.name || "",
                        agency: supplierData.agency || "",
                        gstNumber: supplierData.gstNumber || "",
                        gstDetail: supplierData.gstDetail || "",
                        phone: supplierData.phone || "",
                        email: supplierData.email || "",
                    });
                }
            } catch (error) {
                handleApiError(error, "supplier-fetch");
            } finally {
                setFetching(false);
            }
        };

        if (isOpen && supplierId) {
            fetchSupplierData();
        } else if (!isOpen) {
            setFormData(getInitialFormData());
            clearFieldErrors();
        }
    }, [isOpen, supplierId, storeId, clearFieldErrors, getInitialFormData, handleApiError]);

    // Handle form data changes
    const handleFormDataChange = (fieldName, value) => {
        if (typeof fieldName !== "string") {
            return;
        }

        // Clear error for this field when user starts typing
        if (fieldErrors[fieldName]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }

        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: value,
        }));
    };

    // Handle save
    const handleSave = async () => {
        try {
            setLoading(true);
            clearFieldErrors();

            if (!formData.phone && !formData.email) {
                const errorMsg = t("suppliers.phoneOrEmailRequired");
                setFieldErrors({
                    phone: errorMsg,
                    email: errorMsg,
                });
                setLoading(false);
                return;
            }

            const result = await supplierService.updateSupplier(supplierId, formData, storeId);
            const handled = handleApiResult(
                result,
                t("suppliers.updateSuccess") || "Supplier updated successfully",
                "supplier-update"
            );

            if (handled.type === "success") {
                onClose();
                if (onSuccess) {
                    onSuccess(result.data);
                }
            }
        } catch (error) {
            handleApiError(error, "supplier-update");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={handleClose}
            title={t("suppliers.editSupplier") || "Edit Supplier"}
            icon={Building2}
            description={t("suppliers.editSupplierDescription") || "Update supplier information"}
            width="w-full md:w-2/3 lg:w-1/2"
        >
            <div className="p-3 sm:p-4 md:p-6 h-full">
                {fetching ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[rgb(var(--color-text-secondary))] font-medium">Loading supplier details...</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
                            <SupplierForm
                                formData={formData}
                                onChange={handleFormDataChange}
                                fieldErrors={fieldErrors}
                                mode="drawer"
                                gstVerification={gstVerification}
                            />
                        </div>

                        {/* Footer - Action Buttons */}
                        <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
                            <Button
                                variant="success"
                                onClick={handleSave}
                                disabled={loading}
                                loading={loading}
                                leftIcon={Save}
                                className="w-full sm:w-auto"
                                size="sm"
                            >
                                {t("suppliers.updateSupplier") || "Update Supplier"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                                className="w-full sm:w-auto"
                                size="sm"
                            >
                                {t("common.cancel")}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </SideDrawer>
    );
};

export default EditSupplierDrawer;
