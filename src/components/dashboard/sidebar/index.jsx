"use client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar, toggleExpandedMenu, expandMenu } from "@/store/slices/uiSlice";
import StoreSelector from "@/components/dashboard/sidebar/StoreSelector";
import {
  getSalesSubMenuItems,
  getInventorySubMenuItems,
  getPurchaseSubMenuItems,
  getAnalyticsSubMenuItems,
  getNavigationItems,
  getBottomItems,
} from "@/data/constants/sidebarData";

const Sidebar = ({ onStoreChange }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { agency, selectedStore } = useAppSelector((state) => state.profile);
  const isCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);
  const expandedMenus = useAppSelector((state) => state.ui.expandedMenus);

  // Memoized Menu Items
  const salesSubMenuItems = useMemo(() => getSalesSubMenuItems(t), [t]);
  const inventorySubMenuItems = useMemo(() => getInventorySubMenuItems(t), [t]);
  const purchaseSubMenuItems = useMemo(() => getPurchaseSubMenuItems(t), [t]);
  const analyticsSubMenuItems = useMemo(
    () => getAnalyticsSubMenuItems(t, selectedStore),
    [t, selectedStore]
  );

  const navigationItems = useMemo(
    () =>
      getNavigationItems(
        t,
        salesSubMenuItems,
        inventorySubMenuItems,
        purchaseSubMenuItems,
        analyticsSubMenuItems
      ),
    [t, salesSubMenuItems, inventorySubMenuItems, purchaseSubMenuItems, analyticsSubMenuItems]
  );

  const bottomItems = useMemo(() => getBottomItems(t), [t]);

  const handleSubMenuToggle = (item, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    dispatch(toggleExpandedMenu(item.key));
  };

  // Auto-expand menu for the active route (without collapsing already open menus)
  useEffect(() => {
    if (navigationItems && pathname) {
      const activeItem = navigationItems.find(
        (item) =>
          item.hasSubMenu &&
          item.subMenuItems?.some(
            (subItem) =>
              pathname === subItem.href ||
              pathname.startsWith(`${subItem.href}/`)
          )
      );
      if (activeItem) {
        dispatch(expandMenu(activeItem.key));
      }
    }
  }, [pathname, navigationItems]);

  return (
    <div
      className="bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-r border-[rgb(var(--color-border-primary))]/40 h-screen flex flex-col shadow-lg relative z-[150] flex-shrink-0"
      style={{
        width: isCollapsed ? "64px" : "256px",
        minWidth: isCollapsed ? "64px" : "256px",
        maxWidth: isCollapsed ? "64px" : "256px",
        transition:
          "width 0.3s ease-in-out, min-width 0.3s ease-in-out, max-width 0.3s ease-in-out",
        willChange: "width",
      }}
    >
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        {/* Logo Section */}
        <div className="px-4 py-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[rgb(var(--color-primary))] rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                  {agency?.agencyName || t("common.retailManager")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="relative flex justify-end">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="absolute cursor-pointer w-7 h-7 rounded-full border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors flex items-center justify-center shadow-sm translate-x-3 -translate-y-3"
            aria-label={
              isCollapsed
                ? t("sidebar.expandSidebar")
                : t("sidebar.collapseSidebar")
            }
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
            )}
          </button>
        </div>

        {/* Store Selection */}
        <StoreSelector isCollapsed={isCollapsed} onStoreChange={onStoreChange} />
      </div>

      {/* Scrollable Navigation Section */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            if (item.hasSubMenu && item.key) {
              const isExpanded = expandedMenus[item.key];

              return (
                <div key={item.name} className="relative">
                  <div
                    onClick={(e) => !isCollapsed && handleSubMenuToggle(item, e)}
                    className={`w-full group flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-2"
                      } py-2 cursor-pointer rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors text-[rgb(var(--color-text-secondary))] ${isExpanded && !isCollapsed ? "bg-[rgb(var(--color-bg-secondary))]" : ""
                      }`}
                    title={isCollapsed ? item.name : ""}
                  >
                    {!isCollapsed ? (
                      <div className="flex items-center space-x-3 text-[rgb(var(--color-text-secondary))]">
                        <Icon
                          className={`w-4 h-4 transition-colors ${isExpanded
                            ? "text-[rgb(var(--color-primary))]"
                            : "text-[rgb(var(--color-text-tertiary))]"
                            }`}
                        />
                        <span
                          className={`font-semibold tracking-wide uppercase text-xs transition-colors ${isExpanded ? "text-[rgb(var(--color-primary))]" : ""
                            }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    ) : (
                      <Icon className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    )}

                    {!isCollapsed && (
                      <ChevronDown
                        className={`w-4 h-4 text-[rgb(var(--color-text-tertiary))] transition-all duration-200 ${isExpanded
                          ? "rotate-180 opacity-100 text-[rgb(var(--color-primary))]"
                          : "opacity-50 group-hover:opacity-100"
                          }`}
                      />
                    )}
                  </div>

                  {/* Sub-menu */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && !isCollapsed
                      ? "max-h-96 opacity-100 mt-1"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    <div className="ml-6 space-y-1">
                      {item.subMenuItems &&
                        item.subMenuItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive =
                            pathname === subItem.href ||
                            pathname.startsWith(`${subItem.href}/`);
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${isSubActive
                                ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-l-2 border-[rgb(var(--color-primary))]"
                                : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                }`}
                            >
                              <SubIcon
                                className={`w-4 h-4 ${isSubActive
                                  ? "text-[rgb(var(--color-primary))]"
                                  : "text-[rgb(var(--color-text-tertiary))]"
                                  }`}
                              />
                              <span className="text-sm font-medium">
                                {subItem.name}
                              </span>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            }

            // Simple menu item without submenu
            const isActive = pathname === item.href;
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "space-x-2 px-2"
                    } py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${isActive
                      ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-r-2 border-[rgb(var(--color-primary))]"
                      : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                    }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <Icon
                    className={`w-4 h-4 transition-all duration-300 ${isActive
                      ? "text-[rgb(var(--color-primary))]"
                      : "text-[rgb(var(--color-text-tertiary))]"
                      }`}
                  />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-3 border-t border-[rgb(var(--color-border-primary))]">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"
                } px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer ${isActive
                  ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                  : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                }`}
              title={isCollapsed ? item.name : ""}
            >
              <Icon className="w-6 h-6 text-[rgb(var(--color-text-tertiary))] transition-all duration-300" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
