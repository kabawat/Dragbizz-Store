"use client";
import React from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { useTranslation } from "@/hooks/ui/useTranslation";

export const SidebarHeader = () => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { agency } = useAppSelector((state) => state.profile);
    const isCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);

    return (
        <>
            {/* Logo Section */}
            <div className="px-4 py-4 border-b border-[rgb(var(--color-border-primary))]">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-[rgb(var(--color-primary))] rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-white" />
                        </div>
                        {!isCollapsed && (
                            <span className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                {agency?.agencyName || t("common.retailManager")}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <div className="relative flex justify-end">
                <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="absolute cursor-pointer w-7 h-7 rounded-full border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors flex items-center justify-center shadow-sm translate-x-3 -translate-y-3"
                    aria-label={
                        isCollapsed
                            ? t("sidebar.expandSidebar")
                            : t("sidebar.collapseSidebar")
                    }
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                    ) : (
                        <ChevronLeft className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                    )}
                </button>
            </div>
        </>
    );
};
