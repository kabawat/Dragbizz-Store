"use client";
import { Bell, ChevronDown, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LogoutModal from "@/components/ui/LogoutModal";
import { useLogout } from "@/hooks/useLogout";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";

const Header = ({ title, description }) => {
  const { t } = useTranslation();
  const { showLogoutModal, hideLogoutModal, confirmLogout, isModalOpen } =
    useLogout();

  // Get user data from Redux
  const { user, agency, selectedStore, authProfile } = useAppSelector(
    (state) => state.profile
  );

  // Get user name and role
  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || (authProfile?.firstName && authProfile?.lastName)
        ? `${authProfile.firstName} ${authProfile.lastName}`
        : authProfile?.name || user?.email || t("header.user");

  const userRole = user?.role || authProfile?.role || null;

  // Format role for display
  const formatRole = (role) => {
    if (!role) return null;
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const displayRole = formatRole(userRole) || t("header.user");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      message: t("notifications.newOrderReceived"),
      time: t("notifications.twoMinAgo"),
      unread: true,
    },
    {
      id: 2,
      message: t("notifications.inventoryLowAlert"),
      time: t("notifications.fifteenMinAgo"),
      unread: true,
    },
    {
      id: 3,
      message: t("notifications.paymentReceived"),
      time: t("notifications.oneHourAgo"),
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    showLogoutModal();
  };

  return (
    <>
      <header className="bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-b border-[rgb(var(--color-border-primary))]/50 px-4 py-2 shadow-sm relative z-[100]">
        <div className="flex items-center justify-between">
          {/* Left side - Page Title and Description */}
          <div>
            <h1 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-0.5">
              {title || t("dashboard.title")}
            </h1>
            <div className="text-xs text-[rgb(var(--color-text-secondary))]">
              {description || t("dashboard.description")}
            </div>
          </div>

          {/* Right side - User Actions */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() =>
                  setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
                }
                className="relative w-8 h-8 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center hover:bg-[rgb(var(--color-bg-secondary))] transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[rgb(var(--color-danger))] text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                  <div className="p-3 border-b border-[rgb(var(--color-border-primary))]">
                    <h3 className="font-semibold text-sm text-[rgb(var(--color-text-primary))]">
                      {t("notifications.title")}
                    </h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-[rgb(var(--color-border-primary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer ${notification.unread
                          ? "bg-[rgb(var(--color-primary))]/10"
                          : ""
                          }`}
                      >
                        <p
                          className={`text-xs ${notification.unread ? "font-semibold text-[rgb(var(--color-text-primary))]" : "text-[rgb(var(--color-text-secondary))]"}`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-0.5">
                          {notification.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-[rgb(var(--color-border-primary))]">
                    <button className="text-xs text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 font-medium cursor-pointer">
                      {t("notifications.viewAll")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 hover:bg-[rgb(var(--color-bg-secondary))] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {/* Profile Picture */}
                <div className="w-8 h-8 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] rounded-full flex items-center justify-center overflow-hidden border border-[rgb(var(--color-border-primary))]/30">
                  {user?.profile || authProfile?.profile ? (
                    <img
                      src={user?.profile || authProfile?.profile}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* User Info */}
                <div className="text-left">
                  <div className="text-xs font-medium text-[rgb(var(--color-text-primary))]">
                    {userName}
                  </div>
                  <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                    {displayRole}
                  </div>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown
                  className={`w-3 h-3 text-[rgb(var(--color-text-tertiary))] transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                  <div className="py-1">
                    <button className="w-full px-3 py-1.5 text-left text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer">
                      {t("header.profileSettings")}
                    </button>
                    <button className="w-full px-3 py-1.5 text-left text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer">
                      {t("header.accountSettings")}
                    </button>
                    <button className="w-full px-3 py-1.5 text-left text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer">
                      {t("header.preferences")}
                    </button>
                    <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-1.5 text-left text-xs text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10 cursor-pointer"
                    >
                      {t("header.signOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Professional Logout Modal - Outside Header */}
      {isModalOpen && (
        <LogoutModal
          isOpen={isModalOpen}
          onClose={hideLogoutModal}
          onConfirm={confirmLogout}
        />
      )}
    </>
  );
};

export default Header;
