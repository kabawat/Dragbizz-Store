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

class VibrantThemes {
    constructor() {
        this.amber = new Theme(
            "Amber",
            "Warm and friendly",
            {
                primary: "#f59e0b",
                secondary: "#fbbf24",
                background: "#fffbeb",
                surface: "#fef3c7",
                text: "#78350f",
                textSecondary: "#92400e",
                border: "#fde68a",
            },
            {
                primary: "#f59e0b",
                secondary: "#fbbf24",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );

        this.coral = new Theme(
            "Coral",
            "Vibrant and energetic",
            {
                primary: "#ef4444",
                secondary: "#f87171",
                background: "#fff1f2",
                surface: "#ffe4e6",
                text: "#991b1b",
                textSecondary: "#b91c1c",
                border: "#fecdd3",
            },
            {
                primary: "#ef4444",
                secondary: "#f87171",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );

        this.pink = new Theme(
            "Pink",
            "Soft and feminine",
            {
                primary: "#ec4899",
                secondary: "#f472b6",
                background: "#fdf2f8",
                surface: "#fce7f3",
                text: "#9f1239",
                textSecondary: "#be185d",
                border: "#fbcfe8",
            },
            {
                primary: "#ec4899",
                secondary: "#f472b6",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );
    }
}

export default new VibrantThemes();
