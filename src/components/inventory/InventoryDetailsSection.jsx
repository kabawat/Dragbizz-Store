"use client";
import { ArrowUp, Calculator, Package, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardBody, Input, Select } from "@/components/ui";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { FEATURE_DISPLAY_NAMES, FEATURES } from "@/constants/features";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useTranslation } from "@/hooks/useTranslation";
import { productService, supplierService } from "@/service/retailer";

const InventoryDetailsSection = ({ formData, onChange, errors }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [_searchTerm, _setSearchTerm] = useState("");
  const [_isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // Check if supplier_management feature is available
  const { checkFeatureAccess, isLoading: featuresLoading } = useFeatureAccess();
  const hasSupplierManagement = checkFeatureAccess(
    FEATURES.SUPPLIER_MANAGEMENT
  );

  // Fetch products and suppliers on mount and when store changes
  useEffect(() => {
    fetchProducts();
    if (hasSupplierManagement) {
      fetchSuppliers();
    }
  }, [hasSupplierManagement, fetchProducts, fetchSuppliers]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const result = await productService.getProducts({
        limit: 100,
        lightweight: true,
        store: formData?.store,
      });
      if (result.success) {
        setProducts(result.data?.data || result.data || []);
      }
    } catch (_error) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    if (!hasSupplierManagement || !formData?.store) return;

    try {
      setSuppliersLoading(true);
      const result = await supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: formData?.store,
      });
      if (result.success) {
        setSuppliers(result.data?.data || result.data || []);
      }
    } catch (_error) {
    } finally {
      setSuppliersLoading(false);
    }
  };

  const handleProductChange = (productId) => {
    onChange("productId", productId);
  };

  const handleSupplierChange = (supplierId) => {
    // Check if user has supplier management access
    if (!hasSupplierManagement && supplierId) {
      setShowUpgradeModal(true);
      return;
    }
    onChange("batchData.supplier", supplierId);
  };

  const productOptions = (products || []).map((p) => ({
    value: p.id || p._id,
    label: p.name || p.title || (p.code ? `${p.code}` : t("common.unknown")),
  }));

  const supplierOptions = (suppliers || []).map((s) => ({
    value: s.id || s._id,
    label: s.name || s.companyName || t("common.unknown"),
  }));

  // Calculations
  const calculateTotalValue = () => {
    const quantity = parseFloat(formData.batchData?.quantity || 0);
    const costPrice = parseFloat(formData.batchData?.purchasePrice || 0);
    return quantity * costPrice;
  };

  const calculateMargin = () => {
    return 0;
  };

  const calculateProfit = () => {
    return 0;
  };

  const calculateTotalCost = () => {
    const quantity = parseFloat(formData.batchData?.quantity || 0);
    const costPrice = parseFloat(formData.batchData?.purchasePrice || 0);

    return quantity * costPrice;
  };

  const getStockStatus = () => {
    const currentStock = parseFloat(formData.batchData?.quantity || 0);

    if (currentStock === 0)
      return {
        status: "out",
        color: "danger",
        text: t("inventory.outOfStock"),
      };
    if (currentStock <= 10)
      return { status: "low", color: "warning", text: t("inventory.lowStock") };
    if (currentStock <= 50)
      return {
        status: "medium",
        color: "secondary",
        text: t("inventory.mediumStock"),
      };
    return { status: "good", color: "success", text: t("inventory.goodStock") };
  };

  const _stockStatus = getStockStatus();
  const _margin = calculateMargin();
  const _profit = calculateProfit();
  const _totalCost = calculateTotalCost();

  return (
    <div className="space-y-8">
      {/* Product Selection */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-[rgb(var(--color-primary))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            {t("inventory.productSelection")}
          </h3>
        </div>

        <div>
          <Select
            label={t("inventory.selectProduct")}
            required
            searchable
            clearable
            value={formData.productId || ""}
            onChange={handleProductChange}
            options={productOptions}
            placeholder={t("inventory.searchAndSelectProduct")}
            error={!!errors.productId}
            errorMessage={errors.productId}
            helperText={
              !errors.productId
                ? t("inventory.typeToSearchProducts")
                : undefined
            }
          />
        </div>
      </div>

      {/* Stock Information - Same as Product Table Stock In */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Warehouse className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            {t("inventory.stockInformation")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("inventory.quantity")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.batchData?.quantity || ""}
              onChange={(value) => onChange("batchData.quantity", value)}
              placeholder={t("inventory.enterQuantity")}
              error={errors["batchData.quantity"]}
              helperText={t("inventory.enterQuantityToAdd")}
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("inventory.purchasePricePerUnit")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.batchData?.purchasePrice || ""}
              onChange={(value) => onChange("batchData.purchasePrice", value)}
              placeholder={t("inventory.enterPurchasePricePerUnit")}
              error={errors["batchData.purchasePrice"]}
              helperText={t("inventory.pricePaidToSupplierPerUnit")}
            />
          </div>

          {/* Supplier */}
          <div className="md:col-span-2 relative">
            <Select
              label={t("inventory.supplierOptional")}
              searchable
              clearable
              value={formData.batchData?.supplier || ""}
              onChange={handleSupplierChange}
              options={hasSupplierManagement ? supplierOptions : []}
              placeholder={
                !hasSupplierManagement
                  ? t("inventory.enableSupplierManagementToSelect")
                  : t("inventory.searchAndSelectSupplierOptional")
              }
              error={!!errors["batchData.supplier"]}
              errorMessage={errors["batchData.supplier"]}
              helperText={
                !hasSupplierManagement
                  ? t("inventory.enableSupplierManagementFeature")
                  : !errors["batchData.supplier"]
                    ? t("inventory.optionalTypeToSearchSuppliers")
                    : undefined
              }
              disabled={
                !hasSupplierManagement || suppliersLoading || featuresLoading
              }
            />

            {/* Upgrade Button - Right Side */}
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
        </div>
      </div>

      {/* Summary Card */}
      {formData.batchData?.quantity && formData.batchData?.purchasePrice && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("inventory.summary")}
            </h3>
          </div>

          <Card className="border-2 border-[rgb(var(--color-border-primary))]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                      {t("inventory.stockAdditionSummary")}
                    </h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {formData.batchData?.quantity} {t("inventory.units")} × ₹
                      {formData.batchData?.purchasePrice}{" "}
                      {t("inventory.perUnit")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {t("inventory.totalValue")}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{calculateTotalValue().toLocaleString()}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

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
    </div>
  );
};

export default InventoryDetailsSection;
