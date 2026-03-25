"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreateCustomer } from "@/components/customer";
import { SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { customerService, invoiceService, productService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import InvoiceItemsSection from "@/components/invoice/create/InvoiceItemsSection";

import InvoiceSidebar from "@/components/invoice/create/InvoiceSidebar";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";

const INITIAL_FORM_DATA = {
  customer: "",
  totalDiscount: 0,
  discountMode: "POST_TOTAL",   // POST_TOTAL = discount on taxable value; POST_TOTAL = discount on inclusive MRP
  items: [],
  orderSource: "POS",
};

const CreateInvoicePage = () => {
  // 1. Core Hooks & Selectors
  const router = useRouter();
  const { t } = useTranslation();
  // Combine selectors for profile
  const { selectedStore } = useAppSelector((state) => state.profile);

  // 2. Local State
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // 3. Refs

  const productsFetchedRef = useRef({ storeId: null, fetched: false });
  const customersFetchedRef = useRef({ storeId: null, fetched: false });

  // 4. Custom Hooks
  const { showError } = useGlobalToast();
  const { execute } = useApiResponse();

  // 5. Derived Values
  const storeId = selectedStore?.storeId;

  // 6. Data Fetching Callbacks
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    if (productsFetchedRef.current.storeId === storeId && productsFetchedRef.current.fetched) {
      return;
    }

    productsFetchedRef.current = { storeId, fetched: true };
    const result = await execute(
      productService.getProducts({
        limit: 100,
        lightweight: true,
        store: storeId,
      }),
      { showToast: false }
    );

    if (result?.success) {
      setProducts(result?.data || []);
    } else {
      productsFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [storeId, execute]);

  const fetchCustomers = useCallback(async () => {
    if (!storeId) return;
    if (customersFetchedRef.current.storeId === storeId && customersFetchedRef.current.fetched) {
      return;
    }

    customersFetchedRef.current = { storeId, fetched: true };
    setCustomersLoading(true);

    const params = { limit: 100, lightweight: true, store: storeId };
    const result = await execute(
      customerService.getCustomers(params),
      { showToast: false }
    );

    if (result?.success) {
      const serializedOptions = [
        { value: "", label: t("invoice.walkInCustomer") },
        ...(result.data || []).map((customer) => ({
          value: customer._id || customer.id,
          label: `${customer.name || t("errors.unknown")} - ${customer.phone || t("errors.noPhone")}${customer.email ? ` - ${customer.email}` : ""}`,
        })),
        {
          value: "add-new-customer",
          label: t("invoice.addNewCustomer"),
          isAddOption: true,
        },
      ];
      setCustomers(serializedOptions);
    } else {
      customersFetchedRef.current = { storeId: null, fetched: false };
    }
    setCustomersLoading(false);
  }, [storeId, t, execute]);

  // 7. Effects
  useEffect(() => {
    if (storeId && (productsFetchedRef.current.storeId !== storeId || customersFetchedRef.current.storeId !== storeId)) {
      productsFetchedRef.current = { storeId: null, fetched: false };
      customersFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;
    fetchProducts();
    fetchCustomers();
  }, [storeId, fetchProducts, fetchCustomers]);

  // 8. Event Handlers
  const handleCustomerChange = (value) => {
    if (value === "add-new-customer") {
      setShowCustomerDrawer(true);
    } else {
      setFormData({ ...formData, customer: value });
    }
  };

  const handleCustomerSuccess = async (customerData) => {
    customersFetchedRef.current = { storeId: null, fetched: false };
    await fetchCustomers();

    const newCustomerId = customerData?.id || customerData?._id;
    if (newCustomerId) {
      setFormData({ ...formData, customer: newCustomerId });
    }
    setShowCustomerDrawer(false);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const validItems = formData.items.filter((item) => item.product && item.quantity > 0);

    if (validItems.length === 0) {
      showError(t("invoice.addAtLeastOneItem"));
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
      discountMode: "POST_TOTAL", // Hardcoded for now, UI element hidden for future use.
      orderSource: formData.orderSource || "POS",
    };

    setInvoiceLoading(true);
    const result = await execute(
      invoiceService.createDraftInvoice(invoiceData),
      { message: t("invoice.invoiceCreatedSuccess") || "Invoice created successfully" }
    );

    if (result?.success) {
      const createdId = result?.data?.id || null;

      router.push(
        createdId
          ? `/dashboard/invoices/${createdId}`
          : "/dashboard/invoices"
      );
    } else {
      showError(result?.message || t("errors.unknown") || "Failed to create invoice");
    }
    setInvoiceLoading(false);
  };

  // 9. Shortcuts
  useCommonHotkeys({
    onSave: handleSubmit,
    onBack: () => router.push("/dashboard/invoices"),
  });

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

      <div className="min-h-0 h-screen w-full flex flex-col">
        <Header
          title={t("invoice.createInvoice")}
          description={t("invoice.createInvoiceDescription")}
        />

        <div className="flex-1 min-h-0 p-6 overflow-hidden">
          <div className="max-w-8xl mx-auto w-full h-full flex flex-col">
            {/* Back Button with Quota Progress Bar */}
            <div className="mb-4 flex-shrink-0 flex items-center justify-between">
              <Link
                href="/dashboard/invoices"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("invoice.backToInvoices")}
                </span>
              </Link>
            </div>


            {/* Form Container - Two Column Layout */}
            <div
              className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 flex flex-col min-h-0">
                <div className="flex-1 min-h-0">
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
              />
            </div>
          </div>
        </div>
      </div>

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
