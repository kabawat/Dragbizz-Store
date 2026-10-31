"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import { InvoiceFormView, useInvoiceCalculations, useInvoiceDirtyCheck } from "@dragorbit/features/invoices";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreateCustomer } from "@/components/customer";
import PaymentConfirmModal from "@/components/payment/PaymentConfirmModal";
import { SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { customerService, invoiceService } from "@/service";
import { variantService } from "@/service/retailer/variant.service";
import { useAppSelector } from "@/store/hooks";

const barcodeCache = new Map();

const INITIAL_FORM_DATA = {
  customer: "",
  totalDiscount: 0,
  discountMode: "POST_TOTAL",
  items: [],
  orderSource: "POS",
};

const CreateInvoicePage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState(null);
  const [createdInvoiceId, setCreatedInvoiceId] = useState(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const { can, loading: permissionLoading } = useModulePermissions("invoice");
  const canCreate = can("create");

  useEffect(() => {
    if (!permissionLoading && !canCreate) {
      router.replace("/dashboard/invoices");
    }
  }, [canCreate, permissionLoading, router]);

  const customersFetchedRef = useRef({ storeId: null, fetched: false });
  const { showError } = useGlobalToast();
  const { execute } = useApiResponse();
  const storeId = selectedStore?.storeId;

  const { isDirty, markPristine, setInitialSnapshot } = useInvoiceDirtyCheck(formData);

  const { grandTotal } = useInvoiceCalculations({
    items: formData.items,
    totalDiscount: formData.totalDiscount,
    discountMode: formData.discountMode,
    supplierHasGst: true,
  });

  const fetchCustomers = useCallback(async () => {
    if (!storeId) return;
    if (
      customersFetchedRef.current.storeId === storeId &&
      customersFetchedRef.current.fetched
    ) {
      return;
    }

    customersFetchedRef.current = { storeId, fetched: true };
    setCustomersLoading(true);

    const params = { limit: 100, lightweight: true, store: storeId };
    const result = await execute(customerService.getCustomers(params), {
      showToast: false,
    });

    if (result?.success) {
      const serializedOptions = [
        { value: "", label: t("invoice.walkInCustomer") || "Walk-in Customer" },
        ...(result.data || []).map((customer) => ({
          value: customer._id || customer.id,
          label: `${customer.name || t("errors.unknown")} - ${customer.phone || t("errors.noPhone")}${customer.email ? ` - ${customer.email}` : ""}`,
        })),
        {
          value: "add-new-customer",
          label: t("invoice.addNewCustomer") || "Add New Customer",
          isAddOption: true,
        },
      ];
      setCustomers(serializedOptions);
    } else {
      customersFetchedRef.current = { storeId: null, fetched: false };
    }
    setCustomersLoading(false);
  }, [storeId, t, execute]);

  useEffect(() => {
    if (storeId && customersFetchedRef.current.storeId !== storeId) {
      customersFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;
    fetchCustomers();
  }, [storeId, fetchCustomers]);

  const handleCustomerChange = useCallback((value) => {
    if (value === "add-new-customer") {
      setShowCustomerDrawer(true);
    } else {
      setFormData((prev) => ({ ...prev, customer: value }));
    }
  }, []);

  const handleDiscountChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, totalDiscount: value }));
  }, []);

  const lookupProductByCode = useCallback(
    async (code) => {
      if (!storeId) return null;
      const normalizedCode = String(code || "").trim().toLowerCase();
      if (!normalizedCode) return null;

      const cacheKey = `${storeId}:${normalizedCode}`;
      if (barcodeCache.has(cacheKey)) {
        return barcodeCache.get(cacheKey);
      }

      const variantResult = await execute(
        variantService.getVariants({
          store: storeId,
          search: normalizedCode,
          limit: 30,
        }),
        { showToast: false }
      );
      const matchingVariant = (variantResult?.data || []).find((variant) =>
        [variant?.barcode, variant?.sku].some(
          (value) =>
            String(value || "").trim().toLowerCase() === normalizedCode
        )
      );
      if (matchingVariant) {
        const relatedProduct = matchingVariant.product;
        const productId =
          typeof relatedProduct === "object"
            ? relatedProduct?.id || relatedProduct?._id
            : relatedProduct || matchingVariant.productId;
        if (productId) {
          const resolved = {
            id: String(productId),
            _id: String(productId),
            name:
              typeof relatedProduct === "object"
                ? relatedProduct?.name || "Item"
                : "Item",
            sellingPrice: matchingVariant.sellingPrice,
            mrp: matchingVariant.mrp,
            sku: matchingVariant.sku,
            barcode: matchingVariant.barcode,
            gstInfo: matchingVariant.gstInfo || {},
            uom: matchingVariant.uom,
            variants: [matchingVariant],
            matchedVariantId: matchingVariant.id || matchingVariant._id,
          };
          barcodeCache.set(cacheKey, resolved);
          return resolved;
        }
      }
      return null;
    },
    [storeId, execute]
  );

  const handleProductResolved = useCallback((product) => {
    const id = product?.id || product?._id;
    if (!id) return;
    setProducts((prev) => {
      if (prev.some((p) => (p?.id || p?._id) === id)) return prev;
      return [...prev, product];
    });
  }, []);

  const handleCustomerSuccess = useCallback(
    async (customerData) => {
      customersFetchedRef.current = { storeId: null, fetched: false };
      await fetchCustomers();

      const newCustomerId = customerData?.id || customerData?._id;
      if (newCustomerId) {
        setFormData((prev) => ({ ...prev, customer: newCustomerId }));
      }
      setShowCustomerDrawer(false);
    },
    [fetchCustomers]
  );

  const handleRelease = useCallback(() => {
    if (createdInvoiceId) {
      setPaymentInvoiceId(createdInvoiceId);
    }
  }, [createdInvoiceId]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();

      const validItems = formData.items.filter(
        (item) => item.product && Number(item.quantity) > 0
      );

      if (validItems.length === 0) {
        showError(t("invoice.addAtLeastOneItem") || "Please add at least one item");
        return;
      }

      const invoiceData = {
        customer: formData.customer || null,
        isWalkin: true,
        items: validItems.map((item) => ({
          product: item.product,
          ...(item.variant ? { variant: item.variant } : {}),
          quantity: Number(item.quantity) || 1,
          ...(item.price != null && item.price !== "" ? { price: Number(item.price) } : {}),
          ...(item.uom ? { uom: item.uom } : {}),
        })),
        store: selectedStore?.storeId,
        totalDiscount: Number(formData.totalDiscount) || 0,
        discountMode: "POST_TOTAL",
        orderSource: formData.orderSource || "POS",
      };

      setInvoiceLoading(true);
      const isUpdate = Boolean(createdInvoiceId);
      const result = await execute(
        isUpdate
          ? invoiceService.updateDraftInvoice(createdInvoiceId, invoiceData)
          : invoiceService.createDraftInvoice(invoiceData),
        {
          message: isUpdate
            ? (t("invoice.updateSuccess") || "Invoice updated successfully")
            : (t("invoice.invoiceCreatedSuccess") || "Invoice created successfully"),
        }
      );

      if (result?.success) {
        markPristine();
        const targetId = isUpdate ? createdInvoiceId : (result?.data?.id || result?.data?._id);
        if (targetId) {
          if (!createdInvoiceId) setCreatedInvoiceId(targetId);
          setPaymentInvoiceId(targetId);
        } else {
          router.push("/dashboard/invoices");
        }
      } else {
        showError(
          result?.message || t("errors.unknown") || (isUpdate ? "Failed to update invoice" : "Failed to create invoice")
        );
      }
      setInvoiceLoading(false);
    },
    [formData, selectedStore?.storeId, createdInvoiceId, execute, router, showError, t]
  );

  const handleBack = useCallback(() => {
    if (formData.items && formData.items.length > 0) {
      setPendingNavigation("/dashboard/invoices");
      setShowDiscardModal(true);
    } else {
      router.push("/dashboard/invoices");
    }
  }, [formData.items, router]);

  const handleCreateNew = useCallback(() => {
    if (formData.items && formData.items.length > 0) {
      setPendingNavigation("/dashboard/invoices/add");
      setShowDiscardModal(true);
    } else {
      setCreatedInvoiceId(null);
      setFormData(INITIAL_FORM_DATA);
    }
  }, [formData.items]);

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardModal(false);
    if (pendingNavigation === "/dashboard/invoices/add") {
      setCreatedInvoiceId(null);
      setFormData(INITIAL_FORM_DATA);
      setPendingNavigation(null);
    } else {
      router.push(pendingNavigation || "/dashboard/invoices");
    }
  }, [pendingNavigation, router]);

  const handleSaveDraftAndLeave = useCallback(async () => {
    const validItems = formData.items.filter(
      (item) => item.product && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      setShowDiscardModal(false);
      router.push(pendingNavigation || "/dashboard/invoices");
      return;
    }

    const invoiceData = {
      customer: formData.customer || null,
      isWalkin: true,
      items: validItems.map((item) => ({
        product: item.product,
        ...(item.variant ? { variant: item.variant } : {}),
        quantity: Number(item.quantity) || 1,
        ...(item.price != null && item.price !== "" ? { price: Number(item.price) } : {}),
        ...(item.uom ? { uom: item.uom } : {}),
      })),
      store: selectedStore?.storeId,
      totalDiscount: Number(formData.totalDiscount) || 0,
      discountMode: "POST_TOTAL",
      orderSource: formData.orderSource || "POS",
    };

    setIsSavingDraft(true);
    let result;
    if (createdInvoiceId) {
      result = await execute(
        invoiceService.updateDraftInvoice(createdInvoiceId, invoiceData),
        {
          message:
            t("invoice.savedAsDraftSuccess") ||
            "Invoice saved as draft successfully",
        }
      );
    } else {
      result = await execute(
        invoiceService.createDraftInvoice(invoiceData),
        {
          message:
            t("invoice.savedAsDraftSuccess") ||
            "Invoice saved as draft successfully",
        }
      );
    }
    setIsSavingDraft(false);

    if (result?.success) {
      setShowDiscardModal(false);
      if (pendingNavigation === "/dashboard/invoices/add") {
        setCreatedInvoiceId(null);
        setFormData(INITIAL_FORM_DATA);
        setPendingNavigation(null);
      } else {
        router.push(pendingNavigation || "/dashboard/invoices");
      }
    } else {
      showError(
        result?.message || t("errors.unknown") || "Failed to save draft"
      );
    }
  }, [formData, selectedStore?.storeId, createdInvoiceId, execute, pendingNavigation, router, showError, t]);

  useCommonHotkeys({
    onSave: handleSubmit,
    onBack: handleBack,
  });

  if (!selectedStore?.storeId || permissionLoading) {
    return (
      <PageSkeleton
        label={
          permissionLoading
            ? t("invoice.verifyingPermissions")
            : t("invoice.loadingStoreData")
        }
      />
    );
  }

  if (!canCreate) {
    return null;
  }

  return (
    <InvoiceFormView
      t={t}
      formData={formData}
      setFormData={setFormData}
      products={products}
      customers={customers}
      customersLoading={customersLoading}
      invoiceLoading={invoiceLoading}
      isEditMode={false}
      isDraftSaved={Boolean(createdInvoiceId)}
      isDirty={createdInvoiceId ? isDirty : formData.items.length > 0}
      grandTotal={grandTotal}
      storeId={storeId}
      onBack={handleBack}
      onCreateNew={handleCreateNew}
      onSubmit={handleSubmit}
      onRelease={handleRelease}
      onCancel={handleBack}
      onCustomerChange={handleCustomerChange}
      onDiscountChange={handleDiscountChange}
      onAddNewCustomer={() => setShowCustomerDrawer(true)}
      lookupProductByCode={lookupProductByCode}
      onProductResolved={handleProductResolved}
      fetchVariants={(params) => variantService.getVariants(params)}
      showError={showError}
      showDiscardModal={showDiscardModal}
      onCloseDiscardModal={() => setShowDiscardModal(false)}
      onConfirmDiscard={handleConfirmDiscard}
      onSaveDraft={handleSaveDraftAndLeave}
      isSavingDraft={isSavingDraft}
      customerDrawer={
        <SideDrawer
          isOpen={showCustomerDrawer}
          onClose={() => setShowCustomerDrawer(false)}
          title={t("invoice.addNewCustomer") || "Add New Customer"}
          width="w-full md:w-2/3 lg:w-1/2"
        >
          <div className="p-6 h-full">
            <CreateCustomer
              storeId={storeId || ""}
              onSuccess={handleCustomerSuccess}
              onCancel={() => setShowCustomerDrawer(false)}
              showCancelButton={true}
              autoRedirect={false}
              mode="drawer"
            />
          </div>
        </SideDrawer>
      }
      paymentModal={
        <PaymentConfirmModal
          open={Boolean(paymentInvoiceId)}
          invoiceId={paymentInvoiceId}
          source="create"
          dismissOnBackdrop={false}
          onClose={() => {
            setPaymentInvoiceId(null);
            if (createdInvoiceId) {
              router.replace(`/dashboard/invoices/edit/${createdInvoiceId}`);
            }
          }}
        />
      }
    />
  );
};

export default CreateInvoicePage;
