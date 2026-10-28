import { Tooltip as SharedTooltip } from "@dragorbit/ui";
import {
  Building2,
  Check,
  Mail,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Input, Select } from "@/components/ui";
import { STORE_CATEGORIES } from "@/data";
import styles from "../Onboarding.module.css";

export default function BasicInfoStep({
  formData,
  errors,
  fieldErrors,
  isVerifyingGst,
  isGstVerified,
  onVerifyGst,
  onPanBlur,
  onUpdate,
  showContact,
  onToggleContact,
  disabled,
}) {
  const fieldError = (field) => fieldErrors[field] || errors[field];
  const contactVisible =
    showContact || Boolean(fieldError("phone") || fieldError("email"));
  return (
    <fieldset disabled={disabled} className={styles.storeFields}>
      <div>
        <Input
          id="store-gst"
          type="text"
          size="md"
          label="GST number (optional)"
          placeholder="e.g. 07AAKCS5515R1ZN"
          value={formData.gst}
          onChange={(value) => onUpdate("gst", value)}
          maxLength={15}
          autoCapitalize="characters"
          spellCheck={false}
          onBlur={onVerifyGst}
          leftIcon={Building2}
          error={Boolean(fieldError("gst"))}
          errorMessage={fieldError("gst")}
          rightElement={
            formData.gst.length === 15 ? (
              <SharedTooltip content={isGstVerified ? "GST verified" : "Verify GST"}><button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={onVerifyGst}
                disabled={isVerifyingGst || isGstVerified}
                className={styles.verifyGst}
                aria-label={isGstVerified ? "GST verified" : "Verify GST"}

              >
                {isVerifyingGst ? (
                  <span className={styles.smallSpinner} />
                ) : isGstVerified ? (
                  <Check size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}
              </button></SharedTooltip>
            ) : undefined
          }
        />
        <div className={styles.panEditor}>
          <Input
            id="store-pan"
            type="text"
            size="md"
            aria-label="PAN Number (optional)"
            placeholder="PAN Number (optional)"
            value={formData.pan}
            onChange={(value) => onUpdate("pan", value)}
            onBlur={onPanBlur}
            maxLength={10}
            autoCapitalize="characters"
            spellCheck={false}
            error={Boolean(fieldError("pan"))}
            errorMessage={fieldError("pan")}
          />
        </div>
      </div>
      <Input
        id="store-name"
        type="text"
        size="md"
        label="Store name"
        placeholder="e.g. Drag Stores – Main Branch"
        value={formData.name}
        onChange={(value) => onUpdate("name", value)}
        leftIcon={Store}
        required
        autoComplete="organization"
        error={Boolean(fieldError("name"))}
        errorMessage={fieldError("name")}
      />
      <Select
        size="md"
        placeholder="Select store category"
        value={formData.category}
        onChange={(value) => onUpdate("category", value)}
        options={STORE_CATEGORIES}
        searchable
        required
        disabled={disabled}
        error={Boolean(fieldError("category"))}
        errorMessage={fieldError("category")}
      />
      <div>
        <button
          type="button"
          onClick={onToggleContact}
          className={styles.textAction}
          aria-expanded={contactVisible}
          aria-controls="store-contact-fields"
        >
          {contactVisible ? "Hide contact" : "Add contact"}
        </button>
        {contactVisible && (
          <div id="store-contact-fields" className={styles.contactFields}>
            <Input
              id="store-phone"
              type="tel"
              size="md"
              label="Phone number (optional)"
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={(value) => onUpdate("phone", value)}
              leftIcon={Phone}
              autoComplete="tel"
              error={Boolean(fieldError("phone"))}
              errorMessage={fieldError("phone")}
            />
            <Input
              id="store-email"
              type="email"
              size="md"
              label="Email (optional)"
              placeholder="e.g. store@example.com"
              value={formData.email}
              onChange={(value) => onUpdate("email", value)}
              leftIcon={Mail}
              autoComplete="email"
              error={Boolean(fieldError("email"))}
              errorMessage={fieldError("email")}
            />
          </div>
        )}
      </div>
    </fieldset>
  );
}
