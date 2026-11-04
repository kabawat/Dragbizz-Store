"use client";

import { ProductMasterDetailView } from "@dragorbit/features/products";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ProductDetailsTemplate from "@/components/templates/product/ProductDetailsTemplate";
import { productService } from "@/service";
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
  const handleViewVariants =
    props.onViewVariants ||
    ((product, variantId) => {
      if (variantId) {
        router.push(`/dashboard/variants/view/${variantId}`);
      } else {
        router.push("/dashboard/variants");
      }
    });

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
          const variants = Array.isArray(product.variants)
            ? product.variants
            : [];
          const hasMultipleVariants =
            product.hasMultipleVariants ??
            (variants.length > 1 ||
              (variants.length === 1 && variants[0]?.isDefault !== true));
          const defaultVariant = pickDefaultVariant(variants);

          if (hasMultipleVariants) {
            const normalized = normalizeProductRecord(product) || {};
            const variantPrices = variants
              .map((v) => Number(v.sellingPrice))
              .filter((p) => !isNaN(p) && p > 0);
            const minPrice =
              variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
            const maxPrice =
              variantPrices.length > 0
                ? Math.max(...variantPrices)
                : minPrice;

            const variantMrps = variants
              .map((v) => Number(v.mrp))
              .filter((m) => !isNaN(m) && m > 0);
            const minMrp = variantMrps.length > 0 ? Math.min(...variantMrps) : 0;
            const maxMrp = variantMrps.length > 0 ? Math.max(...variantMrps) : minMrp;

            const variantCosts = variants
              .map((v) =>
                Number(
                  v.stock?.purchasePrice ??
                    v.purchasePrice ??
                    v.basePrice ??
                    0
                )
              )
              .filter((c) => !isNaN(c) && c > 0);
            const minCost =
              variantCosts.length > 0 ? Math.min(...variantCosts) : 0;
            const maxCost =
              variantCosts.length > 0 ? Math.max(...variantCosts) : minCost;

            const totalVariantsStock = variants.reduce(
              (sum, v) =>
                sum +
                Number(
                  v.stock ??
                    v.inventory?.availableQuantity ??
                    v.inventory?.totalQuantity ??
                    v.stockQuantity ??
                    0
                ),
              0
            );

            return {
              ...product,
              ...normalized,
              id: product.id ?? product._id ?? prodId,
              hasMultipleVariants: true,
              priceRange: { min: minPrice, max: maxPrice },
              mrpRange: { min: minMrp, max: maxMrp },
              costRange: { min: minCost, max: maxCost },
              sellingPrice: minPrice,
              mrp: maxMrp,
              basePrice: minCost,
              purchasePrice: minCost,
              stock: totalVariantsStock,
              sku: "Multiple SKUs",
              barcode: "",
              uom: normalized.uom || product.uom || "PCS",
              variants,
              timestamps: product.timestamps,
              createdAt: product.createdAt ?? product.timestamps?.createdAt,
              updatedAt: product.updatedAt ?? product.timestamps?.updatedAt,
            };
          }

          // Single default product: merge default variant data to top level, but hide variants section
          const merged = mergeVariantIntoProduct(product, defaultVariant);
          const normalized = normalizeProductRecord(merged || product) || {};

          return {
            ...product,
            ...normalized,
            id: product.id ?? product._id ?? prodId,
            defaultVariantId:
              defaultVariant?.id ??
              defaultVariant?._id ??
              product.defaultVariantId ??
              normalized.defaultVariantId ??
              null,
            defaultVariant: defaultVariant || null,
            hasMultipleVariants: false,
            sellingPrice:
              normalized.sellingPrice !== undefined &&
              normalized.sellingPrice !== ""
                ? normalized.sellingPrice
                : (defaultVariant?.sellingPrice ??
                  defaultVariant?.price ??
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
                  defaultVariant?.inventory?.availableQuantity ??
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
            variants: [], // Empty for single product so variants section/table is hidden
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
      onCreate={handleCreate}
      onEdit={handleEdit}
      onViewVariants={handleViewVariants}
      onDownloadPDF={handleDownloadPDF}
      moment={moment}
      PrintTemplate={ProductDetailsTemplate}
    />
  );
};

export default ProductMasterDetailLayout;
