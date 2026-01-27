"use client";
import {
  Activity,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  DollarSign,
  FileText,
  IndianRupee,
  LayoutDashboard,
  LineChart,
  Package,
  PieChart,
  Receipt,
  Settings,
  ShoppingCart,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedStore } from "@/store/slices/profileSlice";

const Sidebar = ({ onStoreChange }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const {
    agency,
    stores: reduxStores,
    selectedStore,
  } = useAppSelector((state) => state.profile);
  const {
    features,
    isLoading: featuresLoading,
    checkFeatureAccess,
    checkRouteAccess,
  } = useFeatureAccess();

  // Unified state management
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    featureName: "",
    requiredFeature: "",
  });

  // Refs
  const storeDropdownRef = useRef(null);

  const salesSubMenuItems = [
    { name: t("sidebar.customers"), icon: Users, href: "/dashboard/customers" },
    {
      name: t("sidebar.invoices"),
      icon: FileText,
      href: "/dashboard/invoices",
    },
    {
      name: t("sidebar.expenses"),
      icon: IndianRupee,
      href: "/dashboard/expenses",
    },
    {
      name: t("sidebar.sellOrders") || "Sell Orders",
      icon: ShoppingBag,
      href: "/dashboard/sales-orders",
    },
  ];

  const inventorySubMenuItems = [
    { name: t("sidebar.products"), icon: Package, href: "/dashboard/products" },
    { name: t("sidebar.stocks"), icon: Warehouse, href: "/dashboard/stock" },
  ];

  const purchaseSubMenuItems = [
    {
      name: t("sidebar.suppliers"),
      icon: Building2,
      href: "/dashboard/suppliers",
    },
    {
      name: t("sidebar.purchaseOrders"),
      icon: ShoppingCart,
      href: "/dashboard/purchase-orders",
    },
    { name: t("sidebar.bills"), icon: Receipt, href: "/dashboard/bills" },
    {
      name: t("sidebar.payments"),
      icon: IndianRupee,
      href: "/dashboard/payments",
    },
  ];

  const analyticsSubMenuItems = [
    {
      name: t("dashboard.revenueAnalytics") || "Revenue Analytics",
      icon: LineChart,
      href: "/dashboard/analytics/revenue",
    },
    {
      name: t("dashboard.salesAnalytics") || "Sales Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics/sales",
    },
    {
      name: t("dashboard.stockAnalytics") || "Stock Analytics",
      icon: Warehouse,
      href: "/dashboard/analytics/stock",
    },
    {
      name: t("dashboard.productAnalytics") || "Product Analytics",
      icon: PieChart,
      href: "/dashboard/analytics/products",
    },
    {
      name: t("dashboard.customerAnalytics") || "Customer Analytics",
      icon: Activity,
      href: "/dashboard/analytics/customers",
    },
    {
      name: t("dashboard.supplierAnalytics") || "Supplier Analytics",
      icon: Building2,
      href: "/dashboard/analytics/suppliers",
    },
    {
      name: t("dashboard.billAnalytics") || "Bill Analytics",
      icon: Receipt,
      href: "/dashboard/analytics/bills",
    },
    {
      name: t("dashboard.expenseAnalytics") || "Expense Analytics",
      icon: DollarSign,
      href: "/dashboard/analytics/expenses",
    },
  ];

  const navigationItems = [
    { name: t("sidebar.dashboard"), icon: LayoutDashboard, href: "/dashboard" },
    {
      name: t("sidebar.salesTransactions"),
      icon: Receipt,
      href: "/dashboard/customers",
      hasSubMenu: true,
      subMenuItems: salesSubMenuItems,
      key: "sales",
    },
    {
      name: t("sidebar.inventory"),
      icon: Package,
      href: "/dashboard/products",
      hasSubMenu: true,
      subMenuItems: inventorySubMenuItems,
      key: "inventory",
    },
    {
      name: t("sidebar.purchase"),
      icon: ShoppingCart,
      href: "/dashboard/purchase-orders",
      hasSubMenu: true,
      subMenuItems: purchaseSubMenuItems,
      key: "purchase",
    },
    {
      name: t("sidebar.analytics") || "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics/revenue",
      hasSubMenu: true,
      subMenuItems: analyticsSubMenuItems,
      key: "analytics",
    },
  ];

  const bottomItems = [
    {
      name: t("sidebar.settings"),
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  const menuToFeatureMap = {
    [t("sidebar.salesTransactions")]: [
      "Customer Management",
      "Invoice Management",
      "Expense Management",
      "customer_management",
      "invoice_management",
      "expense_management",
    ],
    [t("sidebar.inventory")]: [
      "Product Management",
      "Stock Management",
      "product_management",
      "stock_management",
    ],
    [t("sidebar.purchase")]: ["Purchase Management", "purchase_management"],
  };

  const subMenuToFeatureMap = {
    [t("sidebar.customers")]: ["Customer Management", "customer_management"],
    [t("sidebar.invoices")]: ["Invoice Management", "invoice_management"],
    [t("sidebar.sellOrders") || "Sell Orders"]: ["Invoice Management", "invoice_management"],
    [t("sidebar.expenses")]: ["Expense Management", "expense_management"],
    [t("sidebar.products")]: ["Product Management", "product_management"],
    [t("sidebar.stocks")]: ["Stock Management", "stock_management"],
    [t("sidebar.lowStockAlerts")]: ["Stock Management", "stock_management"],
    [t("sidebar.suppliers")]: [
      "Purchase Management",
      "purchase_management",
      "Supplier Management",
      "supplier_management",
    ],
    [t("sidebar.purchaseOrders")]: [
      "Purchase Management",
      "purchase_management",
    ],
    [t("sidebar.bills")]: ["Bill Management", "bill_management"],
    [t("sidebar.payments")]: ["Payment Management", "payment_management"],
  };

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

  const handleStoreSelect = (store) => {
    dispatch(setSelectedStore(store));
    setIsStoreDropdownOpen(false);
    if (onStoreChange) {
      onStoreChange(store);
    }
  };

  // Close dropdown when clicking outside (only for store dropdown)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDropdownToggle = event.target.closest(
        "button[data-dropdown-toggle]"
      );
      if (isDropdownToggle) return;

      if (
        storeDropdownRef.current &&
        !storeDropdownRef.current.contains(event.target)
      ) {
        setIsStoreDropdownOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      setIsStoreDropdownOpen(false);
    }
  }, [isCollapsed]);

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
        {!isCollapsed && (
          <div className="p-3 border-b border-[rgb(var(--color-border-primary))]">
            <div className="relative" ref={storeDropdownRef}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStoreDropdownOpen(!isStoreDropdownOpen);
                }}
                data-dropdown-toggle
                className="flex items-center justify-between p-2 bg-[rgb(var(--color-primary))]/5 border-2 border-[rgb(var(--color-primary))]/10 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-primary))]/10 transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {selectedStore?.name ||
                      selectedStore?.storeName ||
                      t("sidebar.selectStore")}
                  </div>
                  <div className="text-xs text-gray-600">
                    GST: {selectedStore?.gst || t("common.notAvailable")}
                  </div>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-[rgb(var(--color-primary))] transition-transform ${isStoreDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isStoreDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                  <div className="p-1">
                    {reduxStores.map((store) => {
                      const isSelected =
                        selectedStore &&
                        store.storeName === selectedStore.storeName;
                      return (
                        <div
                          key={store.storeName || store.name || store.id}
                          onClick={() => handleStoreSelect(store)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] transition-colors ${isSelected ? "bg-[rgb(var(--color-primary))]/5" : ""}`}
                        >
                          <div>
                            <div
                              className={`font-medium text-sm ${isSelected ? "text-gray-900" : "text-gray-900"}`}
                            >
                              {store.storeName}
                            </div>
                            <div
                              className={`text-xs ${isSelected ? "text-gray-600" : "text-gray-500"}`}
                            >
                              GST: {store.gst}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-3 h-3 text-[rgb(var(--color-primary))]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
            const isDropdownOpen = item.hasSubMenu && !isCollapsed;

            if (item.hasSubMenu && item.key) {
              return (
                <div key={item.name} className="relative">
                  <div
                    className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-2"} py-2 ${hasAccess
                      ? "text-[rgb(var(--color-text-secondary))]"
                      : "text-[rgb(var(--color-text-tertiary))] opacity-60"
                      }`}
                    title={isCollapsed ? item.name : ""}
                  >
                    {!isCollapsed ? (
                      <div className="flex items-center space-x-3 text-[rgb(var(--color-text-secondary))]">
                        <Icon className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                        <span className="font-semibold tracking-wide uppercase text-xs">
                          {item.name}
                        </span>
                      </div>
                    ) : (
                      <Icon className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    )}
                    {!isCollapsed && !hasAccess && (
                      <div className="flex items-center space-x-1">
                        <Crown className="w-3.5 h-3.5 text-yellow-500" />
                      </div>
                    )}
                  </div>

                  {/* Sub-menu */}
                  {isDropdownOpen && !isCollapsed && item.subMenuItems && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subMenuItems.map((subItem) => {
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
                  )}
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
