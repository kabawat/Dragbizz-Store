"use client";
import { ArrowUp, Package, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { FEATURE_DISPLAY_NAMES, FEATURES } from "@/constants/features";
import { useTheme } from "@/contexts/ThemeContext";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useTranslation } from "@/hooks/useTranslation";
import { stockService, supplierService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";

const StockInDrawer = ({ isOpen, onClose, product, onSuccess }) => {
  const { t } = useTranslation();
  const { themeConfig } = useTheme();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError } = useGlobalToast();
  const [formData, setFormData] = useState({
    quantity: "",
    purchasePrice: "",
    supplier: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if supplier_management feature is available
  const { checkFeatureAccess, isLoading: featuresLoading } = useFeatureAccess();
  const hasSupplierManagement = checkFeatureAccess(
    FEATURES.SUPPLIER_MANAGEMENT
  );

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        quantity: "",
        purchasePrice: "",
        supplier: "",
      });
      setErrors({});
      if (hasSupplierManagement) {
        fetchSuppliers();
      }
    }
  }, [isOpen, hasSupplierManagement, fetchSuppliers]);

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    const storeId =
      selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId || !hasSupplierManagement) return;

    try {
      setSuppliersLoading(true);
      const result = await supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      if (result.success) {
        setSuppliers(result.data?.data || result.data || []);
      }
    } catch (_error) {
    } finally {
      setSuppliersLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      newErrors.purchasePrice = "Purchase price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const storeId =
        selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

      if (!storeId) {
        throw new Error("Store not selected");
      }

      const apiPayload = {
        productId: product.id,
        store: storeId,
        batchData: {
          quantity: parseInt(formData.quantity, 10),
          purchasePrice: parseFloat(formData.purchasePrice),
          supplier: formData.supplier,
        },
      };

      const response = await stockService.addStock(apiPayload);

      if (response.success) {
        onClose();
        onSuccess?.("Stock added successfully!");
      } else {
        throw new Error(response.message || "Failed to add stock");
      }
    } catch (error) {
      showError(`Error adding stock: ${error.message || "Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const _handleQuantityChange = (type) => {
    const currentQuantity = parseInt(formData.quantity, 10) || 0;
    const newQuantity =
      type === "increment"
        ? currentQuantity + 1
        : Math.max(0, currentQuantity - 1);
    handleInputChange("quantity", newQuantity.toString());
  };

  const handleSupplierChange = (value) => {
    // Check if user has supplier management access
    if (!hasSupplierManagement && value) {
      setShowUpgradeModal(true);
      return;
    }
    handleInputChange("supplier", value);
  };

  // Format suppliers for Select component
  const formattedSuppliers = suppliers.map((supplier) => ({
    value: supplier._id,
    label: supplier.name,
  }));

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[42rem] bg-[rgb(var(--color-bg-primary))] shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                Stock In
              </h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                Add inventory for {product?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info */}
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(var(--color-text-primary))]">
                    {product?.name}
                  </h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    SKU: {product?.sku} | Current Stock: {product?.stock || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity and Purchase Price - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("inventory.quantity")} *
                </label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(value) => handleInputChange("quantity", value)}
                  placeholder={t("inventory.enterQuantity")}
                  error={errors.quantity}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
                )}
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("inventory.purchasePricePerUnit")} *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(value) =>
                    handleInputChange("purchasePrice", value)
                  }
                  placeholder={t("inventory.enterPurchasePricePerUnit")}
                  error={errors.purchasePrice}
                />
                {errors.purchasePrice && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.purchasePrice}
                  </p>
                )}
              </div>
            </div>

            {/* Supplier */}
            <div className="relative">
              <Select
                label={t("inventory.supplierOptional")}
                placeholder={
                  !hasSupplierManagement
                    ? t("inventory.enableSupplierManagementToSelect")
                    : t("inventory.searchAndSelectSupplierOptional")
                }
                value={formData.supplier || ""}
                onChange={handleSupplierChange}
                error={errors.supplier}
                errorMessage={errors.supplier}
                searchable={true}
                options={hasSupplierManagement ? formattedSuppliers : []}
                loading={suppliersLoading}
                disabled={
                  !hasSupplierManagement || suppliersLoading || featuresLoading
                }
                helperText={
                  !hasSupplierManagement
                    ? t("inventory.enableSupplierManagementFeature")
                    : t("inventory.optionalTypeToSearchSuppliers")
                }
              />

              {/* Upgrade Button */}
              {!hasSupplierManagement && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUpgradeModal(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-500 hover:text-amber-600 hover:bg-[rgb(var(--color-bg-secondary))] rounded-md transition-colors duration-200 border-0 shadow-none"
                  title={t("inventory.upgradeToEnableSupplierManagement")}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>{t("common.upgrade")}</span>
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))]">
              <h4 className="font-medium text-[rgb(var(--color-text-primary))] mb-3">
                {t("inventory.stockAdditionSummary")}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    Quantity:
                  </span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {formData.quantity || 0} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    {t("inventory.purchasePrice")}:
                  </span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    ₹{formData.purchasePrice || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    {t("inventory.totalValue")}:
                  </span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    ₹
                    {(
                      (parseFloat(formData.quantity) || 0) *
                      (parseFloat(formData.purchasePrice) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    {t("inventory.newStock")}:
                  </span>
                  <span className="text-green-500 font-medium">
                    {(product?.stock || 0) +
                      (parseInt(formData.quantity, 10) || 0)}{" "}
                    units
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              loading={isLoading}
              leftIcon={Package}
            >
              Add Stock
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Supplier Management"
        requiredFeature={
          FEATURE_DISPLAY_NAMES[FEATURES.SUPPLIER_MANAGEMENT] ||
          "Supplier Management"
        }
      />
    </>
  );
};

export default StockInDrawer;
