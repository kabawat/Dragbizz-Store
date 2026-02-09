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

class NeutralThemes {
    constructor() {
        this.sky = new Theme(
            "Sky",
            "Bright and airy",
            {
                primary: "#06b6d4",
                secondary: "#22d3ee",
                background: "#f0fdfa",
                surface: "#ccfbf1",
                text: "#164e63",
                textSecondary: "#155e75",
                border: "#7dd3fc",
            },
            {
                primary: "#06b6d4",
                secondary: "#22d3ee",
                background: "#111827",
                surface: "#1f2937",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#374151",
            }
        );

        this.cyan = new Theme(
            "Cyan",
            "Cool and modern",
            {
                primary: "#06b6d4",
                secondary: "#22d3ee",
                background: "#ecfeff",
                surface: "#cffafe",
                text: "#164e63",
                textSecondary: "#155e75",
                border: "#bae6fd",
            },
            {
                primary: "#06b6d4",
                secondary: "#22d3ee",
                background: "#111827",
                surface: "#1f2937",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#374151",
            }
        );

        this.slate = new Theme(
            "Slate",
            "Neutral and balanced",
            {
                primary: "#64748b",
                secondary: "#475569",
                background: "#f8fafc",
                surface: "#f1f5f9",
                text: "#0f172a",
                textSecondary: "#334155",
                border: "#e2e8f0",
            },
            {
                primary: "#64748b",
                secondary: "#475569",
                background: "#111827",
                surface: "#1f2937",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#374151",
            }
        );
    }
}

export default new NeutralThemes();
