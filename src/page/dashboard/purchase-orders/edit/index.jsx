"use client";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Package,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import {
  AddActionButton,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui";
import {
  productService,
  purchaseOrderService,
  supplierService,
} from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";

import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const formInit = {
  supplier: "",
  expectedDeliveryDate: "",
  paymentBy: "30_DAYS",
  reference: "",
  note: "",
  products: [],
};

const EditPurchaseOrder = ({ poId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const { can, loading: permissionsLoading } = useModulePermissions("purchase_order");

  useEffect(() => {
    if (!permissionsLoading && !can("edit")) {
      router.push("/dashboard/purchase-orders");
    }
  }, [can, permissionsLoading, router]);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [updateError, setUpdateError] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [formData, setFormData] = useState(formInit);
  const [errors, setErrors] = useState({});

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedPONumber, setUpdatedPONumber] = useState("");
  const hasFetched = useRef(false);
  const suppliersFetchedRef = useRef({ storeId: null, fetched: false });
  const productsFetchedRef = useRef({ storeId: null, fetched: false });
  const [tempProduct, setTempProduct] = useState("");
  const [tempQuantity, setTempQuantity] = useState(1);

  const { execute: executeFetchPO, loading: fetching } = useApiResponse();
  const { execute: executeFetchSuppliers } = useApiResponse();
  const { execute: executeFetchProducts } = useApiResponse();
  const { execute: executeUpdate, loading: isUpdating } = useApiResponse();

  // Fetch suppliers
  const fetchSuppliers = async () => {
    const storeId = selectedStore?.storeId;
    if (!storeId) return;
    if (suppliersFetchedRef.current.storeId === storeId && suppliersFetchedRef.current.fetched) return;
    suppliersFetchedRef.current = { storeId, fetched: true };

    setSuppliersLoading(true);
    const result = await executeFetchSuppliers(
      supplierService.getSuppliers({ limit: 100, lightweight: true, store: storeId }),
      { showToast: false }
    );
    setSuppliersLoading(false);
    if (result?.success) {
      setSuppliers(result.data?.data || result.data || []);
    } else {
      suppliersFetchedRef.current = { storeId: null, fetched: false };
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    const storeId = selectedStore?.storeId;
    if (!storeId) return;
    if (productsFetchedRef.current.storeId === storeId && productsFetchedRef.current.fetched) return;
    productsFetchedRef.current = { storeId, fetched: true };

    setProductsLoading(true);
    const result = await executeFetchProducts(
      productService.getProducts({ limit: 100, lightweight: true, store: storeId }),
      { showToast: false }
    );
    setProductsLoading(false);
    if (result?.success) {
      setProducts(result.data?.data || result.data || []);
    } else {
      productsFetchedRef.current = { storeId: null, fetched: false };
    }
  };

  // Fetch current PO
  useEffect(() => {
    const load = async () => {
      if (!poId || !selectedStore?.storeId || hasFetched.current) return;
      hasFetched.current = true;

      const result = await executeFetchPO(
        purchaseOrderService.getPurchaseOrders({
          id: poId,
          paymentType: "ADVANCE_PAYMENT",
          store: selectedStore.storeId,
        }),
        { showToast: false }
      );

      if (result?.success && result.data) {
        const po = result.data;
        const mappedProducts = (po.items || po.products || []).map((it) => ({
          product: it.product?._id || it.product?.id || it.product || "",
          productName: it.product?.name || it.productName || it.name || "",
          quantity: parseInt(it.quantity, 10) || 1,
        }));
        setFormData({
          supplier: po.supplier?.id || po.supplier?._id || po.supplier || "",
          expectedDeliveryDate: po.expectedDeliveryDate
            ? new Date(po.expectedDeliveryDate).toISOString().split("T")[0]
            : "",
          paymentBy: po.paymentBy || po.paymentTerms || "30_DAYS",
          reference: po.reference || "",
          note: po.note || po.notes || "",
          products: mappedProducts.length ? mappedProducts : [],
        });
        setUpdatedPONumber(po.poNumber || po.reference || "");
      } else {
        setFetchError(result?.message || "Failed to load purchase order");
      }
    };
    load();
  }, [poId, selectedStore, executeFetchPO]);

  useEffect(() => {
    const storeId = selectedStore?.storeId;
    if (!storeId) return;

    // Check if already fetched for this store
    if (
      suppliersFetchedRef.current.storeId !== storeId ||
      !suppliersFetchedRef.current.fetched
    ) {
      fetchSuppliers();
    }
    if (
      productsFetchedRef.current.storeId !== storeId ||
      !productsFetchedRef.current.fetched
    ) {
      fetchProducts();
    }
  }, [selectedStore?.storeId, fetchProducts, fetchSuppliers]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const _handleItemChange = (index, field, value) => {
    const updated = [...formData.products];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "product") {
      const selected = products.find((p) => (p.id || p._id) === value);
      if (selected)
        updated[index].productName =
          selected.name || selected.productName || "";
    }
    setFormData((prev) => ({ ...prev, products: updated }));
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };

  const addItem = () => {
    if (!tempProduct) {
      setErrors((prev) => ({ ...prev, add_product: "Select a product" }));
      return;
    }
    if (
      !tempQuantity ||
      Number(tempQuantity) <= 0 ||
      !Number.isInteger(Number(tempQuantity))
    ) {
      setErrors((prev) => ({
        ...prev,
        add_quantity: "Enter a valid integer > 0",
      }));
      return;
    }
    const selected = products.find((p) => (p.id || p._id) === tempProduct);
    const productName = selected
      ? selected.name || selected.productName || ""
      : "";
    setFormData((prev) => {
      const existingIndex = prev.products.findIndex(
        (item) => item.product === tempProduct
      );
      if (existingIndex !== -1) {
        const updated = [...prev.products];
        const existing = updated[existingIndex];
        const newQty =
          (parseInt(existing.quantity, 10) || 0) + parseInt(tempQuantity, 10);
        updated[existingIndex] = {
          ...existing,
          productName: existing.productName || productName,
          quantity: newQty,
        };
        return { ...prev, products: updated };
      }
      return {
        ...prev,
        products: [
          ...prev.products,
          {
            product: tempProduct,
            productName,
            quantity: parseInt(tempQuantity, 10),
          },
        ],
      };
    });
    setTempProduct("");
    setTempQuantity(1);
    setErrors((prev) => ({ ...prev, add_product: "", add_quantity: "" }));
  };

  const removeItem = (index) => {
    const updated = formData.products.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, products: updated }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplier) newErrors.supplier = "Supplier is required";
    if (
      formData.expectedDeliveryDate &&
      formData.poDate &&
      new Date(formData.expectedDeliveryDate) < new Date(formData.poDate)
    )
      newErrors.expectedDeliveryDate =
        "Expected delivery cannot be before PO date";
    if (formData.note && formData.note.length > 500)
      newErrors.note = "Notes cannot exceed 500 characters";
    if (!formData.products || formData.products.length === 0)
      newErrors.items = "At least one product is required";
    formData.products.forEach((item, index) => {
      if (!item.product)
        newErrors[`item_${index}_product`] = "Product is required";
      if (
        !item.quantity ||
        item.quantity <= 0 ||
        !Number.isInteger(Number(item.quantity))
      )
        newErrors[`item_${index}_quantity`] =
          "Valid quantity (integer > 0) is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setUpdateError(null);

    const payload = {
      store: selectedStore.storeId,
      supplier: formData.supplier,
      products: formData.products.map((it) => ({
        product: it.product,
        quantity: parseInt(it.quantity, 10),
      })),
      paymentBy: formData.paymentBy,
      reference: formData.reference || undefined,
      note: formData.note || undefined,
      expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
    };

    const result = await executeUpdate(
      purchaseOrderService.updatePurchaseOrder(poId, payload, selectedStore.storeId),
      { message: "Purchase order updated successfully" }
    );

    if (result?.success) {
      setUpdatedPONumber(result.data?.poNumber || updatedPONumber || `PO-${Date.now()}`);
      setShowSuccessModal(true);
    } else {
      setUpdateError(result?.message || "Failed to update purchase order");
    }
  };

  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="Edit Purchase Order"
            description="Update purchase order details"
          />
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      {t("common.loadingStoreData")}
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      {t("common.pleaseWaitWhileWeFetch", { item: t("purchaseOrders.title") })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="Edit Purchase Order"
            description="Update purchase order details"
          />
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                      {t("common.reportNotFound")}
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                      {t("common.doesntExistOrRemoved", { item: t("purchaseOrders.title") })}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push("/dashboard/purchase-orders")
                        }
                        className="px-6 py-3"
                      >
                        {t("purchaseOrders.backToPurchaseOrders")}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                        className="px-6 py-3"
                      >
                        {t("common.retry")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />
      <div className="min-h-screen w-full flex flex-col">
        <Header
          title={t("purchaseOrders.editPO")}
          description={t("purchaseOrders.createPODescription")}
        />
        <div className="flex-1 p-6">
          <div className="w-full">
            <div className="mb-4 w-full mx-auto">
              <Link
                href="/dashboard/purchase-orders"
                className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-all duration-200 border border-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("purchaseOrders.backToPurchaseOrders")}
                </span>
              </Link>
            </div>

            <div
              className="flex flex-col h-full"
              style={{ height: "calc(100vh-208px)" }}
            >
              <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  <div className="w-full mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <Card>
                          <div className="p-5">
                            <div className="flex items-center mb-6">
                              <div
                                className="w-10 h-10 rounded-lg flex border border-[rgb(var(--color-border-primary))] items-center justify-center mr-3"
                                style={{
                                  backgroundColor:
                                    "rgba(var(--color-primary), 0.1)",
                                }}
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
                                  onChange={(value) =>
                                    handleInputChange("supplier", value)
                                  }
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
                                  onChange={(value) =>
                                    handleInputChange("paymentBy", value)
                                  }
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
                                    handleInputChange(
                                      "expectedDeliveryDate",
                                      value
                                    )
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
                                  onChange={(value) =>
                                    handleInputChange("reference", value)
                                  }
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
                                onChange={(value) =>
                                  handleInputChange("note", value)
                                }
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

                        {updateError && (
                          <Card>
                            <div className="p-6">
                              <div className="flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="text-sm font-medium">
                                  {updateError}
                                </span>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>

                      <div>
                        <Card className="sticky top-0">
                          <div className="p-4">
                            <div className="flex items-center mb-6">
                              <div className="w-10 h-10 border border-[rgb(var(--color-border-primary))] rounded-lg flex items-center justify-center mr-3">
                                <Package
                                  className="w-5 h-5"
                                  style={{ color: "rgb(var(--color-success))" }}
                                />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                                  {t("purchaseOrders.productsItems")}
                                </h3>
                                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                  {t("purchaseOrders.addProductsToPO")}
                                </p>
                              </div>
                            </div>

                            <div className="bg-[rgb(var(--color-bg-tertiary))]/50 rounded-lg p-4 mb-6">
                              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-4">
                                Add New Item
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-7">
                                  <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                    {t("purchaseOrders.product")} *
                                  </label>
                                  <Select
                                    value={tempProduct}
                                    onChange={(value) => setTempProduct(value)}
                                    options={[
                                      {
                                        value: "",
                                        label: productsLoading
                                          ? t("common.loading")
                                          : t("purchaseOrders.selectProduct"),
                                      },
                                      ...products
                                        .filter((p) => p.name || p.productName)
                                        .map((p) => ({
                                          value: p.id || p._id,
                                          label: p.name || p.productName,
                                        })),
                                    ]}
                                    error={errors.add_product}
                                    disabled={productsLoading}
                                    leftIcon={Package}
                                    size="sm"
                                    searchable={true}
                                    placeholder="Search and select product..."
                                  />
                                </div>

                                <div className="md:col-span-3">
                                  <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                    {t("purchaseOrders.quantity")} *
                                  </label>
                                  <Input
                                    type="number"
                                    value={tempQuantity}
                                    onChange={(value) => setTempQuantity(value)}
                                    placeholder="1"
                                    min="1"
                                    step="1"
                                    error={errors.add_quantity}
                                    leftIcon={Package}
                                    size="sm"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <AddActionButton
                                    onClick={addItem}
                                    fullWidth
                                    label={t("purchaseOrders.add")}
                                    title={t("purchaseOrders.addNewItem")}
                                  />
                                </div>
                              </div>
                            </div>

                            {formData.products.length > 0 ? (
                              <div className="bg-[rgb(var(--color-bg-tertiary))]/30 rounded-lg border border-[rgb(var(--color-border-primary))]">
                                <div className="px-4 py-3 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/50">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {t("purchaseOrders.addedPayments")} ({formData.products.length})
                                    </h4>
                                  </div>
                                </div>
                                <div className="divide-y divide-[rgb(var(--color-border-primary))]">
                                  {formData.products.map((item, index) => (
                                    <div
                                      key={index}
                                      className="px-4 py-4 hover:bg-[rgb(var(--color-bg-secondary))]/30 transition-colors duration-200 group"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                          <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{
                                              backgroundColor:
                                                "rgba(var(--color-primary), 0.1)",
                                            }}
                                          >
                                            <Package
                                              className="w-4 h-4"
                                              style={{
                                                color:
                                                  "rgb(var(--color-primary))",
                                              }}
                                            />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate block">
                                              {item.productName ||
                                                t("purchaseOrders.selectedProduct")}
                                            </span>
                                          </div>
                                          <div className="flex-shrink-0">
                                            <span
                                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                              style={{
                                                backgroundColor:
                                                  "rgba(var(--color-primary), 0.1)",
                                                color:
                                                  "rgb(var(--color-primary))",
                                              }}
                                            >
                                              {t("purchaseOrders.qty")}: {item.quantity}
                                            </span>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => removeItem(index)}
                                          className="flex-shrink-0 p-2 cursor-pointer text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgba(var(--color-danger),0.1)] rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                          title="Remove item"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-[rgb(var(--color-text-secondary))]">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">{t("purchaseOrders.noItemsAddedYet")}</p>
                                <p className="text-xs">
                                  {t("purchaseOrders.addProductsToCreatePO")}
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="bg-[rgb(var(--color-bg-primary))] border-top border-[rgb(var(--color-border-primary))] px-6 py-4">
              <div className="flex items-center justify-between w-full mx-auto">
                <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {formData.products.length > 0 && (
                    <span>
                      {formData.products.length} {formData.products.length !== 1 ? t("purchaseOrders.items") : t("purchaseOrders.item")} {t("purchaseOrders.added")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowSaveModal(true)}
                    type="button"
                    variant="outline"
                    leftIcon={Save}
                    size="sm"
                  >
                    {t("common.save")}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isUpdating}
                    loading={isUpdating}
                    leftIcon={FileText}
                    size="sm"
                  >
                    {t("purchaseOrders.editPO")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
            {t("common.save")}
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {t("purchaseOrders.saveAsDraftDescription")}
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                setShowSaveModal(false);
                handleSubmit();
              }}
              leftIcon={Save}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("purchaseOrders.deleteSuccess")}
      >
        <div className="p-6 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(var(--color-success), 0.1)" }}
          >
            <CheckCircle
              className="w-8 h-8"
              style={{ color: "rgb(var(--color-success))" }}
            />
          </div>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {updatedPONumber || t("purchaseOrders.title")} {t("purchaseOrders.added")}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/dashboard/purchase-orders");
              }}
            >
              {t("purchaseOrders.backToPurchaseOrders")}
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`/dashboard/purchase-orders/${poId}`);
              }}
            >
              {t("purchaseOrders.purchaseOrderDetails")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditPurchaseOrder;
