"use client";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import StoreSelector from "@/components/dashboard/sidebar/StoreSelector";
import {
  getAnalyticsSubMenuItems,
  getBottomItems,
  getIntegrationsSubMenuItems,
  getInventorySubMenuItems,
  getManagementSubMenuItems,
  getNavigationItems,
  getPurchaseSubMenuItems,
  getSalesSubMenuItems,
  getStockSubMenuItems,
} from "@/data/constants/sidebarData";
import { ROLES } from "@/hooks/permissions/useModulePermissions";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { expandMenu } from "@/store/slices/uiSlice";
import { SidebarFlyout } from "./SidebarFlyout";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNavItem } from "./SidebarNavItem";

const Sidebar = ({ onStoreChange }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const {
    selectedStore,
    authProfile,
    authProfileLoading,
    staffProfile,
    staffProfileLoading,
  } = useAppSelector((state) => state.profile);
  const isCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);

  const { t } = useTranslation();

  // Flyout for collapsed sidebar
  const [hoveredItem, setHoveredItem] = useState(null); // { item, rect }
  const hideTimerRef = useRef(null);

  // Memoized Menu Items
  const salesSubMenuItems = useMemo(() => getSalesSubMenuItems(t), [t]);
  const inventorySubMenuItems = useMemo(() => getInventorySubMenuItems(t), [t]);
  const stockSubMenuItems = useMemo(() => getStockSubMenuItems(t), [t]);
  const purchaseSubMenuItems = useMemo(() => getPurchaseSubMenuItems(t), [t]);
  const analyticsSubMenuItems = useMemo(
    () => getAnalyticsSubMenuItems(t, selectedStore),
    [t, selectedStore]
  );
  const managementSubMenuItems = useMemo(
    () => getManagementSubMenuItems(t),
    [t]
  );
  const integrationsSubMenuItems = useMemo(
    () => getIntegrationsSubMenuItems(t),
    [t]
  );

  const rawNavigationItems = useMemo(
    () =>
      getNavigationItems(
        t,
        salesSubMenuItems,
        inventorySubMenuItems,
        purchaseSubMenuItems,
        analyticsSubMenuItems,
        managementSubMenuItems,
        integrationsSubMenuItems,
        stockSubMenuItems
      ),
    [
      t,
      salesSubMenuItems,
      inventorySubMenuItems,
      purchaseSubMenuItems,
      analyticsSubMenuItems,
      managementSubMenuItems,
      integrationsSubMenuItems,
      stockSubMenuItems,
    ]
  );
  const navigationItems = useMemo(() => {
    // If profiles are still loading, return a skeleton or nothing to prevent flashing
    const isLoading =
      (authProfileLoading && !authProfile) ||
      (staffProfileLoading && !staffProfile);
    if (isLoading) return [];

    if (authProfile?.role === ROLES.OWNER) return rawNavigationItems;

    const hasPermission = (href) => {
      // Default always allowed routes for staff
      if (
        ["/dashboard", "/dashboard/support", "/dashboard/settings"].includes(
          href
        )
      )
        return true;

      // Staff cannot manage other staff, plan settings, or integrations
      if (href.startsWith("/dashboard/management")) return false;
      if (href.startsWith("/dashboard/integrations")) return false;

      const permissions = staffProfile?.permissions || [];

      // Check analytics routes
      if (href.startsWith("/dashboard/analytics")) {
        const pm = permissions.find(
          (p) => p.module === "analytics" || p.module === "reports"
        );
        return pm?.read || pm?.analytics || pm?.report || false;
      }

      const ROUTE_MODULE_MAP = {
        "/dashboard/customers": "customer",
        "/dashboard/invoices": "invoice",
        "/dashboard/pos": "invoice",
        "/dashboard/expenses": "expense",
        "/dashboard/cashbook": "cashbook",
        "/dashboard/sales-order": "sales_order",
        "/dashboard/products": "product",
        "/dashboard/categories": "product",
        "/dashboard/brands": "product",
        "/dashboard/variants": "product",
        "/dashboard/stock": "inventory",
        "/dashboard/suppliers": "supplier",
        "/dashboard/purchase-orders": "purchase_order",
        "/dashboard/bills": "billing",
        "/dashboard/payments": "billing",
      };

      const moduleName = ROUTE_MODULE_MAP[href];
      if (moduleName) {
        const pm = permissions.find((p) => p.module === moduleName);
        return pm?.read === true;
      }

      return true; // Unmapped routes allowed by default
    };

    return rawNavigationItems
      .map((item) => {
        if (item.hasSubMenu) {
          const filteredSubItems = item.subMenuItems.filter((sub) =>
            hasPermission(sub.href)
          );
          return { ...item, subMenuItems: filteredSubItems };
        }
        return item;
      })
      .filter((item) => {
        if (item.hasSubMenu && item.subMenuItems.length === 0) return false;
        if (!item.hasSubMenu && !hasPermission(item.href)) return false;
        return true;
      });
  }, [
    rawNavigationItems,
    authProfile,
    staffProfile,
    authProfileLoading,
    staffProfileLoading,
  ]);

  const bottomItems = useMemo(() => getBottomItems(t), [t]);

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
  }, [dispatch, pathname, navigationItems]);

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
    const anchorBottom = isBottom ? window.innerHeight - rect.bottom : null;
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
        transition:
          "width 0.3s ease-in-out, min-width 0.3s ease-in-out, max-width 0.3s ease-in-out",
        willChange: "width",
      }}
    >
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <SidebarHeader />
        <StoreSelector
          isCollapsed={isCollapsed}
          onStoreChange={onStoreChange}
        />
      </div>

      {/* Scrollable Navigation Section */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <nav className="p-3 space-y-1">
          {navigationItems.map((item) => (
            <SidebarNavItem
              key={item.name}
              item={item}
              isCollapsed={isCollapsed}
              onMouseEnterItem={handleMouseEnterItem}
              onMouseLeaveItem={handleMouseLeaveItem}
            />
          ))}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-3 border-t border-[rgb(var(--color-border-primary))]">
        {bottomItems.map((item) => (
          <SidebarNavItem
            key={item.name}
            item={item}
            isCollapsed={isCollapsed}
            onMouseEnterItem={handleMouseEnterItem}
            onMouseLeaveItem={handleMouseLeaveItem}
            isBottomItem={true}
          />
        ))}
      </div>

      {/* ── Collapsed Flyout Menu ── */}
      <SidebarFlyout
        hoveredItem={hoveredItem}
        onMouseEnter={handleMouseEnterFlyout}
        onMouseLeave={handleMouseLeaveFlyout}
        onClose={() => setHoveredItem(null)}
      />
    </div>
  );
};

export default Sidebar;
