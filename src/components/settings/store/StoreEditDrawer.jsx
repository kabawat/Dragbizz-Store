"use client";
import { Loader2, Save, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormDrawer } from "@/components/common";
import storeService from "@/service/retailer/store.service";
import StoreEditForm from "./StoreEditForm";
import { useGstVerification } from "@/hooks/form/useGstVerification";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";
import {
  EMPTY_STORE_FORM,
  mapStoreToForm,
  resolveStoreId,
} from "./storeForm.utils";

const StoreEditDrawer = ({
  isOpen,
  editingStore,
  onClose,
  onSuccess,
  onError,
}) => {
  const [form, setForm] = useState(EMPTY_STORE_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStore, setIsLoadingStore] = useState(false);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const editingStoreId = resolveStoreId(editingStore);

  const {
    isVerifyingGst,
    isGstVerified: isGstVerifiedFromApi,
    handleVerifyGst: verifyGstNumber,
    resetGstVerification,
  } = useGstVerification(setForm);

  const isGstVerified = isGstVerifiedFromApi || Boolean(form.gstDetail);
  
  useEffect(() => {
    if (!isOpen || !editingStoreId) return;

    if (editingStore) {
      setForm(mapStoreToForm(editingStore));
      setErrors({});
      setIsLoadingStore(false);
      return;
    }

    let cancelled = false;

    const fetchStoreData = async () => {
      try {
        setIsLoadingStore(true);
        setErrors({});

        const response = await storeService.getStore(editingStoreId);
        const result = handleSuccess(response);

        if (cancelled) return;

        setForm(mapStoreToForm(result.data || {}));
      } catch (error) {
        if (cancelled) return;
        const result = handleError(error);
        onErrorRef.current?.(result.message || "Failed to fetch store details");
      } finally {
        if (!cancelled) {
          setIsLoadingStore(false);
        }
      }
    };

    fetchStoreData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, editingStoreId, editingStore]);

  const handleVerifyGst = async () => {
    if (!form.gst || form.gst.length < 15) {
      setErrors((prev) => ({ ...prev, gst: "Please enter a valid GST number" }));
      return;
    }
    await verifyGstNumber(form.gst);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
          ...(field === "street" && { line1: value }),
        },
      }));
    } else {
      if (name === "gst") {
        resetGstVerification();
      }
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name?.trim()) {
      newErrors.name = "Store name is required";
    }

    if (!form.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
      const cleanPhone = form.phone.replace(/\D/g, "");
      if (!phoneRegex.test(form.phone) || cleanPhone.length < 10) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (!form.address?.city?.trim()) {
      newErrors["address.city"] = "City is required";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      form.gst &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst)
    ) {
      newErrors.gst = "Please enter a valid GST number";
    }

    if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) {
      newErrors.pan = "Please enter a valid PAN number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!editingStoreId) {
      onError?.("Store ID not found");
      return;
    }

    try {
      setIsSaving(true);
      setErrors({});

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || "",
        address: {
          line1: form.address.street || form.address.line1 || "",
          line2: "",
          city: form.address.city,
          state: form.address.state || "",
          country: "India",
          pincode: form.address.pincode || "",
          landmark: form.address.landmark || "",
        },
        category: form.category || "",
        hasExpiryDate: form.hasExpiryDate === true,
        gst: form.gst?.trim() || "",
        gstDetail: form.gstDetail || null,
        pan: form.pan?.trim() || "",
        catalogId: form.catalogId?.trim() || null,
      };

      const response = await storeService.updateStore(editingStoreId, payload);
      const result = handleSuccess(response);

      if (result?.success) {
        onSuccess?.(result.message || "Store updated successfully!");
        handleCancel();
      } else {
        onError?.(result.message || "Failed to update store. Please try again.");
      }
    } catch (error) {
      const result = handleError(error);
      onError?.(result.message || "An unexpected error occurred. Please try again.");

      if (result.fields) {
        setErrors(result.fields);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_STORE_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Store"
      icon={Store}
      description="Update store information"
      width="w-full md:w-2/3 lg:w-1/2"
      onSave={handleSave}
      onCancel={handleCancel}
      saveLabel={isSaving ? "Saving..." : "Save Changes"}
      cancelLabel="Cancel"
      isSaving={isSaving}
      isLoading={isLoadingStore}
      saveIcon={Save}
      saveVariant="primary"
    >
      {isLoadingStore ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-primary))]" />
            <span className="text-sm text-[rgb(var(--color-text-secondary))]">
              Loading store details...
            </span>
          </div>
        </div>
      ) : (
        <StoreEditForm
          form={form}
          onChange={handleChange}
          errors={errors}
          isVerifyingGst={isVerifyingGst}
          isGstVerified={isGstVerified}
          onVerifyGst={handleVerifyGst}
        />
      )}
    </FormDrawer>
  );
};

export default StoreEditDrawer;
