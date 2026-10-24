import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "../utils/motion";

// Animation variants for page transitions
const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.99,
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: EASE_SMOOTH,
            staggerChildren: 0.08,
        },
    },
    exit: {
        opacity: 0,
        y: -12,
        scale: 0.99,
        transition: {
            duration: 0.25,
            ease: EASE_SMOOTH,
        },
    },
};

// Fallback variant: fade only, without translation/zoom, for
// prefers-reduced-motion (avoids motion on every navigation).
const reducedVariants = {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
};

/**
 * Wrapper component that animates the entry and exit of each page.
 * Use with AnimatePresence + location.key in the router.
 */
function PageTransition({ children }) {
    const shouldReduceMotion = useReducedMotion();
    return (
        <motion.div
            variants={shouldReduceMotion ? reducedVariants : pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            style={{ width: "100%" }}
        >
            {children}
        </motion.div>
    );
}

export default PageTransition;
