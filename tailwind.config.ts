import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    main: "#0288D1", // Sea Blue
                    light: "#5EB8FF",
                    dark: "#005B9F",
                },
                secondary: {
                    main: "#0D47A1", // Dark Blue
                    light: "#5472D3",
                    dark: "#002171",
                },
                accent: {
                    main: "#F57C00", // Orange
                    light: "#FFAD42",
                    dark: "#BB4D00",
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [],
};
export default config;
