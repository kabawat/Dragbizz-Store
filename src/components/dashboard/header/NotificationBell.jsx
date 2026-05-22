"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, Check, MoreVertical, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useSocketContext } from "@/contexts/SocketContext";
import { useSocketNotification } from "@/contexts/SocketNotificationContext";
import { getNotificationConfig } from "@/utils/notification";
import {
    addNotification,
    markAsRead,
    markAllAsRead as dispatchMarkAllAsRead
} from "@/store/slices/notificationsSlice";

const NotificationBell = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch();
    const { socketService } = useSocketContext();
    const { showNotification } = useSocketNotification();

    const notifications = useSelector((state) => state.notifications.notifications);
    const unreadCount = useSelector((state) => state.notifications.unreadCount);

    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const notificationDropdownRef = useRef(null);

    const [shouldAnimateBell, setShouldAnimateBell] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationDropdownRef.current &&
                !notificationDropdownRef.current.contains(event.target)
            ) {
                setIsNotificationDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!socketService) return;

        const handleRealtimeNotification = (data) => {
            

            const notificationPayload = {
                message: data.message || "New activity detected",
                type: data.type,
                data: data // store full data for config
            };

            dispatch(addNotification(notificationPayload));
            showNotification(data);

            // Trigger bell animation
            setShouldAnimateBell(true);
            setTimeout(() => setShouldAnimateBell(false), 1000);
        };

        socketService.on("customer_created", handleRealtimeNotification);
        socketService.on("sales_order_created", handleRealtimeNotification);

        return () => {
            socketService.off("customer_created", handleRealtimeNotification);
            socketService.off("sales_order_created", handleRealtimeNotification);
        };
    }, [socketService, t, showNotification]);

    const markAllAsRead = () => {
        dispatch(dispatchMarkAllAsRead());
    };

    const handleNotificationClick = (notification) => {
        // Mark as read in Redux
        dispatch(markAsRead(notification.id));

        // Get config and navigate
        
        const config = getNotificationConfig(notification.type, notification.data || {});
        

        if (config.url && config.url !== "#") {
            setTimeout(() => {
                router.push(config.url);
                setIsNotificationDropdownOpen(false);
            }, 50);
        }
    };


    return (
        <div className="relative" ref={notificationDropdownRef}>
            <button
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group ${isNotificationDropdownOpen
                    ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                    : "bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                    }`}
            >
                <Bell className={`w-[18px] h-[18px] transition-all duration-300 ${isNotificationDropdownOpen ? "scale-110" : "group-hover:rotate-12"} ${shouldAnimateBell ? "animate-[ring_0.5s_ease-in-out_infinite]" : ""}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[rgb(var(--color-danger))] text-white text-[10px] font-bold rounded-full border-2 border-[rgb(var(--color-bg-primary))] flex items-center justify-center animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-96 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]/50 rounded-xl shadow-sm overflow-hidden z-[9999] origin-top-right transition-all duration-300 animate-in fade-in zoom-in-95">
                    {/* Header */}
                    <div className="p-4 border-b border-[rgb(var(--color-border-primary))]/50 flex items-center justify-between bg-gradient-to-r from-[rgb(var(--color-bg-secondary))]/50 to-transparent">
                        <div>
                            <h3 className="font-bold text-sm text-[rgb(var(--color-text-primary))]">
                                {t("notifications.title") || "Notifications"}
                            </h3>
                            <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] mt-0.5">
                                You have {unreadCount} unread messages
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={markAllAsRead}
                                className="p-1.5 hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] rounded-lg transition-colors title='Mark all as read'"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-tertiary))] rounded-lg transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-[350px] overflow-y-auto scrollbar-hide py-1">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => {
                                const config = getNotificationConfig(notification.type, notification.data || {});
                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`group relative px-4 py-3 flex gap-3 transition-all duration-200 hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer ${notification.unread ? "bg-[rgb(var(--color-primary))]/5" : ""}`}
                                    >
                                        {/* Status Line */}
                                        {notification.unread && (
                                            <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-[rgb(var(--color-primary))] rounded-r-full" />
                                        )}

                                        {/* Icon Container */}
                                        <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${notification.unread
                                            ? "bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]/50"
                                            : "bg-[rgb(var(--color-bg-tertiary))]"
                                            }`}>
                                            {config.icon}
                                        </div>

                                        {/* Text Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[13px] leading-snug ${notification.unread
                                                ? "font-semibold text-[rgb(var(--color-text-primary))]"
                                                : "text-[rgb(var(--color-text-secondary))]"
                                                }`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-medium uppercase tracking-wider">
                                                    {notification.time}
                                                </span>
                                                {notification.unread && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))] animate-pulse" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-12 px-4 text-center">
                                <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell className="w-6 h-6 text-[rgb(var(--color-text-tertiary))]" />
                                </div>
                                <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                                    {t("notifications.noNotifications") || "No notifications yet"}
                                </p>
                                <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1">
                                    We'll notify you when something happens
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-[rgb(var(--color-border-primary))]/50">
                        <button className="w-full py-2 text-xs font-medium text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 transition-colors">
                            {t("notifications.viewAll") || "View all notifications"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
