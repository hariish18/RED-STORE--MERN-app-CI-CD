import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { addToWishlist, removeFromWishlist } from "../JS/actions/wishlist.action";
import { formatPrice } from "../utils/format";
import { STORE_BRAND } from "../utils/brand";
import "./ProductCard.css";

// Unified product card for the site (Shop page, "You Might Also Like"...): brand, title, price,
// wishlist heart overlay, image zoom and card lift on hover.
// inView = true: entry triggers on scroll (for sections lower on the page)
// instead of playing on initial mount like in the Shop grid.
export default function ProductCard({ product, index = 0, inView = false }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const wishlistItems = useSelector((state) => state.wishlistReducer.items);
    const isWishlisted = wishlistItems.some((p) => p._id === product._id);

    const visible = { opacity: 1, y: 0 };
    const reveal = inView
        ? { whileInView: visible, viewport: { once: true, amount: 0.2 } }
        : { animate: visible };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) dispatch(removeFromWishlist(product._id));
        else dispatch(addToWishlist(product));
    };

    // The cart button no longer guesses a size: it navigates to the product
    // details page where the actual size selector lives (avoids "always size 40" bug)
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/shop/${product._id}`);
    };

    return (
        <motion.article
            className="product-card"
            initial={{ opacity: 0, y: 30 }}
            {...reveal}
            transition={{
                duration: 0.4,
                delay: index * 0.06,
                ease: "easeOut"
            }}
        >
            <Link to={`/shop/${product._id}`} className="product-card__link">
                <div className="product-image-wrapper">
                    <img
                        src={product.imageProd || "/vite.svg"}
                        alt={product.title}
                        className="product-image"
                        loading="lazy"
                    />
                    <button
                        type="button"
                        className={`product-card__wishlist-btn${isWishlisted ? " product-card__wishlist-btn--active" : ""}`}
                        aria-label={
                            isWishlisted
                                ? `Remove ${product.title} from wishlist`
                                : `Add ${product.title} to wishlist`
                        }
                        onClick={handleToggleWishlist}
                    >
                        <Heart size={16} strokeWidth={2} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                </div>
                <div className="product-info">
                    <span className="product-brand">{product.brand || STORE_BRAND}</span>
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-footer">
                        <span className="product-price">{formatPrice(product.price)}</span>
                    </div>
                </div>
            </Link>
            <button
                type="button"
                className="add-cart-btn"
                aria-label={`Add ${product.title} to cart`}
                onClick={handleAddToCart}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                    <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                    <path
                        d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </motion.article>
    );
}
