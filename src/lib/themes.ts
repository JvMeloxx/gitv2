export type ThemeType = "default" | "romantic" | "modern" | "baby" | "party" | "nature" | "dark" | "rustic" | "lavender";

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
    },
    dark: {
        primary: "#f43f5e", // Bright Rose on Dark
        secondary: "#1e293b",
        accent: "#fb7185",
        background: "#0f172a",
        card: "#1e293b",
        text: "#f8fafc",
        buttonText: "#ffffff"
    },
    rustic: {
        primary: "#b45309", // Amber/Wood
        secondary: "#fef3c7",
        accent: "#92400e",
        background: "#fffbf0",
        card: "#ffffff",
        text: "#451a03",
        buttonText: "#ffffff"
    },
    lavender: {
        primary: "#7c3aed", // Soft Purple
        secondary: "#f5f3ff",
        accent: "#6d28d9",
        background: "#faf5ff",
        card: "#ffffff",
        text: "#4c1d95",
        buttonText: "#ffffff"
    }
};

export type PatternType = "none" | "floral" | "pastel" | "stripes";

export interface BackgroundPattern {
    id: PatternType;
    label: string;
    style: React.CSSProperties;
}

export const BACKGROUND_PATTERNS: Record<PatternType, BackgroundPattern> = {
    none: {
        id: "none",
        label: "Sem Fundo",
        style: {}
    },
    floral: {
        id: "floral",
        label: "Florido",
        style: {
            backgroundImage: `radial-gradient(#0000000a 2px, transparent 2px), radial-gradient(#0000000a 2px, transparent 2px)`,
            backgroundSize: "30px 30px",
            backgroundPosition: "0 0, 15px 15px",
        }
    },
    pastel: {
        id: "pastel",
        label: "Tom Pastel",
        style: {
            background: "radial-gradient(circle, #00000005 10%, transparent 10%)",
            backgroundSize: "20px 20px",
        }
    },
    stripes: {
        id: "stripes",
        label: "Listras",
        style: {
            background: "repeating-linear-gradient(45deg, #00000005, #00000005 10px, transparent 10px, transparent 20px)",
        }
    }
};
