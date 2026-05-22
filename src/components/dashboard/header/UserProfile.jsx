"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";
import { useLogout } from "@/hooks/auth/useLogout";
import LogoutModal from "@/components/ui/LogoutModal";

const UserProfile = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { showLogoutModal, hideLogoutModal, confirmLogout, isModalOpen, isLoggingOut } = useLogout();

    const { user, authProfile } = useAppSelector((state) => state.profile);

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    const userName =
        user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.name || (authProfile?.firstName && authProfile?.lastName)
                ? `${authProfile.firstName} ${authProfile.lastName}`
                : authProfile?.name || user?.email || t("header.user");

    const userRole = user?.role || authProfile?.role || null;

    const formatRole = (role) => {
        if (!role) return null;
        return role
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const displayRole = formatRole(userRole) || t("header.user");

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

    return (
        <>
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
                        className={`w-3 h-3 text-[rgb(var(--color-text-tertiary))] transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setIsProfileDropdownOpen(false);
                                    router.push("/dashboard/settings?tab=profile");
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer"
                            >
                                {t("header.profileSettings")}
                            </button>
                            <button
                                onClick={() => {
                                    setIsProfileDropdownOpen(false);
                                    router.push("/dashboard/settings?tab=account");
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer"
                            >
                                {t("header.accountSettings")}
                            </button>
                            <button
                                onClick={() => {
                                    setIsProfileDropdownOpen(false);
                                    router.push("/dashboard/settings?tab=appearance");
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer"
                            >
                                {t("header.preferences")}
                            </button>

                            <button
                                onClick={() => {
                                    setIsProfileDropdownOpen(false);
                                    router.push("/dashboard/support?tab=suggestions");
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer font-medium text-[rgb(var(--color-primary))]"
                            >
                                {t("header.suggestions") || "Suggestions"}
                            </button>
                            <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                            <button
                                onClick={showLogoutModal}
                                className="w-full px-3 py-1.5 text-left text-xs text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10 cursor-pointer"
                            >
                                {t("header.signOut")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <LogoutModal
                    isOpen={isModalOpen}
                    onClose={hideLogoutModal}
                    onConfirm={confirmLogout}
                    isLoggingOut={isLoggingOut}
                />
            )}
        </>
    );
};

export default UserProfile;
