"use client";
import { SidebarMenu } from "@dragorbit/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
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
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { expandMenu, toggleExpandedMenu } from "@/store/slices/uiSlice";
import { SidebarHeader } from "./SidebarHeader";

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

  const expandedMenus = useAppSelector((state) => state.ui.expandedMenus);
  const router = useRouter();
  const { hasAccess, withAccess } = useSubscriptionAccess();
  const isItemLocked = (item) =>
    !!item.module &&
    !hasAccess(
      item.module,
      item.requireAnalytics,
      item.requireReport,
      item.requireCapability
    );
  const onNavigate = (item) =>
    withAccess(
      item.module,
      () => router.push(item.href),
      item.requireAnalytics || false,
      item.requireReport || false,
      true,
      item.requireCapability || null
    )();

  return (
    <SidebarMenu
      navigationItems={navigationItems}
      bottomItems={bottomItems}
      pathname={pathname}
      isCollapsed={isCollapsed}
      expandedMenus={expandedMenus}
      onToggleMenu={(key) => dispatch(toggleExpandedMenu(key))}
      onNavigate={onNavigate}
      isItemLocked={isItemLocked}
      header={<SidebarHeader />}
      selector={
        <StoreSelector
          isCollapsed={isCollapsed}
          onStoreChange={onStoreChange}
        />
      }
    />
  );
};
export default Sidebar;
