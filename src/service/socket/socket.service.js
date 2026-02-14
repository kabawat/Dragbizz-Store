// src/service/socket/socket.service.js
import { io } from "socket.io-client";
import { API_CONFIG, SECRET } from "@/config";

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
    }

    // Initialize connection
    connect() {
        if (this.socket) return this.socket;

        const socketUrl = "/";
        const socketPath = `${API_CONFIG.UTILITY.SOCKET}`;

        this.socket = io(socketUrl, {
            path: socketPath,
            transports: ["websocket", "polling"],
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.setupBaseListeners();
        return this.socket;
    }

    setupBaseListeners() {
        if (!this.socket) return;

        this.socket.on("connect", () => {
            console.log("🟢 Socket Connected:", this.socket.id);
            this.isConnected = true;
            this.processPendingListeners();
        });

        this.socket.on("disconnect", (reason) => {
            console.warn("🔴 Socket Disconnected:", reason);
            this.isConnected = false;
        });

        this.socket.on("connect_error", (error) => {
            console.error("⚠️ Socket Connection Error:", error.message);
            this.isConnected = false;
        });

        // Listen for Customer Created Notification
        this.socket.on("customer_created", (data) => {
            console.log("🔔 [Real-time] Customer Created Notification:", data);
        });

        // Listen for Sales Order Created Notification
        this.socket.on("sales_order_created", (data) => {
            console.log("🔔 [Real-time] Sales Order Created Notification:", data);
        });
    }

    // Add event listener
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        } else {
            // Queue listener if socket not initialized
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        }
    }

    // Remove event listener
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
        // Also remove from pending listeners
        if (this.listeners.has(event)) {
            const interactions = this.listeners.get(event);
            const filtered = interactions.filter(cb => cb !== callback);
            if (filtered.length > 0) {
                this.listeners.set(event, filtered);
            } else {
                this.listeners.delete(event);
            }
        }
    }

    // Emit event
    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn(`Cannot emit '${event}': Socket not connected`);
        }
    }

    // Process any listeners added before connection
    processPendingListeners() {
        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach((callback) => {
                this.socket.on(event, callback);
            });
        });
        this.listeners.clear();
    }

    // Disconnect manually
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.listeners.clear();
        }
    }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;
