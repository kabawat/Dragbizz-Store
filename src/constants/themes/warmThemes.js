class Theme {
    constructor(name, description, lightColors, darkColors) {
        this.name = name;
        this.description = description;
        this.colors = {
            light: lightColors,
            dark: darkColors,
        };
    }
}

class WarmThemes {
    constructor() {
        this.default = new Theme(
            "Default",
            "Clean and professional",
            {
                primary: "#3b82f6",
                secondary: "#6b7280",
                background: "#ffffff",
                surface: "#f9fafb",
                text: "#111827",
                textSecondary: "#4b5563",
                border: "#e5e7eb",
            },
            {
                primary: "#3b82f6",
                secondary: "#6b7280",
                background: "#111827",
                surface: "#1f2937",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#374151",
            }
        );

        this.ocean = new Theme(
            "Ocean",
            "Calm and refreshing",
            {
                primary: "#0ea5e9",
                secondary: "#06b6d4",
                background: "#f0f9ff",
                surface: "#e0f2fe",
                text: "#075985",
                textSecondary: "#0c4a6e",
                border: "#bae6fd",
            },
            {
                primary: "#0ea5e9",
                secondary: "#06b6d4",
                background: "#111827",
                surface: "#1f2937",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#374151",
            }
        );

        this.forest = new Theme(
            "Forest",
            "Natural and organic",
            {
                primary: "#22c55e",
                secondary: "#10b981",
                background: "#f0fdf4",
                surface: "#dcfce7",
                text: "#14532d",
                textSecondary: "#166534",
                border: "#bbf7d0",
            },
            {
                primary: "#22c55e",
                secondary: "#10b981",
                background: "#111827",
                surface: "#1f2937",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#374151",
            }
        );

        this.sunset = new Theme(
            "Sunset",
            "Warm and vibrant",
            {
                primary: "#fb923c",
                secondary: "#f97316",
                background: "#fff7ed",
                surface: "#fed7aa",
                text: "#9a3412",
                textSecondary: "#c2410c",
                border: "#fdba74",
            },
            {
                primary: "#fb923c",
                secondary: "#f97316",
                background: "#111827",
                surface: "#1f2937",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#374151",
            }
        );

        this.rose = new Theme(
            "Rose",
            "Soft and elegant",
            {
                primary: "#f43f5e",
                secondary: "#fb7185",
                background: "#fff1f2",
                surface: "#ffe4e6",
                text: "#881337",
                textSecondary: "#be123c",
                border: "#fecdd3",
            },
            {
                primary: "#f43f5e",
                secondary: "#fb7185",
                background: "#111827",
                surface: "#1f2937",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#374151",
            }
        );
    }
}

export default new WarmThemes();
