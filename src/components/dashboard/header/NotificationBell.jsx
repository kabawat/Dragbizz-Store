"use client";
import { NotificationBell as SharedNotificationBell } from "@dragorbit/ui/app";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocketContext } from "@/contexts/SocketContext";
import { useIncomingNotification } from "@/hooks/notifications/useIncomingNotification";
import { useSelectedStoreId } from "@/hooks/store/useSelectedStoreId";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { aiNotificationService } from "@/service/ai";
import {
  markAllAsRead as dispatchMarkAllAsRead,
  markAsRead,
  setStoreNotifications,
} from "@/store/slices/notificationsSlice";
import { getNotificationConfig } from "@/utils/notification";

const NotificationBell = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { socketService } = useSocketContext();
  const { handleIncomingNotification } = useIncomingNotification();
  const { storeId, ready } = useSelectedStoreId();

  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  // Fetch persisted AI alerts and briefings whenever active store is ready
  useEffect(() => {
    if (!ready || !storeId) return;

    let isMounted = true;
    const fetchStoredNotifications = async () => {
      try {
        const res = await aiNotificationService.listNotifications({ storeId });
        if (isMounted && res?.data?.items) {
          dispatch(
            setStoreNotifications({
              storeId,
              items: res.data.items,
            })
          );
        }
      } catch (err) {
        // Non-blocking for UI resilience
      }
    };

    fetchStoredNotifications();

    return () => {
      isMounted = false;
    };
  }, [ready, storeId, dispatch]);

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
    socketService.on("payment_received", handleRealtimeNotification);
    socketService.on("PAYMENT_RECEIVED", handleRealtimeNotification);

    return () => {
      socketService.off("customer_created", handleRealtimeNotification);
      socketService.off("sales_order_created", handleRealtimeNotification);
      socketService.off("payment_received", handleRealtimeNotification);
      socketService.off("PAYMENT_RECEIVED", handleRealtimeNotification);
    };
  }, [socketService, handleIncomingNotification]);

  const markAllAsRead = () => dispatch(dispatchMarkAllAsRead());

  const handleNotificationClick = (notification) => {
    dispatch(markAsRead(notification.id));
    if (storeId && notification.id) {
      aiNotificationService.markAsRead({
        notificationId: notification.id,
        storeId,
      }).catch(() => { });
    }
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
