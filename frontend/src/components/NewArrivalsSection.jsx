import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { getNewArrivals } from '../JS/actions/Prod.action';
import { addToWishlist, removeFromWishlist } from '../JS/actions/wishlist.action';
import { EASE_SMOOTH, SPRING_BOUNCY } from '../utils/motion';
import { formatPrice } from '../utils/format';
import SectionHeading from './SectionHeading';
import './NewArrivalsSection.css';

const MotionLink = motion(Link);

export default function NewArrivalsSection() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const shouldReduceMotion = useReducedMotion();
    const { newArrivals, isLoadNewArrivals, newArrivalsErrors } = useSelector(
        (state) => state.productReducer
    );
    const wishlistItems = useSelector((state) => state.wishlistReducer.items);

    useEffect(() => {
        dispatch(getNewArrivals(8));
    }, [dispatch]);

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
    const hoverLift = shouldReduceMotion
        ? {}
        : { y: -6, boxShadow: '0 20px 40px rgba(230, 57, 70, 0.12)' };

    // The cart button no longer guesses a size: it navigates to the product
    // details page where the actual size selector lives (avoids "always size 40" bug)
    const handleQuickAdd = (event, product) => {
        event.preventDefault();
        event.stopPropagation();
        navigate(`/shop/${product._id}`);
    };

    // Prevents navigation to the product page: preventDefault() cancels
    // react-router navigation (Link doesn't navigate if event is defaultPrevented),
    // stopPropagation() isolates the click from the rest of the card
    const handleToggleWishlist = (event, product) => {
        event.preventDefault();
        event.stopPropagation();
        const isWishlisted = wishlistItems.some((p) => p._id === product._id);
        if (isWishlisted) dispatch(removeFromWishlist(product._id));
        else dispatch(addToWishlist(product));
    };

    const showSkeleton = isLoadNewArrivals && newArrivals.length === 0;
    const showError = !isLoadNewArrivals && newArrivalsErrors && newArrivals.length === 0;
    const showEmpty = !isLoadNewArrivals && !newArrivalsErrors && newArrivals.length === 0;

    return (
        <section className="new-arrivals" id="new-arrivals">
            <div className="section">
                <SectionHeading title="New Arrivals" />

                {showSkeleton && (
                    <div className="new-arrivals__grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="new-arrival-card new-arrival-card--skeleton">
                                <div className="new-arrival-card__image new-arrival-card__image--skeleton" />
                                <div className="new-arrival-card__line new-arrival-card__line--title" />
                                <div className="new-arrival-card__line new-arrival-card__line--price" />
                            </div>
                        ))}
                    </div>
                )}

                {showError && <p className="new-arrivals__message">{newArrivalsErrors}</p>}

                {showEmpty && <p className="new-arrivals__message">No new arrivals yet — check back soon.</p>}

                {!showSkeleton && newArrivals.length > 0 && (
                    <motion.div
                        className="new-arrivals__grid"
                        variants={gridVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {newArrivals.map((product) => (
                            <MotionLink
                                key={product._id}
                                to={`/shop/${product._id}`}
                                className="new-arrival-card"
                                variants={cardVariants}
                                whileHover={hoverLift}
                                whileTap={{ scale: 0.98 }}
                                transition={SPRING_BOUNCY}
                            >
                                <div className="new-arrival-card__image-wrapper">
                                    <img
                                        src={product.imageProd || '/vite.svg'}
                                        alt={product.title}
                                        className="new-arrival-card__image"
                                        loading="lazy"
                                    />
                                    <span className="new-arrival-card__badge">New</span>
                                    <button
                                        type="button"
                                        className={`new-arrival-card__wishlist-btn${
                                            wishlistItems.some((p) => p._id === product._id)
                                                ? ' new-arrival-card__wishlist-btn--active'
                                                : ''
                                        }`}
                                        onClick={(event) => handleToggleWishlist(event, product)}
                                        aria-label={
                                            wishlistItems.some((p) => p._id === product._id)
                                                ? `Remove ${product.title} from wishlist`
                                                : `Add ${product.title} to wishlist`
                                        }
                                    >
                                        <Heart
                                            size={16}
                                            strokeWidth={2}
                                            fill={wishlistItems.some((p) => p._id === product._id) ? 'currentColor' : 'none'}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className="new-arrival-card__quick-add"
                                        onClick={(event) => handleQuickAdd(event, product)}
                                        aria-label={`Add ${product.title} to cart`}
                                    >
                                        <ShoppingBag size={16} strokeWidth={2} />
                                    </button>
                                </div>
                                <div className="new-arrival-card__info">
                                    <h3 className="new-arrival-card__title">{product.title}</h3>
                                    <span className="new-arrival-card__price">{formatPrice(product.price)}</span>
                                </div>
                            </MotionLink>
                        ))}
                    </motion.div>
                )}

                <Link to="/shop" className="new-arrivals__view-all">
                    View All Products
                    <ArrowRight size={18} strokeWidth={2.5} className="new-arrivals__view-all-icon" />
                </Link>
            </div>
        </section>
    );
}
