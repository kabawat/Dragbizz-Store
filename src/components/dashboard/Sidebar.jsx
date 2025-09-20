"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ onStoreChange }) => {
  const pathname = usePathname();
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState('Main Store');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dropdownRef = useRef(null);

  const stores = [
    { name: 'Main Store', gst: '22AAAAA0000A1Z5', isActive: true },
    { name: 'Branch Store', gst: '22BBBBB0000B1Z5', isActive: false },
    { name: 'Warehouse Store', gst: '22CCCCC0000C1Z5', isActive: false },
  ];

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Customers', icon: Users, href: '/dashboard/customers' },
    { name: 'Wholesalers', icon: Building2, href: '/dashboard/wholesalers' },
    { name: 'Products', icon: Package, href: '/dashboard/products' },
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
    setSelectedStore(storeName);
    setIsStoreDropdownOpen(false);
    if (onStoreChange) {
      onStoreChange(storeName);
    }
  };

  const handleAddNewStore = () => {
    // Handle add new store logic here
    console.log('Add new store clicked');
    setIsStoreDropdownOpen(false);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStoreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-r border-[rgb(var(--color-border-primary))]/40 h-screen flex flex-col shadow-lg relative z-[150] transition-all duration-500 ease-in-out`}>
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[rgb(var(--color-primary))] rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-[rgb(var(--color-text-primary))]">RetailManager</span>
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
                  GST: {stores.find(store => store.name === selectedStore)?.gst}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[rgb(var(--color-primary))] transition-transform ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isStoreDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                <div className="p-2">
                  {stores.map((store) => (
                    <div
                      key={store.name}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] transition-colors ${
                        store.name === selectedStore ? 'bg-[rgb(var(--color-primary))]/5' : ''
                      }`}
                      onClick={() => handleStoreSelect(store.name)}
                    >
                      <div>
                        <div className={`font-medium ${store.name === selectedStore ? 'text-gray-900' : 'text-gray-900'}`}>
                          {store.name}
                        </div>
                        <div className={`text-sm ${store.name === selectedStore ? 'text-gray-600' : 'text-gray-500'}`}>
                          GST: {store.gst}
                        </div>
                      </div>
                      {store.name === selectedStore && (
                        <Check className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                      )}
                    </div>
                  ))}
                  
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


      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const delay = 10;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-all duration-500 ease-in-out ${
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

      {/* Bottom Section */}
      <div className="p-4 border-t border-[rgb(var(--color-border-primary))]">
        {/* Settings Option */}
        {bottomItems.map((item, index) => {
          const Icon = item.icon;
          const delay = 0; // Continue staggered delay
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-all duration-500 ease-in-out text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]`}
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
