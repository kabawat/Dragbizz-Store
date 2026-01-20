"use client";
import {
  ArrowLeft,
  Calculator,
  Package,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreateCustomer } from "@/components/customer";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import QuotaProgressBar from "@/components/product/QuotaProgressBar";
import { Button, Card, Input, Select, SideDrawer } from "@/components/ui";
import useErrorHandling from "@/hooks/useErrorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { useUsageQuota } from "@/hooks/useUsageQuota";
import { customerService, invoiceService, productService } from "@/service";
import { useAppSelector } from "@/store/hooks";

const CreateInvoicePage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const quotaRefreshRef = useRef(null);

  // Get quota information for frontend validation
  const { quota, isLoading: quotaLoading } =
    useUsageQuota("invoice_management");

  // Local loading state for invoice creation
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const {
    handleApiError,
    handleApiResult,
    fieldErrors,
    setFieldErrors,
    QuotaModal,
    showSuccess,
    showError,
    setQuotaErrorManually,
  } = useErrorHandling();

  // Check if quota is available
  const isQuotaAvailable = () => {
    if (!quota || quotaLoading) return true; // Allow if quota not loaded yet
    if (quota.remaining === -1 || quota.limit === -1) return true; // Unlimited
    return quota.remaining > 0 && quota.hasAccess !== false;
  };

  const quotaExceeded = !isQuotaAvailable();

  // Local state for products and customers
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [_productsLoading, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Refs to prevent duplicate API calls
  const productsFetchedRef = useRef({ storeId: null, fetched: false });
  const customersFetchedRef = useRef({ storeId: null, fetched: false });

  // Get stable storeId
  const storeId =
    selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  // Customer drawer state
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);

  const [formData, setFormData] = useState({
    customer: "",
    totalDiscount: 0,
    items: [],
  });

  // State for adding new items
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;

    // Prevent duplicate calls for the same store
    if (
      productsFetchedRef.current.storeId === storeId &&
      productsFetchedRef.current.fetched
    ) {
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
        setProducts(result?.data || []);
      }
    } catch (_error) {
      productsFetchedRef.current = { storeId: null, fetched: false }; // Reset on error
    } finally {
      setProductsLoading(false);
    }
  }, [storeId]);

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    if (!storeId) return;

    // Prevent duplicate calls for the same store
    if (
      customersFetchedRef.current.storeId === storeId &&
      customersFetchedRef.current.fetched
    ) {
      return;
    }

    customersFetchedRef.current = { storeId, fetched: true };

    try {
      setCustomersLoading(true);
      const params = {
        limit: 100,
        lightweight: true,
        store: storeId,
      };

      const result = await customerService.getCustomers(params);
      if (result.success) {
        const serializedOptions = [
          { value: "", label: t("invoice.walkInCustomer") },
          ...(result.data || []).map((customer) => ({
            value: customer._id,
            label: `${customer.name || t("errors.unknown")} - ${customer.phone || t("errors.noPhone")}${customer.email ? ` - ${customer.email}` : ""}`,
          })),
          {
            value: "add-new-customer",
            label: t("invoice.addNewCustomer"),
            isAddOption: true,
          },
        ];
        setCustomers(serializedOptions);
      }
    } catch (_error) {
      customersFetchedRef.current = { storeId: null, fetched: false }; // Reset on error
    } finally {
      setCustomersLoading(false);
    }
  }, [storeId, t]);

  // Reset refs when storeId changes
  useEffect(() => {
    if (
      storeId &&
      (productsFetchedRef.current.storeId !== storeId ||
        customersFetchedRef.current.storeId !== storeId)
    ) {
      productsFetchedRef.current = { storeId: null, fetched: false };
      customersFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [storeId]);

  // Load products and customers on component mount or store change (only once per store)
  useEffect(() => {
    if (!storeId) return;

    fetchProducts();
    fetchCustomers();
  }, [storeId, fetchProducts, fetchCustomers]);

  // Handle customer select change
  const handleCustomerChange = (value) => {
    if (value === "add-new-customer") {
      setShowCustomerDrawer(true);
    } else {
      setFormData({ ...formData, customer: value });
    }
  };

  // Handle customer creation success from drawer
  const handleCustomerSuccess = async (customerData) => {
    // Refresh customers list
    customersFetchedRef.current = { storeId: null, fetched: false };
    await fetchCustomers();

    // Auto-select the newly created customer
    const newCustomerId = customerData?.id || customerData?._id;
    if (newCustomerId) {
      setFormData({ ...formData, customer: newCustomerId });
    }

    // Close drawer
    setShowCustomerDrawer(false);
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      showError(t("invoice.pleaseSelectProduct"));
      return;
    }

    const product = products.find((p) => p._id === selectedProduct);
    if (!product) {
      showError(t("invoice.productNotFound"));
      return;
    }

    const productPrice = product.price || product.sellingPrice || 0;
    const quantityToAdd = parseInt(selectedQuantity, 10) || 1;

    // Check if product already exists in items
    const existingItemIndex = formData.items.findIndex(
      (item) => item.product === selectedProduct
    );

    if (existingItemIndex !== -1) {
      // Product already exists, increment quantity
      const updatedItems = [...formData.items];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantityToAdd;
      const newTotal = productPrice * newQuantity;

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        total: newTotal,
      };

      setFormData({
        ...formData,
        items: updatedItems,
      });
    } else {
      // Product doesn't exist, add as new item
      const total = productPrice * quantityToAdd;

      const newItem = {
        product: selectedProduct,
        productName: product.name || "",
        quantity: quantityToAdd,
        price: productPrice,
        total: total,
      };

      setFormData({
        ...formData,
        items: [...formData.items, newItem],
      });
    }

    // Reset selection
    setSelectedProduct("");
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const _handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // Calculate total when quantity or price changes
    if (field === "quantity" || field === "price") {
      const product = products.find(
        (p) => p._id === updatedItems[index].product
      );
      const price = product?.price || product?.sellingPrice || 0;
      const quantity = updatedItems[index].quantity || 1;
      updatedItems[index].total = price * quantity;
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.total || 0);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - (formData.totalDiscount || 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty items
    const validItems = formData.items.filter(
      (item) => item.product && item.quantity > 0
    );

    if (validItems.length === 0) {
      showError(t("invoice.addAtLeastOneItem"));
      return;
    }

    if (!isQuotaAvailable()) {
      const quotaData = quota || {};
      setQuotaErrorManually({
        message:
          quota.remaining === 0
            ? t("invoice.dailyLimitReached", { limit: quota.limit })
            : t("invoice.quotaExceededMessage"),
        quota: quotaData,
        resetTime:
          quota.usageType === "DAILY_FIXED"
            ? "tomorrow"
            : quota.usageType === "MONTHLY_TOTAL"
              ? "next month"
              : null,
        canUpgrade: true,
      });
      return;
    }

    const invoiceData = {
      customer: formData.customer || null,
      items: validItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      store: selectedStore?.storeId,
      totalDiscount: formData.totalDiscount || 0,
    };

    try {
      setInvoiceLoading(true);
      const result = await invoiceService.createDraftInvoice(invoiceData);
      const handled = handleApiResult(
        result,
        t("invoice.invoiceCreatedSuccess"),
        "invoice-creation"
      );

      if (handled.type === "success") {
        if (quotaRefreshRef.current) {
          quotaRefreshRef.current();
        }
        setTimeout(() => {
          const invoiceId = result.data?.id || result.data?._id;
          if (invoiceId) {
            router.push(`/dashboard/invoices/view/${invoiceId}`);
          } else {
            router.push("/dashboard/invoices");
          }
        }, 1500);
      }
    } catch (error) {
      handleApiError(error, "invoice-creation");
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Show loading if store is not available yet
  if (!selectedStore?.storeId) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              {t("invoice.loadingStoreData")}
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))]">
              {t("invoice.pleaseWaitStoreInfo")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <Sidebar />

      <div className="min-h-screen w-full flex flex-col">
        <Header
          title={t("invoice.createInvoice")}
          description={t("invoice.createInvoiceDescription")}
        />

        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto w-full">
            {/* Back Button with Quota Progress Bar */}
            <div className="mb-4 flex items-center justify-between">
              <Link
                href="/dashboard/invoices"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("invoice.backToInvoices")}
                </span>
              </Link>
              <QuotaProgressBar
                featureKey="invoice_management"
                onRefreshRef={(refreshFn) => {
                  quotaRefreshRef.current = refreshFn;
                }}
              />
            </div>

            {/* Form Container - Two Column Layout */}
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              style={{ height: "calc(100vh - 150px)" }}
            >
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 pe-3 h-full">
                  <form onSubmit={handleSubmit} className="h-full">
                    {/* Items Section */}
                    <Card className="!border-[rgb(var(--color-border-primary))]/30 h-full flex flex-col overflow-hidden">
                      <div className="p-4 flex flex-col h-full overflow-hidden">
                        <div className="mb-4 flex-shrink-0">
                          {/* Add Item Section */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-6">
                              <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("invoice.selectProduct")} *
                              </label>
                              <Select
                                size="sm"
                                searchable={true}
                                value={selectedProduct}
                                onChange={(value) => setSelectedProduct(value)}
                                options={[
                                  {
                                    value: "",
                                    label: t(
                                      "invoice.selectProductPlaceholder"
                                    ),
                                  },
                                  ...products
                                    .filter((product) => product._id)
                                    .map((product) => ({
                                      value: product._id,
                                      label: `${product.name} - ₹${product.price || product.sellingPrice || 0}`,
                                    })),
                                ]}
                                leftIcon={Package}
                                size="sm"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("invoice.quantity")} *
                              </label>
                              <Input
                                type="number"
                                value={selectedQuantity}
                                onChange={(value) => setSelectedQuantity(value)}
                                min="1"
                                placeholder="1"
                                leftIcon={Package}
                                size="sm"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <Button
                                type="button"
                                variant="primary"
                                onClick={handleAddItem}
                                leftIcon={Plus}
                                // className="w-full"
                                disabled={!selectedProduct}
                              >
                                {t("invoice.addItem")}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Items List and Discount Container */}
                        {formData.items.length > 0 ? (
                          <div className="mt-6 flex-1 flex flex-col min-h-0">
                            {/* Items List - Scrollable */}
                            <div className="flex-1 flex flex-col min-h-0">
                              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3 flex-shrink-0">
                                {t("invoice.addedItems")} (
                                {formData.items.length})
                              </h4>
                              <div
                                className="overflow-y-auto overflow-x-hidden space-y-3 pr-2"
                                style={{ maxHeight: "calc(100vh - 450px)" }}
                              >
                                {formData.items.map((item, index) => {
                                  const product = products.find(
                                    (p) => p._id === item.product
                                  );
                                  return (
                                    <div
                                      key={index}
                                      className="group rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30 hover:bg-[rgb(var(--color-bg-tertiary))]/50 transition-colors flex-shrink-0"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                          <div>
                                            <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                              {t("invoice.product")}
                                            </label>
                                            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                              {item.productName ||
                                                product?.name ||
                                                "N/A"}
                                            </p>
                                          </div>

                                          <div>
                                            <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                              {t("invoice.quantity")}
                                            </label>
                                            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                              {item.quantity}
                                            </p>
                                          </div>

                                          <div>
                                            <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                              {t("invoice.price")}
                                            </label>
                                            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                              ₹
                                              {item.price?.toFixed(2) || "0.00"}
                                            </p>
                                          </div>

                                          <div>
                                            <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                              {t("invoice.total")}
                                            </label>
                                            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                              ₹
                                              {item.total?.toFixed(2) || "0.00"}
                                            </p>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveItem(index)
                                          }
                                          className="ml-4 opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                                          title={t("invoice.removeItem")}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Total Discount Section - Fixed at Bottom */}
                            <div className="mt-4 flex justify-end flex-shrink-0 pt-4 border-t border-[rgb(var(--color-border-primary))]/30">
                              <div className="w-full md:w-80">
                                <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1 text-right">
                                  {t("invoice.totalDiscount")} (₹)
                                  <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                                    ({t("common.optional")})
                                  </span>
                                </label>
                                <Input
                                  type="number"
                                  value={formData.totalDiscount}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      totalDiscount: value,
                                    })
                                  }
                                  min="0"
                                  step="0.01"
                                  leftIcon={Calculator}
                                  size="sm"
                                  placeholder="Enter discount amount"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-[rgb(var(--color-text-secondary))]">
                              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                {t("invoice.noItemsAdded")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </form>
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto ps-3 max-h-[calc(100vh-224px)]">
                  <div className="space-y-4">
                    {/* Customer Information */}
                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {t("invoice.customerInformation")}
                      </h4>
                      <div>
                        <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                          {t("invoice.customer")}
                          <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                            ({t("common.optional")} - defaults to walk-in)
                          </span>
                        </label>
                        <Select
                          value={formData.customer}
                          onChange={handleCustomerChange}
                          options={
                            customersLoading
                              ? [
                                  {
                                    value: "",
                                    label: t("invoice.loadingCustomers"),
                                  },
                                ]
                              : customers
                          }
                          disabled={customersLoading}
                          leftIcon={User}
                          size="sm"
                          searchable={true}
                          placeholder={t("invoice.searchCustomers")}
                        />
                      </div>
                    </div>

                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                        {t("invoice.invoiceSummary")}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">
                            {t("invoice.subtotal")}:
                          </span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            ₹{calculateSubtotal().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">
                            {t("invoice.discount")}:
                          </span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            ₹{formData.totalDiscount || "0"}
                          </span>
                        </div>
                        <div className="border-t border-[rgb(var(--color-border-primary))]/30 pt-2">
                          <div className="flex justify-between">
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {t("invoice.total")}:
                            </span>
                            <span className="font-bold text-[rgb(var(--color-text-primary))] text-lg">
                              ₹{calculateTotal().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                        {t("invoice.itemCount")}
                      </h4>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">
                          {formData.items.length}
                        </div>
                        <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                          {formData.items.length === 1
                            ? t("invoice.item")
                            : t("invoice.items")}
                        </div>
                      </div>
                    </div>

                    {/* Quota exceeded warning message */}
                    {quotaExceeded && !quotaLoading && (
                      <div className="mb-3">
                        <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
                          ⚠️ {t("invoice.quotaExceeded")}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-3">
                      <Button
                        variant="primary"
                        className="w-full md:flex-1"
                        onClick={handleSubmit}
                        loading={invoiceLoading}
                        leftIcon={Plus}
                        disabled={
                          formData.items.length === 0 ||
                          quotaExceeded ||
                          quotaLoading
                        }
                        title={
                          quotaExceeded ? t("invoice.quotaExceededMessage") : ""
                        }
                      >
                        {t("invoice.createInvoiceButton")}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full md:flex-1"
                        onClick={() => router.push("/dashboard/invoices")}
                        disabled={invoiceLoading}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {QuotaModal}

      <SideDrawer
        isOpen={showCustomerDrawer}
        onClose={() => {
          setShowCustomerDrawer(false);
        }}
        title={t("invoice.addNewCustomer")}
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-6 h-full">
          <CreateCustomer
            storeId={
              selectedStore?.storeId ||
              selectedStore?._id ||
              selectedStore?.id ||
              ""
            }
            onSuccess={handleCustomerSuccess}
            onCancel={() => setShowCustomerDrawer(false)}
            showCancelButton={true}
            autoRedirect={false}
            mode="drawer"
          />
        </div>
      </SideDrawer>
    </div>
  );
};

export default CreateInvoicePage;
