"use client";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  IndianRupee,
  Package,
  Plus,
  Receipt,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button, Card, Input, Modal, Select, Textarea } from "@/components/ui";
import useErrorHandling from "@/hooks/useErrorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import {
  billService,
  productService,
  purchaseOrderService,
  supplierService,
} from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";

const formInit = {
  supplier: "",
  purchaseOrder: "",
  billDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  notes: "",
  goodsReceived: true,
  items: [
    {
      product: "",
      productName: "",
      quantity: 1,
      purchasePrice: 0,
      expiryDate: "",
    },
  ],
};
const CreateBill = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedStore } = useAppSelector((state) => state.profile);

  // Local state for suppliers
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // Local state for products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Local state for purchase orders
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseOrdersLoading, setPurchaseOrdersLoading] = useState(false);

  // Local state for bill creation
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [formData, setFormData] = useState(formInit);

  const [errors, setErrors] = useState({});
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const {
    handleApiError,
    handleApiResult,
    fieldErrors: errorHandlingFieldErrors,
    setFieldErrors: setErrorHandlingFieldErrors,
    QuotaModal,
    showSuccess,
  } = useErrorHandling();

  // Refs to prevent duplicate API calls
  const suppliersFetchedRef = useRef({ storeId: null, fetched: false });
  const productsFetchedRef = useRef({ storeId: null, fetched: false });
  const purchaseOrdersFetchedRef = useRef({ storeId: null, fetched: false });

  // Get stable storeId
  const storeId =
    selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    if (!storeId) return;

    if (
      suppliersFetchedRef.current.storeId === storeId &&
      suppliersFetchedRef.current.fetched
    ) {
      return;
    }

    if (suppliersLoading) {
      return;
    }

    suppliersFetchedRef.current = { storeId, fetched: true };

    try {
      setSuppliersLoading(true);
      const result = await supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      if (result.success) {
        const suppliersData = result.data?.data || result.data || [];
        setSuppliers(suppliersData);
      }
    } catch (_error) {
    } finally {
      setSuppliersLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    if (!storeId) return;

    if (
      productsFetchedRef.current.storeId === storeId &&
      productsFetchedRef.current.fetched
    ) {
      return;
    }

    if (productsLoading) {
      return;
    }

    productsFetchedRef.current = { storeId, fetched: true };
    try {
      setProductsLoading(true);
      const result = await productService.getProducts({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      if (result.success) {
        const productsData = result.data?.data || result.data || [];
        setProducts(productsData);
      }
    } catch (_error) {
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch purchase orders from API
  const fetchPurchaseOrders = async () => {
    if (!storeId) return;

    // Prevent duplicate calls for the same store
    if (
      purchaseOrdersFetchedRef.current.storeId === storeId &&
      purchaseOrdersFetchedRef.current.fetched
    ) {
      return;
    }

    // Prevent call if already loading
    if (purchaseOrdersLoading) {
      return;
    }

    purchaseOrdersFetchedRef.current = { storeId, fetched: true };

    try {
      setPurchaseOrdersLoading(true);
      const result = await purchaseOrderService.getPurchaseOrders({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      if (result.success) {
        const purchaseOrdersData = result.data?.data || result.data || [];
        setPurchaseOrders(purchaseOrdersData);
      }
    } catch (_error) {
    } finally {
      setPurchaseOrdersLoading(false);
    }
  };

  // Handle URL parameters for purchase order
  useEffect(() => {
    const poNumber = searchParams.get("poNumber");

    if (poNumber && purchaseOrders.length > 0) {
      const foundPO = purchaseOrders.find(
        (po) =>
          (po.poNumber || po.purchaseOrderNumber || po.billNumber) === poNumber
      );
      if (foundPO) {
        // Pre-fill the purchase order field with the PO ID
        setFormData((prev) => ({
          ...prev,
          purchaseOrder: foundPO.id || foundPO._id,
        }));
      }
    }
  }, [searchParams, purchaseOrders]);

  // Reset refs when storeId changes
  useEffect(() => {
    if (
      storeId &&
      (suppliersFetchedRef.current.storeId !== storeId ||
        productsFetchedRef.current.storeId !== storeId ||
        purchaseOrdersFetchedRef.current.storeId !== storeId)
    ) {
      suppliersFetchedRef.current = { storeId: null, fetched: false };
      productsFetchedRef.current = { storeId: null, fetched: false };
      purchaseOrdersFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [storeId]);

  // Fetch data on mount or store change (only once per store)
  useEffect(() => {
    if (!storeId) return;

    fetchSuppliers();
    fetchProducts();
    fetchPurchaseOrders();
  }, [storeId, fetchProducts, fetchPurchaseOrders, fetchSuppliers]);

  // Auto-set due date as 30 days from bill date
  useEffect(() => {
    if (formData.billDate && !formData.dueDate) {
      const billDate = new Date(formData.billDate);
      billDate.setDate(billDate.getDate() + 30);
      setFormData((prev) => ({
        ...prev,
        dueDate: billDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.billDate, formData.dueDate]);

  const handleStoreChange = (_storeObject) => {
    // Store change handled by Redux
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (value === "add-new-supplier") {
      router.push("/dashboard/suppliers/add");
      return;
    }

    if (value === "add-new-purchase-order") {
      router.push("/dashboard/purchase-orders/create");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Update product name when product is selected
    if (field === "product") {
      const selectedProduct = products.find((p) => (p.id || p._id) === value);
      if (selectedProduct) {
        updatedItems[index].productName =
          selectedProduct.name || selectedProduct.productName || "";
      }
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Clear item errors
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  // Add new item
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: "",
          productName: "",
          quantity: 1,
          purchasePrice: 0,
          expiryDate: "",
        },
      ],
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    }
  };

  // Validate form according to API specification
  const validateForm = () => {
    const newErrors = {};

    // REQUIRED FIELDS VALIDATION
    if (!formData.supplier) {
      newErrors.supplier = "Supplier is required";
    }

    // OPTIONAL FIELDS VALIDATION
    if (formData.billDate && new Date(formData.billDate) > new Date()) {
      newErrors.billDate = "Bill date cannot be in the future";
    }

    if (
      formData.dueDate &&
      formData.billDate &&
      new Date(formData.dueDate) < new Date(formData.billDate)
    ) {
      newErrors.dueDate = "Due date cannot be before bill date";
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = t("errors.notesCannotExceed500Chars");
    }

    // ITEMS VALIDATION (Required)
    if (!formData.items || formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    }

    formData.items.forEach((item, index) => {
      // Product ID validation (Required)
      if (!item.product) {
        newErrors[`item_${index}_product`] = "Product is required";
      }

      // Quantity validation (Required - number > 0)
      if (
        !item.quantity ||
        item.quantity <= 0 ||
        !Number.isInteger(Number(item.quantity))
      ) {
        newErrors[`item_${index}_quantity`] =
          "Valid quantity (integer &gt; 0) is required";
      }

      // Purchase Price validation (Required - number >= 0)
      if (
        item.purchasePrice === undefined ||
        item.purchasePrice === null ||
        item.purchasePrice < 0
      ) {
        newErrors[`item_${index}_purchasePrice`] =
          "Valid purchase price (number &gt;= 0) is required";
      }

      // Expiry Date validation (Optional - ISO date string)
      if (item.expiryDate) {
        const expiryDate = new Date(item.expiryDate);
        const billDate = new Date(formData.billDate || new Date());

        if (Number.isNaN(expiryDate.getTime())) {
          newErrors[`item_${index}_expiryDate`] = "Invalid expiry date format";
        } else if (expiryDate < billDate) {
          newErrors[`item_${index}_expiryDate`] =
            "Expiry date cannot be before bill date";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (isDraft = false) => {
    if (!validateForm() && !isDraft) {
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      // Transform formData to match API payload structure
      const billData = {
        store: selectedStore.storeId,
        supplier: formData.supplier,
        purchaseOrder: formData.purchaseOrder || undefined,
        goodsReceived: !!formData.goodsReceived,
        items: formData.items.map((item) => ({
          product: item.product,
          quantity: parseInt(item.quantity, 10),
          purchasePrice: parseFloat(item.purchasePrice),
          expiryDate: item.expiryDate || undefined,
        })),

        billDate: formData.billDate || new Date().toISOString().split("T")[0],
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
      };

      const result = await billService.createBill(billData);
      const handled = handleApiResult(
        result,
        t("success.createdSuccessfully", { item: t("common.bill") }),
        "bill-creation"
      );

      if (handled.type === "success") {
        setTimeout(() => {
          const billId = result.data?.id || result.data?._id;
          if (billId) {
            router.push(`/dashboard/bills/${billId}`);
          } else {
            router.push("/dashboard/bills");
          }
        }, 1500);
      } else if (handled.type === "field") {
        setErrors(handled.fieldErrors);
      }
    } catch (error) {
      const handled = handleApiError(error, "bill-creation");
      if (handled.type === "field") {
        setErrors(handled.fieldErrors);
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Handle save draft
  const handleSaveDraft = () => {
    setShowSaveDraftModal(true);
  };

  const handleConfirmSaveDraft = () => {
    handleSubmit(true);
    setShowSaveDraftModal(false);
  };

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar onStoreChange={handleStoreChange} />

      {/* Main Content Area */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title={t("bills.createBill")}
          description={
            searchParams.get("poNumber")
              ? t("bills.billForPO", { poNumber: searchParams.get("poNumber") })
              : t("bills.createBillDescription")
          }
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-4">
              <Link
                href="/dashboard/bills"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("common.backTo", { item: t("common.bills") })}
                </span>
              </Link>
            </div>

            {/* Form Container - Two Column Layout */}
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              style={{ height: "calc(100vh - 204px)" }}
            >
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-204px)]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    {/* Bill Information */}
                    <Card className="mb-6">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                          <Receipt className="w-5 h-5 mr-2" />
                          Bill Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                              Supplier *
                            </label>
                            <Select
                              value={formData.supplier}
                              onChange={(value) =>
                                handleInputChange("supplier", value)
                              }
                              options={[
                                {
                                  value: "",
                                  label: suppliersLoading
                                    ? t("errors.loading")
                                    : t("errors.selectSupplier"),
                                },
                                ...suppliers
                                  .filter(
                                    (supplier) =>
                                      supplier.name || supplier.supplierName
                                  )
                                  .map((supplier) => ({
                                    value: supplier.id || supplier._id,
                                    label:
                                      supplier.name || supplier.supplierName,
                                  })),
                                {
                                  value: "add-new-supplier",
                                  label: t("errors.addNewSupplier"),
                                  isAddOption: true,
                                },
                              ]}
                              error={errors.supplier}
                              disabled={suppliersLoading}
                              leftIcon={Building2}
                              searchable={true}
                              size="md"
                              multiple={false}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                              Purchase Order
                              <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                                (Optional)
                              </span>
                            </label>
                            <Select
                              value={formData.purchaseOrder}
                              onChange={(value) =>
                                handleInputChange("purchaseOrder", value)
                              }
                              options={[
                                {
                                  value: "",
                                  label: purchaseOrdersLoading
                                    ? t("errors.loading")
                                    : t("errors.selectPurchaseOrder"),
                                },
                                ...purchaseOrders
                                  .filter(
                                    (po) =>
                                      po.poNumber || po.purchaseOrderNumber
                                  )
                                  .map((po) => ({
                                    value: po.id || po._id,
                                    label:
                                      po.poNumber ||
                                      po.purchaseOrderNumber ||
                                      `PO-${po.id || po._id}`,
                                  })),
                                {
                                  value: "add-new-purchase-order",
                                  label: t("errors.addNewPurchaseOrder"),
                                  isAddOption: true,
                                },
                              ]}
                              error={errors.purchaseOrder}
                              disabled={purchaseOrdersLoading}
                              searchable={true}
                              leftIcon={FileText}
                              size="md"
                              multiple={false}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                              Bill Date
                              <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                                (Optional - defaults to today)
                              </span>
                            </label>
                            <Input
                              type="date"
                              value={formData.billDate}
                              onChange={(value) =>
                                handleInputChange("billDate", value)
                              }
                              error={errors.billDate}
                              leftIcon={Calendar}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                              Due Date
                              <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                                (Optional - defaults to +30 days)
                              </span>
                            </label>
                            <Input
                              type="date"
                              value={formData.dueDate}
                              onChange={(value) =>
                                handleInputChange("dueDate", value)
                              }
                              error={errors.dueDate}
                              leftIcon={Calendar}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            Notes
                            <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                              (Optional - max 500 characters)
                            </span>
                          </label>
                          <Textarea
                            value={formData.notes}
                            onChange={(value) =>
                              handleInputChange("notes", value)
                            }
                            placeholder="Additional notes for this bill..."
                            rows={3}
                            leftIcon={FileText}
                            maxLength={500}
                          />
                          {formData.notes && (
                            <div className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1 text-right">
                              {formData.notes.length}/500 characters
                            </div>
                          )}
                        </div>

                        <div className="mt-4 border border-[rgb(var(--color-border-primary))] rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                              Goods already received?
                            </p>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                              Turn this on to stock add these items to stock
                              when the bill is created.
                            </p>
                          </div>
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="w-5 h-5 accent-[rgb(var(--color-primary))] rounded"
                              checked={formData.goodsReceived}
                              onChange={(e) =>
                                handleInputChange(
                                  "goodsReceived",
                                  e.target.checked
                                )
                              }
                            />
                            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                              {formData.goodsReceived
                                ? t("common.yes")
                                : t("common.no")}
                            </span>
                          </label>
                        </div>
                      </div>
                    </Card>

                    {/* Items Section */}
                    <Card className="mb-6">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Items
                          </h3>
                          <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Add new item"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Add Item
                            </span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {formData.items.map((item, index) => (
                            <div
                              key={index}
                              className="border border-[rgb(var(--color-border-primary))] rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                  Item {index + 1}
                                </span>
                                {formData.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-2 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1 text-xs">
                                    Product *
                                  </label>
                                  <Select
                                    value={item.product}
                                    onChange={(value) =>
                                      handleItemChange(index, "product", value)
                                    }
                                    options={[
                                      {
                                        value: "",
                                        label: productsLoading
                                          ? t("errors.loading")
                                          : t("errors.selectProduct"),
                                      },
                                      ...products
                                        .filter(
                                          (product) =>
                                            product.name || product.productName
                                        )
                                        .map((product) => ({
                                          value: product.id || product._id,
                                          label:
                                            product.name || product.productName,
                                        })),
                                    ]}
                                    error={errors[`item_${index}_product`]}
                                    disabled={productsLoading}
                                    leftIcon={Package}
                                    searchable={true}
                                    size="sm"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1 text-xs">
                                    Quantity *
                                  </label>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(value) =>
                                      handleItemChange(index, "quantity", value)
                                    }
                                    placeholder="1"
                                    min="1"
                                    step="1"
                                    error={errors[`item_${index}_quantity`]}
                                    leftIcon={Package}
                                    size="sm"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1 text-xs">
                                    Purchase Price *
                                  </label>
                                  <Input
                                    type="number"
                                    value={item.purchasePrice}
                                    onChange={(value) =>
                                      handleItemChange(
                                        index,
                                        "purchasePrice",
                                        value
                                      )
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    error={
                                      errors[`item_${index}_purchasePrice`]
                                    }
                                    leftIcon={IndianRupee}
                                    size="sm"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1 text-xs">
                                    Expiry Date
                                  </label>
                                  <Input
                                    type="date"
                                    value={item.expiryDate}
                                    onChange={(value) =>
                                      handleItemChange(
                                        index,
                                        "expiryDate",
                                        value
                                      )
                                    }
                                    min={formData.billDate}
                                    error={errors[`item_${index}_expiryDate`]}
                                    leftIcon={Clock}
                                    size="sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Error Display */}
                    {createError && (
                      <Card className="mb-6">
                        <div className="p-6">
                          <div className="flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">
                              {createError}
                            </span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </form>
                </div>

                {/* Action Buttons */}
                <div className="bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3 rounded-b-lg">
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      leftIcon={Save}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={isCreating}
                      loading={isCreating}
                      leftIcon={Receipt}
                    >
                      Create Bill
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tips Section - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-xl border border-[rgb(var(--color-primary))]/20 p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-xl flex items-center justify-center shadow-lg">
                        <Receipt className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
                          {t("bills.billManagementTips")}
                        </h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">
                          {t("bills.bestPracticesForEfficientBillProcessing")}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                            {t("bills.requiredFields")}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed">
                            {t("bills.supplierAndItemsMandatory")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                            {t("bills.itemManagement")}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed">
                            {t("bills.useAddItemToAddProducts")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                            {t("bills.itemValidation")}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed">
                            {t("bills.quantityMustBeIntegerGreaterThanZero")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                            {t("bills.expiryDates")}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed">
                            {t("bills.optionalButCannotBeBeforeBillDate")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                            {t("bills.notesLimit")}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed">
                            {t(
                              "bills.maximum500CharactersAllowedWithLiveCounter"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <IndianRupee className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                            {t("bills.currency")}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed">
                            {t("bills.allPricesDisplayedInIndianRupee")}
                          </p>
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

      {/* Save Draft Modal */}
      <Modal
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
            Save as Draft
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            This bill will be saved as a draft and can be completed later.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowSaveDraftModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSaveDraft} leftIcon={Save}>
              Save Draft
            </Button>
          </div>
        </div>
      </Modal>

      {QuotaModal}
    </div>
  );
};

export default CreateBill;
