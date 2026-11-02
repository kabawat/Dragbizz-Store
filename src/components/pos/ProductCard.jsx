import { Tooltip as SharedTooltip } from "@dragorbit/ui";
import { Check, Minus, Plus } from "lucide-react";
import { memo } from "react";
import { resolveProductUnitPrice } from "@/utils/productUtils";

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

function ProductCard({
  product,
  onAdd,
  onIncrease,
  onDecrease,
  viewMode,
  selectedQty = 0,
  productQty = selectedQty,
  availableStock,
  isService = false,
}) {
  const isGrid = viewMode === "grid";
  const price = resolveProductUnitPrice(product);
  const isSelected = selectedQty > 0;
  const stockLimitReached = !isService && productQty >= availableStock;

  const handleIncrease = onIncrease || onAdd;
  const handleDecrease = onDecrease;

  const handleCardClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (isSelected) {
        handleDecrease?.(product);
      }
    } else {
      if (!stockLimitReached) {
        handleIncrease?.(product);
      }
    }
  };

  const getImageUrl = (images) => {
    const first = images?.[0];
    if (!first) return null;
    if (typeof first === "string") return first;
    if (typeof first === "object" && first.url) return first.url;
    return null;
  };

  const imageUrl = getImageUrl(product.images);

  const selectedBorder = isSelected
    ? "border-[rgb(var(--color-primary))] ring-2 ring-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/[0.04]"
    : "border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))]";

  // Grid View
  if (isGrid) {
    return (
      <SharedTooltip
        content={
          isSelected ? "Click to increase, Ctrl+Click to decrease" : undefined
        }
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: composite card container */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: composite card container */}
        <div
          onClick={handleCardClick}
          className={`group w-full h-full p-2 bg-[rgb(var(--color-bg-primary))] border rounded-xl transition-all duration-300 text-left overflow-hidden flex flex-col gap-2 relative ${
            !isSelected && stockLimitReached
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer"
          } ${selectedBorder}`}
        >
          {isSelected && (
            <div className="absolute top-2 left-2 z-10 min-w-5 h-5 px-1 rounded-full bg-[rgb(var(--color-primary))] text-white text-[0.625rem] font-bold flex items-center justify-center shadow-sm">
              {selectedQty > 1 ? (
                selectedQty
              ) : (
                <Check className="w-3 h-3" strokeWidth={3} />
              )}
            </div>
          )}
          <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden w-full h-20 sm:h-24 md:h-28 relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <span className="text-3xl opacity-50">📦</span>
            )}
            <div className="absolute bottom-1 right-1 bg-[rgb(var(--color-primary))] text-white text-[0.625rem] font-bold px-1.5 py-0.5 rounded">
              {fmt(price)}
            </div>
          </div>
          <div className="min-w-0 w-full px-1 flex-1 flex flex-col justify-between pb-1">
            <div>
              <p className="text-[0.6875rem] font-bold text-[rgb(var(--color-text-primary))] leading-[1.2] line-clamp-2 mb-0.5">
                {product.name}
              </p>
              <p className="text-[0.5625rem] text-[rgb(var(--color-text-secondary))] font-medium truncate uppercase tracking-wider">
                {product.sku || "NO SKU"}
              </p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-1 gap-1">
              <span className="text-xs font-black text-[rgb(var(--color-primary))] whitespace-nowrap">
                {fmt(price)}
              </span>
              {isSelected ? (
                <div className="flex items-center bg-[rgb(var(--color-primary))] text-white rounded-lg shadow-sm overflow-hidden flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDecrease?.(product);
                    }}
                    className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-white/20 active:bg-white/30 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                  <span className="min-w-4 sm:min-w-5 px-0.5 text-center text-[0.6875rem] sm:text-xs font-black select-none">
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    disabled={stockLimitReached}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!stockLimitReached) handleIncrease?.(product);
                    }}
                    className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-white/20 active:bg-white/30 transition-colors enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!stockLimitReached) handleIncrease?.(product);
                  }}
                  className="w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] group-hover:bg-[rgb(var(--color-primary))] group-hover:text-white flex-shrink-0 cursor-pointer"
                  aria-label="Add to cart"
                >
                  <Plus className="w-3 h-3" strokeWidth={3} />
                </button>
              )}
            </div>
          </div>
        </div>
      </SharedTooltip>
    );
  }

  // List View
  return (
    <SharedTooltip
      content={
        isSelected ? "Click to increase, Ctrl+Click to decrease" : undefined
      }
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: composite card container */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: composite card container */}
      <div
        onClick={handleCardClick}
        className={`group w-full relative bg-[rgb(var(--color-bg-primary))] border rounded-xl transition-all duration-200 text-left overflow-hidden flex-shrink-0 p-2.5 flex items-center gap-3 ${
          !isSelected && stockLimitReached
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer"
        } ${selectedBorder}`}
      >
        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden w-14 h-14 border border-[rgb(var(--color-border-primary))] relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-2xl opacity-40">📦</span>
          )}
          {isSelected && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[rgb(var(--color-primary))] text-white text-[0.625rem] font-bold flex items-center justify-center shadow-sm">
              {selectedQty > 1 ? (
                selectedQty
              ) : (
                <Check className="w-3 h-3" strokeWidth={3} />
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] truncate">
              {product.name}
            </p>
            <span className="text-sm font-black text-[rgb(var(--color-primary))] whitespace-nowrap">
              {fmt(price)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[0.625rem] bg-[rgb(var(--color-bg-secondary))] px-1.5 py-0.5 rounded border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] font-mono">
              {product.sku || "N/A"}
            </span>
            {isSelected && (
              <span className="text-[0.625rem] font-bold text-[rgb(var(--color-primary))]">
                ×{selectedQty} in cart
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {isSelected ? (
            <div className="flex items-center bg-[rgb(var(--color-primary))] text-white rounded-lg shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecrease?.(product);
                }}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/20 active:bg-white/30 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
              <span className="min-w-6 px-1 text-center text-xs font-black select-none">
                {selectedQty}
              </span>
              <button
                type="button"
                disabled={stockLimitReached}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!stockLimitReached) handleIncrease?.(product);
                }}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/20 active:bg-white/30 transition-colors enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!stockLimitReached) handleIncrease?.(product);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[rgb(var(--color-primary))] text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Add to cart"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </SharedTooltip>
  );
}

export default memo(ProductCard);
