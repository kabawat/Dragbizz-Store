"use client";
import { Building2, Mail, MapPin, Phone, Store } from "lucide-react";
import { Checkbox, Input, Select } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { copyToClipboard } from "@/utils/clipboard";

const StoreEditForm = ({ form, onChange, errors = {} }) => {
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
    { value: "electronics", label: t("settings.storeCategories.electronics") },
    { value: "clothing", label: t("settings.storeCategories.clothing") },
    { value: "food", label: t("settings.storeCategories.food") },
    { value: "pharmacy", label: t("settings.storeCategories.pharmacy") },
    { value: "books", label: t("settings.storeCategories.books") },
    { value: "home", label: t("settings.storeCategories.home") },
    { value: "automotive", label: t("settings.storeCategories.automotive") },
    { value: "beauty", label: t("settings.storeCategories.beauty") },
    { value: "sports", label: t("settings.storeCategories.sports") },
    { value: "other", label: t("settings.storeCategories.other") },
  ];

  return (
    <div className="space-y-6">
      {/* Store Name */}
      <Input
        label={t("settings.storeName")}
        name="name"
        type="text"
        value={form.name || ""}
        onChange={(value) => handleInputChange("name", value)}
        placeholder={t("settings.enterStoreName")}
        leftIcon={Store}
        error={errors.name}
      />

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label={t("settings.phoneNumber")}
          name="phone"
          type="tel"
          value={form.phone || ""}
          onChange={(value) => handleInputChange("phone", value)}
          placeholder={t("settings.enterPhoneNumber")}
          leftIcon={Phone}
          error={errors.phone}
        />

        <Input
          label={t("settings.emailOptional")}
          name="email"
          type="email"
          value={form.email || ""}
          onChange={(value) => handleInputChange("email", value)}
          placeholder={t("settings.enterEmailAddress")}
          leftIcon={Mail}
          error={errors.email}
        />
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          {t("settings.addressInformation")}
        </h3>

        {/* Street Address */}
        <Input
          label={t("settings.streetAddressOptional")}
          name="address.street"
          type="text"
          value={form.address?.street || form.address?.line1 || ""}
          onChange={(value) => handleAddressChange("street", value)}
          placeholder={t("settings.enterStreetAddress")}
          leftIcon={MapPin}
          error={errors["address.street"] || errors["address.line1"]}
        />

        {/* City, State, Pincode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label={t("settings.city")}
            name="address.city"
            type="text"
            value={form.address?.city || ""}
            onChange={(value) => handleAddressChange("city", value)}
            placeholder={t("settings.enterCity")}
            leftIcon={MapPin}
            error={errors["address.city"]}
          />

          <Input
            label={t("settings.stateOptional")}
            name="address.state"
            type="text"
            value={form.address?.state || ""}
            onChange={(value) => handleAddressChange("state", value)}
            placeholder={t("settings.enterState")}
            leftIcon={MapPin}
            error={errors["address.state"]}
          />

          <Input
            label={t("settings.pincodeOptional")}
            name="address.pincode"
            type="text"
            value={form.address?.pincode || ""}
            onChange={(value) => handleAddressChange("pincode", value)}
            placeholder={t("settings.enterPincode")}
            leftIcon={MapPin}
            error={errors["address.pincode"]}
          />
        </div>

        {/* Landmark */}
        <Input
          label={t("settings.landmarkOptional")}
          name="address.landmark"
          type="text"
          value={form.address?.landmark || ""}
          onChange={(value) => handleAddressChange("landmark", value)}
          placeholder={t("settings.enterLandmark")}
          leftIcon={MapPin}
          error={errors["address.landmark"]}
        />
      </div>

      {/* Business Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
          {t("settings.businessInformation")}
        </h3>

        {/* Store Category */}
        <Select
          label={t("settings.storeCategoryOptional")}
          name="category"
          value={form.category || ""}
          onChange={(value) => handleInputChange("category", value)}
          options={storeCategories}
          placeholder={t("settings.selectStoreCategory")}
          searchable={true}
        />

        {/* Products require expiry date (Grocery / Pharma) */}
        <Checkbox
          label={t("settings.productsRequireExpiryDate") || "Products require expiry date (e.g. Grocery, Pharma)"}
          checked={form.hasExpiryDate === true}
          onChange={(checked) => handleInputChange("hasExpiryDate", checked)}
          description={t("settings.productsRequireExpiryDateHint") || "Enable for stores selling perishables or pharma."}
        />

        {/* GST & PAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t("settings.gstNumberOptional")}
            name="gst"
            type="text"
            value={form.gst || ""}
            onChange={(value) => handleInputChange("gst", value)}
            placeholder={t("settings.enterGstNumber")}
            leftIcon={Building2}
            error={errors.gst}
          />

          <Input
            label={t("settings.panNumberOptional")}
            name="pan"
            type="text"
            value={form.pan || ""}
            onChange={(value) => handleInputChange("pan", value)}
            placeholder={t("settings.enterPanNumber")}
            leftIcon={Building2}
            error={errors.pan}
          />
        </div>
      </div>

    </div>
  );
};

export default StoreEditForm;
