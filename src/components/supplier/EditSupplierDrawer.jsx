"use client";
import { EditSupplierDrawerPresentation } from "@dragorbit/features/suppliers";

import { useCallback, useEffect, useState } from "react";
import SupplierForm from "./SupplierForm";

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

  const getInitialFormData = useCallback(
    () => ({
      store: storeId,
      name: "",
      agency: "",
      gstNumber: "",
      gstDetail: "",
      phone: "",
      email: "",
    }),
    [storeId],
  );

  const [formData, setFormData] = useState(getInitialFormData());

  // Fetch or reset on open/close
  useEffect(() => {
    if (isOpen && supplierId) {
      setFieldErrors({});
      executeFetch(
        supplierService.getSuppliers({ id: supplierId, store: storeId }),
        { showToast: false },
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
      { message: t("suppliers.updateSuccess") },
    );

    if (result?.success) {
      onClose();
      onSuccess?.(result.data);
    } else if (result?.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    }
  };

  return (
    <EditSupplierDrawerPresentation
      model={{
        isOpen,
        onClose,
        t,
        fetching,
        SupplierForm,
        formData,
        handleFormDataChange,
        fieldErrors,
        gstVerification,
        handleSave,
        loading,
      }}
    />
  );
};

export default EditSupplierDrawer;
