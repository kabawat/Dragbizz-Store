"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useLogout } from '@/hooks/useLogout';
import LogoutModal from '@/components/ui/LogoutModal';

const Header = ({ selectedStore = 'Main Store' }) => {
  const { user, isLoading } = useAppSelector(state => state.auth);
  const { showLogoutModal, hideLogoutModal, confirmLogout, isModalOpen } = useLogout();
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const notifications = [
    { id: 1, message: 'New order received', time: '2 min ago', unread: true },
    { id: 2, message: 'Inventory low alert', time: '15 min ago', unread: true },
    { id: 3, message: 'Payment received', time: '1 hour ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    showLogoutModal();
  };

  return (
    <>
      <header className="bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-b border-[rgb(var(--color-border-primary))]/50 px-6 py-3 shadow-sm relative z-[100]">
        <div className="flex items-center justify-between">
          {/* Left side - Page Title and Welcome Message */}
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-1">Dashboard</h1>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              Welcome back! Here's what's happening with {selectedStore} today.
            </p>
          </div>

          {/* Right side - User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className="relative w-10 h-10 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
              >
                <Bell className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[rgb(var(--color-danger))] text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                  <div className="p-4 border-b border-[rgb(var(--color-border-primary))]">
                    <h3 className="font-semibold text-[rgb(var(--color-text-primary))]">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-[rgb(var(--color-border-primary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer ${
                          notification.unread ? 'bg-[rgb(var(--color-primary))]/10' : ''
                        }`}
                      >
                        <p className={`text-sm ${notification.unread ? 'font-semibold text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-secondary))]'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-[rgb(var(--color-border-primary))]">
                    <button className="text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-3 hover:bg-[rgb(var(--color-bg-secondary))] p-2 rounded-lg transition-colors"
              >
                {/* Profile Picture */}
                <div className="w-10 h-10 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="text-left">
                  <div className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
                  </div>
                  <div className="text-xs text-[rgb(var(--color-text-secondary))]">Admin</div>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown className={`w-4 h-4 text-[rgb(var(--color-text-tertiary))] transition-transform ${
                  isProfileDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]">
                      Profile Settings
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]">
                      Account Settings
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]">
                      Preferences
                    </button>
                    <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                    <button 
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10 disabled:opacity-50"
                    >
                      {isLoading ? 'Signing Out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Professional Logout Modal - Outside Header */}
      {
        isModalOpen ? (
          <LogoutModal
            isOpen={isModalOpen}
            onClose={hideLogoutModal}
            onConfirm={confirmLogout}
            isLoading={isLoading}
          />
        ):<></>
      }
      
    </>
  );
};

export default Header;
