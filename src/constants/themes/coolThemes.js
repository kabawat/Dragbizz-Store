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

class CoolThemes {
    constructor() {
        this.violet = new Theme(
            "Violet",
            "Bold and modern",
            {
                primary: "#8b5cf6",
                secondary: "#7c3aed",
                background: "#f5f3ff",
                surface: "#ede9fe",
                text: "#4c1d95",
                textSecondary: "#6d28d9",
                border: "#ddd6fe",
            },
            {
                primary: "#8b5cf6",
                secondary: "#7c3aed",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );

        this.indigo = new Theme(
            "Indigo",
            "Trustworthy and calm",
            {
                primary: "#6366f1",
                secondary: "#4f46e5",
                background: "#eef2ff",
                surface: "#e0e7ff",
                text: "#312e81",
                textSecondary: "#4338ca",
                border: "#c7d2fe",
            },
            {
                primary: "#6366f1",
                secondary: "#4f46e5",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );

        this.purple = new Theme(
            "Purple",
            "Royal and luxurious",
            {
                primary: "#a855f7",
                secondary: "#c084fc",
                background: "#faf5ff",
                surface: "#f3e8ff",
                text: "#581c87",
                textSecondary: "#6b21a8",
                border: "#e9d5ff",
            },
            {
                primary: "#a855f7",
                secondary: "#c084fc",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );

        this.blue = new Theme(
            "Blue",
            "Classic and trustworthy",
            {
                primary: "#2563eb",
                secondary: "#3b82f6",
                background: "#eff6ff",
                surface: "#dbeafe",
                text: "#1e3a8a",
                textSecondary: "#1e40af",
                border: "#bfdbfe",
            },
            {
                primary: "#2563eb",
                secondary: "#3b82f6",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );
    }
}

export default new CoolThemes();
