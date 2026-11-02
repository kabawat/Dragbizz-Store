"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import {
  BillFormView,
  useBillForm,
  unwrapProductList,
  resolveProductPurchasePrice,
} from "@dragorbit/features/bills";
import { Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddSupplierDrawer from "@/components/supplier/AddSupplierDrawer";
import { Button } from "@/components/ui";
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

const EditBillPage = ({ billId }) => {
  const { t } = useTranslation();
  const router = useRouter();

  useDashboardHeader(
    t("bills.editBill"),
    t("bills.updateBillInformationAndDetails")
  );

  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(() => pickStoreId(selectedStore), [selectedStore]);
  const { showError } = useGlobalToast();

  const fetchedBillRef = useRef(null);

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
  const {
    execute: executeFetch,
    data: fetchedBill,
    loading: fetching,
    error: fetchError,
  } = useApiResponse();
  const { execute: executeUpdate, loading: isUpdating } = useApiResponse();
  const { execute: fetchProductsApi, loading: productsLoading } =
    useApiResponse();
  const { execute: fetchSuppliersApi, loading: suppliersLoading } =
    useApiResponse();
  const { execute: fetchPOsApi, loading: purchaseOrdersLoading } =
    useApiResponse();

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

  // 4. Fetch the existing bill for editing
  useEffect(() => {
    if (billId && storeId && fetchedBillRef.current !== billId) {
      fetchedBillRef.current = billId;
      executeFetch(billService.getBills({ store: storeId, id: billId }), {
        showToast: false,
      });
    }
  }, [billId, storeId, executeFetch]);

  // 5. Populate form when bill data arrives
  useEffect(() => {
    if (fetchedBill) {
      const data = fetchedBill.data || fetchedBill;
      setFormData({
        supplier: data.supplier?._id || data.supplier?.id || data.supplier || "",
        purchaseOrder:
          data.purchaseOrder?._id ||
          data.purchaseOrder?.id ||
          data.purchaseOrder ||
          "",
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString().split("T")[0]
          : "",
        notes: data.notes || "",
        goodsReceived: data.goodsReceived ?? true,
        items: (data.items || []).map((item) => ({
          product: item.product?._id || item.product?.id || item.product,
          productName: item.productName || item.product?.name || "Product",
          quantity: item.quantity || 1,
          purchasePrice:
            item.purchasePrice !== undefined
              ? item.purchasePrice
              : item.unitPrice || 0,
          uom: item.uom || item.product?.uom || "PCS",
        })),
      });
    }
  }, [fetchedBill, setFormData]);

  // Handle supplier drawer / PO creation routing
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

  const onAddItem = useCallback(() => {
    handleAddItem(products, showError);
  }, [handleAddItem, products, showError]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm(t)) return;
    if (!storeId || !billId) return;

    const payload = buildBillPayload(storeId);

    const result = await executeUpdate(
      billService.updateBill(billId, payload, storeId),
      { message: t("success.updatedSuccessfully", { item: t("common.bill") }) }
    );

    if (result?.success) {
      setTimeout(() => {
        router.push(`/dashboard/bills/${billId}`);
      }, 1200);
    } else if (result?.fieldErrors) {
      setErrors(result.fieldErrors);
    }
  }, [
    validateForm,
    t,
    storeId,
    billId,
    buildBillPayload,
    executeUpdate,
    router,
    setErrors,
  ]);

  const handleBack = useCallback(() => {
    router.push(billId ? `/dashboard/bills/${billId}` : "/dashboard/bills");
  }, [billId, router]);

  const handleCreateNew = useCallback(() => {
    router.push("/dashboard/bills/create");
  }, [router]);

  if (fetching || (!fetchedBill && !fetchError)) {
    return <PageSkeleton />;
  }

  if (fetchError) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8 bg-[rgb(var(--color-bg-primary))] rounded-xl shadow-sm border border-[rgb(var(--color-border-primary))]">
          <Receipt className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-2">
            {fetchError}
          </h2>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/bills")}
            className="mt-4"
          >
            {t("common.backTo", { item: t("common.bills") })}
          </Button>
        </div>
      </div>
    );
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
      isSubmitting={isUpdating}
      isEditMode={true}
      // Navigation
      onBack={handleBack}
      onCreateNew={handleCreateNew}
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

export default memo(EditBillPage);
