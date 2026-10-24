import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ProductCard from "./ui/smoothui/product-card";
import { cn } from "../lib/utils";
import "../styles/tailwind-scoped.css";

// Horizontal carousel (native scroll + scroll-snap) rather than a third-party library: reuses
// ProductCard as-is, remains lightweight, and finger/trackpad scrolling works natively alongside arrows.
function ProductCarousel({ products, emptyMessage = "No products found." }) {
    const shouldReduceMotion = useReducedMotion();
    const trackRef = useRef(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const updateArrows = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanPrev(el.scrollLeft > 4);
        setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    useEffect(() => {
        updateArrows();
        const el = trackRef.current;
        if (!el) return undefined;
        el.addEventListener("scroll", updateArrows, { passive: true });
        window.addEventListener("resize", updateArrows);
        return () => {
            el.removeEventListener("scroll", updateArrows);
            window.removeEventListener("resize", updateArrows);
        };
    }, [updateArrows, products]);

    const scrollByPage = (direction) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({
            left: direction * el.clientWidth * 0.9,
            behavior: shouldReduceMotion ? "auto" : "smooth",
        });
    };

    if (!products || products.length === 0) {
        return (
            <p className="tw-scope py-10 text-center text-sm text-gray-500">{emptyMessage}</p>
        );
    }

    // Same orchestration pattern as ProductGrid (named variants, disabled under
    // prefers-reduced-motion) - see ProductGrid.jsx for details.
    const containerVariants = {
        hidden: {},
        show: {
            transition: shouldReduceMotion ? { staggerChildren: 0 } : { staggerChildren: 0.06, delayChildren: 0.05 },
        },
    };
    const cardVariants = {
        hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, transform: "translateY(20px) scale(0.97)" },
        show: { opacity: 1, transform: "translateY(0px) scale(1)" },
    };

    // inset-y-0 + my-auto (rather than top-[x%] + -translate-y-1/2): the .relative container has an
    // "auto" height (defined by its flex content), and `top` percentages do not resolve
    // properly on an auto-height ancestor - this combination centers vertically without
    // depending on it.
    // !border-*: Bootstrap defines its own global ".border" class with !important, which
    // would otherwise override the Tailwind border color (see same comment in ProductCard).
    const arrowClass =
        "absolute inset-y-0 my-auto z-10 flex h-10 w-10 items-center justify-center self-center rounded-full " +
        "border !border-gray-200 bg-white text-gray-700 shadow-md " +
        "transition-all duration-200 hover:scale-110 hover:!border-red-500 hover:text-red-600 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 " +
        "disabled:opacity-0 disabled:pointer-events-none";

    return (
        <div className="tw-scope">
            {/* tw-scope must be on an ANCESTOR, never on the same node as the utilities
                it is meant to unlock: `important: ".tw-scope"` compiles into a descendant selector
                (`.tw-scope .relative`), so `relative` on THIS div would have no effect. */}
            <div className="relative flex items-center">
                <button
                    type="button"
                    className={cn(arrowClass, "-left-2 sm:-left-5")}
                    aria-label="Previous products"
                    onClick={() => scrollByPage(-1)}
                    disabled={!canPrev}
                >
                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                </button>

                <motion.div
                    className={cn(
                        "flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-2 pt-1",
                        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    )}
                    ref={trackRef}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {products.map((product) => (
                        <div
                            className="w-[220px] shrink-0 snap-start sm:w-[calc(50%-6px)] md:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)]"
                            key={product._id}
                        >
                            <ProductCard product={product} badge="New" variants={cardVariants} />
                        </div>
                    ))}
                </motion.div>

                <button
                    type="button"
                    className={cn(arrowClass, "-right-2 sm:-right-5")}
                    aria-label="Next products"
                    onClick={() => scrollByPage(1)}
                    disabled={!canNext}
                >
                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

export default ProductCarousel;
