"use client";
import { ArrowUp, Calculator, Package, Warehouse } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Input, Select } from "@/components/ui";
import { FEATURE_DISPLAY_NAMES, FEATURES } from "@/constants/features";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { productService, supplierService } from "@/service/retailer";
import { useApiResponse } from "@/hooks/useApiResponse";

const InventoryDetailsSection = ({ formData, onChange, errors }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const { execute: fetchProductsApi, loading: productsLoading } = useApiResponse();
  const { execute: fetchSuppliersApi, loading: suppliersLoading } = useApiResponse();

  const fetchProducts = useCallback(async () => {
    if (!formData?.store) return;
    const result = await fetchProductsApi(
      productService.getProducts({
        limit: 100,
        lightweight: true,
        store: formData.store,
      }),
      { showToast: false }
    );

    if (result?.success) {
      setProducts(result.data?.products || result.data?.data || result.data || []);
    }
  }, [formData?.store, fetchProductsApi]);

  const fetchSuppliers = useCallback(async () => {
    if (!formData?.store) return;
    const result = await fetchSuppliersApi(
      supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: formData.store,
      }),
      { showToast: false }
    );

    if (result?.success) {
      setSuppliers(result.data?.suppliers || result.data?.data || result.data || []);
    }
  }, [formData?.store, fetchSuppliersApi]);

  // Fetch products and suppliers on mount and when store changes
  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, [fetchProducts, fetchSuppliers]);

  const handleProductChange = (productId) => {
    onChange("productId", productId);
  };

  const handleSupplierChange = (supplierId) => {
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
        <div className="md:col-span-2 relative">
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
          />
        </div>
        <div className="md:col-span-2 relative">
          <Select
            label={t("inventory.supplierOptional")}
            searchable
            clearable
            value={formData.batchData?.supplier || ""}
            onChange={handleSupplierChange}
            options={supplierOptions}
            placeholder={t("inventory.searchAndSelectSupplierOptional")}
            error={!!errors["batchData.supplier"]}
            errorMessage={errors["batchData.supplier"]}
            disabled={suppliersLoading}
          />
        </div>
      </div>

      {/* Stock Information - Same as Product Table Stock In */}
      <div className="space-y-6">
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

    </div>
  );
};

export default InventoryDetailsSection;
