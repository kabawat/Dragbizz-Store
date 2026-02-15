"use client";
import {
  ArrowLeft,
  Calculator,
  FileText,
  IndianRupee,
  Package,
  Plus,
  Save,
  Trash2,
  User,
  Check,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button, Card, Input, Select } from "@/components/ui";
import { SignatureDrawer, SignaturePreview } from "@/components/common";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";
import {
  customerService,
  invoiceService,
  productService,
  signatureService,
} from "@/service";
import { useAppSelector } from "@/store/hooks";

const EditInvoicePage = ({ invoiceId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError } = useGlobalToast();

  // Local loading state for invoice update
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Local state for products and customers
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [_productsLoading, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Refs to prevent duplicate API calls
  const hasFetchedProducts = useRef(false);
  const hasFetchedCustomers = useRef(false);
  const hasFetchedInvoice = useRef(false);

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    customer: "",
    totalDiscount: 0,
    items: [
      {
        product: "",
        productName: "",
        quantity: 1,
        price: 0,
        total: 0,
      },
    ],
    orderSource: "POS",
  });

  // Digital Signature State
  const [signatures, setSignatures] = useState([]);
  const [signaturesLoading, setSignaturesLoading] = useState(false);
  const [showSignatureDrawer, setShowSignatureDrawer] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState("");

  const agencyId = selectedStore?.agency || selectedStore?.agencyId;

  // Fetch signatures from API
  const fetchSignatures = useCallback(async () => {
    if (!agencyId) return;
    try {
      setSignaturesLoading(true);
      const result = await signatureService.getSignatures({ agencyId });
      if (result.success) {
        setSignatures(result.data || []);
      }
    } catch (_error) {
      
    } finally {
      setSignaturesLoading(false);
    }
  }, [agencyId]);

  const handleSignatureSuccess = (signatureData) => {
    setSignatures((prev) => [signatureData, ...prev]);
    setSelectedSignature(signatureData.id || signatureData._id);
  };

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    if (!selectedStore?.storeId || hasFetchedProducts.current) return;
    hasFetchedProducts.current = true;

    try {
      setProductsLoading(true);
      const result = await productService.getProducts({
        limit: 100,
        lightweight: true,
        store: selectedStore.storeId,
      });
      if (result.success) {
        setProducts(result?.data || []);
      }
    } catch (_error) {
      hasFetchedProducts.current = false; // Reset on error
    } finally {
      setProductsLoading(false);
    }
  }, [selectedStore?.storeId]);

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    if (hasFetchedCustomers.current) return;

    hasFetchedCustomers.current = true;

    try {
      setCustomersLoading(true);
      const params = {
        limit: 100,
        lightweight: true,
      };
      if (selectedStore?.storeId) {
        params.store = selectedStore.storeId;
      }

      const result = await customerService.getCustomers(params);
      if (result.success) {
        const serializedOptions = [
          { value: "", label: t("dashboard.walkInCustomer") },
          ...(result.data || []).map((customer) => ({
            value: customer.id || customer._id,
            label: `${customer.name || t("errors.unknown")} - ${customer.phone || t("errors.noPhone")}${customer.email ? ` - ${customer.email}` : ""}`,
          })),
        ];
        setCustomers(serializedOptions);
      }
    } catch (_error) {
      hasFetchedCustomers.current = false; // Reset on error
    } finally {
      setCustomersLoading(false);
    }
  }, [selectedStore?.storeId, t]);

  // Fetch invoice data
  const fetchInvoiceData = useCallback(async () => {
    if (!invoiceId || !selectedStore?.storeId || hasFetchedInvoice.current)
      return;
    hasFetchedInvoice.current = true;

    try {
      setFetching(true);
      setError(null);

      const result = await invoiceService.getInvoices({
        id: invoiceId,
        store: selectedStore.storeId,
      });
      if (result.success && result.data) {
        const inv = result.data;

        // Transform invoice data to match form structure
        const transformedItems = inv.items?.map((item) => ({
          product: item.product?.id || item.product?._id || item.product,
          productName: item.product?.name || "",
          quantity: item.quantity || 1,
          price: item.price || item.product?.sellingPrice || 0,
          total: item.total || 0,
        })) || [
            {
              product: "",
              productName: "",
              quantity: 1,
              price: 0,
              total: 0,
            },
          ];

        setFormData({
          customer: inv.customer?.id || inv.customer?._id || "",
          totalDiscount: inv.totalDiscount || 0,
          items: transformedItems,
          orderSource: inv.orderSource || "POS",
        });
        setSelectedSignature(inv.signature?.id || inv.signature?._id || inv.signature || "");
      } else {
        setError(
          result.message ||
          t("errors.failedToFetchData", { item: t("common.invoice") })
        );
      }
    } catch (_err) {
      setError(
        t("errors.failedToFetchDataTryAgain", { item: t("common.invoice") })
      );
    } finally {
      setFetching(false);
    }
  }, [invoiceId, selectedStore?.storeId, t]);

  // Load products, customers, and invoice data on component mount
  useEffect(() => {
    if (selectedStore?.storeId) {
      fetchProducts();
      fetchCustomers();
      fetchInvoiceData();
      fetchSignatures();
    }
  }, [selectedStore?.storeId, fetchProducts, fetchCustomers, fetchInvoiceData, fetchSignatures]);

  const handleAddItem = () => {
    const newItem = {
      product: "",
      productName: "",
      quantity: 1,
      price: 0,
      total: 0,
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // Calculate total when quantity or price changes
    if (field === "quantity" || field === "price") {
      const product = products.find(
        (p) => (p.id || p._id) === updatedItems[index].product
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
      showError("Please add at least one item to the invoice");
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
      orderSource: formData.orderSource || "POS",
      signature: selectedSignature || undefined,
    };

    try {
      setInvoiceLoading(true);
      const result = await invoiceService.updateDraftInvoice(
        invoiceId,
        invoiceData
      );
      if (result.success) {
        // Redirect to the updated invoice view page
        router.push(`/dashboard/invoices/view/${invoiceId}`);
      } else {
        showError(t("invoice.updateError"));
      }
    } catch (_error) {
      showError(t("invoice.updateError"));
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
              {t("common.loadingStoreData")}
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))]">
              {t("common.pleaseWaitWhileWeFetch", { item: t("common.store") })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              {t("common.loadingInvoice")}
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))]">
              {t("common.pleaseWaitWhileWeFetch", {
                item: t("common.invoice"),
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              {t("common.errorLoading", { item: t("common.invoice") })}
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                {t("common.retry")}
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push("/dashboard/invoices")}
              >
                {t("common.backTo", { item: t("common.invoices") })}
              </Button>
            </div>
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
          title={t("invoice.editInvoice")}
          description={t("invoice.editInvoiceDescription")}
        />

        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto w-full">
            {/* Back Button */}
            <div className="mb-4">
              <Link
                href="/dashboard/invoices"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("common.backTo", { item: t("common.invoices") })}
                </span>
              </Link>
            </div>

            {/* Form Container - Two Column Layout */}
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              style={{ height: "calc(100vh - 150px)" }}
            >
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-150px)]">
                  <form onSubmit={handleSubmit}>
                    {/* Invoice Information */}
                    <Card className="mb-6">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          Customer Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                              Customer
                              <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                                (Optional - defaults to walk-in)
                              </span>
                            </label>
                            <Select
                              value={formData.customer}
                              onChange={(value) =>
                                setFormData({ ...formData, customer: value })
                              }
                              options={
                                customersLoading
                                  ? [
                                    {
                                      value: "",
                                      label: t("errors.loadingCustomers"),
                                    },
                                  ]
                                  : customers
                              }
                              disabled={customersLoading}
                              leftIcon={User}
                              size="md"
                              searchable={true}
                              placeholder={t("invoice.searchCustomers")}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                              Total Discount (₹)
                              <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                                (Optional)
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
                              size="md"
                              placeholder="Enter discount amount"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Items Section */}
                    <Card>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Items
                          </h3>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title={t("invoice.addItem")}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {t("invoice.addItem")}
                            </span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {formData.items.map((item, index) => {
                            const _product = products.find(
                              (p) => (p.id || p._id) === item.product
                            );
                            return (
                              <div
                                key={index}
                                className="border border-[rgb(var(--color-border-primary))] rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                    Item {index + 1}
                                  </h4>
                                  {formData.items.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(index)}
                                      className="flex items-center gap-1 px-2 py-1 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                                      title={t("invoice.removeItem")}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span className="text-xs">Remove</span>
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                      Product *
                                    </label>
                                    <Select
                                      value={item.product}
                                      onChange={(value) => {
                                        const selectedProduct = products.find(
                                          (p) => (p.id || p._id) === value
                                        );
                                        const productPrice =
                                          selectedProduct?.price ||
                                          selectedProduct?.sellingPrice ||
                                          0;
                                        handleItemChange(
                                          index,
                                          "product",
                                          value
                                        );
                                        handleItemChange(
                                          index,
                                          "productName",
                                          selectedProduct?.name || ""
                                        );
                                        handleItemChange(
                                          index,
                                          "price",
                                          productPrice
                                        );
                                      }}
                                      options={[
                                        {
                                          value: "",
                                          label: t("errors.selectProduct"),
                                        },
                                        ...products
                                          .filter(
                                            (product) =>
                                              product.id || product._id
                                          )
                                          .map((product) => ({
                                            value: product.id || product._id,
                                            label: `${product.name} - ₹${product.price || product.sellingPrice || 0}`,
                                          })),
                                      ]}
                                      leftIcon={Package}
                                      size="sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                      Quantity *
                                    </label>
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(value) =>
                                        handleItemChange(
                                          index,
                                          "quantity",
                                          value
                                        )
                                      }
                                      min="1"
                                      placeholder="0"
                                      leftIcon={Package}
                                      size="sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                      Price
                                    </label>
                                    <Input
                                      type="number"
                                      value={item.price || 0}
                                      disabled
                                      leftIcon={IndianRupee}
                                      size="sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                      Total
                                    </label>
                                    <Input
                                      type="number"
                                      value={item.total || 0}
                                      disabled
                                      leftIcon={IndianRupee}
                                      size="sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  </form>
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto ps-3 max-h-[calc(100vh-204px)]">
                  <div className="space-y-4">
                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                        Invoice Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">
                            Subtotal:
                          </span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            ₹{calculateSubtotal().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">
                            Discount:
                          </span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            ₹{formData.totalDiscount || "0"}
                          </span>
                        </div>
                        <div className="border-t border-[rgb(var(--color-border-primary))]/30 pt-2">
                          <div className="flex justify-between">
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              Total:
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
                        Item Count
                      </h4>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">
                          {formData.items.length}
                        </div>
                        <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                          {formData.items.length === 1 ? "Item" : "Items"}
                        </div>
                      </div>
                    </div>

                    {/* Digital Signature Selection */}
                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                        <Fingerprint className="w-4 h-4 mr-2" />
                        {t("invoice.digitalSignature") || "Digital Signature"}
                      </h4>

                      <div className="relative">
                        {signaturesLoading ? (
                          <div className="flex space-x-3 overflow-x-hidden">
                            {[1, 2].map((i) => (
                              <div
                                key={i}
                                className="flex-shrink-0 w-[calc(50%-6px)] h-20 bg-slate-100 animate-pulse rounded-xl"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                            {/* Add New Signature Card */}
                            <div
                              onClick={() => setShowSignatureDrawer(true)}
                              className="flex-shrink-0 w-[calc(50%-6px)] h-20 border-2 border-dashed border-[rgb(var(--color-border-primary))] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5 transition-all group snap-start"
                            >
                              <Plus className="w-5 h-5 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]" />
                              <span className="text-[10px] font-medium mt-1 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]">
                                {t("invoice.createSignature") || "Add New"}
                              </span>
                            </div>

                            {/* Existing Signatures */}
                            {signatures.map((sig) => (
                              <div
                                key={sig._id}
                                onClick={() =>
                                  setSelectedSignature(
                                    selectedSignature === sig._id ? "" : sig._id
                                  )
                                }
                                className={`flex-shrink-0 w-[calc(50%-6px)] h-20 border-2 rounded-xl flex items-center justify-center cursor-pointer transition-all relative overflow-hidden snap-start ${selectedSignature === sig._id
                                  ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5 ring-1 ring-[rgb(var(--color-primary))]/20"
                                  : "border-[rgb(var(--color-border-primary))] bg-white hover:border-[rgb(var(--color-primary))]/50 shadow-sm"
                                  }`}
                              >
                                <SignaturePreview signature={sig} size="sm" />
                                {selectedSignature === sig._id && (
                                  <div className="absolute top-1.5 right-1.5 bg-[rgb(var(--color-primary))] text-white rounded-full p-0.5">
                                    <Check className="w-2.5 h-2.5" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {!signaturesLoading && signatures.length === 0 && (
                          <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] mt-1 italic">
                            {t("invoice.noSignaturesFound") || "No signatures found. Add one to sign your invoices."}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleSubmit}
                        loading={invoiceLoading}
                        leftIcon={Save}
                        disabled={formData.items.length === 0}
                      >
                        Update Invoice
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push("/dashboard/invoices")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SignatureDrawer
        isOpen={showSignatureDrawer}
        onClose={() => setShowSignatureDrawer(false)}
        agencyId={agencyId}
        onSuccess={handleSignatureSuccess}
      />
    </div>
  );
};

export default EditInvoicePage;
