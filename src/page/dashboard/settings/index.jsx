"use client";

import {
    Bell,
    ChevronRight,
    CreditCard,
    Palette,
    Settings as SettingsIcon,
    Shield,
    Store,
    User,
    PenTool,
    Languages,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import {
    AccountSettings,
    AppearanceSettings,
    ManageUpiSettings,
    NotificationsSettings,
    ProfileSettings,
    SecuritySettings,
    StoreSettings,
    SignatureSettings,
    LanguageSettings,
} from "@/components/settings";
import { AnimatedBackground } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";

const SettingsPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { user, selectedStore } = useAppSelector((state) => state.profile);
    const { toggleVariant } = useTheme();
    const [activeTab, setActiveTab] = useState("appearance");
    const [animationKey, setAnimationKey] = useState(0);

    const settingsTabs = [
        { id: "appearance", label: t("settings.appearance"), icon: Palette },
        { id: "language", label: t("settings.language"), icon: Languages },
        { id: "profile", label: t("settings.profile"), icon: User },
        { id: "account", label: t("settings.account"), icon: SettingsIcon },
        { id: "store", label: t("settings.store"), icon: Store },
        { id: "signature", label: t("settings.digitalSignatures") || "Signatures", icon: PenTool },
        { id: "payment", label: t("settings.payment"), icon: CreditCard },
        { id: "security", label: t("settings.security"), icon: Shield },
        {
            id: "notifications",
            label: t("settings.notificationsLabel"),
            icon: Bell,
        },
    ];

    useEffect(() => {
        const tabFromUrl = searchParams.get("tab");
        if (tabFromUrl) {
            const isValidTab = settingsTabs.some((tab) => tab.id === tabFromUrl);
            if (isValidTab) {
                setActiveTab(tabFromUrl);
            }
        }
    }, [searchParams]);

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
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <AnimatedBackground variant="default" />
            <Sidebar />

            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                <Header
                    title={t("settings.title")}
                    description={t("settings.description")}
                />

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar Navigation */}
                    <div className="w-64 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md border-r border-[rgb(var(--color-border-primary))]/50 flex-shrink-0">
                        <div className="p-4">
                            <div className="space-y-1">
                                {settingsTabs.map((tab) => {
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

                    {/* Content Area */}
                    <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6">
                        <div className="w-full h-full mx-auto overflow-y-auto custom-scrollbar">
                            {activeTab === "appearance" && (
                                <AppearanceSettings
                                    animationKey={animationKey}
                                    handleToggleVariant={handleToggleVariant}
                                />
                            )}
                            {activeTab === "language" && <LanguageSettings />}
                            {activeTab === "profile" && <ProfileSettings user={user} />}
                            {activeTab === "account" && <AccountSettings />}
                            {activeTab === "store" && <StoreSettings selectedStore={selectedStore} />}
                            {activeTab === "signature" && <SignatureSettings />}
                            {activeTab === "payment" && <ManageUpiSettings />}
                            {activeTab === "security" && <SecuritySettings />}
                            {activeTab === "notifications" && <NotificationsSettings />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
