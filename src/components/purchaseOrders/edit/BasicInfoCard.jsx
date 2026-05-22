"use client";
import React from "react";
import { Building2, Calendar, FileText } from "lucide-react";
import { Card, Input, Select, Textarea } from "@/components/ui";

const BasicInfoCard = ({
  t,
  formData,
  handleInputChange,
  suppliers,
  suppliersLoading,
  errors,
}) => {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center mb-6">
          <div
            className="w-10 h-10 rounded-lg flex border border-[rgb(var(--color-border-primary))] items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(var(--color-primary), 0.1)" }}
          >
            <FileText
              className="w-5 h-5"
              style={{ color: "rgb(var(--color-primary))" }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("purchaseOrders.basicInformation")}
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("purchaseOrders.essentialDetailsForPO")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
              {t("purchaseOrders.supplier")} *
            </label>
            <Select
              value={formData.supplier}
              onChange={(value) => handleInputChange("supplier", value)}
              options={[
                {
                  value: "",
                  label: suppliersLoading
                    ? t("common.loading")
                    : t("purchaseOrders.selectSupplier"),
                },
                ...suppliers
                  .filter((s) => s.name || s.supplierName)
                  .map((s) => ({
                    value: s.id || s._id,
                    label: s.name || s.supplierName,
                  })),
              ]}
              error={errors.supplier}
              disabled={suppliersLoading}
              leftIcon={Building2}
              size="sm"
              searchable={true}
              placeholder={t("purchaseOrders.chooseSupplier")}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
              {t("purchaseOrders.paymentDueIn")}
            </label>
            <Select
              size="sm"
              value={formData.paymentBy}
              onChange={(value) => handleInputChange("paymentBy", value)}
              options={[
                { value: "COD", label: t("purchaseOrders.cashOnDelivery") },
                { value: "7_DAYS", label: "7 Days" },
                { value: "15_DAYS", label: "15 Days" },
                { value: "30_DAYS", label: "30 Days" },
                { value: "45_DAYS", label: "45 Days" },
                { value: "60_DAYS", label: "60 Days" },
                { value: "90_DAYS", label: "90 Days" },
              ]}
              leftIcon={Calendar}
            />
          </div>

          <div className="space-y-2">
            <label className="block text sm font-medium text-[rgb(var(--color-text-primary))]">
              {t("purchaseOrders.expectedDeliveryDate")}
            </label>
            <Input
              type="date"
              size="sm"
              value={formData.expectedDeliveryDate}
              onChange={(value) =>
                handleInputChange("expectedDeliveryDate", value)
              }
              error={errors.expectedDeliveryDate}
              leftIcon={Calendar}
              placeholder={t("purchaseOrders.selectDeliveryDate")}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
              {t("purchaseOrders.referenceNumber")}
            </label>
            <Input
              type="text"
              size="sm"
              value={formData.reference}
              onChange={(value) => handleInputChange("reference", value)}
              leftIcon={FileText}
              placeholder={t("purchaseOrders.enterReferenceNumber")}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            {t("purchaseOrders.additionalNotes")}
          </label>
          <Textarea
            value={formData.note}
            onChange={(value) => handleInputChange("note", value)}
            placeholder={t("purchaseOrders.addSpecialInstructions")}
            rows={3}
            leftIcon={FileText}
            maxLength={500}
          />
          {formData.note && (
            <div className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2 text-right">
              {formData.note.length}/500 {t("purchaseOrders.characters")}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BasicInfoCard;
