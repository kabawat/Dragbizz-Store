"use client";
import { useRouter } from "next/navigation";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { buildSidebarShortcutHandlers } from "@/utils/sidebarShortcuts";

// Mounted with the sidebar, inside the authenticated subscription provider.
const GlobalHotkeys = ({
  navigationItems = [],
  bottomItems = [],
  onNavigate,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const navigation = buildSidebarShortcutHandlers(
    [...navigationItems, ...bottomItems],
    onNavigate
  );
  useHotkeys({
    ...navigation,
    "alt+\\": (event) => {
      event.preventDefault();
      dispatch(toggleSidebar());
    },
    "shift+backspace": (event) => {
      event.preventDefault();
      router.back();
    },
    "shift+?": (event) => {
      event.preventDefault();
      router.push("/dashboard/support");
    },
  });
  return null;
};
export default GlobalHotkeys;
