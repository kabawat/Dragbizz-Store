import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
    unreadCount: 0,
    currentStoreId: null,
};

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setStoreNotifications: (state, action) => {
            const { storeId, items = [] } = action.payload || {};
            const mapped = items.map(item => ({
                id: item.id || item._id,
                title: item.title || "",
                message: item.message || "",
                type: item.notificationType || item.type || "SYSTEM",
                severity: item.severity || "info",
                unread: !item.read,
                time: item.createdAt || "Recently",
                data: item.data || {},
                storeId,
            }));

            if (state.currentStoreId !== storeId) {
                // Switching stores: clear old store notifications and initialize
                state.currentStoreId = storeId;
                state.notifications = mapped;
            } else {
                // Merge without duplicates
                const existingIds = new Set(state.notifications.map(n => n.id));
                const newItems = mapped.filter(n => !existingIds.has(n.id));
                state.notifications = [...newItems, ...state.notifications];
            }
            state.unreadCount = state.notifications.filter(n => n.unread).length;
        },
        addNotification: (state, action) => {
            const newNotification = {
                id: Date.now(),
                unread: true,
                time: "Just now",
                ...action.payload,
            };
            const exists = state.notifications.some(n => n.id === newNotification.id);
            if (!exists) {
                state.notifications = [newNotification, ...state.notifications];
                state.unreadCount = state.notifications.filter(n => n.unread).length;
            }
        },
        markAsRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && notification.unread) {
                notification.unread = false;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => {
                n.unread = false;
            });
            state.unreadCount = 0;
        },
        removeNotification: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && notification.unread) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearAll: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        }
    },
});

export const {
    setStoreNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
