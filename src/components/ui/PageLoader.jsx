"use client";
import React from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const PageLoader = ({ text, className = "" }) => {
    const { t } = useTranslation();

    return (
        <div className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center ${className}`}>
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[rgb(var(--color-text-secondary))]">{text || t("common.loading")}</p>
            </div>
        </div>
    );
};

export default PageLoader;
