"use client";

import { ProductMasterDetailView } from "@dragorbit/features/products";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ProductDetailsTemplate from "@/components/templates/product/ProductDetailsTemplate";
import { productService, variantService } from "@/service";
import {
  mergeVariantIntoProduct,
  normalizeProductRecord,
  pickDefaultVariant,
} from "@/utils/productUtils";
import { useProductDetailsPrint } from "../view/hooks/useProductDetailsPrint";

const ProductMasterDetailLayout = (props) => {
  const router = useRouter();
  const [fetchingData, setFetchingData] = useState(false);
  const { handleDownloadPDF } = useProductDetailsPrint(fetchingData);

  const handleEdit =
    props.onEdit || ((id) => router.push(`/dashboard/products/${id}/edit`));
  const handleCreate =
    props.onCreate || (() => router.push("/dashboard/products/add"));

  const handleFetchDetails = useCallback(
    async (prodId) => {
      if (!prodId || !props.storeId) return null;

      try {
        setFetchingData(true);
        const response = await productService.getProducts({
          store: props.storeId,
          id: prodId,
        });

        const raw = response?.data;
        let product = null;
        if (raw?.data && !Array.isArray(raw.data)) product = raw.data;
        else if (Array.isArray(raw?.data)) product = raw.data[0];
        else if (Array.isArray(raw)) product = raw[0];
        else if (raw) product = raw;

        if (product) {
          let variants = [];
          try {
            const variantsResponse = await variantService.getVariants({
              store: props.storeId,
              product: prodId,
              limit: 20,
            });
            const vRaw = variantsResponse?.data;
            variants = Array.isArray(vRaw)
              ? vRaw
              : Array.isArray(vRaw?.data)
                ? vRaw.data
                : [];
          } catch {
            // optional variants
          }

          const defaultVariant = pickDefaultVariant(variants);
          const merged = mergeVariantIntoProduct(product, defaultVariant);
          const normalized = normalizeProductRecord(merged || product) || {};

          return {
            ...product,
            ...normalized,
            id: product.id ?? product._id ?? prodId,
            sellingPrice:
              normalized.sellingPrice !== undefined &&
              normalized.sellingPrice !== ""
                ? normalized.sellingPrice
                : (defaultVariant?.sellingPrice ??
                  product.pricing?.sellingPrice ??
                  product.sellingPrice),
            mrp:
              normalized.mrp !== undefined && normalized.mrp !== ""
                ? normalized.mrp
                : (defaultVariant?.mrp ?? product.pricing?.mrp ?? product.mrp),
            basePrice:
              normalized.basePrice !== undefined && normalized.basePrice !== ""
                ? normalized.basePrice
                : (defaultVariant?.basePrice ??
                  product.pricing?.basePrice ??
                  product.basePrice),
            purchasePrice:
              normalized.basePrice !== undefined && normalized.basePrice !== ""
                ? normalized.basePrice
                : (defaultVariant?.basePrice ??
                  product.pricing?.basePrice ??
                  product.purchasePrice),
            stock:
              normalized.stock !== undefined &&
              normalized.stock !== "" &&
              Number(normalized.stock) > 0
                ? normalized.stock
                : (defaultVariant?.stock ??
                  defaultVariant?.stockQuantity ??
                  product.stock ??
                  0),
            sku: normalized.sku || defaultVariant?.sku || product.sku || "",
            barcode:
              normalized.barcode ||
              defaultVariant?.barcode ||
              product.barcode ||
              "",
            uom: normalized.uom || defaultVariant?.uom || product.uom || "PCS",
            variants: variants.length > 0 ? variants : product.variants || [],
            timestamps: product.timestamps,
            createdAt: product.createdAt ?? product.timestamps?.createdAt,
            updatedAt: product.updatedAt ?? product.timestamps?.updatedAt,
          };
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setFetchingData(false);
      }
      return null;
    },
    [props.storeId]
  );

  return (
    <ProductMasterDetailView
      {...props}
      onFetchDetails={handleFetchDetails}
      productService={productService}
      variantService={variantService}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDownloadPDF={handleDownloadPDF}
      moment={moment}
      PrintTemplate={ProductDetailsTemplate}
    />
  );
};

export default ProductMasterDetailLayout;
