"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { redirectToMainDomain } from "@/utils/helper/domain";
import styles from "./style.module.scss";

// Icons
const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const ArrowIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);

// Particle animations
const Particles = ({ isQuota }) => {
    const dots = Array.from({ length: 18 });
    return (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", borderRadius: "inherit" }}>
            {dots.map((_, i) => {
                const size = 3 + Math.random() * 4;
                const x = Math.random() * 100;
                const delay = Math.random() * 4;
                const dur = 4 + Math.random() * 4;
                const color = `rgba(var(--color-primary-rgb, 99, 102, 241), ${0.3 + Math.random() * 0.4})`;
                return (
                    <span
                        key={i}
                        style={{
                            position: "absolute",
                            bottom: "-8px",
                            left: `${x}%`,
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            background: color,
                            opacity: 0,
                            animation: `floatUp ${dur}s ${delay}s infinite ease-in`,
                        }}
                    />
                );
            })}
        </div>
    );
};

// Upgrade Modal Component
const SubscriptionUpgradeModal = ({
    isOpen,
    onClose,
    message,
    type = "UPGRADE",
}) => {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const isQuota = type === "QUOTA";
    const isInfo = type === "INFO";

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            setMounted(true);
            window.addEventListener("keydown", handleEscape);
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        } else {
            setVisible(false);
            window.removeEventListener("keydown", handleEscape);
            const t = setTimeout(() => setMounted(false), 350);
            return () => clearTimeout(t);
        }
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    if (!mounted) return null;

    // Solid background based on theme
    const gradientBg = "rgb(var(--color-bg-primary))";
    const primaryColor = "rgb(var(--color-primary))";

    return (
        <div
            className={styles.sumOverlay}
            style={{ opacity: visible ? 1 : 0 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={styles.sumCard}
                role="dialog"
                aria-modal="true"
                aria-labelledby="upgrade-modal-title"
                style={{
                    background: gradientBg,
                    border: `1px solid rgb(var(--color-border-primary))`,
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 32px 64px rgba(0,0,0,0.15)`,
                    transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
                }}
            >
                {/* Particles */}
                {!isInfo && <Particles isQuota={isQuota} />}

                {/* Noise texture overlay */}
                <div style={{
                    position: "absolute", inset: 0, borderRadius: "inherit",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    opacity: 0.03, pointerEvents: "none", zIndex: 0,
                }} />

                <div className={styles.sumCardInner}>
                    {/* Close */}
                    <button className={styles.sumClose} onClick={onClose} aria-label="Close">
                        <XIcon />
                    </button>

                    {/* Badge */}
                    <div
                        className={styles.sumBadge}
                        style={{ background: isInfo ? `rgba(var(--color-warning-rgb, 245, 158, 11), 0.1)` : `rgba(var(--color-primary-rgb, 99, 102, 241), 0.1)`, border: isInfo ? `1px solid rgba(var(--color-warning-rgb, 245, 158, 11), 0.2)` : `1px solid rgba(var(--color-primary-rgb, 99, 102, 241), 0.2)` }}
                    >
                        <div className={styles.sumBadgeRing} style={{ borderColor: isInfo ? "rgb(var(--color-warning))" : primaryColor }} />
                        <span style={{ fontSize: "2rem" }} role="img" aria-hidden="true">{isQuota ? "⚡" : isInfo ? "ℹ️" : "✦"}</span>
                    </div>

                    {/* Heading */}
                    <h3 className={styles.sumTitle} id="upgrade-modal-title">
                        {isQuota ? "You've hit the limit" : isInfo ? "Access Restricted" : "Unlock the full power"}
                    </h3>

                    <p className={styles.sumDesc}>
                        {message || (isQuota
                            ? "You've used up your quota for this period. Upgrade now to continue without interruptions."
                            : isInfo
                                ? "This feature is restricted in the current plan."
                                : "Premium features are waiting for you. Upgrade your plan and get access to everything."
                        )}
                    </p>

                    {/* Feature chips */}
                    {!isQuota && !isInfo && (
                        <div className={`${styles.sumFeatures} w-full`}>
                            {[["∞", "Unlimited usage"], ["⚡", "Priority speed"], ["🔒", "Advanced access"]].map(([icon, label]) => (
                                <div className={styles.sumFeat} key={label}>
                                    <div className={styles.sumFeatIcon}>{icon}</div>
                                    {label}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.sumDivider} />

                    {/* CTA */}
                    {isInfo ? (
                        <button
                            className={styles.sumBtnPrimary}
                            onClick={onClose}
                        >
                            Got it
                        </button>
                    ) : (
                        <button
                            className={styles.sumBtnPrimary}
                            onClick={() => {
                                onClose();
                                redirectToMainDomain("/pricing");
                            }}
                        >
                            {isQuota ? "Upgrade & Continue" : "Upgrade My Plan"}
                            <span className={styles.sumArrow}><ArrowIcon /></span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionUpgradeModal;
