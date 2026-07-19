"use client";
import { useTranslation } from "@/hooks/ui/useTranslation";

const HeaderTitle = ({ title, description }) => {
  const { t } = useTranslation();

  return (
    <div className="min-w-0 py-0.5">
      <h1 className="truncate text-lg font-semibold leading-6 text-[rgb(var(--color-text-primary))]">
        {title || t("dashboard.title")}
      </h1>
      <p className="mt-0.5 truncate text-sm leading-5 text-[rgb(var(--color-text-secondary))]">
        {description || t("dashboard.description")}
      </p>
    </div>
  );
};

export default HeaderTitle;
