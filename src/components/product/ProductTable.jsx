"use client";
import { ArrowDownToLine, Copy, Edit, Eye, MoreVertical, Package, Trash2, } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";

const ProductTable = ({
  products = [],
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onStockIn,
  loading = false,
  emptyMessage,
  className = "",
  hasStoreGst = false,
  canEdit = false,
  canDelete = false,
}) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);
  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } = useRowActionMenu();

  const _defaultEmptyMessage = emptyMessage || t("products.noProducts");

  const handleMenuAction = useCallback((productId, action) => {
    closeMenu();
    switch (action) {
      case "view":
        onViewDetails?.(productId);
        break;
      case "stock-in":
        onStockIn?.(productId);
        break;
      case "edit":
        onEdit?.(productId);
        break;
      case "duplicate":
        onDuplicate?.(productId);
        break;
      case "delete":
        onDelete?.(productId);
        break;
      default:
        break;
    }
  }, [closeMenu, onViewDetails, onStockIn, onEdit, onDuplicate, onDelete]);

  const buildMenuItems = useCallback((rowId) => {
    const run = (action) => () => handleMenuAction(rowId, action);
    const items = [
      { key: "view", label: t("common.viewDetails"), icon: Eye, onClick: run("view") },
    ];
    if (canEdit) {
      items.push(
        { key: "stock-in", label: t("products.stockIn"), icon: ArrowDownToLine, tone: "success", onClick: run("stock-in") },
        { key: "edit", label: t("common.edit"), icon: Edit, onClick: run("edit") },
        { key: "duplicate", label: t("common.duplicate"), icon: Copy, onClick: run("duplicate") },
      );
    }
    if (canDelete) {
      items.push({ key: "delete", label: t("common.delete"), icon: Trash2, tone: "danger", onClick: run("delete") });
    }
    return items;
  }, [t, canEdit, canDelete, handleMenuAction]);

  const getVisibilityBadge = (product) => {
    const isInCatalog = product.showInCatalog !== false;

    if (isInCatalog) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20 dark:border-green-500/30">
          {t("products.inCatalog")}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-500/10 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/20 dark:border-gray-500/30">
        {t("products.hidden")}
      </span>
    );
  };

  const _calculateDiscount = (sellingPrice, mrp) => {
    if (!mrp || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };

  return (
    <div className={`${className}`}>
      <div className="relative">
        <table className="w-full min-w-[1000px]">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  {t("products.product")}
                </span>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("products.visibility")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("products.categories")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("products.price")}
              </th>
              {hasStoreGst && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  {t("products.gst")}
                </th>
              )}
              <th className="px-6 py-4 w-24 text-center text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
            {products.map((product, index) => {
              const rowId = product.id;
              return (
                <tr
                  key={product.id}
                  className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${hoveredRow === index
                    ? "bg-[rgb(var(--color-bg-tertiary))]"
                    : ""
                    }`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onContextMenu={(event) => openContextMenu(event, rowId)}
                >
                  {/* Product Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-[rgb(var(--color-border-primary))]">
                        {product.image && !imageError[product.id] ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover"
                            onError={() =>
                              setImageError((prev) => ({
                                ...prev,
                                [product.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <Package className="w-6 h-6 text-[rgb(var(--color-text-tertiary))]" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[rgb(var(--color-text-primary))] text-sm truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] font-medium">
                          {product.brand}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            SKU: {product.sku}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Visibility Column */}
                  <td className="px-6 py-4">
                    {getVisibilityBadge(product)}
                  </td>

                  {/* Categories Column */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        // Safely handle category - could be string, array, object, null, or undefined
                        let categoryParts = [];
                        const rawCategory = product.category;

                        if (Array.isArray(rawCategory)) {
                          categoryParts = rawCategory.filter(Boolean);
                        } else if (
                          typeof rawCategory === "string" &&
                          rawCategory.trim()
                        ) {
                          categoryParts = rawCategory
                            .split(" > ")
                            .filter(Boolean);
                        } else if (
                          rawCategory &&
                          typeof rawCategory === "object" &&
                          rawCategory.name
                        ) {
                          // Handle object with name property (from API)
                          categoryParts = [rawCategory.name];
                        } else if (rawCategory) {
                          // Fallback: convert to string and split
                          categoryParts = [String(rawCategory)];
                        }

                        if (categoryParts.length === 0) {
                          return (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/20 dark:border-gray-500/30">
                              Uncategorized
                            </span>
                          );
                        }

                        return (
                          <>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 dark:border-purple-500/30">
                              {categoryParts[0]}
                            </span>
                            {categoryParts[1] && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30">
                                {categoryParts[1]}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                      ₹{product.sellingPrice.toLocaleString()}
                    </span>
                  </td>

                  {/* GST Column */}
                  {hasStoreGst && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start h-full">
                        {(product.gst || product.gstRate) > 0 ? (
                          <div className="flex flex-col items-start">
                            <div className="flex gap-2 mb-1">
                              <span className="text-sm font-bold text-[rgb(var(--color-primary))]">
                                {product.gst || product.gstRate || 0}%
                              </span>
                              <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 dark:border-green-500/30">
                                GST
                              </span>
                            </div>
                            {(product.hsnCode || product.hsn) && (
                              <div className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1">
                                HSN: {product.hsnCode || product.hsn}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-sm text-[rgb(var(--color-text-tertiary))]">
                              No GST
                            </span>
                            <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                              Not Applicable
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Actions Column */}
                  <td className="px-4 py-4 w-24 text-start">
                    <div
                      className="relative"
                      ref={(el) => (menuRefs.current[rowId] = el)}
                    >
                      <button
                        onClick={() => toggleDropdown(rowId)}
                        className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                        title={t("common.actions")}
                      >
                        <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                      </button>

                      {menu?.rowId === rowId && menu.mode === "dropdown" ? (
                        <RowActionsMenu items={buildMenuItems(rowId)} mode="dropdown" />
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RowContextMenuLayer open={menu?.mode === "context"} onClose={closeMenu} />
      {menu?.mode === "context" ? (
        <RowActionsMenu
          mode="context"
          anchorPoint={{ x: menu.x, y: menu.y }}
          items={buildMenuItems(menu.rowId)}
          className="w-48"
        />
      ) : null}
    </div>
  );
};

export default ProductTable;
