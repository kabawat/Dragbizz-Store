"use client";
import { Building2, Mail, MapPin, Phone, Store } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { copyToClipboard } from "@/utils/clipboard";

const StoreEditForm = ({ form, onChange, errors = {}, onGenerateCatalog }) => {
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

      {/* Public Catalog Settings */}
      <div className="space-y-4 pt-4 border-t border-[rgb(var(--color-border-primary))]/50">
        <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
          <Building2 className="w-4 h-4 mr-2 text-[rgb(var(--color-primary))]" />
          {t("settings.publicCatalog")}
        </h3>
        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
          {t("settings.catalogIdDescription")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {!form.catalogId ? (
            <button
              type="button"
              onClick={onGenerateCatalog}
              className="w-full flex items-center justify-center g    ap-2 px-4 py-3 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] font-semibold rounded-lg border-2 border-dashed border-[rgb(var(--color-primary))]/30 hover:bg-[rgb(var(--color-primary))]/20 transition-all group"
            >
              <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {t("settings.generateCatalogId") || "Generate Catalog Link"}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-[rgb(var(--color-primary))]/5 p-4 rounded-lg border border-[rgb(var(--color-primary))]/10">
                <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] block mb-2">
                  {t("settings.yourPublicCatalogLink")}
                </span>
                <div className="flex items-center justify-between gap-3 overflow-hidden">
                  <code className="text-sm font-mono text-[rgb(var(--color-primary))] truncate bg-white/50 px-3 py-1.5 rounded border border-[rgb(var(--color-primary))]/20 flex-1">
                    {''}/c/{form.catalogId}
                  </code>
                  <button
                    type="button"
                    onClick={async () => {
                      const success = await copyToClipboard(`${window.location.origin}/c/${form.catalogId}`);
                      if (success) {
                        alert(t("settings.linkCopied"));
                      }
                    }}
                    className="flex-shrink-0 px-4 py-1.5 bg-[rgb(var(--color-primary))] text-white text-xs font-semibold rounded hover:bg-[rgb(var(--color-primary))]/90 transition-colors shadow-sm"
                  >
                    {t("common.copy") || "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onGenerateCatalog}
                  className="text-xs text-[rgb(var(--color-primary))] hover:underline font-medium"
                >
                  {t("settings.regenerateLink") || "Regenerate Link"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreEditForm;
