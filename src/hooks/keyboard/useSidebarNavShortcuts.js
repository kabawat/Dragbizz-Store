import { buildSidebarShortcutHandlers } from "@/utils/sidebarShortcuts";
import { useHotkeys } from "./useHotkeys";

export const useSidebarNavShortcuts = (items = [], onNavigate) => {
  useHotkeys(onNavigate ? buildSidebarShortcutHandlers(items, onNavigate) : {});
};
