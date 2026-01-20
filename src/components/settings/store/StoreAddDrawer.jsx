"use client";
import { Plus, Save } from "lucide-react";
import { useState } from "react";
import { FormDrawer } from "@/components/common";
import storeService from "@/service/retailer/store.service";
import StoreEditForm from "./StoreEditForm";

const StoreAddDrawer = ({ isOpen, agency, onClose, onSuccess, onError }) => {
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
  const [isCreating, setIsCreating] = useState(false);

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
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        form.gst
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

  // Handle save new store
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!agency || !agency.agencyId) {
      onError?.("Agency not found. Please create an agency first.");
      return;
    }

    try {
      setIsCreating(true);
      setErrors({});

      // Prepare payload according to API structure
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || "",
        address: {
          street: form.address.street || form.address.line1 || "",
          city: form.address.city,
          state: form.address.state || "",
          pincode: form.address.pincode || "",
          landmark: form.address.landmark || "",
        },
        category: form.category || "",
        gst: form.gst?.trim() || "",
        pan: form.pan?.trim() || "",
        agency: agency.agencyId,
      };

      const result = await storeService.createStore(payload);

      if (result?.success) {
        onSuccess?.(result.message || "Store created successfully!");
        handleCancel();
      } else {
        // Handle field errors from API
        if (result?.error?.data?.fields) {
          setErrors(result.error.data.fields);
        } else {
          onError?.(
            result?.message || "Failed to create store. Please try again."
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
      setIsCreating(false);
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
      title="Add New Store"
      icon={Plus}
      description="Create a new store for your agency"
      width="w-full md:w-2/3 lg:w-1/2"
      onSave={handleSave}
      onCancel={handleCancel}
      saveLabel={isCreating ? "Creating..." : "Create Store"}
      cancelLabel="Cancel"
      isSaving={isCreating}
      saveIcon={Save}
      saveVariant="primary"
    >
      <StoreEditForm form={form} onChange={handleChange} errors={errors} />
    </FormDrawer>
  );
};

export default StoreAddDrawer;
