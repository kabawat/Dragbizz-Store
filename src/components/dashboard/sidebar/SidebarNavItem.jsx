"use client";
import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleExpandedMenu } from "@/store/slices/uiSlice";

export const SidebarNavItem = ({
    item,
    isCollapsed,
    onMouseEnterItem,
    onMouseLeaveItem,
    isBottomItem = false,
}) => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const expandedMenus = useAppSelector((state) => state.ui.expandedMenus);

    const handleToggleSubMenu = (item, e) => {
        e?.preventDefault();
        e?.stopPropagation();
        dispatch(toggleExpandedMenu(item.key));
    };
    const Icon = item.icon;

    if (item.hasSubMenu && item.key) {
        const isExpanded = expandedMenus[item.key];
        const isChildActive = isCollapsed && item.subMenuItems?.some(
            (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
        );

        return (
            <div
                className="relative"
                onMouseEnter={(e) => onMouseEnterItem(item, e, isBottomItem)}
                onMouseLeave={onMouseLeaveItem}
            >
                <div
                    onClick={(e) => !isCollapsed && handleToggleSubMenu(item, e)}
                    className={`w-full group flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-2"
                        } py-2 cursor-pointer rounded-lg transition-colors text-[rgb(var(--color-text-secondary))] ${isChildActive
                            ? "bg-[rgb(var(--color-primary))]/10"
                            : "hover:bg-[rgb(var(--color-bg-secondary))]"
                        } ${isExpanded && !isCollapsed ? "bg-[rgb(var(--color-bg-secondary))]" : ""}`}
                    title={isCollapsed ? item.name : ""}
                >
                    {!isCollapsed ? (
                        <div className="flex items-center space-x-3 text-[rgb(var(--color-text-secondary))]">
                            <Icon className={`w-4 h-4 transition-colors ${isExpanded ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`} />
                            <span className={`font-semibold tracking-wide uppercase text-xs transition-colors ${isExpanded ? "text-[rgb(var(--color-primary))]" : ""}`}>
                                {item.name}
                            </span>
                        </div>
                    ) : (
                        <Icon className={`w-[18px] h-[18px] transition-colors ${isChildActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`} />
                    )}

                    {!isCollapsed && (
                        <ChevronDown className={`w-4 h-4 text-[rgb(var(--color-text-tertiary))] transition-all duration-200 ${isExpanded ? "rotate-180 opacity-100 text-[rgb(var(--color-primary))]" : "opacity-50 group-hover:opacity-100"}`} />
                    )}
                </div>

                {/* Sub-menu (expanded sidebar) */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && !isCollapsed ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="ml-6 space-y-1">
                        {item.subMenuItems &&
                            item.subMenuItems.map((subItem) => {
                                const SubIcon = subItem.icon;
                                const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                                return (
                                    <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        className={`group relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${isSubActive
                                            ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-l-2 border-[rgb(var(--color-primary))]"
                                            : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                            }`}
                                        title={subItem.shortcut ? `Alt+${subItem.shortcut.toUpperCase()}` : ""}
                                    >
                                        <SubIcon className={`w-4 h-4 ${isSubActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`} />
                                        <span className="text-sm font-medium flex-1">{subItem.name}</span>
                                        {subItem.shortcut && (
                                            <kbd className="absolute right-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200 text-[9px] px-1 py-px rounded border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-tertiary))] font-mono pointer-events-none bg-[rgb(var(--color-bg-secondary))] shadow-sm">
                                                ⌥{subItem.shortcut === "," ? "," : subItem.shortcut.toUpperCase()}
                                            </kbd>
                                        )}
                                    </Link>
                                );
                            })}
                    </div>
                </div>
            </div>
        );
    }

    // Simple menu item without submenu
    const isActive = pathname === item.href;
    const bottomSpecificClasses = isBottomItem
        ? `px-2 py-2 ${isCollapsed ? "justify-center" : "space-x-3"}`
        : `py-1.5 ${isCollapsed ? "justify-center px-0" : "space-x-2 px-2"} ${isActive && !isBottomItem ? "border-r-2 border-[rgb(var(--color-primary))]" : ""
        }`;

    const iconClasses = isBottomItem
        ? `${isCollapsed ? "w-[24px] h-[24px]" : "w-5 h-5"} text-[rgb(var(--color-text-tertiary))]`
        : `${isCollapsed ? "w-[18px] h-[18px]" : "w-4 h-4"} ${isActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"
        }`;

    return (
        <div
            onMouseEnter={(e) => onMouseEnterItem(item, e, isBottomItem)}
            onMouseLeave={onMouseLeaveItem}
        >
            <Link
                href={item.href}
                className={`w-full flex items-center rounded-lg transition-all duration-300 cursor-pointer ${bottomSpecificClasses} ${isActive
                    ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                    : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                    }`}
                title={isCollapsed && item.shortcut ? `${item.name}  ⌥${item.shortcut.toUpperCase()}` : isCollapsed ? item.name : ""}
            >
                <Icon className={`transition-all duration-300 ${iconClasses}`} />
                {!isCollapsed && (
                    <span className={`font-medium ${isBottomItem ? "" : "text-sm"}`}>{item.name}</span>
                )}
            </Link>
        </div>
    );
};
