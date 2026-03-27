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

class GreenThemes {
    constructor() {
        this.emerald = new Theme(
            "Emerald",
            "Fresh and natural",
            {
                primary: "#10b981",
                secondary: "#34d399",
                background: "#ecfdf5",
                surface: "#d1fae5",
                text: "#065f46",
                textSecondary: "#047857",
                border: "#a7f3d0",
            },
            {
                primary: "#10b981",
                secondary: "#34d399",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );

        this.green = new Theme(
            "Green",
            "Calm and peaceful",
            {
                primary: "#16a34a",
                secondary: "#22c55e",
                background: "#f0fdf4",
                surface: "#dcfce7",
                text: "#14532d",
                textSecondary: "#166534",
                border: "#bbf7d0",
            },
            {
                primary: "#16a34a",
                secondary: "#22c55e",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );

        this.teal = new Theme(
            "Teal",
            "Fresh and crisp",
            {
                primary: "#14b8a6",
                secondary: "#0f766e",
                background: "#f0fdfa",
                surface: "#ccfbf1",
                text: "#134e4a",
                textSecondary: "#115e59",
                border: "#99f6e4",
            },
            {
                primary: "#14b8a6",
                secondary: "#0f766e",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );

        this.lime = new Theme(
            "Lime",
            "Fresh and zesty",
            {
                primary: "#84cc16",
                secondary: "#a3e635",
                background: "#f7fee7",
                surface: "#ecfccb",
                text: "#365314",
                textSecondary: "#3f6212",
                border: "#d9f99d",
            },
            {
                primary: "#84cc16",
                secondary: "#a3e635",
                background: "#09090b",
                surface: "#121212",
                text: "#f9fafb",
                textSecondary: "#d1d5db",
                border: "#1e1e20",
            }
        );
    }
}

export default new GreenThemes();
