"use client";
import { ProductGridPresentation } from "@dragorbit/features/products";

import { Package } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products = [],
  selectedProducts = [],
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  loading = false,
  emptyMessage,
  className = "",
  ...props
}) => {
  const { t } = useTranslation();
  const defaultEmptyMessage = emptyMessage || t("products.noProducts");
  const [selectAll, setSelectAll] = useState(false);

  // Handle individual product selection
  const handleProductSelect = (productId, isSelected) => {
    if (onSelect) {
      onSelect(productId, isSelected);
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    setSelectAll(isSelected);
    if (onSelectAll) {
      onSelectAll(isSelected);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm overflow-hidden ${className}`}
        {...props}
      >
        <div className="animate-pulse">
          <div className="h-16 bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div
                  className="rounded-xl h-80"
                  style={{ backgroundColor: "rgb(var(--color-bg-secondary))" }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div
        className={`bg-[rgb(var(--color-bg-primary))] rounded-xl  ${className}`}
        {...props}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            {defaultEmptyMessage}
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
            {t("products.noProductsMatchCriteria")}
          </p>
        </div>
      </div>
    );
  }

  // List view (using ProductCard in list mode)
  return (
    <ProductGridPresentation
      model={{
        className,
        props,
        products,
        selectAll,
        handleSelectAll,
        t,
        selectedProducts,
        ProductCard,
        handleProductSelect,
        onEdit,
        onDelete,
        onDuplicate,
        onViewDetails,
      }}
    />
  );
};

export default ProductGrid;
