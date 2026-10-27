"use client";
import { SettingsScreen } from "@dragorbit/features/settings";

import {
  Bell,
  Wallet,
  Hash,
  Palette,
  Settings as SettingsIcon,
  Shield,
  Store,
  User,
  PenTool,
  Languages,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AccountSettings,
  AppearanceSettings,
  NotificationsSettings,
  ProfileSettings,
  SecuritySettings,
  StoreSettings,
  SignatureSettings,
  LanguageSettings,
  InvoiceNumberSettings,
} from "@/components/settings";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppSelector } from "@/store/hooks";
import { ROLES } from "@/hooks/permissions/useModulePermissions";

import CashbookSettings from "@/components/settings/CashbookSettings";

const LEGACY_TAB_REDIRECTS = {
  integrations: "/dashboard/integrations/tally",
  payment: "/dashboard/integrations/payment",
  invoiceNumber: "/dashboard/utilities/invoice-number",
  signature: "/dashboard/utilities/signatures",
};

const SettingsPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("settings.title"), t("settings.description"));
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, selectedStore, authProfile } = useAppSelector(
    (state) => state.profile,
  );
  const { toggleVariant } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");
  const [animationKey, setAnimationKey] = useState(0);
  const contentRef = useRef(null);

  const allTabs = [
    { id: "appearance", label: t("settings.appearance"), icon: Palette },
    { id: "language", label: t("settings.language"), icon: Languages },
    { id: "profile", label: t("settings.profile"), icon: User },
    { id: "account", label: t("settings.account"), icon: SettingsIcon },
    { id: "store", label: t("settings.store"), icon: Store },
    { id: "cashbook", label: t("cashbook.title"), icon: Wallet },
    { id: "security", label: t("settings.security"), icon: Shield },
    {
      id: "notifications",
      label: t("settings.notificationsLabel"),
      icon: Bell,
    },
  ];

  const settingsTabs =
    authProfile?.role === ROLES.STAFF
      ? allTabs.filter((tab) =>
        ["appearance", "language", "profile"].includes(tab.id),
      )
      : allTabs;

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (!tabFromUrl) return;

    const legacyTarget = LEGACY_TAB_REDIRECTS[tabFromUrl];
    if (legacyTarget) {
      const sub = searchParams.get("sub");
      const suffix = sub ? `?sub=${encodeURIComponent(sub)}` : "";
      router.replace(`${legacyTarget}${suffix}`);
      return;
    }

    const isValidTab = settingsTabs.some((tab) => tab.id === tabFromUrl);
    if (isValidTab) {
      setActiveTab(tabFromUrl);
    } else if (settingsTabs.length > 0) {
      setActiveTab(settingsTabs[0].id);
    }
  }, [searchParams, settingsTabs, router]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleToggleVariant = () => {
    setAnimationKey((prev) => prev + 1);
    toggleVariant();
  };

  return (
    <SettingsScreen
      tabs={settingsTabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      contentRef={contentRef}
      sidebarExtra={undefined}
    >
      {
        <>
          {activeTab === "appearance" && (
            <AppearanceSettings
              animationKey={animationKey}
              handleToggleVariant={handleToggleVariant}
            />
          )}
          {activeTab === "language" && <LanguageSettings />}
          {activeTab === "profile" && <ProfileSettings user={user} />}
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "cashbook" && <CashbookSettings />}
          {activeTab === "store" && (
            <StoreSettings selectedStore={selectedStore} />
          )}
          {activeTab === "signature" && <SignatureSettings />}
          {activeTab === "invoiceNumber" && <InvoiceNumberSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "notifications" && <NotificationsSettings />}
        </>
      }
    </SettingsScreen>
  );
};

export default SettingsPage;
