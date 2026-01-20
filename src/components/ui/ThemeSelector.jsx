"use client";
import {
  Bell,
  Moon,
  Palette,
  RefreshCw,
  Settings,
  Sun,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { localeNames } from "@/i18n/config";
import { useTheme } from "../../contexts/ThemeContext";

const SettingsPanel = () => {
  const { t, locale, changeLanguage } = useTranslation();
  const { currentTheme, currentVariant, themes, changeTheme, toggleVariant } =
    useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // Close drawer with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Close drawer with click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen) {
        // Get the drawer element
        const drawerElement = document.querySelector("[data-drawer]");
        const settingsButton = document.querySelector(".settings-panel button");

        // Check if click is outside both the settings button and the drawer
        if (drawerElement && settingsButton) {
          const isClickInsideDrawer = drawerElement.contains(event.target);
          const isClickOnSettingsButton = settingsButton.contains(event.target);

          if (!isClickInsideDrawer && !isClickOnSettingsButton) {
            setIsOpen(false);
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
  };

  const handleVariantToggle = () => {
    toggleVariant();
  };

  const _currentThemeConfig = themes[currentTheme];

  const tabs = [
    { id: "appearance", label: t("settings.appearance"), icon: Palette },
    {
      id: "notifications",
      label: t("settings.notificationsLabel"),
      icon: Bell,
    },
    { id: "general", label: t("settings.general"), icon: Settings },
  ];

  return (
    <div className="settings-panel fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[10000]">
      {/* Main Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[rgb(var(--color-primary))] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
        title={t("settings.title")}
      >
        <Settings
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Right Drawer */}
      {isOpen && (
        <div
          data-drawer
          className="fixed inset-y-0 right-0 w-full max-w-full sm:max-w-md md:w-[30.5rem] bg-[rgb(var(--color-bg-primary))] border-l border-[rgb(var(--color-border-primary))] shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col isolate"
        >
          {/* Header */}
          <div className="bg-[rgb(var(--color-bg-secondary))] px-6 py-4 border-b border-[rgb(var(--color-border-primary))] flex-shrink-0 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[rgb(var(--color-text-primary))]">
                  {t("settings.title")}
                </h2>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {t("settings.customizeExperience")}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[rgb(var(--color-border-primary))] overflow-x-auto whitespace-nowrap tabs-scroll flex-shrink-0 relative z-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer flex-shrink-0 ${
                    activeTab === tab.id
                      ? "text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))] bg-[rgb(var(--color-bg-secondary))]"
                      : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                  <div className="flex items-center gap-3">
                    {currentVariant === "light" ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                        {t("settings.darkMode")}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {currentVariant === "light"
                          ? t("settings.switchToDark")
                          : t("settings.switchToLight")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleVariantToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      currentVariant === "dark"
                        ? "bg-[rgb(var(--color-primary))]"
                        : "bg-[rgb(var(--color-border-primary))]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentVariant === "dark"
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {/* Theme Selection */}
                <div>
                  <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                    {t("settings.theme")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(themes).map(([themeKey, theme]) => (
                      <button
                        key={themeKey}
                        onClick={() => handleThemeChange(themeKey)}
                        className={`relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                          currentTheme === themeKey
                            ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] bg-opacity-10"
                            : "border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: theme.colors.light.primary,
                            }}
                          />
                          <span
                            className={`text-xs font-medium ${
                              currentTheme === themeKey
                                ? "text-white"
                                : "text-[rgb(var(--color-text-primary))]"
                            }`}
                          >
                            {theme.name}
                          </span>
                        </div>
                        <p
                          className={`text-xs text-left ${
                            currentTheme === themeKey
                              ? "text-white/80"
                              : "text-[rgb(var(--color-text-secondary))]"
                          }`}
                        >
                          {theme.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                        {t("settings.pushNotifications")}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {t("settings.receiveUpdates")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      notifications
                        ? "bg-[rgb(var(--color-primary))]"
                        : "bg-[rgb(var(--color-border-primary))]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                        {t("settings.soundEffects")}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {t("settings.playSounds")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSound(!sound)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      sound
                        ? "bg-[rgb(var(--color-primary))]"
                        : "bg-[rgb(var(--color-border-primary))]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sound ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                        {t("settings.autoSave")}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {t("settings.autoSaveDescription")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      autoSave
                        ? "bg-[rgb(var(--color-primary))]"
                        : "bg-[rgb(var(--color-border-primary))]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoSave ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                    {t("settings.language")}
                  </h3>
                  <select
                    value={locale || "en"}
                    onChange={(e) => {
                      const newLocale = e.target.value;
                      if (newLocale !== locale) {
                        changeLanguage(newLocale);
                      }
                    }}
                    className="w-full p-3 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                  >
                    <option value="en">{localeNames.en}</option>
                    <option value="hi">{localeNames.hi}</option>
                    <option value="gu">{localeNames.gu}</option>
                    <option value="hi-en">{localeNames["hi-en"]}</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-[rgb(var(--color-border-primary))]">
                  <button className="w-full p-3 rounded-lg bg-[rgb(var(--color-danger))] text-white hover:opacity-90 transition-colors cursor-pointer">
                    {t("settings.resetAll")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[rgb(var(--color-bg-secondary))] border-t border-[rgb(var(--color-border-primary))] flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-[rgb(var(--color-text-secondary))]">
              <span>{t("settings.appVersion")}</span>
              <span>{t("settings.savedAutomatically")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
