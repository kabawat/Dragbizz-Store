"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, ArrowLeft } from "lucide-react";

// Import components
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { SupplierForm } from "@/components/supplier";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import useErrorHandling from "@/hooks/useErrorHandling";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

const AddSupplierPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId =
    selectedStore?.storeId || selectedStore?._id || selectedStore?.id || "";

  const [loading, setLoading] = useState(false);
  const {
    handleApiError,
    handleApiResult,
    fieldErrors,
    setFieldErrors,
    QuotaModal,
    showSuccess,
    clearFieldErrors,
  } = useErrorHandling();

  // Initial form data
  const getInitialFormData = () => ({
    store: storeId,
    name: "",
    agency: "",
    gstNumber: "",
    phone: "",
    email: "",
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // Update store ID when selectedStore changes
  useEffect(() => {
    if (storeId) {
      setFormData((prevData) => ({
        ...prevData,
        store: storeId,
      }));
    }
  }, [storeId]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    // Ensure fieldName is a string
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

  const handleSaveAndPublish = async () => {
    try {
      setLoading(true);
      clearFieldErrors();

      if (!formData.phone && !formData.email) {
        setFieldErrors({
          phone: t("suppliers.phoneOrEmailRequired"),
          email: t("suppliers.phoneOrEmailRequired"),
        });
        setLoading(false);
        return;
      }

      const result = await supplierService.createSupplier(formData);
      const handled = handleApiResult(
        result,
        t("suppliers.createSuccess"),
        "supplier-creation"
      );

      if (handled.type === "success") {
        setTimeout(() => {
          setFormData(getInitialFormData());
          clearFieldErrors();
          router.push("/dashboard/suppliers");
        }, 1500);
      }
    } catch (error) {
      handleApiError(error, "supplier-creation");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/dashboard/suppliers");
  };

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title={t("suppliers.addNewSupplier")}
          description={t("suppliers.addNewSupplierDescription")}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-4">
              <Link
                href="/dashboard/suppliers"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("suppliers.backToSuppliers")}
                </span>
              </Link>
            </div>
            {/* Form Container - Scrollable */}
            <div className="overflow-hidden">
              <div className="h-[calc(100vh-240px)] overflow-y-auto pe-3">
                <SupplierForm
                  formData={formData}
                  onChange={handleFormDataChange}
                  fieldErrors={fieldErrors}
                />
              </div>

              {/* Fixed Action Bar */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleSaveAndPublish}
                    disabled={loading}
                    loading={loading}
                    leftIcon={Save}
                  >
                    {t("suppliers.saveSupplier")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {QuotaModal}
    </div>
  );
};

export default AddSupplierPage;
