import { useRouter } from "next/navigation";
import { useHotkeys } from "./useHotkeys";

// Registers Alt+key navigation shortcuts for sidebar routes.
export const useSidebarNavShortcuts = (allItems = []) => {
    const router = useRouter();

    // Build keyMap: { "alt+c": handler, "alt+i": handler, ... }
    const keyMap = allItems.reduce((acc, item) => {
        if (item?.shortcut && item?.href) {
            const combo = `alt+${item.shortcut}`;
            acc[combo] = (e) => {
                e.preventDefault();
                router.push(item.href);
            };
        }
        return acc;
    }, {});

    useHotkeys(keyMap);
};
