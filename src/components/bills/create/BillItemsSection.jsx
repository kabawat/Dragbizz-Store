"use client";
import { CreateBillItemsSectionPresentation } from "@dragorbit/features/bills";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { productService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { pickStoreId } from "@/utils/store.util";

const BillItemsSection = ({ formData, setFormData, showError }) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(() => pickStoreId(selectedStore), [selectedStore]);

  // Local state for products
  const [products, setProducts] = useState([]);
  const productsFetchedRef = useRef({ storeId: null, fetched: false });

  const { execute: fetchProducts, loading: productsLoading } = useApiResponse();

  useEffect(() => {
    if (!storeId || productsFetchedRef.current.fetched) return;
    productsFetchedRef.current = { storeId, fetched: true };

    fetchProducts(
      productService.getProducts({
        limit: 100,
        lightweight: true,
        store: storeId,
      }),
      { showToast: false }
    ).then((result) => {
      if (result?.success) {
        setProducts(result.data || []);
      } else {
        productsFetchedRef.current = { storeId: null, fetched: false };
      }
    });
  }, [storeId, fetchProducts]);

  const productsMap = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      map.set(p.id || p._id, p);
    }
    return map;
  }, [products]);

  // Local state for item addition
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState(0);

  const handleAddItem = useCallback(() => {
    if (!selectedProduct) {
      showError(t("errors.selectProduct"));
      return;
    }

    const product = productsMap.get(selectedProduct);
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

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset selection
    setSelectedProduct("");
    setSelectedQuantity(1);
    setSelectedPrice(0);
  }, [
    selectedProduct,
    productsMap,
    selectedQuantity,
    selectedPrice,
    showError,
    setFormData,
    t,
  ]);

  const handleRemoveItem = useCallback(
    (index) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    },
    [setFormData]
  );

  const model = useMemo(
    () => ({
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
    }),
    [
      t,
      selectedProduct,
      products,
      productsLoading,
      selectedQuantity,
      selectedPrice,
      handleAddItem,
      formData,
      handleRemoveItem,
    ]
  );

  return <CreateBillItemsSectionPresentation model={model} />;
};

export default memo(BillItemsSection);
