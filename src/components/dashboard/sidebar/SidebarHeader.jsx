"use client";
import { SidebarHeader as SharedSidebarHeader } from "@dragorbit/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
export const SidebarHeader = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { agency } = useAppSelector((state) => state.profile);
  const isCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);
  return (
    <SharedSidebarHeader
      title={agency?.agencyName || t("common.retailManager")}
      isCollapsed={isCollapsed}
      onToggle={() => dispatch(toggleSidebar())}
      expandLabel={t("sidebar.expandSidebar")}
      collapseLabel={t("sidebar.collapseSidebar")}
    />
  );
};
