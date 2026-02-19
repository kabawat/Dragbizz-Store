"use client";
import { useTranslation } from "@/hooks/ui/useTranslation";

const HeaderTitle = ({ title, description }) => {
    const { t } = useTranslation();

    return (
        <div>
            <h1 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-0.5">
                {title || t("dashboard.title")}
            </h1>
            <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                {description || t("dashboard.description")}
            </div>
        </div>
    );
};

export default HeaderTitle;
