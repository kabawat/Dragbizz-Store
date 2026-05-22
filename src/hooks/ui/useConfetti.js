import { useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export const useConfetti = () => {
    const { themeConfig } = useTheme();

    const triggerConfetti = useCallback(async (customOptions = {}) => {
        if (typeof window === "undefined") return;

        // Check for reduced motion preference
        const prefersReducedMotion =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Rainbow palette building off theme defaults
        const RAINBOW = [
            themeConfig?.primary || "#4f46e5",
            themeConfig?.secondary || "#10b981",
            "#facc15",
            "#22c55e",
            "#3b82f6",
            "#8b5cf6",
            "#ec4899",
        ];

        try {
            const confettiLib = (await import("canvas-confetti")).default;

            // Handle reduced motion if the custom options don't explicitly disable it
            if (prefersReducedMotion) {
                if (customOptions.disableForReducedMotion) return;

                confettiLib({
                    particleCount: 60,
                    spread: 80,
                    origin: { x: 0.5, y: 0.2 },
                    colors: customOptions.colors || RAINBOW,
                    startVelocity: 25,
                    gravity: 0.8,
                    ticks: 300,
                    ...customOptions, // allow override
                });
                return;
            }

            // Default burst behavior
            confettiLib({
                particleCount: 80,
                spread: 120,
                origin: { x: 0.5, y: 0.3 },
                colors: customOptions.colors || RAINBOW,
                startVelocity: 30,
                gravity: 1,
                ticks: 400,
                scalar: 1,
                shapes: ["square", "circle"],
                ...customOptions,
            });
        } catch (error) {
            console.error("Confetti error:", error);
        }
    }, [themeConfig]);

    return { triggerConfetti };
};
