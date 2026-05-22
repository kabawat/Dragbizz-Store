"use client";
import { Plus, Save } from "lucide-react";
import { useState } from "react";
import { FormDrawer } from "@/components/common";
import storeService from "@/service/retailer/store.service";
import useApiResponse from "@/hooks/useApiResponse";
import StoreEditForm from "./StoreEditForm";
import { useGstVerification } from "@/hooks/form/useGstVerification";
import { VALIDATION_REGEX } from "@/utils/validators";
import { useAppSelector } from "@/store/hooks";

const INITIAL_FORM = {
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
  hasExpiryDate: false,
  gst: "",
  gstDetail: null,
  pan: "",
  catalogId: "",
};

const StoreAddDrawer = ({ isOpen, onClose, onSuccess, onError }) => {
  const { agency } = useAppSelector((state) => state.profile);
  const [form, setForm] = useState(INITIAL_FORM);
  const { execute, loading: isCreating, fieldErrors: errors, setFieldErrors: setErrors } = useApiResponse();

  // Hook for GST verification
  const {
    isVerifyingGst,
    isGstVerified,
    handleVerifyGst: verifyGst,
    resetGstVerification
  } = useGstVerification(setForm);

  // Handle GST Verification
  const handleVerifyGst = async () => {
    if (!form.gst || form.gst.length < 15) {
      setErrors((prev) => ({ ...prev, gst: "Please enter a valid GST number" }));
      return;
    }
    await verifyGst(form.gst);
  };

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
      if (name === "gst") {
        resetGstVerification();
      }
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
      const cleanPhone = form.phone.replace(/\D/g, "");
      if (!VALIDATION_REGEX.PHONE.test(form.phone) || cleanPhone.length < 10) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (!form.address?.city?.trim()) {
      newErrors["address.city"] = "City is required";
    }

    if (form.email && !VALIDATION_REGEX.EMAIL.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (form.gst && !VALIDATION_REGEX.GST.test(form.gst)) {
      newErrors.gst = "Please enter a valid GST number";
    }

    if (form.pan && !VALIDATION_REGEX.PAN.test(form.pan)) {
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

    setErrors({});

    const payload = {
      name: form.name.trim(),
      agency: agency.agencyId,
      phone: form.phone.trim(),
      email: form.email?.trim() || "",
      address: {
        line1: form.address.street || form.address.line1 || "",
        line2: "", // Not collected in form
        city: form.address.city,
        state: form.address.state || "",
        country: "India", // Default to India
        pincode: form.address.pincode || "",
        landmark: form.address.landmark || "",
        location: {
          type: "Point",
          coordinates: [0, 0], // Default location as it's not collected in form yet
        },
      },
      category: form.category || "",
      subCategories: [],
      tags: [],
      hasExpiryDate: form.hasExpiryDate === true,
      gst: form.gst?.trim() || "",
      gstDetail: form.gstDetail || null,
      pan: form.pan?.trim() || "",
      catalogId: form.catalogId?.trim() || null,
      status: "active",
      metadata: {
        gst: form.gst?.trim() || "",
        owner: agency.userId || "",
      },
    };

    const result = await execute(storeService.createStore(payload), { showToast: false });

    if (result?.success) {
      onSuccess?.(result.message || "Store created successfully!");
      handleCancel();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setForm(INITIAL_FORM);
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
      <StoreEditForm
        form={form}
        onChange={handleChange}
        errors={errors}
        isVerifyingGst={isVerifyingGst}
        isGstVerified={isGstVerified}
        onVerifyGst={handleVerifyGst}
      />
    </FormDrawer>
  );
};

export default StoreAddDrawer;
