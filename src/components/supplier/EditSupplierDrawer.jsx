"use client";
import { Building2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import SupplierForm from "./SupplierForm";
import { Button, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGstVerification } from "@/hooks/form/useGstVerification";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";

const EditSupplierDrawer = ({ isOpen, onClose, onSuccess, supplierId }) => {
    const { t } = useTranslation();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId || "";

    const [fieldErrors, setFieldErrors] = useState({});
    const { execute: executeFetch, loading: fetching } = useApiResponse();
    const { execute: executeSave, loading } = useApiResponse();

    // GST Verification Hook
    const gstVerification = useGstVerification({
        onNameAutoFill: (name) => {
            setFormData((prev) => ({ ...prev, agency: name }));
        },
        ongstDetailChange: (id) => {
            setFormData((prev) => ({ ...prev, gstDetail: id }));
        },
    });

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

    // Fetch or reset on open/close
    useEffect(() => {
        if (isOpen && supplierId) {
            setFieldErrors({});
            executeFetch(
                supplierService.getSuppliers({ id: supplierId, store: storeId }),
                { showToast: false }
            ).then((result) => {
                if (result?.success && result.data) {
                    const s = result.data?.data || result.data;
                    setFormData({
                        store: storeId,
                        name: s.name || "",
                        agency: s.agency || "",
                        gstNumber: s.gstNumber || "",
                        gstDetail: s.gstDetail || "",
                        phone: s.phone || "",
                        email: s.email || "",
                    });
                }
            });
        } else if (!isOpen) {
            setFormData(getInitialFormData());
            setFieldErrors({});
        }
    }, [isOpen, supplierId, storeId]);

    // Handle form field changes
    const handleFormDataChange = (fieldName, value) => {
        if (typeof fieldName !== "string") return;

        if (fieldErrors[fieldName]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }

        setFormData((prevData) => ({ ...prevData, [fieldName]: value }));
    };

    // Handle save
    const handleSave = async () => {
        setFieldErrors({});

        if (!formData.phone && !formData.email) {
            const errorMsg = t("suppliers.phoneOrEmailRequired");
            setFieldErrors({ phone: errorMsg, email: errorMsg });
            return;
        }

        const result = await executeSave(
            supplierService.updateSupplier(supplierId, formData, storeId),
            { message: t("suppliers.updateSuccess") }
        );

        if (result?.success) {
            onClose();
            onSuccess?.(result.data);
        } else if (result?.fieldErrors) {
            setFieldErrors(result.fieldErrors);
        }
    };

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={t("suppliers.editSupplier")}
            icon={Building2}
            description={t("suppliers.editSupplierDescription")}
            width="w-full md:w-2/3 lg:w-1/2"
        >
            <div className="p-3 sm:p-4 md:p-6 h-full">
                {fetching ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[rgb(var(--color-text-secondary))] font-medium">
                            {t("common.loading")}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
                            <SupplierForm
                                formData={formData}
                                onChange={handleFormDataChange}
                                fieldErrors={fieldErrors}
                                mode="drawer"
                                gstVerification={gstVerification}
                            />
                        </div>

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
                                {t("suppliers.updateSupplier")}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onClose}
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
