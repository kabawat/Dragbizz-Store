"use client";
import { useState, useEffect } from "react";
import { Save, Store, Loader2 } from "lucide-react";
import { FormDrawer } from "@/components/common";
import StoreEditForm from "./StoreEditForm";
import storeService from "@/service/retailer/store.service";

const StoreEditDrawer = ({
  isOpen,
  editingStoreId,
  onClose,
  onSuccess,
  onError,
}) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: {
      street: "",
      line1: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    category: "",
    gst: "",
    pan: "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStore, setIsLoadingStore] = useState(false);

  // Fetch store data when drawer opens
  useEffect(() => {
    if (isOpen && editingStoreId) {
      const fetchStoreData = async () => {
        try {
          setIsLoadingStore(true);
          setErrors({});

          // Fetch store details
          const result = await storeService.getStore(editingStoreId);

          if (result?.success) {
            const storeData = result.data?.data || result.data || {};
            const address = storeData.address || {};

            // Format form data
            setForm({
              name: storeData.name || "",
              phone: storeData.phone || "",
              email: storeData.email || "",
              address: {
                street: address.line1 || "",
                line1: address.line1 || "",
                city: address.city || "",
                state: address.state || "",
                pincode: address.pincode || "",
                landmark: address.landmark || "",
              },
              category: storeData.category || "",
              gst: storeData.gst || "",
              pan: storeData.pan || "",
            });
          } else {
            onError?.(result?.message || "Failed to fetch store details");
          }
        } catch (error) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "An unexpected error occurred";
          onError?.(errorMessage);
        } finally {
          setIsLoadingStore(false);
        }
      };

      fetchStoreData();
    }
  }, [isOpen, editingStoreId, onError]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Handle nested address fields
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
          // Also update line1 if it's street
          ...(field === "street" && { line1: value }),
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!form.name?.trim()) {
      newErrors.name = "Store name is required";
    }

    if (!form.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
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
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        form.gst,
      )
    ) {
      newErrors.gst = "Please enter a valid GST number";
    }

    if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) {
      newErrors.pan = "Please enter a valid PAN number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save store
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

      // Prepare payload according to API structure
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
        gst: form.gst?.trim() || "",
        pan: form.pan?.trim() || "",
      };

      const result = await storeService.updateStore(editingStoreId, payload);

      if (result?.success) {
        onSuccess?.(result.message || "Store updated successfully!");
        handleCancel();
      } else {
        // Handle field errors from API
        if (result?.error?.data?.fields) {
          setErrors(result.error.data.fields);
        } else {
          onError?.(
            result?.message || "Failed to update store. Please try again.",
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred. Please try again.";
      onError?.(errorMessage);

      // Handle field errors from API
      if (error?.response?.data?.fields) {
        setErrors(error.response.data.fields);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      address: {
        street: "",
        line1: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
      },
      category: "",
      gst: "",
      pan: "",
    });
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
        <StoreEditForm form={form} onChange={handleChange} errors={errors} />
      )}
    </FormDrawer>
  );
};

export default StoreEditDrawer;
