"use client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import StoreSelector from "@/components/dashboard/sidebar/StoreSelector";
import { usePathname } from "next/navigation";
import { toggleSidebar, toggleExpandedMenu, expandMenu } from "@/store/slices/uiSlice";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";


import { useTranslation } from "@/hooks/ui/useTranslation";
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

  // Flyout for collapsed sidebar
  const [hoveredItem, setHoveredItem] = useState(null); // { item, rect }
  const hideTimerRef = useRef(null);

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

  // Close flyout when sidebar expands
  useEffect(() => {
    if (!isCollapsed) setHoveredItem(null);
  }, [isCollapsed]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Flyout hover handlers — 100ms grace period so mouse can travel icon → flyout
  const handleMouseEnterItem = (item, e, isBottom = false) => {
    if (!isCollapsed) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const anchorBottom = isBottom
      ? window.innerHeight - rect.bottom
      : null;
    setHoveredItem({ item, rect, anchorBottom });
  };

  const handleMouseLeaveItem = () => {
    if (!isCollapsed) return;
    hideTimerRef.current = setTimeout(() => setHoveredItem(null), 100);
  };

  const handleMouseEnterFlyout = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const handleMouseLeaveFlyout = () => {
    hideTimerRef.current = setTimeout(() => setHoveredItem(null), 100);
  };

  return (
    <div
      className="bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-r border-[rgb(var(--color-border-primary))]/40 h-screen flex flex-col shadow-lg relative z-[150] flex-shrink-0"
      style={{
        width: isCollapsed ? "64px" : "256px",
        minWidth: isCollapsed ? "64px" : "256px",
        maxWidth: isCollapsed ? "64px" : "256px",
        transition: "width 0.3s ease-in-out, min-width 0.3s ease-in-out, max-width 0.3s ease-in-out",
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
              // collapsed me active child hai to parent icon bhi active dikhao
              const isChildActive = isCollapsed && item.subMenuItems?.some(
                (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
              );

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={(e) => handleMouseEnterItem(item, e)}
                  onMouseLeave={handleMouseLeaveItem}
                >
                  <div
                    onClick={(e) => !isCollapsed && handleSubMenuToggle(item, e)}
                    className={`w-full group flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-2"
                      } py-2 cursor-pointer rounded-lg transition-colors text-[rgb(var(--color-text-secondary))] ${isChildActive
                        ? "bg-[rgb(var(--color-primary))]/10"  // collapsed active child
                        : "hover:bg-[rgb(var(--color-bg-secondary))]"
                      } ${isExpanded && !isCollapsed ? "bg-[rgb(var(--color-bg-secondary))]" : ""
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
                      <Icon className={`w-[18px] h-[18px] transition-colors ${isChildActive
                        ? "text-[rgb(var(--color-primary))]"
                        : "text-[rgb(var(--color-text-tertiary))]"
                        }`} />
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

                  {/* Sub-menu (expanded sidebar) */}
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
                              className={`group relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${isSubActive
                                ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-l-2 border-[rgb(var(--color-primary))]"
                                : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                }`}
                              title={subItem.shortcut ? `Alt+${subItem.shortcut.toUpperCase()}` : ""}
                            >
                              <SubIcon
                                className={`w-4 h-4 ${isSubActive
                                  ? "text-[rgb(var(--color-primary))]"
                                  : "text-[rgb(var(--color-text-tertiary))]"
                                  }`}
                              />
                              <span className="text-sm font-medium flex-1">
                                {subItem.name}
                              </span>
                              {subItem.shortcut && (
                                <kbd className="absolute right-2 opacity-0 group-hover:opacity-50 transition-opacity duration-200 delay-300 text-[9px] px-1 py-px rounded border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-tertiary))] font-mono pointer-events-none">
                                  ⌥{subItem.shortcut === "," ? "," : subItem.shortcut.toUpperCase()}
                                </kbd>
                              )}
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
              <div key={item.name} onMouseEnter={(e) => handleMouseEnterItem(item, e)} onMouseLeave={handleMouseLeaveItem} >
                <Link
                  href={item.href}
                  className={
                    `w-full flex items-center py-1.5 rounded-lg transition-all duration-300 cursor-pointer
                    ${isCollapsed ? "justify-center px-0" : "space-x-2 px-2"} 
                    ${isActive
                      ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-r-2 border-[rgb(var(--color-primary))]"
                      : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                    }`
                  }
                  title={isCollapsed && item.shortcut ? `${item.name}  ⌥${item.shortcut.toUpperCase()}` : isCollapsed ? item.name : ""}
                >
                  <Icon
                    className={`transition-all duration-300 
                    ${isCollapsed ? "w-[18px] h-[18px]" : "w-4 h-4"} 
                    ${isActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`}
                  />
                  {!isCollapsed && (<span className="font-medium text-sm">{item.name}</span>)}
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
            <div
              key={item.name}
              onMouseEnter={(e) => handleMouseEnterItem(item, e, true)}
              onMouseLeave={handleMouseLeaveItem}
            >
              <Link
                href={item.href}
                className={`flex items-center ml-2 py-2 rounded-lg transition-all duration-300 cursor-pointer 
                  ${isCollapsed ? "justify-center" : "space-x-3"}
                  ${isActive
                    ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                    : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  }`}
                title={isCollapsed && item.shortcut ? `${item.name}  ⌥${item.shortcut.toUpperCase()}` : isCollapsed ? item.name : ""}
              >
                <Icon className={`${isCollapsed ? "w-[24px] h-[24px]" : "w-5 h-5"} text-[rgb(var(--color-text-tertiary))] transition-all duration-300`} />
                {!isCollapsed && (<span className="font-medium">{item.name}</span>)}
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Collapsed Flyout Menu ── */}
      {isCollapsed && hoveredItem && (
        <div
          className="fixed z-[200] w-auto whitespace-nowrap bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl shadow-xl overflow-hidden"
          style={{
            ...(hoveredItem.anchorBottom !== null
              ? { bottom: hoveredItem.anchorBottom } // bottom items → flyout opens upward
              : { top: hoveredItem.rect.top }         // top items → flyout opens downward
            ),
            left: 72, // 64px sidebar width + 8px gap
          }}
          onMouseEnter={handleMouseEnterFlyout}
          onMouseLeave={handleMouseLeaveFlyout}
        >
          {/* Flyout Header */}
          <div className="px-3 py-2.5 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]">
            <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">
              {hoveredItem.item.name}
            </span>
          </div>

          {/* Flyout Links */}
          <div className="p-1.5 space-y-0.5">
            {hoveredItem.item.subMenuItems ? (
              // Submenu items
              hoveredItem.item.subMenuItems.map((subItem) => {
                const SubIcon = subItem.icon;
                const isSubActive =
                  pathname === subItem.href ||
                  pathname.startsWith(`${subItem.href}/`);
                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    onClick={() => setHoveredItem(null)}
                    className={`group relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 ${isSubActive
                      ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                      : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                      }`}
                  >
                    <SubIcon
                      className={`w-4 h-4 flex-shrink-0 ${isSubActive
                        ? "text-[rgb(var(--color-primary))]"
                        : "text-[rgb(var(--color-text-tertiary))]"
                        }`}
                    />
                    <span className="text-sm font-medium flex-1 pr-6">{subItem.name}</span>
                    {subItem.shortcut && (
                      <kbd className="absolute right-2 text-[9px] px-1 py-px rounded border border-[rgb(var(--color-border-primary))]/60 text-[rgb(var(--color-text-tertiary))] font-mono opacity-0 group-hover:opacity-40 transition-opacity duration-200 delay-300 pointer-events-none">
                        ⌥{subItem.shortcut === "," ? "," : subItem.shortcut.toUpperCase()}
                      </kbd>
                    )}

                    {isSubActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                    )}
                  </Link>
                );
              })
            ) : (
              // Simple item (e.g. Dashboard) — single link
              <Link
                href={hoveredItem.item.href}
                onClick={() => setHoveredItem(null)}
                className={`group relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 ${pathname === hoveredItem.item.href
                  ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                  : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  }`}
              >
                <span className="text-sm font-medium flex-1 pr-6">
                  {hoveredItem.item.name}
                </span>
                {hoveredItem.item.shortcut && (
                  <kbd className="absolute right-2 text-[9px] px-1 py-px rounded border border-[rgb(var(--color-border-primary))]/60 text-[rgb(var(--color-text-tertiary))] font-mono opacity-0 group-hover:opacity-40 transition-opacity duration-200 delay-300 pointer-events-none">
                    ⌥{hoveredItem.item.shortcut === "," ? "," : hoveredItem.item.shortcut.toUpperCase()}
                  </kbd>
                )}
                {pathname === hoveredItem.item.href && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                )}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
