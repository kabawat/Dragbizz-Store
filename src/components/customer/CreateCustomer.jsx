"use client";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { CustomerForm } from "@/components/customer";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGstVerification } from "@/hooks/form/useGstVerification";
import { customerService } from "@/service";
import useApiResponse from "@/hooks/useApiResponse";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addCustomer } from "@/store/slices/customers/customerSlice";

const CreateCustomer = ({
  onSuccess,
  onCancel,
  showCancelButton = true,
  mode = "page", // 'page' | 'drawer'
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";

  const {
    execute,
    loading,
    clearAll,
    fieldErrors,
    setFieldErrors,
  } = useApiResponse();

  // GST Verification Hook
  const gstVerification = useGstVerification({
    onNameAutoFill: (name) =>
      setFormData((prev) => ({
        ...prev,
        companyDetails: { ...prev.companyDetails, companyName: name },
      })),
    ongstDetailChange: (id) =>
      setFormData((prev) => ({
        ...prev,
        companyDetails: { ...prev.companyDetails, gstDetail: id },
      })),
  });

  const getInitialFormData = () => ({
    store: storeId || "",
    name: "",
    phone: "",
    email: "",
    address: "",
    companyDetails: { gstin: "", companyName: "", gstDetail: "" },
    addresses: null,
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // Sync storeId into formData when store changes
  useEffect(() => {
    if (storeId) {
      setFormData((prev) => ({ ...prev, store: storeId }));
    }
  }, [storeId]);

  const handleFormDataChange = (fieldName, value) => {
    if (fieldName === "clearError") {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n[value];
        return n;
      });
      return;
    }
    if (typeof fieldName !== "string") return;

    setFieldErrors((prev) => {
      const n = { ...prev };
      if (n[fieldName]) delete n[fieldName];
      if (fieldName === "companyDetails")
        Object.keys(n).forEach((k) => { if (k.startsWith("companyDetails.")) delete n[k]; });
      if (fieldName === "addresses")
        Object.keys(n).forEach((k) => { if (k.startsWith("addresses.")) delete n[k]; });
      return n;
    });

    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSaveAndPublish = async () => {
    // Frontend validation
    const errors = {};
    if (!formData.name?.trim()) {
      errors.name = t("validation.required", { field: t("customers.customerName") });
    }
    if (!formData.phone?.trim() && !formData.email?.trim()) {
      const msg = t("validation.eitherPhoneOrEmailRequired") || "Either Phone or Email is required";
      errors.phone = msg;
      errors.email = msg;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    clearAll(); // clears errors and message states

    // Omit companyDetails if both gstin and companyName are empty
    const payload = (() => {
      const data = { ...formData };
      const gstin = data.companyDetails?.gstin?.trim() || "";
      const companyName = data.companyDetails?.companyName?.trim() || "";
      if (!gstin && !companyName) {
        const { companyDetails, ...rest } = data;
        return rest;
      }
      return data;
    })();

    // execute manages loading=true/false, auto-wraps handleSuccess, and triggers toasts
    const result = await execute(customerService.createCustomer(payload), {
      message: t("customers.createSuccess")
    });

    if (result?.success && result?.data) {
      const addedCustomer = result.data.customer || result.data;
      dispatch(addCustomer(addedCustomer));
      setFormData(getInitialFormData());
      onSuccess?.(addedCustomer);
    }
  };

  return (
    <div className={`flex flex-col ${mode === "drawer" ? "h-full" : "min-h-full"}`}>
      <div className={`${mode === "drawer" ? "flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0" : ""}`}>
        <CustomerForm
          formData={formData}
          onChange={handleFormDataChange}
          fieldErrors={fieldErrors}
          gstVerification={gstVerification}
        />
      </div>

      {/* Action Buttons */}
      {(mode === "drawer" || showCancelButton) && (
        <div
          className={`flex-shrink-0 ${mode === "drawer"
            ? "bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6"
            : "mt-auto bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4 pb-4"
            } flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3`}
        >
          <Button
            variant="success"
            onClick={handleSaveAndPublish}
            disabled={loading}
            loading={loading}
            leftIcon={Save}
            className="w-full sm:w-auto"
            size="sm"
          >
            {t("customers.saveCustomer")}
          </Button>
          {showCancelButton && onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto"
              size="sm"
            >
              {t("common.cancel")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateCustomer;
