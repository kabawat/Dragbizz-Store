"use client";
import {
  CreateBillItemsSectionPresentation,
  resolveProductPurchasePrice,
  unwrapProductList,
} from "@dragorbit/features/bills";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { productService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { pickStoreId } from "@/utils/store.util";

const BillItemsSection = ({
  formData,
  setFormData,
  showError,
  errors,
  setErrors,
}) => {
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
        const raw = unwrapProductList(result.data);
        const normalized = raw.map((p) => ({
          ...p,
          purchasePrice: resolveProductPurchasePrice(p),
        }));
        setProducts(normalized);
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
      showError?.(t("errors.selectProduct") || "Please select a product");
      return;
    }

    const product = productsMap.get(selectedProduct);
    if (!product) {
      showError?.(t("errors.productNotFound") || "Product not found");
      return;
    }

    const quantityToAdd = parseInt(selectedQuantity, 10) || 1;
    const priceToAdd =
      selectedPrice !== undefined && selectedPrice !== ""
        ? parseFloat(selectedPrice)
        : resolveProductPurchasePrice(product);

    const newItem = {
      product: selectedProduct,
      productName: product.name || product.productName || "Product",
      quantity: quantityToAdd,
      purchasePrice: priceToAdd,
      uom: product.uom || product.pricing?.uom || "PCS",
    };

    setFormData((prev) => {
      const existingIdx = prev.items.findIndex(
        (it) => it.product === selectedProduct
      );
      if (existingIdx > -1) {
        const updated = [...prev.items];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantityToAdd,
          purchasePrice: priceToAdd || updated[existingIdx].purchasePrice,
        };
        return { ...prev, items: updated };
      }
      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });

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

  const handleUpdateItem = useCallback(
    (index, updates) => {
      setFormData((prev) => {
        if (!prev.items[index]) return prev;
        const updated = [...prev.items];
        updated[index] = { ...updated[index], ...updates };
        return { ...prev, items: updated };
      });
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
      handleUpdateItem,
      errors,
      setErrors,
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
      handleUpdateItem,
      errors,
      setErrors,
    ]
  );

  return <CreateBillItemsSectionPresentation model={model} />;
};

export default memo(BillItemsSection);
