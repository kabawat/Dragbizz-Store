"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Package } from "lucide-react";

// Import components
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";

// Import inventory components
import InventoryForm from "@/components/inventory/InventoryForm";

// Import services
import inventoryService from "@/service/retailer/inventory.service";

const EditInventoryPage = ({ inventoryId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId =
    selectedStore?.storeId || selectedStore?._id || selectedStore?.id || "";

  const [inventory, setInventory] = useState(null);
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initial form data
  const getInitialFormData = () => ({
    productId: "",
    batchData: {
      quantity: "",
      purchasePrice: "",
      supplier: "",
      expiryDate: "",
    },
  });

  // Fetch inventory details
  useEffect(() => {
    const fetchInventory = async () => {
      if (!inventoryId || !storeId) return;

      try {
        setLoading(true);
        const response = await inventoryService.getInventoryById(
          inventoryId,
          storeId,
        );

        if (response.success) {
          const inventoryData = response.data?.inventory;
          setInventory(inventoryData);

          // Set form data from inventory
          setFormData({
            productId: inventoryData.product?.id || "",
            batchData: {
              quantity: inventoryData.stockSummary?.totalQuantity || "",
              purchasePrice:
                inventoryData.pricingSummary?.averagePurchasePrice || "",
              supplier: inventoryData.batches?.[0]?.supplier?.id || "",
              expiryDate: inventoryData.batches?.[0]?.expiryDate || "",
            },
          });
        } else {
          setError("Failed to fetch inventory details");
        }
      } catch (error) {
        setError("Error loading inventory details");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [inventoryId, storeId]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    if (fieldName.includes(".")) {
      const [parent, child] = fieldName.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }

    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.productId) {
      errors.productId = "Product is required";
    }

    if (!formData.batchData?.quantity || formData.batchData.quantity <= 0) {
      errors["batchData.quantity"] = "Quantity must be greater than 0";
    }

    if (
      !formData.batchData?.purchasePrice ||
      formData.batchData.purchasePrice <= 0
    ) {
      errors["batchData.purchasePrice"] =
        "Purchase price must be greater than 0";
    }

    // Supplier is optional - no validation needed

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        productId: formData.productId,
        batchData: {
          quantity: parseInt(formData.batchData.quantity),
          purchasePrice: parseFloat(formData.batchData.purchasePrice),
          supplier: formData.batchData.supplier,
          expiryDate: formData.batchData.expiryDate || undefined,
        },
      };

      const response = await inventoryService.updateInventory(
        inventoryId,
        updateData,
      );

      if (response.success) {
        router.push(`/dashboard/stock/view/${inventoryId}`);
      } else {
        setError(response.message || "Failed to update stock");
      }
    } catch (error) {
      setError("Error updating stock. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/stock/view/${inventoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-primary))] via-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))]">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--color-primary))]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !inventory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-primary))] via-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))]">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto flex items-center justify-center">
              <div className="text-center">
                <Package className="w-16 h-16 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                  {error || "Inventory not found"}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                  The inventory you're trying to edit doesn't exist or has been
                  removed.
                </p>
                <Link href="/dashboard/stock">
                  <Button className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Stock
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-primary))] via-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))]">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Link href={`/dashboard/stock/view/${inventoryId}`}>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] flex items-center gap-3">
                      <Package className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                      Edit Stock
                    </h1>
                    <p className="text-[rgb(var(--color-text-secondary))] mt-1">
                      Update stock information for {inventory.product?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Form Container */}
              <div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                style={{ height: "calc(100vh - 200px)" }}
              >
                {/* Main Form - Left Side */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-260px)]">
                    <InventoryForm
                      formData={formData}
                      onChange={handleFormDataChange}
                      fieldErrors={fieldErrors}
                    />
                  </div>

                  {/* Action Buttons - Fixed Bottom */}
                  <div className="mt-6 flex items-center justify-end space-x-3 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>

                {/* Info Panel - Right Side */}
                <div className="lg:col-span-1">
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))] h-full">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                      Edit Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-[rgb(var(--color-text-primary))] mb-2">
                          Current Inventory
                        </h4>
                        <div className="space-y-2 text-sm text-[rgb(var(--color-text-secondary))]">
                          <p>
                            <strong>Product:</strong> {inventory.product?.name}
                          </p>
                          <p>
                            <strong>Brand:</strong> {inventory.product?.brand}
                          </p>
                          <p>
                            <strong>Current Stock:</strong>{" "}
                            {inventory.stockSummary?.totalQuantity || 0}
                          </p>
                          <p>
                            <strong>Available:</strong>{" "}
                            {inventory.stockSummary?.availableQuantity || 0}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-[rgb(var(--color-text-primary))] mb-2">
                          Tips
                        </h4>
                        <ul className="space-y-1 text-sm text-[rgb(var(--color-text-secondary))]">
                          <li>
                            • Update quantity to reflect current stock levels
                          </li>
                          <li>• Adjust purchase price if cost has changed</li>
                          <li>• Select the correct supplier for this batch</li>
                          <li>• Set expiry date for perishable items</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInventoryPage;
