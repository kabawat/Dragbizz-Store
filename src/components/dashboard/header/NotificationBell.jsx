"use client";
import { NotificationBell as SharedNotificationBell } from "@dragorbit/ui/app";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocketContext } from "@/contexts/SocketContext";
import { useIncomingNotification } from "@/hooks/notifications/useIncomingNotification";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  markAllAsRead as dispatchMarkAllAsRead,
  markAsRead,
} from "@/store/slices/notificationsSlice";
import { getNotificationConfig } from "@/utils/notification";

const NotificationBell = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { socketService } = useSocketContext();
  const { handleIncomingNotification } = useIncomingNotification();

  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  useEffect(() => {
    if (!socketService) return;

    const handleRealtimeNotification = (data) => {
      handleIncomingNotification({
        message: data.message || "New activity detected",
        type: data.type,
        data,
      });
    };

    socketService.on("customer_created", handleRealtimeNotification);
    socketService.on("sales_order_created", handleRealtimeNotification);

    return () => {
      socketService.off("customer_created", handleRealtimeNotification);
      socketService.off("sales_order_created", handleRealtimeNotification);
    };
  }, [socketService, handleIncomingNotification]);
  const markAllAsRead = () => dispatch(dispatchMarkAllAsRead());
  const handleNotificationClick = (notification) => {
    dispatch(markAsRead(notification.id));
    const config = getNotificationConfig(
      notification.type,
      notification.data || {}
    );
    if (config.url && config.url !== "#") router.push(config.url);
  };
  return (
    <SharedNotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      t={t}
      getAppearance={(notification) =>
        getNotificationConfig(notification.type, notification.data || {})
      }
      onNotificationClick={handleNotificationClick}
      onMarkAllRead={markAllAsRead}
    />
  );
};
export default NotificationBell;
