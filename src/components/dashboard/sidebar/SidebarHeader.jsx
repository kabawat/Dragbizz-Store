"use client";
import { SidebarHeader as SharedSidebarHeader } from "@dragorbit/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
export const SidebarHeader = ({
  isCollapsed: collapsedOverride,
  onToggle,
  mode,
  locked,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { agency } = useAppSelector((state) => state.profile);
  const isCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);
  return (
    <SharedSidebarHeader
      title={agency?.agencyName || t("common.retailManager")}
      isCollapsed={collapsedOverride ?? isCollapsed}
      onToggle={onToggle ?? (() => dispatch(toggleSidebar()))}
      toggleMode={mode === "hover" ? "lock" : "collapse"}
      locked={locked}
      lockLabel={t("sidebar.lockExpanded")}
      unlockLabel={t("sidebar.unlockSidebar")}
      expandLabel={t("sidebar.expandSidebar")}
      collapseLabel={t("sidebar.collapseSidebar")}
    />
  );
};
