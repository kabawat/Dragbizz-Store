"use client";
import React, { useState, useRef } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";

const AppearanceSettings = ({ animationKey, handleToggleVariant }) => {
  const { t } = useTranslation();
  const { currentTheme, currentVariant, themes, changeTheme } = useTheme();
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollContainerRef = useRef(null);

  const handleThemeScroll = (e) => {
    const target = e.currentTarget;
    const atBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 4;
    setShowScrollHint(!atBottom);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
          {t("settings.appearanceSettings")}
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          {t("settings.customizeThemeAndAppearance")}
        </p>
      </div>

      {/* Theme and Mode - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Theme Selection */}
        <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 flex flex-col min-h-0 h-full">
          <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex-shrink-0">
            {t("settings.chooseTheme")}
          </h3>
          <div className="relative flex-1 min-h-0 overflow-hidden pb-4">
            <div
              ref={scrollContainerRef}
              onScroll={handleThemeScroll}
              className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 h-full"
            >
              {Object.entries(themes).map(([themeKey, theme]) => (
                <button
                  key={themeKey}
                  onClick={() => changeTheme(themeKey)}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    currentTheme === themeKey
                      ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] bg-opacity-10"
                      : "border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.colors.light.primary }}
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

            {/* Scroll hint at bottom (hide when scrolled to end) */}
            {showScrollHint && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[rgb(var(--color-bg-primary))] via-[rgb(var(--color-bg-primary))]/70 to-transparent flex items-end justify-center">
                <div className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgb(var(--color-bg-secondary))]/80 border border-[rgb(var(--color-border-primary))]/60 text-[10px] text-[rgb(var(--color-text-secondary))]">
                  {/* <span>Scroll for more themes</span> */}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div
          className="relative h-40 rounded-2xl cursor-pointer overflow-hidden group shadow-lg"
          onClick={handleToggleVariant}
          style={{
            background:
              currentVariant === "light"
                ? "linear-gradient(135deg, rgba(59, 130, 246, 0.88) 0%, rgba(147, 51, 234, 0.99) 100%)"
                : "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(99, 102, 241, 0.44) 100%)",
            transition: "background 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/30" />

          {currentVariant === "dark" && (
            <div className="absolute inset-0">
              <div
                className="absolute top-6 left-14 w-1 h-1 bg-white/70 rounded-full animate-pulse"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="absolute top-10 right-16 w-1 h-1 bg-white/60 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute top-8 right-28 w-1 h-1 bg-white/50 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              />
              <div
                className="absolute top-12 left-24 w-1 h-1 bg-white/60 rounded-full animate-pulse"
                style={{ animationDelay: "1.5s" }}
              />
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            {/* Sun Icon - Rises from horizon, sets below horizon */}
            {currentVariant === "light" && (
              <div
                className="absolute"
                style={{ left: "25%", top: "20%" }}
                key={`sun-${animationKey}`}
              >
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center sun-appear"
                  style={{
                    background: "rgba(251, 191, 36, 0.25)",
                    backdropFilter: "blur(12px)",
                    boxShadow:
                      "0 8px 32px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  <Sun className="w-8 h-8 text-yellow-200" />
                </div>
              </div>
            )}

            {/* Moon Icon - Moves from top to its position */}
            {currentVariant === "dark" && (
              <div
                className="absolute"
                style={{ right: "25%", bottom: "20%" }}
                key={`moon-${animationKey}`}
              >
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center moon-appear"
                  style={{
                    background: "rgba(99, 102, 241, 0.25)",
                    backdropFilter: "blur(12px)",
                    boxShadow:
                      "0 8px 32px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  <Moon className="w-8 h-8 text-blue-100" />
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-5 left-0 right-0 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm bg-white/10 border border-white/20">
              <span className="text-lg">
                {currentVariant === "light" ? "☀️" : "🌙"}
              </span>
              <p className="text-sm font-semibold text-white">
                {currentVariant === "light"
                  ? t("settings.lightMode")
                  : t("settings.darkMode")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
