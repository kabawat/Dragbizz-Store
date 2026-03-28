"use client";
import { Package, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import { FEATURE_DISPLAY_NAMES, FEATURES } from "@/constants/features";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useFeatureAccess } from "@/hooks/auth/useFeatureAccess";
import { inventoryService, supplierService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";

const StockInDrawer = ({
  isOpen,
  onClose,
  item,
  onSuccess,
  type = "product",
}) => {
  const { selectedStore } = useAppSelector((state) => state.profile);
  const [formData, setFormData] = useState({
    quantity: "",
    purchasePrice: "",
    supplier: "",
  });
  const [errors, setErrors] = useState({});
  const { execute, loading: isLoading } = useApiResponse();
  const { execute: fetchSuppliersApi, loading: suppliersLoading } = useApiResponse();
  const [suppliers, setSuppliers] = useState([]);

  // Hook to fetch subscription info if needed for other purposes
  const { isLoading: featuresLoading } = useFeatureAccess();
  const { showError } = useGlobalToast();

  // Fetch suppliers from API
  const fetchSuppliers = useCallback(async () => {
    const storeId = selectedStore?.storeId;
    if (!storeId) return;

    const result = await fetchSuppliersApi(
      supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: storeId,
      }),
      { showToast: false }
    );

    if (result?.success) {
      setSuppliers(result.data?.data || result.data || []);
    }
  }, [selectedStore, fetchSuppliersApi]);

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        quantity: "",
        purchasePrice: "",
        supplier: "",
      });
      setErrors({});
      if (true) {
        fetchSuppliers();
      }
    }
  }, [isOpen]);

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

    const storeId = selectedStore?.storeId;

    if (!storeId) {
      showError("Store not selected");
      return;
    }

    // Determine product ID based on type
    const productId = type === "product" ? item?.id : item?.product?.id;

    const apiPayload = {
      productId: productId,
      store: storeId,
      batchData: {
        quantity: parseInt(formData.quantity, 10),
        purchasePrice: parseFloat(formData.purchasePrice),
        supplier: formData.supplier,
      },
    };

    const response = await execute(inventoryService.addInventory(apiPayload), {
      message: "Stock added successfully!",
    });

    if (response?.success) {
      onClose();
      onSuccess?.("Stock added successfully!");
    }
  };

  const handleSupplierChange = (value) => {
    handleInputChange("supplier", value);
  };

  // Format suppliers for Select component
  const formattedSuppliers = suppliers.map((supplier) => ({
    value: supplier.id || supplier._id,
    label: supplier.name || supplier.companyName || "Unknown Supplier",
  }));

  // Get product information based on type
  const getProductInfo = () => {
    if (type === "product") {
      return {
        name: item?.name || "Unknown Product",
        brand: item?.brand || "Unknown Brand",
        currentStock: item?.stock || 0,
      };
    } else {
      return {
        name: item?.product?.name || "Unknown Product",
        brand: item?.product?.brand || "Unknown Brand",
        currentStock: item?.stockSummary?.totalQuantity || 0,
      };
    }
  };

  const productInfo = getProductInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-[9999]">
      <div className="w-full max-w-2xl h-full bg-[rgb(var(--color-bg-primary))] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[rgb(var(--color-success))]/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[rgb(var(--color-success))]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                Add Stock
              </h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {productInfo.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info */}
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4">
              <h3 className="font-medium text-[rgb(var(--color-text-primary))] mb-2">
                Product Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    Name:
                  </span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {productInfo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    Brand:
                  </span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {productInfo.brand}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    Current Stock:
                  </span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {productInfo.currentStock} units
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity and Purchase Price - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(value) => handleInputChange("quantity", value)}
                  placeholder="Enter quantity"
                  error={errors.quantity}
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  Purchase Price (per unit){" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(value) =>
                    handleInputChange("purchasePrice", value)
                  }
                  placeholder="Enter purchase price per unit"
                  error={errors.purchasePrice}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                Supplier
              </label>
              <Select
                value={formData.supplier}
                onChange={handleSupplierChange}
                options={formattedSuppliers}
                placeholder="Select supplier (optional)"
                error={errors.supplier}
                loading={suppliersLoading}
                disabled={suppliersLoading || featuresLoading}
                helperText="Optional: Choose the supplier for this stock"
              />
            </div>

            {/* Total Calculation */}
            {formData.quantity && formData.purchasePrice && (
              <div className="bg-[rgb(var(--color-success))]/10 border border-[rgb(var(--color-success))]/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[rgb(var(--color-success))]">
                    Total Value:
                  </span>
                  <span className="text-lg font-bold text-[rgb(var(--color-success))]">
                    ₹
                    {(
                      parseInt(formData.quantity, 10) *
                      parseFloat(formData.purchasePrice)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-[rgb(var(--color-success))]/80 mt-1">
                  {formData.quantity} units × ₹{formData.purchasePrice} per unit
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex space-x-3">
            <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Adding Stock..." : "Add Stock"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StockInDrawer;
