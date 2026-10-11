"use client";
import { StoreEditFormView } from "@dragorbit/features/settings";

import { useTranslation } from "@/hooks/ui/useTranslation";

const StoreEditForm = ({
  form,
  onChange,
  errors = {},
  isVerifyingGst,
  isGstVerified,
  onVerifyGst,
}) => {
  const { t } = useTranslation();
  // Handle Input component onChange (receives value directly)
  const handleInputChange = (name, value) => {
    const event = {
      target: { name, value },
    };
    onChange(event);
  };

  // Handle nested address fields
  const handleAddressChange = (field, value) => {
    const event = {
      target: {
        name: `address.${field}`,
        value: value,
      },
    };
    onChange(event);
  };

  const storeCategories = [
    {
      value: "electronics",
      label: t("settings.storeCategories.electronics") || "Electronics",
    },
    {
      value: "clothing",
      label: t("settings.storeCategories.clothing") || "Clothing",
    },
    {
      value: "food",
      label: t("settings.storeCategories.food") || "Food & Beverages",
    },
    {
      value: "pharmacy",
      label: t("settings.storeCategories.pharmacy") || "Pharmacy",
    },
    {
      value: "books",
      label: t("settings.storeCategories.books") || "Books & Stationery",
    },
    {
      value: "home",
      label: t("settings.storeCategories.home") || "Home & Living",
    },
    {
      value: "automotive",
      label: t("settings.storeCategories.automotive") || "Automotive",
    },
    {
      value: "beauty",
      label: t("settings.storeCategories.beauty") || "Beauty & Personal Care",
    },
    {
      value: "sports",
      label: t("settings.storeCategories.sports") || "Sports & Fitness",
    },
    { value: "other", label: t("settings.storeCategories.other") || "Other" },
  ];

  return (
    <StoreEditFormView
      model={{
        t,
        form,
        errors,
        handleInputChange,
        isGstVerified,
        isVerifyingGst,
        onVerifyGst,
        storeCategories,
        handleAddressChange,
      }}
    />
  );
};

export default StoreEditForm;
