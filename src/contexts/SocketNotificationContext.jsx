"use client";
import { createContext, useContext, useState, useCallback } from "react";
import SocketNotification from "@/components/ui/SocketNotification";

const SocketNotificationContext = createContext(null);

export const SocketNotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((data) => {
        setNotification(data);
    }, []);

    const closeNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return (
        <SocketNotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <SocketNotification
                    data={notification}
                    onClose={closeNotification}
                />
            )}
        </SocketNotificationContext.Provider>
    );
};

export const useSocketNotification = () => {
    const context = useContext(SocketNotificationContext);
    if (!context) {
        throw new Error("useSocketNotification must be used within a SocketNotificationProvider");
    }
    return context;
};
