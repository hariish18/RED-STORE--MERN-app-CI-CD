import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { getAllProducts, getProductById } from "../JS/actions/Prod.action";
import { addToCart } from "../JS/actions/cart.action";
import { addToWishlist, removeFromWishlist } from "../JS/actions/wishlist.action";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import Reveal from "../components/Reveal";
import { formatPrice } from "../utils/format";
import "./ProductDetail.css";

//The 7 sizes that must always appear on EACH product page, even if none
//of the products in that category stock them (displayed disabled rather than hidden)
const REQUIRED_SIZES = [40, 41, 42, 43, 44, 45, 46];

const ProductDetailView = ({ id }) => {
    const dispatch = useDispatch();
    const { product, products } = useSelector((state) => state.productReducer);
    const wishlistItems = useSelector((state) => state.wishlistReducer.items);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [added, setAdded] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        dispatch(getProductById(id));
        if (products.length === 0) dispatch(getAllProducts());
        window.scrollTo(0, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, dispatch]);

    if (!product || product._id !== id) {
        return <p className="text-small home__muted product-detail__loading">Loading product…</p>;
    }

    const gallery = [product.imageProd, ...(product.images || [])].filter(Boolean);
    const sizeInfo = product.sizes || [];
    // master size grid per category (gender): union of the 7 required sizes (REQUIRED_SIZES)
    // and all sizes actually used by products in the same category, so that
    // the grid ALWAYS shows the 7 required sizes (disabled if none stock them) without
    // ever hiding a size that is truly in stock for that category (e.g. women 36-39, kids 18-35)
    const sameCategoryProducts = products.length > 0 ? products.filter((p) => p.gender === product.gender) : [product];
    const categorySizes = [
        ...new Set([...REQUIRED_SIZES, ...sameCategoryProducts.flatMap((p) => (p.sizes || []).map((s) => s.size))]),
    ].sort((a, b) => a - b);
    const allSizes = categorySizes.map((size) => ({
        size,
        stock: sizeInfo.find((s) => s.size === size)?.stock ?? 0,
    }));
    const currentStock = allSizes.find((s) => s.size === selectedSize)?.stock ?? 0;

    const isWishlisted = wishlistItems.some((p) => p._id === product._id);

    const handleToggleWishlist = () => {
        if (isWishlisted) dispatch(removeFromWishlist(product._id));
        else dispatch(addToWishlist(product));
    };

    const handleAddToCart = async () => {
        if (!selectedSize || currentStock === 0) return;

        setAdding(true);
        const result = await dispatch(addToCart(product, selectedSize));
        if (result.success) {
            toast.success("Product added to cart!");
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } else {
            toast.error(result.error || "Error adding to cart");
        }
        setAdding(false);
    };

    const related = products
        .filter((p) => p._id !== product._id && (p.brand === product.brand || p.category === product.category))
        .slice(0, 4);

    return (
        <div className="product-detail">
            <div className="product-detail__main">
                <div className="product-detail__gallery">
                    <div className="product-detail__main-image">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={gallery[activeImage] || "placeholder"}
                                src={gallery[activeImage] || "/vite.svg"}
                                alt={product.title}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            />
                        </AnimatePresence>
                    </div>
                    {gallery.length > 1 && (
                        <div className="product-detail__thumbs">
                            {gallery.map((img, i) => (
                                <button
                                    key={img + i}
                                    type="button"
                                    className={`product-detail__thumb ${
                                        i === activeImage ? "product-detail__thumb--active" : ""
                                    }`}
                                    onClick={() => setActiveImage(i)}
                                >
                                    <img src={img} alt={`${product.title} ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-detail__info">
                    {product.brand && <p className="text-small product-detail__brand">{product.brand}</p>}
                    <h1>{product.title}</h1>
                    <p className="product-detail__price">{formatPrice(product.price)}</p>

                    <div className="product-detail__sizes">
                        <h4>Size</h4>
                        <div className="shop__size-grid product-detail__size-grid">
                            {allSizes.length === 0 && (
                                <p className="text-small home__muted">No sizes available</p>
                            )}
                            {allSizes.map((s) => (
                                <button
                                    key={s.size}
                                    type="button"
                                    disabled={s.stock === 0}
                                    className={`shop__size-pill ${
                                        selectedSize === s.size ? "shop__size-pill--active" : ""
                                    }`}
                                    onClick={() => setSelectedSize(s.size)}
                                >
                                    {s.size}
                                </button>
                            ))}
                        </div>
                        {selectedSize && (
                            <p className="text-small home__muted">
                                {currentStock > 0 ? `${currentStock} in stock` : "Out of stock"}
                            </p>
                        )}
                    </div>

                    <div className="product-detail__actions">
                        <motion.button
                            type="button"
                            className="btn-primary product-detail__add"
                            whileHover={selectedSize && currentStock > 0 ? { scale: 1.02 } : {}}
                            whileTap={selectedSize && currentStock > 0 ? { scale: 0.98 } : {}}
                            disabled={!selectedSize || currentStock === 0 || adding}
                            onClick={handleAddToCart}
                        >
                            {added ? "Added ✓" : adding ? "Adding…" : !selectedSize ? "Select a size" : "Add to Cart"}
                        </motion.button>
                        <button
                            type="button"
                            className={`product-detail__wishlist-btn${isWishlisted ? " product-detail__wishlist-btn--active" : ""}`}
                            aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
                            onClick={handleToggleWishlist}
                        >
                            <Heart size={20} strokeWidth={2} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div className="product-detail__description">
                        <h4>Description</h4>
                        <p>{product.description}</p>
                    </div>
                </div>
            </div>

            {related.length > 0 && (
                <section className="product-detail__related">
                    <Reveal>
                        <SectionHeading title="You Might Also Like" />
                    </Reveal>
                    <div className="product-detail__related-grid">
                        {related.map((p, index) => (
                            <ProductCard key={p._id} product={p} index={index} inView />
                        ))}
                    </div>
                </section>
            )}

            <Link to="/shop" className="product-detail__back">
                ← Back to Shop
            </Link>
        </div>
    );
};

const ProductDetail = () => {
    const { id } = useParams();
    return <ProductDetailView key={id} id={id} />;
};

export default ProductDetail;
