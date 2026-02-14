"use client";
import { createContext, useContext, useEffect, useState } from "react";
import socketService from "@/service/socket/socket.service";
import { useAppSelector } from "@/store/hooks";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Get authentication status from Redux
    const { isAuthenticated } = useAppSelector((state) => state.profile);

    useEffect(() => {
        // Only connect if authenticated
        if (!isAuthenticated) {
            if (socketService.socket) {
                socketService.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Initialize socket connection
        const socketInstance = socketService.connect();
        setSocket(socketInstance);

        // Connection status handlers
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        // Check if already connected
        if (socketInstance.connected) {
            setIsConnected(true);
        }

        socketService.on("connect", onConnect);
        socketService.on("disconnect", onDisconnect);

        return () => {
            // Cleanup listeners on unmount
            socketService.off("connect", onConnect);
            socketService.off("disconnect", onDisconnect);
        };
    }, [isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, socketService }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext must be used within a SocketProvider");
    }
    return context;
};
