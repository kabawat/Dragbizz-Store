"use client";
import { HeaderTitle as SharedHeaderTitle } from "@dragorbit/ui/header";
import { useTranslation } from "@/hooks/ui/useTranslation";

const HeaderTitle = ({ title, description }) => {
  const { t } = useTranslation();
  return (
    <SharedHeaderTitle
      title={title || t("dashboard.title")}
      description={description || t("dashboard.description")}
    />
  );
};
export default HeaderTitle;
