"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const SidebarFlyout = ({
    hoveredItem,
    onMouseEnter,
    onMouseLeave,
    onClose,
}) => {
    const pathname = usePathname();

    if (!hoveredItem) return null;

    return (
        <div
            className="fixed z-[200] w-auto whitespace-nowrap bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl shadow-xl overflow-hidden"
            style={{
                ...(hoveredItem.anchorBottom !== null
                    ? { bottom: hoveredItem.anchorBottom } // bottom items → flyout opens upward
                    : { top: hoveredItem.rect.top }         // top items → flyout opens downward
                ),
                left: 72, // 64px sidebar width + 8px gap
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Flyout Header */}
            <div className="px-3 py-2.5 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]">
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">
                    {hoveredItem.item.name}
                </span>
            </div>

            {/* Flyout Links */}
            <div className="p-1.5 space-y-0.5">
                {hoveredItem.item.subMenuItems ? (
                    // Submenu items
                    hoveredItem.item.subMenuItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive =
                            pathname === subItem.href ||
                            pathname.startsWith(`${subItem.href}/`);
                        return (
                            <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={onClose}
                                className={`group relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 ${isSubActive
                                    ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                                    : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                    }`}
                            >
                                <SubIcon
                                    className={`w-4 h-4 flex-shrink-0 ${isSubActive
                                        ? "text-[rgb(var(--color-primary))]"
                                        : "text-[rgb(var(--color-text-tertiary))]"
                                        }`}
                                />
                                <span className="text-sm font-medium flex-1 pr-6">{subItem.name}</span>
                                {subItem.shortcut && (
                                    <kbd className="absolute right-2 text-[9px] px-1 py-px rounded border border-[rgb(var(--color-border-primary))]/60 text-[rgb(var(--color-text-tertiary))] font-mono opacity-0 group-hover:opacity-40 transition-opacity duration-200 delay-300 pointer-events-none">
                                        ⌥{subItem.shortcut === "," ? "," : subItem.shortcut.toUpperCase()}
                                    </kbd>
                                )}

                                {isSubActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                                )}
                            </Link>
                        );
                    })
                ) : (
                    // Simple item (e.g. Dashboard) — single link
                    <Link
                        href={hoveredItem.item.href}
                        onClick={onClose}
                        className={`group relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 ${pathname === hoveredItem.item.href
                            ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                            : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                            }`}
                    >
                        <span className="text-sm font-medium flex-1 pr-6">
                            {hoveredItem.item.name}
                        </span>
                        {hoveredItem.item.shortcut && (
                            <kbd className="absolute right-2 text-[9px] px-1 py-px rounded border border-[rgb(var(--color-border-primary))]/60 text-[rgb(var(--color-text-tertiary))] font-mono opacity-0 group-hover:opacity-40 transition-opacity duration-200 delay-300 pointer-events-none">
                                ⌥{hoveredItem.item.shortcut === "," ? "," : hoveredItem.item.shortcut.toUpperCase()}
                            </kbd>
                        )}
                        {pathname === hoveredItem.item.href && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                        )}
                    </Link>
                )}
            </div>
        </div>
    );
};
