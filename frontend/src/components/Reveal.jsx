import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "../utils/motion";

// "Fade + translate" scroll animation wrapper, reusable across all sections
function Reveal({ children, delay = 0, y = 24, className = "" }) {
    const shouldReduceMotion = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay, ease: EASE_SMOOTH }}
        >
            {children}
        </motion.div>
    );
}

export default Reveal;
