"use client";
import { Package } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
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
  // Infinite scroll props
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
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
    <div
      className={`bg-[rgb(var(--color-bg-primary))] rounded-xl  ${className}`}
      {...props}
    >
      {/* Select All Checkbox - Fixed at top */}
      {products.length > 0 && (
        <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
            />
            <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              {t("products.selectAllProducts", { count: products.length })}
            </span>
            {selectedProducts.length > 0 && (
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                {selectedProducts.length} {t("products.selected")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {products.map((product, _index) => (
          <div key={product.id} className="relative">
            <ProductCard
              product={product}
              selected={selectedProducts.includes(product.id)}
              onSelect={handleProductSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onViewDetails={onViewDetails}
              className="transition-all duration-300 ease-out"
            />
          </div>
        ))}
      </div>

      {/* Infinite Scroll Loading */}
      {isLoadingMore && (
        <div className="bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                {t("products.loadingMoreProducts")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
