"use client";
import { CreateBillSidebarPresentation } from "@dragorbit/features/bills";

import React from "react";

import { supplierService, purchaseOrderService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useSearchParams } from "next/navigation";
import { useApiResponse } from "@/hooks/useApiResponse";
import AddSupplierDrawer from "@/components/supplier/AddSupplierDrawer";

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
  const storeId = selectedStore?.storeId;

  // Local state
  const [suppliers, setSuppliers] = React.useState([]);
  const [purchaseOrders, setPurchaseOrders] = React.useState([]);
  const [showAddSupplierDrawer, setShowAddSupplierDrawer] =
    React.useState(false);

  // Refs to prevent duplicate API calls
  const suppliersFetchedRef = React.useRef(null);
  const posFetchedRef = React.useRef(null);

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

  React.useEffect(() => {
    if (suppliersData) {
      setSuppliers(suppliersData?.data || suppliersData || []);
    }
  }, [suppliersData]);

  React.useEffect(() => {
    if (posData) {
      setPurchaseOrders(posData?.data || posData || []);
    }
  }, [posData]);

  React.useEffect(() => {
    if (storeId && suppliersFetchedRef.current !== storeId) {
      suppliersFetchedRef.current = storeId;
      executeFetchSuppliers(
        supplierService.getSuppliers({
          limit: 100,
          lightweight: true,
          store: storeId,
        }),
        { showToast: false },
      );
    }
  }, [storeId, executeFetchSuppliers]);

  React.useEffect(() => {
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
        { showToast: false },
      );
    }
  }, [formData.supplier, storeId, executeFetchPOs]);

  // Handle PO from URL
  React.useEffect(() => {
    const poNumber = searchParams.get("poNumber");
    if (poNumber && purchaseOrders.length > 0) {
      const foundPO = purchaseOrders.find(
        (po) =>
          (po.poNumber || po.purchaseOrderNumber || po.billNumber) === poNumber,
      );
      if (foundPO) {
        setFormData((prev) => ({
          ...prev,
          purchaseOrder: foundPO.id || foundPO._id,
        }));
      }
    }
  }, [searchParams, purchaseOrders]);

  // Handle new supplier added from drawer
  const handleAddSupplierSuccess = React.useCallback(
    (newSupplier) => {
      setShowAddSupplierDrawer(false);
      if (!newSupplier) return;

      const supplierId = newSupplier.id || newSupplier._id;
      setSuppliers((prev) => [...prev, newSupplier]);
      handleInputChange("supplier", supplierId);
      // Reset ref so a fresh fetch runs on next mount
      suppliersFetchedRef.current = null;
    },
    [handleInputChange],
  );

  return (
    <CreateBillSidebarPresentation
      model={{
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
      }}
    />
  );
};

export default BillSidebar;
