/** @type {import('tailwindcss').Config} */
export default {
    // Scoped utility layer: every generated utility is prefixed with this
    // ancestor class so Tailwind can't leak onto the rest of the app, which
    // is styled with plain CSS (see src/styles/theme.css). Any component
    // that opts in wraps its root element with className="tw-scope".
    important: ".tw-scope",
    corePlugins: {
        preflight: false,
    },
    content: [
        "./src/components/HeroPromo.jsx",
        "./src/pages/Profile.jsx",
        "./src/pages/Login.jsx",
        "./src/pages/Register.jsx",
        "./src/pages/Shop.jsx",
        "./src/pages/Wishlist.jsx",
        "./src/components/ProductCarousel.jsx",
        "./src/components/profile/**/*.{jsx,js}",
        "./src/components/ui/**/*.{jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                chart: {
                    1: "var(--chart-1)",
                    2: "var(--chart-2)",
                    3: "var(--chart-3)",
                    4: "var(--chart-4)",
                    5: "var(--chart-5)",
                },
                // Additional brand aliases (do not collide with shadcn tokens above):
                // primary/border intentionally remain on var(--primary)/var(--border)
                // to leave the rendering of existing ui/** components unchanged.
                "primary-dark": "#C1121F",
                surface: "#F8F9FA",
                "text-primary": "#1D1D1D",
                "text-secondary": "#6C757D",
                success: "#2A9D8F",
                error: "#D62828",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
        },
    },

    plugins: [],
};
