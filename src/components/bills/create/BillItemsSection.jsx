"use client";
import { CreateBillItemsSectionPresentation } from "@dragorbit/features/bills";

import React, { useState } from "react";

import { productService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useTranslation } from "@/hooks/ui/useTranslation";

const BillItemsSection = ({
  formData,
  setFormData,
  showError,
  errors,
  setErrors,
}) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // Local state for products
  const [products, setProducts] = React.useState([]);
  const productsFetchedRef = React.useRef({ storeId: null, fetched: false });

  const { execute: fetchProducts, loading: productsLoading } = useApiResponse();

  React.useEffect(() => {
    if (!storeId || productsFetchedRef.current.fetched) return;
    productsFetchedRef.current = { storeId, fetched: true };

    fetchProducts(
      productService.getProducts({
        limit: 100,
        lightweight: true,
        store: storeId,
      }),
      { showToast: false },
    ).then((result) => {
      if (result?.success) {
        setProducts(result.data || []);
      } else {
        productsFetchedRef.current = { storeId: null, fetched: false };
      }
    });
  }, [storeId, fetchProducts]);

  // Local state for item addition
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState(0);

  const handleAddItem = () => {
    if (!selectedProduct) {
      showError(t("errors.selectProduct"));
      return;
    }

    const product = products.find((p) => (p.id || p._id) === selectedProduct);
    if (!product) {
      showError(t("errors.productNotFound"));
      return;
    }

    const quantityToAdd = parseInt(selectedQuantity, 10) || 1;
    const priceToAdd = parseFloat(selectedPrice) || 0;

    const newItem = {
      product: selectedProduct,
      productName: product.name || product.productName || "",
      quantity: quantityToAdd,
      purchasePrice: priceToAdd,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    // Reset selection
    setSelectedProduct("");
    setSelectedQuantity(1);
    setSelectedPrice(0);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  return (
    <CreateBillItemsSectionPresentation
      model={{
        t,
        selectedProduct,
        setSelectedProduct,
        products,
        setSelectedPrice,
        productsLoading,
        selectedQuantity,
        setSelectedQuantity,
        selectedPrice,
        handleAddItem,
        formData,
        handleRemoveItem,
      }}
    />
  );
};

export default BillItemsSection;
