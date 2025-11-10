"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSelectedStore } from '@/store/slices/profileSlice';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FEATURE_ROUTES } from '@/constants/featureMapping';
import UpgradeModal from '@/components/ui/UpgradeModal';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Warehouse,
  Receipt,
  TrendingUp,
  BookOpen,
  FileText,
  IndianRupee,
  Settings,
  ChevronDown,
  ShoppingCart,
  Plus,
  Check,
  Menu,
  X,
  Home,
  BarChart3,
  ShoppingBag,
  User,
  MessageSquare,
  Code,
  Zap,
  ChevronLeft,
  ChevronRight,
  PackagePlus,
  Upload,
  Archive,
  Star,
  ChevronRight as ChevronRightIcon,
  UserPlus,
  UserX,
  Building,
  AlertTriangle,
  Eye,
  Clock,
  CreditCard,
  Crown,
  Lock
} from 'lucide-react';

const Sidebar = ({ onStoreChange }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { agency, stores: reduxStores, selectedStore } = useAppSelector((state) => state.profile);
  const { features, checkFeatureAccess, checkMenuItemAccess, isLoading: featuresLoading } = useFeatureAccess();
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, featureName: '', requiredFeature: '' });
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isCustomersDropdownOpen, setIsCustomersDropdownOpen] = useState(false);
  const [isSuppliersDropdownOpen, setIsSuppliersDropdownOpen] = useState(false);
  const [isInventoryDropdownOpen, setIsInventoryDropdownOpen] = useState(false);
  const [isPurchaseDropdownOpen, setIsPurchaseDropdownOpen] = useState(false);
  const [isBillsDropdownOpen, setIsBillsDropdownOpen] = useState(false);
  const [isPaymentsDropdownOpen, setIsPaymentsDropdownOpen] = useState(false);
  const [isInvoicesDropdownOpen, setIsInvoicesDropdownOpen] = useState(false);
  const [isExpensesDropdownOpen, setIsExpensesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);
  const customersDropdownRef = useRef(null);
  const suppliersDropdownRef = useRef(null);
  const inventoryDropdownRef = useRef(null);
  const purchaseDropdownRef = useRef(null);
  const billsDropdownRef = useRef(null);
  const paymentsDropdownRef = useRef(null);
  const invoicesDropdownRef = useRef(null);
  const expensesDropdownRef = useRef(null);

  // Use Redux stores data, fallback to mock data if not available
  const stores = reduxStores && reduxStores.length > 0
    ? reduxStores.map(store => ({
      ...store,
      isActive: store.storeStatus === 'ACTIVE'
    }))
    : [];


  const productAndStockSubMenuItems = [
    { name: 'Products', icon: Package, href: '/dashboard/products' },
    { name: 'Stocks', icon: Warehouse, href: '/dashboard/stock' },
    { name: 'Low Stock Alerts', icon: AlertTriangle, href: '/dashboard/stock/alerts' },
  ];

  const customerSubMenuItems = [
    { name: 'All Customers', icon: Users, href: '/dashboard/customers' },
    { name: 'Add New Customer', icon: UserPlus, href: '/dashboard/customers/add' },
    { name: 'Inactive Customers', icon: UserX, href: '/dashboard/customers/inactive' },
  ];

  const suppliersSubMenuItems = [
    { name: 'All Suppliers', icon: Building2, href: '/dashboard/suppliers' },
    { name: 'Add New Supplier', icon: Building, href: '/dashboard/suppliers/add' },
  ];

  const billSubMenuItems = [
    { name: 'Create Bill', icon: FileText, href: '/dashboard/bills/create' },
    { name: 'Bill List', icon: Receipt, href: '/dashboard/bills' },
    { name: 'Pending Bills', icon: Clock, href: '/dashboard/bills/pending' },
    { name: 'Overdue Bills', icon: AlertTriangle, href: '/dashboard/bills/overdue' },
    { name: 'Bill Reports', icon: BarChart3, href: '/dashboard/bills/reports' },
  ];

  const paymentSubMenuItems = [
    { name: 'Create Payment', icon: IndianRupee, href: '/dashboard/payments/create' },
    { name: 'Payment List', icon: CreditCard, href: '/dashboard/payments' },
    { name: 'Pending Payments', icon: Clock, href: '/dashboard/payments/pending' },
    { name: 'Payment Reports', icon: BarChart3, href: '/dashboard/payments/reports' },
    { name: 'Payment Analytics', icon: TrendingUp, href: '/dashboard/payments/analytics' },
  ];

  const invoiceSubMenuItems = [
    { name: 'All Invoices', icon: Receipt, href: '/dashboard/invoices' },
    { name: 'Add New Invoice', icon: FileText, href: '/dashboard/invoices/add' },
    { name: 'View Invoice', icon: Eye, href: '/dashboard/invoices/view' },
  ];

  const expenseSubMenuItems = [
    { name: 'All Expenses', icon: Receipt, href: '/dashboard/expenses' },
    { name: 'Add New Expense', icon: Plus, href: '/dashboard/expenses/add' },
    { name: 'Expense Reports', icon: BarChart3, href: '/dashboard/expenses/reports' },
  ];

  const purchaseSubMenuItems = [
    { name: 'Suppliers', icon: Building2, href: '/dashboard/suppliers', hasSubMenu: true, subMenuItems: suppliersSubMenuItems },
    { name: 'Purchase Orders', icon: ShoppingCart, href: '/dashboard/purchase-orders' },
    { name: 'Bills', icon: Receipt, href: '/dashboard/bills', hasSubMenu: true, subMenuItems: billSubMenuItems },
    { name: 'Payments', icon: IndianRupee, href: '/dashboard/payments', hasSubMenu: true, subMenuItems: paymentSubMenuItems },
  ];

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Customers', icon: Users, href: '/dashboard/customers', hasSubMenu: true, subMenuItems: customerSubMenuItems },
    { name: 'Purchase', icon: ShoppingCart, href: '/dashboard/purchase', hasSubMenu: true, subMenuItems: purchaseSubMenuItems },
    { name: 'Product & Stock', icon: Package, href: '/dashboard/products', hasSubMenu: true, subMenuItems: productAndStockSubMenuItems },
    { name: 'Invoices', icon: FileText, href: '/dashboard/invoices', hasSubMenu: true, subMenuItems: invoiceSubMenuItems },
    // { name: 'Billing', icon: Receipt, href: '/dashboard/billing' },
    // { name: 'AI Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
    // { name: 'Ledger', icon: BookOpen, href: '/dashboard/ledger' },
    // { name: 'Journal Entry', icon: FileText, href: '/dashboard/journal' },
    { name: 'Daily Expenses', icon: IndianRupee, href: '/dashboard/expenses', hasSubMenu: true, subMenuItems: expenseSubMenuItems },
  ];

  const bottomItems = [
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  // Helper function to check if user has access to a menu item
  const hasMenuItemAccess = (itemName) => {
    // Dashboard is always accessible
    if (itemName === 'Dashboard') return true;
    
    // If features are still loading, assume access (will be checked on click)
    if (featuresLoading) return true;
    
    // If no features, no access except dashboard
    if (!features || features.length === 0) return false;
    
    // Map menu item names to feature names
    const menuToFeatureMap = {
      'Customers': ['Customer Management', 'customer_management'],
      'Purchase': ['Purchase Management', 'purchase_management'],
      'Product & Stock': ['Product Management', 'Stock Management', 'product_management', 'stock_management'],
      'Invoices': ['Invoice Management', 'invoice_management'],
      'Daily Expenses': ['Expense Management', 'expense_management'],
    };
    
    const requiredFeatures = menuToFeatureMap[itemName] || [];
    if (requiredFeatures.length === 0) return true; // If no mapping, show by default
    
    // Check if any required feature is in the user's subscription
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

  // Handle menu item click - check access and show upgrade modal if needed
  const handleMenuItemClick = (item, e) => {
    if (!hasMenuItemAccess(item.name)) {
      e.preventDefault();
      e.stopPropagation();
      
      const menuToFeatureMap = {
        'Customers': 'Customer Management',
        'Purchase': 'Purchase Management',
        'Product & Stock': 'Product Management',
        'Invoices': 'Invoice Management',
        'Daily Expenses': 'Expense Management',
      };
      
      setUpgradeModal({
        isOpen: true,
        featureName: item.name,
        requiredFeature: menuToFeatureMap[item.name] || 'Premium Feature'
      });
    }
  };

  // Show all navigation items (not filtered)
  const filteredNavigationItems = navigationItems;

  const handleStoreSelect = (store) => {
    dispatch(setSelectedStore(store));
    setIsStoreDropdownOpen(false);
    if (onStoreChange) {
      onStoreChange(store);
    }
  };

  const handleAddNewStore = () => {
    // Redirect to store creation page
    router.push('/onboarding/store');
    setIsStoreDropdownOpen(false);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleProductsDropdown = (e) => {
    e.stopPropagation();
    setIsProductsDropdownOpen(!isProductsDropdownOpen);
  };

  const toggleCustomersDropdown = (e) => {
    e.stopPropagation();
    setIsCustomersDropdownOpen(!isCustomersDropdownOpen);
  };

  const toggleSuppliersDropdown = (e) => {
    e.stopPropagation();
    setIsSuppliersDropdownOpen(!isSuppliersDropdownOpen);
  };

  const toggleInventoryDropdown = (e) => {
    e.stopPropagation();
    setIsInventoryDropdownOpen(!isInventoryDropdownOpen);
  };

  const togglePurchaseDropdown = (e) => {
    e.stopPropagation();
    setIsPurchaseDropdownOpen(!isPurchaseDropdownOpen);
  };

  const toggleBillsDropdown = (e) => {
    e.stopPropagation();
    setIsBillsDropdownOpen(!isBillsDropdownOpen);
  };

  const togglePaymentsDropdown = (e) => {
    e.stopPropagation();
    setIsPaymentsDropdownOpen(!isPaymentsDropdownOpen);
  };

  const toggleInvoicesDropdown = (e) => {
    e.stopPropagation();
    setIsInvoicesDropdownOpen(!isInvoicesDropdownOpen);
  };

  const toggleExpensesDropdown = (e) => {
    e.stopPropagation();
    setIsExpensesDropdownOpen(!isExpensesDropdownOpen);
  };


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on a dropdown toggle button
      const isDropdownToggle = event.target.closest('button[data-dropdown-toggle]');
      if (isDropdownToggle) {
        return; // Don't close if clicking on dropdown toggle
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStoreDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setIsProductsDropdownOpen(false);
      }
      if (customersDropdownRef.current && !customersDropdownRef.current.contains(event.target)) {
        setIsCustomersDropdownOpen(false);
      }
      if (suppliersDropdownRef.current && !suppliersDropdownRef.current.contains(event.target)) {
        setIsSuppliersDropdownOpen(false);
      }
      if (inventoryDropdownRef.current && !inventoryDropdownRef.current.contains(event.target)) {
        setIsInventoryDropdownOpen(false);
      }
      if (purchaseDropdownRef.current && !purchaseDropdownRef.current.contains(event.target)) {
        setIsPurchaseDropdownOpen(false);
      }
      if (billsDropdownRef.current && !billsDropdownRef.current.contains(event.target)) {
        setIsBillsDropdownOpen(false);
      }
      if (paymentsDropdownRef.current && !paymentsDropdownRef.current.contains(event.target)) {
        setIsPaymentsDropdownOpen(false);
      }
      if (invoicesDropdownRef.current && !invoicesDropdownRef.current.contains(event.target)) {
        setIsInvoicesDropdownOpen(false);
      }
      if (expensesDropdownRef.current && !expensesDropdownRef.current.contains(event.target)) {
        setIsExpensesDropdownOpen(false);
      }
    };

    // Use a small delay to allow click events to process first
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-r border-[rgb(var(--color-border-primary))]/40 h-screen flex flex-col shadow-lg relative z-[150] transition-all duration-500 ease-in-out`}>
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
          <button onClick={toggleSidebar} className="absolute cursor-pointer w-7 h-7 rounded-full border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors flex items-center justify-center shadow-sm translate-x-3 -translate-y-3">
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" /> : <ChevronLeft className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />}
          </button>
        </div>

        {/* Store Selection */}
        {!isCollapsed && (
          <div className="p-3 border-b border-[rgb(var(--color-border-primary))]">
            <div className="relative" ref={dropdownRef}>
              {/* Selected Store Display */}
              <div onClick={(e) => { e.stopPropagation(); setIsStoreDropdownOpen(!isStoreDropdownOpen); }} data-dropdown-toggle className="flex items-center justify-between p-2 bg-[rgb(var(--color-primary))]/5 border-2 border-[rgb(var(--color-primary))]/10 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-primary))]/10 transition-colors">
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

              {/* Dropdown Menu */}
              {isStoreDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                  <div className="p-1">
                    {reduxStores.map((store) => {
                      const isSelected = selectedStore && (store.storeName === selectedStore.storeName);
                      return (
                        <div key={store.storeName || store.name || store.id} onClick={() => handleStoreSelect(store)} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] transition-colors ${isSelected ? 'bg-[rgb(var(--color-primary))]/5' : ''}`}>
                          <div>
                            <div className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
                              {store.storeName}
                            </div>
                            <div className={`text-xs ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                              GST: {store.gst}
                            </div>
                          </div>
                          {isSelected && (<Check className="w-3 h-3 text-[rgb(var(--color-primary))]" />)}
                        </div>
                      );
                    })}

                    {/* Add New Store Button */}
                    <div className="border-t border-[rgb(var(--color-border-primary))] mt-1 pt-1">
                      <button onClick={handleAddNewStore} className="flex items-center space-x-1 w-full p-2 text-gray-900 hover:bg-[rgb(var(--color-primary))]/5 rounded-lg transition-colors">
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
          {filteredNavigationItems.map((item, index) => {
            const Icon = item.icon;
            const delay = 10;
            const isActive = pathname === item.href || (item.hasSubMenu && pathname.startsWith(item.href));
            const hasAccess = hasMenuItemAccess(item.name);

            if (item.hasSubMenu) {
              const isProductAndStockMenu = item.name === 'Product & Stock';
              const isCustomersMenu = item.name === 'Customers';
              const isSuppliersMenu = item.name === 'Suppliers';
              const isPurchaseMenu = item.name === 'Purchase';
              const isBillsMenu = item.name === 'Bills';
              const isPaymentsMenu = item.name === 'Payments';
              const isInvoicesMenu = item.name === 'Invoices';
              const isExpensesMenu = item.name === 'Daily Expenses';

              const dropdownRef = isProductAndStockMenu ? productsDropdownRef :
                isCustomersMenu ? customersDropdownRef :
                  isSuppliersMenu ? suppliersDropdownRef :
                    isPurchaseMenu ? purchaseDropdownRef :
                      isBillsMenu ? billsDropdownRef :
                        isPaymentsMenu ? paymentsDropdownRef :
                          isInvoicesMenu ? invoicesDropdownRef :
                            expensesDropdownRef;

              const isDropdownOpen = isProductAndStockMenu ? isProductsDropdownOpen :
                isCustomersMenu ? isCustomersDropdownOpen :
                  isSuppliersMenu ? isSuppliersDropdownOpen :
                    isPurchaseMenu ? isPurchaseDropdownOpen :
                      isBillsMenu ? isBillsDropdownOpen :
                        isPaymentsMenu ? isPaymentsDropdownOpen :
                          isInvoicesMenu ? isInvoicesDropdownOpen :
                            isExpensesDropdownOpen;

              const toggleDropdown = isProductAndStockMenu ? toggleProductsDropdown :
                isCustomersMenu ? toggleCustomersDropdown :
                  isSuppliersMenu ? toggleSuppliersDropdown :
                    isPurchaseMenu ? togglePurchaseDropdown :
                      isBillsMenu ? toggleBillsDropdown :
                        isPaymentsMenu ? togglePaymentsDropdown :
                          isInvoicesMenu ? toggleInvoicesDropdown :
                            toggleExpensesDropdown;

              return (
                <div key={item.name} className="relative" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      if (!hasAccess) {
                        handleMenuItemClick(item, e);
                      } else {
                        toggleDropdown(e);
                      }
                    }}
                    data-dropdown-toggle
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg transition-all duration-500 ease-in-out cursor-pointer ${isActive
                      ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-r-2 border-[rgb(var(--color-primary))]'
                      : hasAccess 
                        ? 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                        : 'text-[rgb(var(--color-text-tertiary))] opacity-60 hover:bg-[rgb(var(--color-bg-secondary))]'
                      }`}
                    title={isCollapsed ? item.name : ''}
                    style={{
                      transitionDelay: `${delay}ms`,
                      transform: isCollapsed ? 'translateX(0)' : 'translateX(0)',
                      opacity: 1
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Icon className={`w-5 h-5 transition-all duration-500 ease-in-out ${isActive ? 'text-[rgb(var(--color-primary))]' : hasAccess ? 'text-[rgb(var(--color-text-tertiary))]' : 'text-[rgb(var(--color-text-tertiary))] opacity-60'}`} />
                      </div>
                      <span
                        className={`font-medium transition-all duration-500 ease-in-out ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'} ${!hasAccess ? 'text-[rgb(var(--color-text-tertiary))]' : ''}`}
                        style={{
                          transitionDelay: `${delay + 50}ms`,
                          transform: isCollapsed ? 'translateX(-20px)' : 'translateX(0)'
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center space-x-1">
                        {!hasAccess && (
                          <Crown className="w-3.5 h-3.5 text-yellow-500" />
                        )}
                        <ChevronRightIcon
                          className={`w-4 h-4 transition-all duration-300 ${isDropdownOpen ? 'rotate-90' : ''
                            } ${isActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-tertiary))]'}`}
                        />
                      </div>
                    )}
                  </button>

                  {/* Sub-menu */}
                  {isDropdownOpen && !isCollapsed && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subMenuItems.map((subItem, subIndex) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${isSubActive
                              ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-l-2 border-[rgb(var(--color-primary))]'
                              : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                              }`}
                          >
                            <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-tertiary))]'}`} />
                            <span className="text-sm font-medium">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={item.name}
                onClick={(e) => {
                  if (!hasAccess) {
                    e.preventDefault();
                    handleMenuItemClick(item, e);
                  }
                }}
                className={hasAccess ? '' : 'cursor-pointer'}
              >
                <Link
                  href={hasAccess ? item.href : '#'}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} px-2 py-1.5 rounded-lg transition-all duration-500 ease-in-out cursor-pointer ${isActive
                    ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-r-2 border-[rgb(var(--color-primary))]'
                    : hasAccess
                      ? 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                      : 'text-[rgb(var(--color-text-tertiary))] opacity-60 hover:bg-[rgb(var(--color-bg-secondary))]'
                    }`}
                  title={isCollapsed ? item.name : ''}
                  style={{
                    transitionDelay: `${delay}ms`,
                    transform: isCollapsed ? 'translateX(0)' : 'translateX(0)',
                    opacity: 1
                  }}
                >
                  <div className="relative">
                    <Icon className={`w-4 h-4 transition-all duration-500 ease-in-out ${isActive ? 'text-[rgb(var(--color-primary))]' : hasAccess ? 'text-[rgb(var(--color-text-tertiary))]' : 'text-[rgb(var(--color-text-tertiary))] opacity-60'}`} />
                  </div>
                  <span
                    className={`font-medium text-sm transition-all duration-500 ease-in-out ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'} ${!hasAccess ? 'text-[rgb(var(--color-text-tertiary))]' : ''}`}
                    style={{
                      transitionDelay: `${delay + 50}ms`,
                      transform: isCollapsed ? 'translateX(-20px)' : 'translateX(0)'
                    }}
                  >
                    {item.name}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-3 border-t border-[rgb(var(--color-border-primary))]">
        {/* Settings Option */}
        {bottomItems.map((item, index) => {
          const Icon = item.icon;
          const delay = 0; // Continue staggered delay
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-all duration-500 ease-in-out cursor-pointer text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]`}
              title={isCollapsed ? item.name : ''}
              style={{
                transitionDelay: `${delay}ms`,
                transform: isCollapsed ? 'translateX(0)' : 'translateX(0)',
                opacity: 1
              }}
            >
              <Icon className="w-6 h-6 text-[rgb(var(--color-text-tertiary))] transition-all duration-500 ease-in-out" />
              <span
                className={`font-medium transition-all duration-500 ease-in-out ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}
                style={{
                  transitionDelay: `${delay + 50}ms`,
                  transform: isCollapsed ? 'translateX(-20px)' : 'translateX(0)'
                }}
              >
                {item.name}
              </span>
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
