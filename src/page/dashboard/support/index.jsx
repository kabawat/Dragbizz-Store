"use client";

import {
    Lightbulb,
    HelpCircle,
    Keyboard,
    ChevronRight,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import SuggestionsTab from "@/components/support/tabs/SuggestionsTab";
import HelpTab from "@/components/support/tabs/HelpTab";
import ShortcutsTab from "@/components/support/tabs/ShortcutsTab";
import { useTranslation } from "@/hooks/useTranslation";

const SupportPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState("help");

    const tabs = useMemo(() => [
        { id: "suggestions", label: t("suggestions.tabs.suggestions") || "Suggestions", icon: Lightbulb },
        { id: "help", label: t("suggestions.tabs.help") || "Help Center", icon: HelpCircle },
        { id: "shortcuts", label: t("suggestions.tabs.shortcuts") || "Shortcuts", icon: Keyboard },
    ], [t]);

    useEffect(() => {
        const tabFromUrl = searchParams.get("tab");
        if (tabFromUrl && tabs.some(t => t.id === tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams, tabs]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tabId);
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                <Header
                    title={t("suggestions.title") || "Support Center"}
                    description={t("suggestions.description") || "Get help, share ideas, and master shortcuts."}
                />

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar Navigation (100% Match with Settings Page) */}
                    <div className="w-64 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md border-r border-[rgb(var(--color-border-primary))]/50 flex-shrink-0">
                        <div className="p-4">
                            <div className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabChange(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isActive
                                                ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary))]/20"
                                                : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-primary))]/30 hover:text-[rgb(var(--color-text-primary))]"
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{tab.label}</span>
                                            {isActive && (
                                                <ChevronRight className="w-4 h-4 ml-auto" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area (Match Settings Page Padding) */}
                    <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6">
                        <div className="w-full h-full mx-auto">
                            {activeTab === "suggestions" && <SuggestionsTab />}
                            {activeTab === "help" && <HelpTab />}
                            {activeTab === "shortcuts" && <ShortcutsTab />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
