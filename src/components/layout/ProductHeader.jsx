"use client";
import React, { useState, useEffect, useRef } from "react";
import logger from "@/utils/logger";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import {
  Menu,
  X,
  ShoppingBag,
  ChevronDown,
  ArrowRight,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { cookieManager } from "@/utils/cookieManager";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getRetailerDetails } from "@/store/slices/profileSlice";
import { useLogout } from "@/hooks/useLogout";
import LogoutModal from "@/components/ui/LogoutModal";

const ProductHeader = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const profileDropdownRef = useRef(null);
  const { showLogoutModal, hideLogoutModal, confirmLogout, isModalOpen } =
    useLogout();

  // Get user data from Redux
  const { user, agency } = useAppSelector((state) => state.profile);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const authToken = cookieManager.getAuthToken();
      if (authToken) {
        setIsLoggedIn(true);
        // Fetch profile if not already in Redux
        if (!user) {
          try {
            await dispatch(getRetailerDetails()).unwrap();
          } catch (error) {
            logger.error("Failed to fetch retailer details:", error);
          }
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [dispatch, user]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    {
      name: "Products",
      href: "/products",
      hasDropdown: true,
      dropdownItems: [
        { name: "All Products", href: "/products" },
        { name: "Features", href: "/products#features" },
        { name: "Pricing", href: "/products#pricing" },
        { name: "Solutions", href: "/products#solutions" },
      ],
    },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[rgb(var(--color-bg-primary))]/95 backdrop-blur-md shadow-lg border-b border-[rgb(var(--color-border-primary))]"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-1.5 sm:space-x-2 group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[rgb(var(--color-text-primary))]">
              DragBizz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() =>
                        setIsProductsDropdownOpen(!isProductsDropdownOpen)
                      }
                      className="flex items-center space-x-1 text-sm lg:text-base text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isProductsDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isProductsDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-44 lg:w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-xl py-2 animate-fade-in">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                            onClick={() => setIsProductsDropdownOpen(false)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm lg:text-base text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons / Profile - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-2 hover:bg-[rgb(var(--color-bg-secondary))] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  style={{
                    paddingTop: "calc(0.375rem + 2.5px)",
                    paddingBottom: "calc(0.375rem + 2.5px)",
                  }}
                >
                  {/* Profile Picture/Avatar */}
                  <div className="w-7 h-7 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center overflow-hidden">
                    {user?.firstName || user?.name ? (
                      <span className="text-xs font-semibold text-white">
                        {(user?.firstName || user?.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-left">
                    <div className="text-xs font-medium text-[rgb(var(--color-text-primary))]">
                      {user?.firstName ||
                        user?.name ||
                        user?.email?.split("@")[0] ||
                        "User"}
                    </div>
                    {agency?.agencyName && (
                      <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {agency.agencyName}
                      </div>
                    )}
                  </div>

                  {/* Dropdown Arrow */}
                  <ChevronDown
                    className={`w-3 h-3 text-[rgb(var(--color-text-tertiary))] transition-transform ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-xl z-[9999]">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-[rgb(var(--color-border-primary))]">
                        <div className="text-xs font-medium text-[rgb(var(--color-text-primary))]">
                          {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.name || user?.email || "User"}
                        </div>
                        {user?.email && (
                          <div className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">
                            {user.email}
                          </div>
                        )}
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Settings className="w-3 h-3 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center px-4 py-2 text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Settings className="w-3 h-3 mr-2" />
                        Settings
                      </Link>
                      <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          showLogoutModal();
                        }}
                        className="w-full flex items-center px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection("features")}
                  className="text-xs text-[rgb(var(--color-text-primary))] px-2.5 py-1.5"
                >
                  Features
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={ArrowRight}
                  onClick={() => scrollToSection("cta")}
                  className="text-xs px-3"
                  style={{
                    paddingTop: "calc(0.375rem + 2.5px)",
                    paddingBottom: "calc(0.375rem + 2.5px)",
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[rgb(var(--color-border-primary))] py-3 sm:py-4 animate-slide-in">
            <div className="flex flex-col space-y-3 sm:space-y-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() =>
                          setIsProductsDropdownOpen(!isProductsDropdownOpen)
                        }
                        className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-sm sm:text-base text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isProductsDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isProductsDropdownOpen && (
                        <div className="pl-3 sm:pl-4 mt-2 space-y-1.5 sm:space-y-2">
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsProductsDropdownOpen(false);
                              }}
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-3 sm:px-4 py-2 text-sm sm:text-base text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-3 sm:pt-4 border-t border-[rgb(var(--color-border-primary))] space-y-2">
                {isLoggedIn ? (
                  <>
                    <div className="px-3 sm:px-4 py-2 bg-[rgb(var(--color-bg-secondary))] rounded-lg mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center overflow-hidden">
                          {user?.firstName || user?.name ? (
                            <span className="text-xs font-semibold text-white">
                              {(user?.firstName || user?.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-[rgb(var(--color-text-primary))]">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.name || user?.email || "User"}
                          </div>
                          {user?.email && (
                            <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        router.push("/dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        showLogoutModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs sm:text-sm text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        scrollToSection("features");
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Features
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      rightIcon={ArrowRight}
                      onClick={() => {
                        scrollToSection("cta");
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Close dropdown when clicking outside */}
      {isProductsDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProductsDropdownOpen(false)}
        />
      )}

      {/* Logout Modal */}
      {isModalOpen && (
        <LogoutModal
          isOpen={isModalOpen}
          onClose={hideLogoutModal}
          onConfirm={confirmLogout}
        />
      )}
    </header>
  );
};

export default ProductHeader;
