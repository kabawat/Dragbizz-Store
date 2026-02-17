"use client";
import SupplierForm from "./SupplierForm";
import { Building2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button, SideDrawer } from "@/components/ui";
import useErrorHandling from "@/hooks/useErrorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { useGstVerification } from "@/hooks/useGstVerification";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";

const AddSupplierDrawer = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || "";

  const {
    handleApiError,
    handleApiResult,
    fieldErrors,
    setFieldErrors,
    QuotaModal,
    clearFieldErrors,
  } = useErrorHandling();

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
  const [loading, setLoading] = useState(false);

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

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      clearFieldErrors();
    }
  }, [isOpen, clearFieldErrors, getInitialFormData]);

  // Update store ID when selectedStore changes
  useEffect(() => {
    if (storeId && isOpen) {
      setFormData((prevData) => ({
        ...prevData,
        store: storeId,
      }));
    }
  }, [storeId, isOpen]);

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

  // Handle save and publish
  const handleSaveAndPublish = async () => {
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

      const result = await supplierService.createSupplier(formData);
      const handled = handleApiResult(
        result,
        t("suppliers.addSuccess"),
        "supplier-creation"
      );

      if (handled.type === "success") {
        setFormData(getInitialFormData());
        clearFieldErrors();
        onClose();
        if (onSuccess) {
          onSuccess(result.data);
        }
      }
    } catch (error) {
      handleApiError(error, "supplier-creation");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(getInitialFormData());
    setFieldErrors({});
    onClose();
  };

  return (
    <>
      <SideDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title={t("suppliers.addSupplier")}
        icon={Building2}
        description={t("suppliers.addSupplierDescription")}
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-3 sm:p-4 md:p-6 h-full">
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
                onClick={handleSaveAndPublish}
                disabled={loading}
                loading={loading}
                leftIcon={Save}
                className="w-full sm:w-auto"
                size="sm"
              >
                {t("suppliers.saveSupplier")}
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
        </div>
      </SideDrawer>

      {QuotaModal}
    </>
  );
};

export default AddSupplierDrawer;
