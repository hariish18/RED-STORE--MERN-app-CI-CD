import { Star } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE_SMOOTH } from '../utils/motion';
import SectionHeading from './SectionHeading';
import './Testimonials.css';

// 3 variations of the same chromatic family (--color-primary): light,
// medium, full, rather than non-brand shades
const AVATAR_STYLES = [
    { background: 'rgba(230, 57, 70, 0.10)', color: '#C1121F' },
    { background: 'rgba(230, 57, 70, 0.18)', color: '#E63946' },
    { background: '#C1121F', color: '#FDF2F3' },
];

// Decorative background shapes: very slow and subtle movement,
// disabled if user prefers reduced motion
const BLOBS = [
    { className: 'testimonials__blob testimonials__blob--a', x: [0, 24, 0], y: [0, -20, 0], duration: 16 },
    { className: 'testimonials__blob testimonials__blob--b', x: [0, -22, 0], y: [0, 26, 0], duration: 20 },
    { className: 'testimonials__blob testimonials__blob--c', x: [0, 16, 0], y: [0, 18, 0], duration: 18 },
];

const reviews = [
    {
        name: 'Sofiane',
        comment: 'I ordered my shoes yesterday and they arrived this morning. Incredible quality!',
        rating: 5,
    },
    {
        name: 'Amina',
        comment: 'The site is so easy to use and checkout felt completely secure. I love my new pair!',
        rating: 5,
    },
    {
        name: 'Karim',
        comment: 'Red Store has the best shoes around. Customer service is fast and genuinely professional. Top!',
        rating: 5,
    },
];

export default function Testimonials() {
    const shouldReduceMotion = useReducedMotion();

    const gridVariants = {
        hidden: {},
        show: {
            transition: shouldReduceMotion ? { staggerChildren: 0 } : { staggerChildren: 0.1, delayChildren: 0.05 },
        },
    };
    const cardVariants = {
        hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SMOOTH } },
    };

    return (
        <section className="testimonials">
            {BLOBS.map((blob, i) => (
                <motion.div
                    key={i}
                    aria-hidden="true"
                    className={blob.className}
                    animate={shouldReduceMotion ? undefined : { x: blob.x, y: blob.y }}
                    transition={
                        shouldReduceMotion
                            ? undefined
                            : { duration: blob.duration, repeat: Infinity, ease: 'easeInOut' }
                    }
                />
            ))}
            <div className="section">
                <SectionHeading title="What our customers say" />
                <motion.div
                    className="testimonials__grid"
                    variants={gridVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {reviews.map((review, index) => {
                        const avatar = AVATAR_STYLES[index % AVATAR_STYLES.length];
                        return (
                            <motion.div key={review.name} className="testimonial-card" variants={cardVariants}>
                                <span className="testimonial-card__quote-mark" aria-hidden="true">
                                    &ldquo;
                                </span>
                                <div className="testimonial-card__stars">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            strokeWidth={1.5}
                                            className={
                                                i < review.rating
                                                    ? 'testimonial-card__star testimonial-card__star--filled'
                                                    : 'testimonial-card__star'
                                            }
                                        />
                                    ))}
                                </div>
                                <p className="testimonial-card__comment">&ldquo;{review.comment}&rdquo;</p>
                                <div className="testimonial-card__author">
                                    <span
                                        className="testimonial-card__avatar"
                                        style={{ background: avatar.background, color: avatar.color }}
                                        aria-hidden="true"
                                    >
                                        {review.name.charAt(0)}
                                    </span>
                                    <span className="testimonial-card__name">{review.name}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
