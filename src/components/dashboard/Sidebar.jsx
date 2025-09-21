"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSelectedStore } from '@/store/slices/profileSlice';
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
  DollarSign, 
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
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

const Sidebar = ({ onStoreChange }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { agency, stores: reduxStores, selectedStore } = useAppSelector((state) => state.profile);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);

  // Use Redux stores data, fallback to mock data if not available
  const stores = reduxStores && reduxStores.length > 0 
    ? reduxStores.map(store => ({
        name: store.storeName,
        gst: store.gst,
        isActive: store.storeStatus === 'ACTIVE'
      }))
    : [];


  const productSubMenuItems = [
    { name: 'All Products', icon: Package, href: '/dashboard/products' },
    { name: 'Add New Product', icon: PackagePlus, href: '/dashboard/products/add' },
    { name: 'Import/Export', icon: Upload, href: '/dashboard/products/import-export' },
    { name: 'Reviews & Ratings', icon: Star, href: '/dashboard/products/reviews' },
    { name: 'Archived Products', icon: Archive, href: '/dashboard/products/archived' },
  ];

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Customers', icon: Users, href: '/dashboard/customers' },
    { name: 'Wholesalers', icon: Building2, href: '/dashboard/wholesalers' },
    { name: 'Products', icon: Package, href: '/dashboard/products', hasSubMenu: true, subMenuItems: productSubMenuItems },
    { name: 'Inventory', icon: Warehouse, href: '/dashboard/inventory' },
    { name: 'Billing', icon: Receipt, href: '/dashboard/billing' },
    { name: 'AI Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
    { name: 'Ledger', icon: BookOpen, href: '/dashboard/ledger' },
    { name: 'Journal Entry', icon: FileText, href: '/dashboard/journal' },
    { name: 'Daily Expenses', icon: DollarSign, href: '/dashboard/expenses' },
  ];

  const bottomItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  const handleStoreSelect = (storeName) => {
    console.log('Selecting store:', storeName);
    dispatch(setSelectedStore(storeName));
    setIsStoreDropdownOpen(false);
    if (onStoreChange) {
      onStoreChange(storeName);
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

  const toggleProductsDropdown = () => {
    setIsProductsDropdownOpen(!isProductsDropdownOpen);
  };

  // Debug selectedStore changes
  useEffect(() => {
    console.log('Selected store changed to:', selectedStore);
  }, [selectedStore]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStoreDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setIsProductsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-r border-[rgb(var(--color-border-primary))]/40 h-screen flex flex-col shadow-lg relative z-[150] transition-all duration-500 ease-in-out`}>
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        {/* Logo Section */}
        <div className="px-6 py-6 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[rgb(var(--color-primary))] rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
                  {agency?.agencyName || 'RetailManager'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="relative flex justify-end">
          <button
            onClick={toggleSidebar}
            className="absolute cursor-pointer w-8 h-8 rounded-full border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors flex items-center justify-center shadow-sm translate-x-4 -translate-y-4"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" /> : <ChevronLeft className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />}
          </button>
        </div>

        {/* Store Selection */}
        {!isCollapsed && (
          <div className="p-4 border-b border-[rgb(var(--color-border-primary))]">
            <div className="relative" ref={dropdownRef}>
              {/* Selected Store Display */}
              <div 
                className="flex items-center justify-between p-3 bg-[rgb(var(--color-primary))]/5 border-2 border-[rgb(var(--color-primary))]/10 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-primary))]/10 transition-colors"
                onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              >
                <div>
                  <div className="font-semibold text-gray-900">{selectedStore}</div>
                  <div className="text-sm text-gray-600">
                    GST: {stores.find(store => store.name === selectedStore)?.gst || 'N/A'}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[rgb(var(--color-primary))] transition-transform ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isStoreDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                  <div className="p-2">
                    {stores.map((store) => {
                      const isSelected = store.name === selectedStore;
                      return (
                        <div
                          key={store.name}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] transition-colors ${
                            isSelected ? 'bg-[rgb(var(--color-primary))]/5' : ''
                          }`}
                          onClick={() => handleStoreSelect(store.name)}
                        >
                          <div>
                            <div className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
                              {store.name}
                            </div>
                            <div className={`text-sm ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                              GST: {store.gst}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Add New Store Button */}
                    <div className="border-t border-[rgb(var(--color-border-primary))] mt-2 pt-2">
                      <button
                        onClick={handleAddNewStore}
                        className="flex items-center space-x-2 w-full p-3 text-gray-900 hover:bg-[rgb(var(--color-primary))]/5 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="font-medium">Add New Store</span>
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
        <nav className="p-4 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const delay = 10;
            const isActive = pathname === item.href || (item.hasSubMenu && pathname.startsWith(item.href));
            
            if (item.hasSubMenu) {
              return (
                <div key={item.name} className="relative" ref={productsDropdownRef}>
                  <button
                    onClick={toggleProductsDropdown}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg transition-all duration-500 ease-in-out cursor-pointer ${
                      isActive
                        ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-r-2 border-[rgb(var(--color-primary))]'
                        : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                    }`}
                    title={isCollapsed ? item.name : ''}
                    style={{
                      transitionDelay: `${delay}ms`,
                      transform: isCollapsed ? 'translateX(0)' : 'translateX(0)',
                      opacity: 1
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 transition-all duration-500 ease-in-out ${isActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-tertiary))]'}`} />
                      <span 
                        className={`font-medium transition-all duration-500 ease-in-out ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`} 
                        style={{ 
                          transitionDelay: `${delay + 50}ms`,
                          transform: isCollapsed ? 'translateX(-20px)' : 'translateX(0)'
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    {!isCollapsed && (
                      <ChevronRightIcon 
                        className={`w-4 h-4 transition-all duration-300 ${
                          isProductsDropdownOpen ? 'rotate-90' : ''
                        } ${isActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-tertiary))]'}`} 
                      />
                    )}
                  </button>
                  
                  {/* Sub-menu */}
                  {isProductsDropdownOpen && !isCollapsed && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subMenuItems.map((subItem, subIndex) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                              isSubActive
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
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-all duration-500 ease-in-out cursor-pointer ${
                  isActive
                    ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-r-2 border-[rgb(var(--color-primary))]'
                    : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                }`}
                title={isCollapsed ? item.name : ''}
                style={{
                  transitionDelay: `${delay}ms`,
                  transform: isCollapsed ? 'translateX(0)' : 'translateX(0)',
                  opacity: 1
                }}
              >
                <Icon className={`w-5 h-5 transition-all duration-500 ease-in-out ${isActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-tertiary))]'}`} />
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
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-4 border-t border-[rgb(var(--color-border-primary))]">
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
    </div>
  );
};

export default Sidebar;
