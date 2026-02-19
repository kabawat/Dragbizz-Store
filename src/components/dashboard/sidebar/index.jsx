"use client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";
import StoreSelector from "@/components/dashboard/sidebar/StoreSelector";
import {
  getSalesSubMenuItems,
  getInventorySubMenuItems,
  getPurchaseSubMenuItems,
  getAnalyticsSubMenuItems,
  getNavigationItems,
  getBottomItems,
  getMenuToFeatureMap,
  getSubMenuToFeatureMap,
} from "../constants/sidebarData";

const Sidebar = ({ onStoreChange }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { agency, selectedStore } = useAppSelector((state) => state.profile);
  const {
    features,
    isLoading: featuresLoading,
    checkFeatureAccess,
    checkRouteAccess,
  } = useFeatureAccess();

  // Unified state management
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    featureName: "",
    requiredFeature: "",
  });

  // Memoized Menu Items
  const salesSubMenuItems = useMemo(() => getSalesSubMenuItems(t), [t]);
  const inventorySubMenuItems = useMemo(() => getInventorySubMenuItems(t), [t]);
  const purchaseSubMenuItems = useMemo(() => getPurchaseSubMenuItems(t), [t]);
  const analyticsSubMenuItems = useMemo(() => getAnalyticsSubMenuItems(t, selectedStore), [t, selectedStore]);

  const navigationItems = useMemo(() =>
    getNavigationItems(t, salesSubMenuItems, inventorySubMenuItems, purchaseSubMenuItems, analyticsSubMenuItems),
    [t, salesSubMenuItems, inventorySubMenuItems, purchaseSubMenuItems, analyticsSubMenuItems]
  );

  const bottomItems = useMemo(() => getBottomItems(t), [t]);
  const menuToFeatureMap = useMemo(() => getMenuToFeatureMap(t), [t]);
  const subMenuToFeatureMap = useMemo(() => getSubMenuToFeatureMap(t), [t]);

  const hasMenuItemAccess = (itemName) => {
    if (itemName === t("sidebar.dashboard")) return true;
    if (featuresLoading) return true;
    if (!features || features.length === 0) return false;

    const requiredFeatures = menuToFeatureMap[itemName] || [];
    if (requiredFeatures.length === 0) return true;

    return requiredFeatures.some((featureName) => {
      return features.some((f) => {
        const featureNameStr = typeof f === "object" ? f.name : f;
        return (
          featureNameStr &&
          (featureNameStr.toLowerCase().includes(featureName.toLowerCase()) ||
            featureName.toLowerCase().includes(featureNameStr.toLowerCase()))
        );
      });
    });
  };

  // Helper function to check if user has access to a sub-menu item
  const hasSubMenuItemAccess = (subItemName, href) => {
    if (featuresLoading) return true;

    // First try route-based access check
    if (checkRouteAccess && href) {
      const hasRouteAccess = checkRouteAccess(href);
      if (hasRouteAccess) return true;
    }

    // Then check feature-based access
    const requiredFeatures = subMenuToFeatureMap[subItemName] || [];
    if (requiredFeatures.length === 0) return true;

    return requiredFeatures.some((featureName) => {
      if (checkFeatureAccess) {
        return checkFeatureAccess(featureName);
      }
      // Fallback to manual check
      if (!features || features.length === 0) return false;
      return features.some((f) => {
        const featureNameStr = typeof f === "object" ? f.name : f;
        return (
          featureNameStr &&
          (featureNameStr.toLowerCase().includes(featureName.toLowerCase()) ||
            featureName.toLowerCase().includes(featureNameStr.toLowerCase()))
        );
      });
    });
  };

  // Handle menu item click - check access and show upgrade modal if needed
  const handleMenuItemClick = (item, e) => {
    if (!hasMenuItemAccess(item.name)) {
      e?.preventDefault();
      e?.stopPropagation();

      const featureMap = {
        [t("sidebar.salesTransactions")]: t("sidebar.salesTransactions"),
        [t("sidebar.inventory")]: t("sidebar.inventory"),
        [t("sidebar.purchase")]: t("sidebar.purchase"),
      };

      setUpgradeModal({
        isOpen: true,
        featureName: item.name,
        requiredFeature: featureMap[item.name] || t("sidebar.premiumFeature"),
      });
      return false;
    }
    return true;
  };

  // Handle sub-menu item click - check access and show upgrade modal if needed
  const handleSubMenuItemClick = (subItem, e) => {
    if (!hasSubMenuItemAccess(subItem.name, subItem.href)) {
      e?.preventDefault();
      e?.stopPropagation();

      const featureMap = {
        [t("sidebar.customers")]: t("sidebar.customers"),
        [t("sidebar.invoices")]: t("sidebar.invoices"),
        [t("sidebar.sellOrders") || "Sell Orders"]: t("sidebar.sellOrders") || "Sell Orders",
        [t("sidebar.expenses")]: t("sidebar.expenses"),
        [t("sidebar.products")]: t("sidebar.products"),
        [t("sidebar.stocks")]: t("sidebar.stocks"),
        [t("sidebar.lowStockAlerts")]: t("sidebar.lowStockAlerts"),
        [t("sidebar.suppliers")]: t("sidebar.suppliers"),
        [t("sidebar.purchaseOrders")]: t("sidebar.purchaseOrders"),
        [t("sidebar.bills")]: t("sidebar.bills"),
        [t("sidebar.payments")]: t("sidebar.payments"),
      };

      setUpgradeModal({
        isOpen: true,
        featureName: subItem.name,
        requiredFeature:
          featureMap[subItem.name] || t("sidebar.premiumFeature"),
      });
      return false;
    }
    return true;
  };

  const handleSubMenuToggle = (item, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!hasMenuItemAccess(item.name)) {
      handleMenuItemClick(item, e);
      return;
    }

    setExpandedMenus((prev) => ({
      ...prev,
      [item.key]: !prev[item.key],
    }));
  };

  // Auto-expand menu based on active route
  useEffect(() => {
    if (navigationItems && pathname) {
      const activeItem = navigationItems.find(
        (item) =>
          item.hasSubMenu &&
          item.subMenuItems?.some((subItem) =>
            pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)
          )
      );
      if (activeItem) {
        setExpandedMenus((prev) => {
          if (prev[activeItem.key]) return prev;
          return {
            ...prev,
            [activeItem.key]: true,
          };
        });
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
            onClick={() => setIsCollapsed(!isCollapsed)}
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
            const isActive =
              pathname === item.href ||
              (item.hasSubMenu && pathname.startsWith(item.href));
            const hasAccess = hasMenuItemAccess(item.name);

            if (item.hasSubMenu && item.key) {
              const isExpanded = expandedMenus[item.key];

              return (
                <div key={item.name} className="relative">
                  <div
                    onClick={(e) => !isCollapsed && handleSubMenuToggle(item, e)}
                    className={`w-full group flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-2"} py-2 cursor-pointer rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors ${hasAccess
                      ? "text-[rgb(var(--color-text-secondary))]"
                      : "text-[rgb(var(--color-text-tertiary))] opacity-60"
                      } ${isExpanded && !isCollapsed ? "bg-[rgb(var(--color-bg-secondary))]" : ""}`}
                    title={isCollapsed ? item.name : ""}
                  >
                    {!isCollapsed ? (
                      <div className="flex items-center space-x-3 text-[rgb(var(--color-text-secondary))]">
                        <Icon className={`w-4 h-4 transition-colors ${isExpanded ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`} />
                        <span className={`font-semibold tracking-wide uppercase text-xs transition-colors ${isExpanded ? "text-[rgb(var(--color-primary))]" : ""}`}>
                          {item.name}
                        </span>
                      </div>
                    ) : (
                      <Icon className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    )}

                    {!isCollapsed && (
                      <div className="flex items-center space-x-2">
                        {!hasAccess && (
                          <Crown className="w-3.5 h-3.5 text-yellow-500" />
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-[rgb(var(--color-text-tertiary))] transition-all duration-200 ${isExpanded ? "rotate-180 opacity-100 text-[rgb(var(--color-primary))]" : "opacity-50 group-hover:opacity-100"
                            }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Sub-menu */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && !isCollapsed ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                      }`}
                  >
                    <div className="ml-6 space-y-1">
                      {item.subMenuItems && item.subMenuItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive =
                          pathname === subItem.href ||
                          pathname.startsWith(`${subItem.href}/`);
                        const hasSubAccess = hasSubMenuItemAccess(
                          subItem.name,
                          subItem.href
                        );
                        return (
                          <Link
                            key={subItem.name}
                            href={hasSubAccess ? subItem.href : "#"}
                            onClick={(e) => {
                              if (!handleSubMenuItemClick(subItem, e)) {
                                e.preventDefault();
                              }
                            }}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${isSubActive
                              ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-l-2 border-[rgb(var(--color-primary))]"
                              : hasSubAccess
                                ? "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                : "text-[rgb(var(--color-text-tertiary))] opacity-60 hover:bg-[rgb(var(--color-bg-secondary))] cursor-not-allowed"
                              }`}
                          >
                            <SubIcon
                              className={`w-4 h-4 ${isSubActive ? "text-[rgb(var(--color-primary))]" : hasSubAccess ? "text-[rgb(var(--color-text-tertiary))]" : "text-[rgb(var(--color-text-tertiary))] opacity-60"}`}
                            />
                            <span
                              className={`text-sm font-medium ${!hasSubAccess ? "opacity-60" : ""}`}
                            >
                              {subItem.name}
                            </span>
                            {!hasSubAccess && (
                              <Crown className="w-3 h-3 text-yellow-500 ml-auto" />
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
            return (
              <div key={item.name}>
                <Link
                  href={hasAccess ? item.href : "#"}
                  onClick={(e) => {
                    if (!handleMenuItemClick(item, e)) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "space-x-2 px-2"} py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${isActive
                    ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-r-2 border-[rgb(var(--color-primary))]"
                    : hasAccess
                      ? "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                      : "text-[rgb(var(--color-text-tertiary))] opacity-60 hover:bg-[rgb(var(--color-bg-secondary))]"
                    }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <Icon
                    className={`w-4 h-4 transition-all duration-300 ${isActive
                      ? "text-[rgb(var(--color-primary))]"
                      : hasAccess
                        ? "text-[rgb(var(--color-text-tertiary))]"
                        : "text-[rgb(var(--color-text-tertiary))] opacity-60"
                      }`}
                  />
                  {!isCollapsed && (
                    <span
                      className={`font-medium text-sm ${!hasAccess ? "text-[rgb(var(--color-text-tertiary))]" : ""}`}
                    >
                      {item.name}
                    </span>
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
              className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer ${isActive
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() =>
          setUpgradeModal({
            isOpen: false,
            featureName: "",
            requiredFeature: "",
          })
        }
        featureName={upgradeModal.featureName}
        requiredFeature={upgradeModal.requiredFeature}
      />
    </div>
  );
};

export default Sidebar;
