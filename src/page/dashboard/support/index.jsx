"use client";
import { SupportScreen } from "@dragorbit/features/support";

import { Lightbulb, HelpCircle, Keyboard } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SuggestionsTab from "@/components/support/tabs/SuggestionsTab";
import HelpTab from "@/components/support/tabs/HelpTab";
import ShortcutsTab from "@/components/support/tabs/ShortcutsTab";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppSelector } from "@/store/hooks";
import { ROLES } from "@/hooks/permissions/useModulePermissions";

const SupportPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("suggestions.title") || "Support Center",
    t("suggestions.description") ||
      "Get help, share ideas, and master shortcuts.",
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { authProfile } = useAppSelector((state) => state.profile);

  const [activeTab, setActiveTab] = useState("help");

  const allTabs = useMemo(
    () => [
      {
        id: "suggestions",
        label: t("suggestions.tabs.suggestions") || "Suggestions",
        icon: Lightbulb,
      },
      {
        id: "help",
        label: t("suggestions.tabs.help") || "Help Center",
        icon: HelpCircle,
      },
      {
        id: "shortcuts",
        label: t("suggestions.tabs.shortcuts") || "Shortcuts",
        icon: Keyboard,
      },
    ],
    [t],
  );

  const tabs = useMemo(() => {
    if (authProfile?.role === ROLES.STAFF) {
      return allTabs.filter((tab) => ["help", "shortcuts"].includes(tab.id));
    }
    return allTabs;
  }, [allTabs, authProfile?.role]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabs.some((t) => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (tabs.length > 0 && !tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [searchParams, tabs, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <SupportScreen
      model={{
        tabs,
        activeTab,
        handleTabChange,
        SuggestionsTab,
        HelpTab,
        ShortcutsTab,
      }}
    />
  );
};

export default SupportPage;
