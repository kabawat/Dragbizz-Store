"use client";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui";
import InvoiceItemsSection from "@/components/invoice/create/InvoiceItemsSection";
import InvoiceSidebar from "@/components/invoice/create/InvoiceSidebar";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  customerService,
  invoiceService,
  productService,
} from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import useApiResponse from "@/hooks/useApiResponse";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const EditInvoicePage = ({ invoiceId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError } = useGlobalToast();
  const { execute } = useApiResponse();

  // Local loading state for invoice update
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Local state for products and customers
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Refs to prevent duplicate API calls
  const hasFetchedProducts = useRef(false);
  const hasFetchedCustomers = useRef(false);
  const hasFetchedInvoice = useRef(false);

  // Permission Management
  const { can, loading: permissionLoading } = useModulePermissions("invoice");
  const canEdit = can("edit");

  useEffect(() => {
    if (!permissionLoading && !canEdit) {
      router.replace("/dashboard/invoices");
    }
  }, [canEdit, permissionLoading, router]);

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    customer: "",
    totalDiscount: 0,
    discountMode: "POST_TOTAL",
    items: [],
    orderSource: "POS",
  });

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    if (!selectedStore?.storeId || hasFetchedProducts.current) return;
    hasFetchedProducts.current = true;

    setProductsLoading(true);
    const result = await execute(
      productService.getProducts({
        limit: 100,
        lightweight: true,
        store: selectedStore.storeId,
      }),
      { showToast: false }
    );
    if (result?.success) {
      setProducts(result?.data || []);
    } else {
      hasFetchedProducts.current = false;
    }
    setProductsLoading(false);
  }, [selectedStore?.storeId, execute]);

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    if (hasFetchedCustomers.current) return;

    hasFetchedCustomers.current = true;
    setCustomersLoading(true);

    const params = {
      limit: 100,
      lightweight: true,
    };
    if (selectedStore?.storeId) {
      params.store = selectedStore.storeId;
    }

    const result = await execute(
      customerService.getCustomers(params),
      { showToast: false }
    );

    if (result?.success) {
      const serializedOptions = [
        { value: "", label: t("dashboard.walkInCustomer") },
        ...(result.data || []).map((customer) => ({
          value: customer.id || customer._id,
          label: `${customer.name || t("errors.unknown")} - ${customer.phone || t("errors.noPhone")}${customer.email ? ` - ${customer.email}` : ""}`,
        })),
      ];
      setCustomers(serializedOptions);
    } else {
      hasFetchedCustomers.current = false;
    }
    setCustomersLoading(false);
  }, [selectedStore?.storeId, t, execute]);

  // Fetch invoice data
  const fetchInvoiceData = useCallback(async () => {
    if (!invoiceId || !selectedStore?.storeId || hasFetchedInvoice.current)
      return;
    hasFetchedInvoice.current = true;

    setFetching(true);
    setError(null);

    const result = await execute(
      invoiceService.getInvoices({
        id: invoiceId,
        store: selectedStore.storeId,
      }),
      { showToast: false }
    );

    if (result?.success && result.data) {
      const inv = result.data;

      if (inv.invoiceStatus !== "DRAFT") {
        setError(t("invoice.cannotEditNonDraft") || "Only draft invoices can be edited. This invoice is already " + (inv.invoiceStatus || "processed") + " and cannot be modified.");
        setFetching(false);
        return;
      }

      // Transform invoice data to match form structure
      const transformedItems = inv.items?.map((item) => {
        const productObj = typeof item.product === 'object' ? item.product : {};
        const productId = productObj.id || productObj._id || item.product;

        return {
          product: productId,
          productName: productObj.name || "",
          quantity: item.quantity || 1,
          price: item.price || productObj.sellingPrice || productObj.price || 0,
          total: item.total || 0,
          gstRate: productObj.gstInfo?.gstRate || item.gstRate || 0,
          isInclusive: productObj.gstInfo && productObj.gstInfo.isGstIncluded !== undefined ? productObj.gstInfo.isGstIncluded : (item.isInclusive !== undefined ? item.isInclusive : false),
          uom: productObj.uom || item.uom || "Unit",
        };
      }) || [];

      setFormData({
        customer: inv.customer?.id || inv.customer?._id || "",
        totalDiscount: inv.totalDiscount || 0,
        discountMode: inv.discountMode || "POST_TOTAL",
        items: transformedItems,
        orderSource: inv.orderSource || "POS",
      });
    } else {
      setError(
        result?.message ||
        t("errors.failedToFetchData", { item: t("common.invoice") })
      );
    }
    setFetching(false);
  }, [invoiceId, selectedStore?.storeId, t, execute]);

  // Load products, customers, and invoice data on component mount
  useEffect(() => {
    if (selectedStore?.storeId) {
      fetchProducts();
      fetchCustomers();
      fetchInvoiceData();
    }
  }, [selectedStore?.storeId, fetchProducts, fetchCustomers, fetchInvoiceData]);

  const handleCustomerChange = (value) => {
    setFormData({ ...formData, customer: value });
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
      isWalkin: true,
      items: validItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      store: selectedStore?.storeId,
      totalDiscount: formData.totalDiscount || 0,
      discountMode: formData.discountMode || "POST_TOTAL",
      orderSource: formData.orderSource || "POS",
    };

    setInvoiceLoading(true);
    const result = await execute(
      invoiceService.updateDraftInvoice(invoiceId, invoiceData),
      { message: t("invoice.updateSuccess") }
    );

    if (result?.success) {
      // Redirect to the updated invoice view page
      router.push(`/dashboard/invoices/${invoiceId}`);
    } else {
      showError(result?.message || t("invoice.updateError"));
    }
    setInvoiceLoading(false);
  };

  useCommonHotkeys({
    onSave: handleSubmit,
    onBack: () => router.push("/dashboard/invoices"),
  });

  // Show loading if store or permissions are not available yet
  if (!selectedStore?.storeId || permissionLoading) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              {permissionLoading
                ? t("invoice.verifyingPermissions") || "Checking permissions..."
                : t("common.loadingStoreData")}
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))]">
              {t("invoice.pleaseWaitStoreInfo") || "Almost there..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pre-render guard for non-staff/restricted users
  if (!canEdit) {
    return null;
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 h-full">
                  <form onSubmit={handleSubmit} className="h-full">
                    <InvoiceItemsSection
                      t={t}
                      products={products}
                      formData={formData}
                      setFormData={setFormData}
                      showError={showError}
                    />
                  </form>
                </div>
              </div>

              {/* Summary Sidebar */}
              <InvoiceSidebar
                t={t}
                router={router}
                formData={formData}
                handleCustomerChange={handleCustomerChange}
                customers={customers}
                customersLoading={customersLoading}
                invoiceLoading={invoiceLoading}
                handleSubmit={handleSubmit}
                isEditMode={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoicePage;
