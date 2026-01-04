export type ThemeType = "default" | "romantic" | "modern" | "baby" | "party" | "nature";

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    text: string;
    buttonText: string;
}

export const VISUAL_THEMES: Record<ThemeType, ThemeColors> = {
    default: {
        primary: "#e11d48", // Rose/Pink
        secondary: "#fdf2f8",
        accent: "#be123c",
        background: "#fff1f2",
        card: "#ffffff",
        text: "#111827",
        buttonText: "#ffffff"
    },
    romantic: {
        primary: "#9d174d", // Deep Pink/Purple
        secondary: "#fdf2f8",
        accent: "#701a75",
        background: "#fdf2f8",
        card: "#ffffff",
        text: "#4c0519",
        buttonText: "#ffffff"
    },
    modern: {
        primary: "#0f172a", // Navy/Slate
        secondary: "#f1f5f9",
        accent: "#334155",
        background: "#f8fafc",
        card: "#ffffff",
        text: "#0f172a",
        buttonText: "#ffffff"
    },
    baby: {
        primary: "#0ea5e9", // Sky Blue
        secondary: "#f0f9ff",
        accent: "#0284c7",
        background: "#f0f9ff",
        card: "#ffffff",
        text: "#0c4a6e",
        buttonText: "#ffffff"
    },
    party: {
        primary: "#8b5cf6", // Violet
        secondary: "#f5f3ff",
        accent: "#7c3aed",
        background: "#f5f3ff",
        card: "#ffffff",
        text: "#2e1065",
        buttonText: "#ffffff"
    },
    nature: {
        primary: "#15803d", // Green
        secondary: "#f0fdf4",
        accent: "#166534",
        background: "#f0fdf4",
        card: "#ffffff",
        text: "#064e3b",
        buttonText: "#ffffff"
    }
};
