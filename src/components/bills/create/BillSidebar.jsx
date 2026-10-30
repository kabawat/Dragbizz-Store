"use client";
import { CreateBillSidebarPresentation } from "@dragorbit/features/bills";
import { useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddSupplierDrawer from "@/components/supplier/AddSupplierDrawer";
import { useApiResponse } from "@/hooks/useApiResponse";
import { purchaseOrderService, supplierService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { pickStoreId } from "@/utils/store.util";

const BillSidebar = ({
  t,
  formData,
  handleInputChange,
  errors,
  isCreating,
  handleSubmit,
  setFormData,
  isEditing = false,
}) => {
  const searchParams = useSearchParams();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(() => pickStoreId(selectedStore), [selectedStore]);

  // Local state
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showAddSupplierDrawer, setShowAddSupplierDrawer] = useState(false);

  // Refs to prevent duplicate API calls
  const suppliersFetchedRef = useRef(null);
  const posFetchedRef = useRef(null);

  const {
    execute: executeFetchSuppliers,
    data: suppliersData,
    loading: suppliersLoading,
  } = useApiResponse();
  const {
    execute: executeFetchPOs,
    data: posData,
    loading: purchaseOrdersLoading,
  } = useApiResponse();

  useEffect(() => {
    if (suppliersData) {
      setSuppliers(suppliersData?.data || suppliersData || []);
    }
  }, [suppliersData]);

  useEffect(() => {
    if (posData) {
      setPurchaseOrders(posData?.data || posData || []);
    }
  }, [posData]);

  useEffect(() => {
    if (storeId && suppliersFetchedRef.current !== storeId) {
      suppliersFetchedRef.current = storeId;
      executeFetchSuppliers(
        supplierService.getSuppliers({
          limit: 100,
          lightweight: true,
          store: storeId,
        }),
        { showToast: false }
      );
    }
  }, [storeId, executeFetchSuppliers]);

  useEffect(() => {
    if (!formData.supplier) {
      setPurchaseOrders([]);
      return;
    }
    const lookupKey = `${storeId}_${formData.supplier}`;
    if (storeId && posFetchedRef.current !== lookupKey) {
      posFetchedRef.current = lookupKey;
      executeFetchPOs(
        purchaseOrderService.getPurchaseOrders({
          limit: 100,
          lightweight: true,
          store: storeId,
          supplier: formData.supplier,
        }),
        { showToast: false }
      );
    }
  }, [formData.supplier, storeId, executeFetchPOs]);

  // Handle PO from URL
  useEffect(() => {
    const poNumber = searchParams.get("poNumber");
    if (poNumber && purchaseOrders.length > 0) {
      const foundPO = purchaseOrders.find(
        (po) =>
          (po.poNumber || po.purchaseOrderNumber || po.billNumber) === poNumber
      );
      if (foundPO) {
        setFormData((prev) => ({
          ...prev,
          purchaseOrder: foundPO.id || foundPO._id,
        }));
      }
    }
  }, [searchParams, purchaseOrders, setFormData]);

  // Handle new supplier added from drawer
  const handleAddSupplierSuccess = useCallback(
    (newSupplier) => {
      setShowAddSupplierDrawer(false);
      if (!newSupplier) return;

      const supplierId = newSupplier.id || newSupplier._id;
      setSuppliers((prev) => [...prev, newSupplier]);
      handleInputChange("supplier", supplierId);
      // Reset ref so a fresh fetch runs on next mount
      suppliersFetchedRef.current = null;
    },
    [handleInputChange]
  );

  const model = useMemo(
    () => ({
      t,
      formData,
      setShowAddSupplierDrawer,
      handleInputChange,
      suppliersLoading,
      suppliers,
      errors,
      purchaseOrdersLoading,
      purchaseOrders,
      handleSubmit,
      isCreating,
      isEditing,
      AddSupplierDrawer,
      showAddSupplierDrawer,
      handleAddSupplierSuccess,
    }),
    [
      t,
      formData,
      handleInputChange,
      suppliersLoading,
      suppliers,
      errors,
      purchaseOrdersLoading,
      purchaseOrders,
      handleSubmit,
      isCreating,
      isEditing,
      showAddSupplierDrawer,
      handleAddSupplierSuccess,
    ]
  );

  return <CreateBillSidebarPresentation model={model} />;
};

export default memo(BillSidebar);
