// Shared animation tokens: a single source for easings/springs
// used by PageTransition, Reveal, ProductGrid and ProductCard, so that
// transitions between components feel consistent across the entire site.

// easeOutQuint: same curve as page transitions, smooth and fast at the end
export const EASE_SMOOTH = [0.22, 1, 0.36, 1];

export const SPRING = { type: "spring", duration: 0.25, bounce: 0.1 };
export const SPRING_BOUNCY = { type: "spring", duration: 0.3, bounce: 0.2 };
