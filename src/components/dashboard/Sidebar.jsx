"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSelectedStore } from '@/store/slices/profileSlice';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/ui/UpgradeModal';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Warehouse,
  Receipt,
  FileText,
  IndianRupee,
  Settings,
  ChevronDown,
  ShoppingCart,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  AlertTriangle,
  Crown
} from 'lucide-react';

const Sidebar = ({ onStoreChange }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { agency, stores: reduxStores, selectedStore } = useAppSelector((state) => state.profile);
  const { features, isLoading: featuresLoading, checkFeatureAccess, checkRouteAccess } = useFeatureAccess();
  
  // Unified state management
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, featureName: '', requiredFeature: '' });
  const [openDropdowns, setOpenDropdowns] = useState({});
  
  // Refs for dropdowns - will be initialized after navigationItems is defined
  const dropdownRefs = useRef({});
  const storeDropdownRef = useRef(null);

  // Menu item configurations - Grouped by category, removed "create/add" items
  // Sales & Transactions Category
  const salesSubMenuItems = [
    { name: 'Customers', icon: Users, href: '/dashboard/customers' },
    { name: 'Invoices', icon: FileText, href: '/dashboard/invoices' },
    { name: 'Expenses', icon: IndianRupee, href: '/dashboard/expenses' },
  ];

  // Inventory Category
  const inventorySubMenuItems = [
    { name: 'Products', icon: Package, href: '/dashboard/products' },
    { name: 'Stocks', icon: Warehouse, href: '/dashboard/stock' },
    { name: 'Low Stock Alerts', icon: AlertTriangle, href: '/dashboard/stock/alerts' },
  ];

  // Purchase Category
  const purchaseSubMenuItems = [
    { name: 'Suppliers', icon: Building2, href: '/dashboard/suppliers' },
    { name: 'Purchase Orders', icon: ShoppingCart, href: '/dashboard/purchase-orders' },
    { name: 'Bills', icon: Receipt, href: '/dashboard/bills' },
    { name: 'Payments', icon: IndianRupee, href: '/dashboard/payments' },
  ];

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Sales & Transactions', icon: Receipt, href: '/dashboard/customers', hasSubMenu: true, subMenuItems: salesSubMenuItems, key: 'sales' },
    { name: 'Inventory', icon: Package, href: '/dashboard/products', hasSubMenu: true, subMenuItems: inventorySubMenuItems, key: 'inventory' },
    { name: 'Purchase', icon: ShoppingCart, href: '/dashboard/purchase-orders', hasSubMenu: true, subMenuItems: purchaseSubMenuItems, key: 'purchase' },
  ];

  // Initialize refs for dropdowns
  navigationItems.forEach(item => {
    if (item.key && !dropdownRefs.current[item.key]) {
      dropdownRefs.current[item.key] = React.createRef();
    }
  });

  const bottomItems = [
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  // Menu to feature mapping
  const menuToFeatureMap = {
    'Sales & Transactions': ['Customer Management', 'Invoice Management', 'Expense Management', 'customer_management', 'invoice_management', 'expense_management'],
    'Inventory': ['Product Management', 'Stock Management', 'product_management', 'stock_management'],
    'Purchase': ['Purchase Management', 'purchase_management'],
  };

  // Sub-menu item to feature mapping
  const subMenuToFeatureMap = {
    'Customers': ['Customer Management', 'customer_management'],
    'Invoices': ['Invoice Management', 'invoice_management'],
    'Expenses': ['Expense Management', 'expense_management'],
    'Products': ['Product Management', 'product_management'],
    'Stocks': ['Stock Management', 'stock_management'],
    'Low Stock Alerts': ['Stock Management', 'stock_management'],
    'Suppliers': ['Purchase Management', 'purchase_management', 'Supplier Management', 'supplier_management'],
    'Purchase Orders': ['Purchase Management', 'purchase_management'],
    'Bills': ['Bill Management', 'bill_management'],
    'Payments': ['Payment Management', 'payment_management'],
  };

  // Helper function to check if user has access to a menu item
  const hasMenuItemAccess = (itemName) => {
    if (itemName === 'Dashboard') return true;
    if (featuresLoading) return true;
    if (!features || features.length === 0) return false;
    
    const requiredFeatures = menuToFeatureMap[itemName] || [];
    if (requiredFeatures.length === 0) return true;
    
    return requiredFeatures.some(featureName => {
      return features.some(f => {
        const featureNameStr = typeof f === 'object' ? f.name : f;
        return featureNameStr && (
          featureNameStr.toLowerCase().includes(featureName.toLowerCase()) ||
          featureName.toLowerCase().includes(featureNameStr.toLowerCase())
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
    
    return requiredFeatures.some(featureName => {
      if (checkFeatureAccess) {
        return checkFeatureAccess(featureName);
      }
      // Fallback to manual check
      if (!features || features.length === 0) return false;
      return features.some(f => {
        const featureNameStr = typeof f === 'object' ? f.name : f;
        return featureNameStr && (
          featureNameStr.toLowerCase().includes(featureName.toLowerCase()) ||
          featureName.toLowerCase().includes(featureNameStr.toLowerCase())
        );
      });
    });
  };

  // Unified dropdown toggle function
  const toggleDropdown = (key, e) => {
    if (e) e.stopPropagation();
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if dropdown should be open based on pathname
  const shouldDropdownBeOpen = (item) => {
    if (!item.hasSubMenu || !item.subMenuItems) return false;
    return item.subMenuItems.some(subItem => pathname === subItem.href || pathname.startsWith(subItem.href + '/'));
  };

  // Auto-open dropdowns when pathname matches
  useEffect(() => {
    const newOpenDropdowns = {};
    navigationItems.forEach(item => {
      if (item.key && shouldDropdownBeOpen(item)) {
        newOpenDropdowns[item.key] = true;
      }
    });
    if (Object.keys(newOpenDropdowns).length > 0) {
      setOpenDropdowns(prev => ({ ...prev, ...newOpenDropdowns }));
    }
  }, [pathname]);

  // Handle menu item click - check access and show upgrade modal if needed
  const handleMenuItemClick = (item, e) => {
    if (!hasMenuItemAccess(item.name)) {
      e?.preventDefault();
      e?.stopPropagation();
      
      const featureMap = {
        'Sales & Transactions': 'Sales & Transactions',
        'Inventory': 'Inventory Management',
        'Purchase': 'Purchase Management',
      };
      
      setUpgradeModal({
        isOpen: true,
        featureName: item.name,
        requiredFeature: featureMap[item.name] || 'Premium Feature'
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
        'Customers': 'Customer Management',
        'Invoices': 'Invoice Management',
        'Expenses': 'Expense Management',
        'Products': 'Product Management',
        'Stocks': 'Stock Management',
        'Low Stock Alerts': 'Stock Management',
        'Suppliers': 'Supplier Management',
        'Purchase Orders': 'Purchase Management',
        'Bills': 'Bill Management',
        'Payments': 'Payment Management',
      };
      
      setUpgradeModal({
        isOpen: true,
        featureName: subItem.name,
        requiredFeature: featureMap[subItem.name] || 'Premium Feature'
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

  const handleAddNewStore = () => {
    router.push('/onboarding/store');
    setIsStoreDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDropdownToggle = event.target.closest('button[data-dropdown-toggle]');
      if (isDropdownToggle) return;

      // Close store dropdown
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(event.target)) {
        setIsStoreDropdownOpen(false);
      }

      // Close all menu dropdowns
      Object.keys(dropdownRefs.current).forEach(key => {
        const ref = dropdownRefs.current[key]?.current;
        if (ref && !ref.contains(event.target)) {
          setOpenDropdowns(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Close all dropdowns when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setOpenDropdowns({});
      setIsStoreDropdownOpen(false);
    }
  }, [isCollapsed]);

  return (
    <div 
      className="bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-r border-[rgb(var(--color-border-primary))]/40 h-screen flex flex-col shadow-lg relative z-[150] flex-shrink-0"
      style={{
        width: isCollapsed ? '64px' : '256px',
        minWidth: isCollapsed ? '64px' : '256px',
        maxWidth: isCollapsed ? '64px' : '256px',
        transition: 'width 0.3s ease-in-out, min-width 0.3s ease-in-out, max-width 0.3s ease-in-out',
        willChange: 'width',
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
                  {agency?.agencyName || 'RetailManager'}
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
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
                onClick={(e) => { e.stopPropagation(); setIsStoreDropdownOpen(!isStoreDropdownOpen); }} 
                data-dropdown-toggle 
                className="flex items-center justify-between p-2 bg-[rgb(var(--color-primary))]/5 border-2 border-[rgb(var(--color-primary))]/10 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-primary))]/10 transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {selectedStore?.name || selectedStore?.storeName || 'Select Store'}
                  </div>
                  <div className="text-xs text-gray-600">
                    GST: {selectedStore?.gst || 'N/A'}
                  </div>
                </div>
                <ChevronDown className={`w-3 h-3 text-[rgb(var(--color-primary))] transition-transform ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isStoreDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                  <div className="p-1">
                    {reduxStores.map((store) => {
                      const isSelected = selectedStore && (store.storeName === selectedStore.storeName);
                      return (
                        <div 
                          key={store.storeName || store.name || store.id} 
                          onClick={() => handleStoreSelect(store)} 
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] transition-colors ${isSelected ? 'bg-[rgb(var(--color-primary))]/5' : ''}`}
                        >
                          <div>
                            <div className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
                              {store.storeName}
                            </div>
                            <div className={`text-xs ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                              GST: {store.gst}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3 h-3 text-[rgb(var(--color-primary))]" />}
                        </div>
                      );
                    })}

                    <div className="border-t border-[rgb(var(--color-border-primary))] mt-1 pt-1">
                      <button 
                        onClick={handleAddNewStore} 
                        className="flex items-center space-x-1 w-full p-2 text-gray-900 hover:bg-[rgb(var(--color-primary))]/5 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span className="font-medium text-xs">Add New Store</span>
                      </button>
                    </div>
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
            const isActive = pathname === item.href || (item.hasSubMenu && pathname.startsWith(item.href));
            const hasAccess = hasMenuItemAccess(item.name);
            const isDropdownOpen = item.key ? openDropdowns[item.key] : false;

            if (item.hasSubMenu && item.key) {
              return (
                <div key={item.name} className="relative" ref={dropdownRefs.current[item.key]}>
                  <button
                    onClick={(e) => {
                      if (!handleMenuItemClick(item, e)) return;
                      toggleDropdown(item.key, e);
                    }}
                    data-dropdown-toggle
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-r-2 border-[rgb(var(--color-primary))]'
                        : hasAccess 
                          ? 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                          : 'text-[rgb(var(--color-text-tertiary))] opacity-60 hover:bg-[rgb(var(--color-bg-secondary))]'
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 transition-all duration-300 ${
                        isActive ? 'text-[rgb(var(--color-primary))]' : hasAccess ? 'text-[rgb(var(--color-text-tertiary))]' : 'text-[rgb(var(--color-text-tertiary))] opacity-60'
                      }`} />
                      {!isCollapsed && (
                        <span className={`font-medium ${!hasAccess ? 'text-[rgb(var(--color-text-tertiary))]' : ''}`}>
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center space-x-1">
                        {!hasAccess && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                        <ChevronRightIcon
                          className={`w-4 h-4 transition-all duration-300 ${
                            isDropdownOpen ? 'rotate-90' : ''
                          } ${isActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-tertiary))]'}`}
                        />
                      </div>
                    )}
                  </button>

                  {/* Sub-menu */}
                  {isDropdownOpen && !isCollapsed && item.subMenuItems && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subMenuItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                        const hasSubAccess = hasSubMenuItemAccess(subItem.name, subItem.href);
                        return (
                          <Link
                            key={subItem.name}
                            href={hasSubAccess ? subItem.href : '#'}
                            onClick={(e) => {
                              if (!handleSubMenuItemClick(subItem, e)) {
                                e.preventDefault();
                              }
                            }}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                              isSubActive
                                ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-l-2 border-[rgb(var(--color-primary))]'
                                : hasSubAccess
                                  ? 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                                  : 'text-[rgb(var(--color-text-tertiary))] opacity-60 hover:bg-[rgb(var(--color-bg-secondary))] cursor-not-allowed'
                            }`}
                          >
                            <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-[rgb(var(--color-primary))]' : hasSubAccess ? 'text-[rgb(var(--color-text-tertiary))]' : 'text-[rgb(var(--color-text-tertiary))] opacity-60'}`} />
                            <span className={`text-sm font-medium ${!hasSubAccess ? 'opacity-60' : ''}`}>
                              {subItem.name}
                            </span>
                            {!hasSubAccess && <Crown className="w-3 h-3 text-yellow-500 ml-auto" />}
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
                  href={hasAccess ? item.href : '#'}
                  onClick={(e) => {
                    if (!handleMenuItemClick(item, e)) {
                      e.preventDefault();
                    }
                  }}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} px-2 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-r-2 border-[rgb(var(--color-primary))]'
                      : hasAccess
                        ? 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                        : 'text-[rgb(var(--color-text-tertiary))] opacity-60 hover:bg-[rgb(var(--color-bg-secondary))]'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${
                    isActive ? 'text-[rgb(var(--color-primary))]' : hasAccess ? 'text-[rgb(var(--color-text-tertiary))]' : 'text-[rgb(var(--color-text-tertiary))] opacity-60'
                  }`} />
                  {!isCollapsed && (
                    <span className={`font-medium text-sm ${!hasAccess ? 'text-[rgb(var(--color-text-tertiary))]' : ''}`}>
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
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]'
                  : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
              }`}
              title={isCollapsed ? item.name : ''}
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
        onClose={() => setUpgradeModal({ isOpen: false, featureName: '', requiredFeature: '' })}
        featureName={upgradeModal.featureName}
        requiredFeature={upgradeModal.requiredFeature}
      />
    </div>
  );
};

export default Sidebar;
