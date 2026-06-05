import { useEffect } from "react";
import socketService from "@/service/socket/socket.service";

// Custom hook to listen to socket events.
export const useSocket = (event, callback, dependencies = []) => {
    useEffect(() => {
        if (!event || !callback) return;

        // Register the listener
        socketService.on(event, callback);

        return () => {
            // Cleanup on unmount
            socketService.off(event, callback);
        };
    }, [event, callback, ...dependencies]);

    return socketService;
};
