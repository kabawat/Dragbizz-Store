"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import {
  BillFormView,
  useBillForm,
  unwrapProductList,
  resolveProductPurchasePrice,
} from "@dragorbit/features/bills";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddSupplierDrawer from "@/components/supplier/AddSupplierDrawer";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import {
  billService,
  productService,
  purchaseOrderService,
  supplierService,
} from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { pickStoreId } from "@/utils/store.util";

const CreateBillPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const poNumberFromUrl = searchParams.get("poNumber");

  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(() => pickStoreId(selectedStore), [selectedStore]);

  useDashboardHeader(
    t("bills.createBill"),
    poNumberFromUrl
      ? t("bills.billForPO", { poNumber: poNumberFromUrl })
      : t("bills.createBillDescription")
  );

  const { showError } = useGlobalToast();

  // Centralized bill form state & handlers
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    selectedProduct,
    setSelectedProduct,
    selectedQuantity,
    setSelectedQuantity,
    selectedPrice,
    setSelectedPrice,
    handleInputChange,
    handleAddItem,
    handleRemoveItem,
    handleUpdateItem,
    validateForm,
    buildBillPayload,
  } = useBillForm();

  // Data states
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showAddSupplierDrawer, setShowAddSupplierDrawer] = useState(false);

  // API executors
  const { execute: fetchProductsApi, loading: productsLoading } =
    useApiResponse();
  const { execute: fetchSuppliersApi, loading: suppliersLoading } =
    useApiResponse();
  const { execute: fetchPOsApi, loading: purchaseOrdersLoading } =
    useApiResponse();
  const { execute: submitBillApi, loading: isSubmitting } = useApiResponse();

  // Fetch trackers
  const productsFetchedRef = useRef(null);
  const suppliersFetchedRef = useRef(null);
  const posFetchedRef = useRef(null);

  // 1. Fetch products
  useEffect(() => {
    if (!storeId || productsFetchedRef.current === storeId) return;
    productsFetchedRef.current = storeId;

    fetchProductsApi(
      productService.getProducts({
        limit: 100,
        lightweight: true,
        store: storeId,
      }),
      { showToast: false }
    ).then((result) => {
      if (result?.success) {
        const list = unwrapProductList(result.data);
        const normalized = list.map((p) => ({
          ...p,
          purchasePrice: resolveProductPurchasePrice(p),
        }));
        setProducts(normalized);
      } else {
        productsFetchedRef.current = null;
      }
    });
  }, [storeId, fetchProductsApi]);

  // 2. Fetch suppliers
  useEffect(() => {
    if (!storeId || suppliersFetchedRef.current === storeId) return;
    suppliersFetchedRef.current = storeId;

    fetchSuppliersApi(
      supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: storeId,
      }),
      { showToast: false }
    ).then((result) => {
      if (result?.success) {
        const list = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.data)
            ? result.data.data
            : [];
        setSuppliers(list);
      } else {
        suppliersFetchedRef.current = null;
      }
    });
  }, [storeId, fetchSuppliersApi]);

  // 3. Fetch purchase orders when supplier is chosen
  useEffect(() => {
    if (!formData.supplier || !storeId) {
      setPurchaseOrders([]);
      return;
    }

    const key = `${storeId}_${formData.supplier}`;
    if (posFetchedRef.current === key) return;
    posFetchedRef.current = key;

    fetchPOsApi(
      purchaseOrderService.getPurchaseOrders({
        limit: 100,
        lightweight: true,
        store: storeId,
        supplier: formData.supplier,
      }),
      { showToast: false }
    ).then((result) => {
      if (result?.success) {
        const list = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.data)
            ? result.data.data
            : [];
        setPurchaseOrders(list);
      } else {
        posFetchedRef.current = null;
      }
    });
  }, [formData.supplier, storeId, fetchPOsApi]);

  // 4. Auto-select purchase order from URL query param if present
  useEffect(() => {
    if (poNumberFromUrl && purchaseOrders.length > 0) {
      const match = purchaseOrders.find(
        (po) =>
          (po.poNumber || po.purchaseOrderNumber || po.billNumber) ===
          poNumberFromUrl
      );
      if (match) {
        setFormData((prev) => ({
          ...prev,
          purchaseOrder: String(match.id || match._id),
        }));
      }
    }
  }, [poNumberFromUrl, purchaseOrders, setFormData]);

  // Handle supplier selection navigation / drawer
  const onFieldChange = useCallback(
    (field, value) => {
      if (value === "add-new-supplier") {
        setShowAddSupplierDrawer(true);
        return;
      }
      if (value === "add-new-purchase-order") {
        router.push("/dashboard/purchase-orders/create");
        return;
      }
      handleInputChange(field, value);
    },
    [handleInputChange, router]
  );

  // Handle new supplier created via drawer
  const handleAddSupplierSuccess = useCallback(
    (newSupplier) => {
      setShowAddSupplierDrawer(false);
      if (!newSupplier) return;
      const sId = newSupplier.id || newSupplier._id;
      setSuppliers((prev) => [...prev, newSupplier]);
      handleInputChange("supplier", sId);
      suppliersFetchedRef.current = null;
    },
    [handleInputChange]
  );

  // Handle item addition
  const onAddItem = useCallback(() => {
    handleAddItem(products, showError);
  }, [handleAddItem, products, showError]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm(t)) return;
    if (!storeId) return;

    const payload = buildBillPayload(storeId);

    const result = await submitBillApi(billService.createBill(payload), {
      message: t("success.createdSuccessfully", { item: t("common.bill") }),
    });

    if (result?.success) {
      setTimeout(() => {
        const billId = result.data?.id || result.data?._id;
        if (billId) router.push(`/dashboard/bills/${billId}`);
        else router.push("/dashboard/bills");
      }, 1200);
    } else if (result?.fieldErrors) {
      setErrors(result.fieldErrors);
    }
  }, [
    validateForm,
    t,
    storeId,
    buildBillPayload,
    submitBillApi,
    router,
    setErrors,
  ]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/bills");
  }, [router]);

  if (!storeId) {
    return <PageSkeleton />;
  }

  return (
    <BillFormView
      t={t}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      setErrors={setErrors}
      // Products
      products={products}
      productsLoading={productsLoading}
      selectedProduct={selectedProduct}
      setSelectedProduct={setSelectedProduct}
      selectedQuantity={selectedQuantity}
      setSelectedQuantity={setSelectedQuantity}
      selectedPrice={selectedPrice}
      setSelectedPrice={setSelectedPrice}
      handleAddItem={onAddItem}
      handleRemoveItem={handleRemoveItem}
      handleUpdateItem={handleUpdateItem}
      // Suppliers & POs
      suppliers={suppliers}
      suppliersLoading={suppliersLoading}
      purchaseOrders={purchaseOrders}
      purchaseOrdersLoading={purchaseOrdersLoading}
      handleInputChange={onFieldChange}
      // State
      isSubmitting={isSubmitting}
      isEditMode={false}
      // Navigation
      onBack={handleBack}
      onSubmit={handleSubmit}
      onCancel={handleBack}
      // Slots
      supplierDrawer={
        <AddSupplierDrawer
          isOpen={showAddSupplierDrawer}
          onClose={() => setShowAddSupplierDrawer(false)}
          onSuccess={handleAddSupplierSuccess}
        />
      }
    />
  );
};

export default memo(CreateBillPage);
