"use client";
import { UserProfileMenu } from "@dragorbit/ui/app";

import { useRouter } from "next/navigation";
import LogoutModal from "@/components/ui/LogoutModal";
import { useLogout } from "@/hooks/auth/useLogout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";

const UserProfile = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    showLogoutModal,
    hideLogoutModal,
    confirmLogout,
    isModalOpen,
    isLoggingOut,
  } = useLogout();

  const { user, authProfile } = useAppSelector((state) => state.profile);

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name ||
        (authProfile?.firstName && authProfile?.lastName
          ? `${authProfile.firstName} ${authProfile.lastName}`
          : authProfile?.name || user?.email || t("header.user"));

  const userRole = user?.role || authProfile?.role || null;

  const formatRole = (role) => {
    if (!role) return null;
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const displayRole = formatRole(userRole) || t("header.user");

  const actions = [
    ["profile", "header.profileSettings", "/dashboard/settings?tab=profile"],
    ["account", "header.accountSettings", "/dashboard/settings?tab=account"],
    ["preferences", "header.preferences", "/dashboard/settings?tab=appearance"],
    ["suggestions", "header.suggestions", "/dashboard/support?tab=suggestions"],
  ].map(([id, key, path]) => ({
    id,
    label: t(key),
    onClick: () => router.push(path),
  }));
  actions.push({
    id: "logout",
    label: t("header.signOut"),
    danger: true,
    onClick: showLogoutModal,
  });
  return (
    <>
      <UserProfileMenu
        name={userName}
        role={displayRole}
        avatarUrl={user?.profile || authProfile?.profile}
        actions={actions}
      />
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
