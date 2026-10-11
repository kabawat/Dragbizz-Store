"use client";
import { CreateAddressCardPresentation } from "@dragorbit/features/purchase-orders";

import { useState, useEffect } from "react";

const ADDRESS_INIT = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  phone: "",
  sameAsStore: false,
};

const AddressCard = ({ t, formData, setFormData, selectedStore }) => {
  const [showBillingAddress, setShowBillingAddress] = useState(
    !!formData.billingAddress,
  );
  const [showShippingAddress, setShowShippingAddress] = useState(
    !!formData.shippingAddress,
  );

  useEffect(() => {
    setShowBillingAddress(!!formData.billingAddress);
  }, [formData.billingAddress]);

  useEffect(() => {
    setShowShippingAddress(!!formData.shippingAddress);
  }, [formData.shippingAddress]);

  const hasStoreAddress = Boolean(
    selectedStore?.address &&
      (selectedStore.address.line1 ||
        selectedStore.address.addressLine1 ||
        selectedStore.address.city ||
        selectedStore.address.state ||
        selectedStore.address.pincode),
  );

  const buildStoreAddressPayload = () => {
    const address = selectedStore?.address || {};
    return {
      addressLine1: address.line1 || address.addressLine1 || "",
      addressLine2: address.line2 || address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
      phone: selectedStore?.phone || "",
    };
  };

  const addAddress = (type) => {
    const key = type === "billing" ? "billingAddress" : "shippingAddress";
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key] ? { ...prev[key] } : { ...ADDRESS_INIT },
    }));
  };

  const removeAddress = (type) => {
    const key = type === "billing" ? "billingAddress" : "shippingAddress";
    setFormData((prev) => ({
      ...prev,
      [key]: null,
    }));
  };

  const handleAddressFieldChange = (type, field, value) => {
    const key = type === "billing" ? "billingAddress" : "shippingAddress";
    setFormData((prev) => {
      const current = prev[key] ? { ...prev[key] } : { ...ADDRESS_INIT };
      return {
        ...prev,
        [key]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleSameAsStoreToggle = (type, checked) => {
    if (checked && !hasStoreAddress) {
      return;
    }
    const key = type === "billing" ? "billingAddress" : "shippingAddress";
    setFormData((prev) => {
      const current = prev[key] ? { ...prev[key] } : { ...ADDRESS_INIT };
      if (checked) {
        const storeAddress = buildStoreAddressPayload();
        return {
          ...prev,
          [key]: {
            ...current,
            ...storeAddress,
            sameAsStore: true,
          },
        };
      }

      return {
        ...prev,
        [key]: {
          ...current,
          sameAsStore: false,
        },
      };
    });
  };

  return (
    <CreateAddressCardPresentation
      model={{
        t,
        showBillingAddress,
        addAddress,
        showShippingAddress,
        formData,
        handleSameAsStoreToggle,
        hasStoreAddress,
        removeAddress,
        handleAddressFieldChange,
      }}
    />
  );
};

export default AddressCard;
