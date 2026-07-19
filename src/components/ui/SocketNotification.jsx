"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getNotificationConfig } from "@/utils/notification";

const SocketNotification = ({ data, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();
    const timerRef = useRef(null);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            handleClose();
        }, 6000);
    }, [handleClose]);

    const stopTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    useEffect(() => {
        const appearTimer = setTimeout(() => setIsVisible(true), 100);
        startTimer();

        return () => {
            clearTimeout(appearTimer);
            stopTimer();
        };
    }, [startTimer, stopTimer]);


    const config = getNotificationConfig(data.type, data);

    const handleClick = () => {
        if (config.url && config.url !== "#") {
            router.push(config.url);
            setTimeout(handleClose, 100);
        } else {
            handleClose();
        }
    };

    return (
        <div
            onMouseEnter={stopTimer}
            onMouseLeave={startTimer}
            className={`fixed top-15 right-4 z-[10001] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
        >
            <div
                onClick={handleClick}
                className="group relative overflow-hidden bg-[rgb(var(--color-bg-primary))]/90 backdrop-blur-xl shadow-sm border border-[rgb(var(--color-border-primary))]/50 rounded-xl  p-5 cursor-pointer active:scale-[0.97] transition-all max-w-[360px] w-full flex items-start gap-4"
            >
                {/* Animated background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative w-12 h-12 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center flex-shrink-0 group-hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors">
                    {config.icon}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[rgb(var(--color-bg-primary))] animate-pulse" />
                </div>

                <div className="relative flex-1">
                    <div className="flex justify-between items-center">
                        <span className="text-[0.625rem] font-bold text-[rgb(var(--color-primary))] uppercase tracking-[0.2em]">
                            New Activity
                        </span>
                    </div>
                    <p className="text-[0.8125rem] font-semibold text-[rgb(var(--color-text-primary))] mt-1 leading-snug">
                        {data.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                        <span className="text-[0.6875rem] text-[rgb(var(--color-text-tertiary))] font-medium group-hover:text-[rgb(var(--color-primary))] transition-colors">
                            Tap to view details
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[rgb(var(--color-text-tertiary))] opacity-30" />
                        <span className="text-[0.6875rem] text-[rgb(var(--color-text-tertiary))] font-medium">
                            Just now
                        </span>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className="relative text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10 p-1 rounded-lg transition-all"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default SocketNotification;
