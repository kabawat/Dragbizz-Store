import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
    unreadCount: 0,
};

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
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
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
