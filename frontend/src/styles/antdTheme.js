// Ant Design theme aligned with theme.css variables, so that antd components
// (Cart, ForgotPassword, ResetPassword...) keep the Red Store red and typography.
// Values are hardcoded (not read via var(--...)) because antd derives its
// hover/active colors from these hex values at theme computation time.
const RED_STORE_PRIMARY = "#e63946"; // --color-primary
const RED_STORE_PRIMARY_DARK = "#c1121f"; // --color-primary-dark

export const antdTheme = {
    token: {
        colorPrimary: RED_STORE_PRIMARY,
        colorLink: RED_STORE_PRIMARY,
        colorText: "#1d1d1d", // --color-text
        colorTextSecondary: "#6c757d", // --color-text-secondary
        colorBorder: "#e5e5e5", // --color-border
        colorBorderSecondary: "#e5e5e5",
        colorSuccess: "#2a9d8f", // --color-success
        colorError: "#d62828", // --color-error
        // font actually rendered on the site (index.css: body/headings use Poppins)
        fontFamily: "'Poppins', sans-serif",
        borderRadius: 8, // --radius
    },
    components: {
        // a "danger" button (e.g. Proceed to Checkout) stays in the brand red,
        // not in the error red (--color-error) used for messages
        Button: {
            colorError: RED_STORE_PRIMARY,
            colorErrorHover: RED_STORE_PRIMARY_DARK,
            colorErrorActive: RED_STORE_PRIMARY_DARK,
            primaryShadow: "0 4px 12px rgba(230, 57, 70, 0.25)",
            dangerShadow: "0 4px 12px rgba(230, 57, 70, 0.25)",
        },
    },
};
