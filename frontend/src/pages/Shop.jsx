import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { API_URL } from "../utils/api";
import { formatPrice } from "../utils/format";
import ProductCard from "../components/ProductCard";
import "./Shop.css"; // CRITICAL IMPORT: the classic CSS

const MOCK_PRODUCTS = [
    {
        _id: "1",
        title: "Red Store Urban Runner",
        brand: "Red Store",
        price: 139.99,
        imageProd: "https://res.cloudinary.com/dvvekltxc/image/upload/v1786646076/Screenshot_2026-08-13_192224_ewcnfr.png?v=2",
        sizes: [40, 41, 42, 43, 44]
    },
    {
        _id: "2",
        title: "Red Store Premium Leather",
        brand: "Red Store",
        price: 159.50,
        imageProd: "https://res.cloudinary.com/dvvekltxc/image/upload/v1786646056/Screenshot_2026-08-13_192259_p9jq8i.png?v=2",
        sizes: [41, 42, 43, 45]
    },
    {
        _id: "3",
        title: "Red Store Classic Retro",
        brand: "Red Store",
        price: 119.99,
        imageProd: "https://res.cloudinary.com/dvvekltxc/image/upload/v1786646097/Screenshot_2026-08-13_192216_x4citu.png?v=2",
        sizes: [40, 42, 44, 46]
    },
    {
        _id: "4",
        title: "Red Store Sport Lite",
        brand: "Red Store",
        price: 129.00,
        imageProd: "https://res.cloudinary.com/dvvekltxc/image/upload/v1786646117/Screenshot_2026-08-13_192205_g8qea5.png?v=2",
        sizes: [41, 42, 43, 44]
    },
    {
        _id: "5",
        title: "Red Store Street Edition",
        brand: "Red Store",
        price: 149.90,
        imageProd: "https://res.cloudinary.com/dvvekltxc/image/upload/v1786646283/Screenshot_2026-08-13_190106_qozbyf.png?v=2",
        sizes: [40, 41, 43, 45]
    },
    {
        _id: "6",
        title: "Red Store Executive Boot",
        brand: "Red Store",
        price: 169.00,
        imageProd: "https://res.cloudinary.com/dvvekltxc/image/upload/v1786646303/Screenshot_2026-08-13_190114_narpnd.png?v=2",
        sizes: [42, 43, 44, 46]
    }
];

const SORT_OPTIONS = [
    { value: "", label: "Sort: Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "popularity", label: "Popularity" },
];

const GENDER_LABELS = {
    men: "Men's Shoes",
    women: "Women's Shoes",
    kids: "Kids' Shoes",
};

// same trio of images as CategoriesSection (visual consistency between the
// "Men/Women/Kids" card on the home page and the hero banner of the corresponding Shop page)
const HERO_IMAGES = {
    men: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2000&auto=format&fit=crop",
    // same photo as the "Women" card of CategoriesSection (home): verified
    // with no logo or visible brand text.
    women: "https://images.unsplash.com/photo-1524553879936-2ff074ae5816?fm=jpg&q=80&w=2000&auto=format&fit=crop",
    kids: "https://images.unsplash.com/photo-1552912276-56ef47874741?fm=jpg&q=80&w=2000&auto=format&fit=crop",
    // view without ?gender= ("All Shoes").
    // photo-1600455745764 contains brand text: "Twinkle toes" + "Skechers" on
    // the tongues (~y 1100-1320 on the 2000px version) and "Twinkle toes" on the
    // right sole bumper (~y 1920-1970). So we only keep the middle band
    // (laces + rhinestone tips, no readable text - verified at full
    // resolution) via the Unsplash rect parameter: x,y,width,height in pixels
    // of the ORIGINAL (4016x6016). This band is wider than the hero (ratio
    // ~3.9), so the browser only crops the sides: the text cannot
    // reappear, regardless of screen width.
    all: "https://images.unsplash.com/photo-1600455745764-ebd75e6cd567?rect=0,2691,4016,1024&fm=jpg&q=80&w=2000&auto=format&fit=crop",
};

// banner for the dedicated /new-arrivals page (no ?gender=: all genders).
// Dark photo with no visible brand text (verified), so that the white title
// remains readable; the .shop-hero__overlay gradient does the rest.
const NEW_ARRIVALS_HERO_IMAGE =
    "https://images.unsplash.com/photo-1632761298177-51e35403e27e?fm=jpg&q=80&w=2000&auto=format&fit=crop";
const NEW_ARRIVALS_HERO_POSITION = "50% 62%";

// number of products fetched (most recent first) on /new-arrivals
const NEW_ARRIVALS_LIMIT = 24;

const HERO_EYEBROWS = {
    men: "Men's Collection",
    women: "Women's Collection",
    kids: "Kids' Collection",
};

// the old Women photo was a portrait cropped lower to stay visible;
// the current photo (same as CategoriesSection, landscape format) is well framed
// by center default, so no position override is needed here.
const HERO_IMAGE_POSITIONS = {};

// newArrivals: true on the /new-arrivals route. Same page and layout as
// /shop, but all genders combined, "newest" sort by default and dedicated banner.
const Shop = ({ newArrivals = false }) => {
    const [searchParams] = useSearchParams();
    // without ?gender= the page lists ALL products (Men + Women + Kids);
    // this is the destination for "All Shoes" and generic "/shop" links.
    // /new-arrivals ignores ?gender=: "across all categories".
    const genderParam = newArrivals ? null : searchParams.get("gender");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [priceCeiling, setPriceCeiling] = useState(200);
    const [maxPrice, setMaxPrice] = useState(200);
    const [sortBy, setSortBy] = useState(newArrivals ? "newest" : "");


    const pageTitle = newArrivals ? "New Arrivals" : GENDER_LABELS[genderParam] || "All Shoes";
    const heroImage = newArrivals ? NEW_ARRIVALS_HERO_IMAGE : HERO_IMAGES[genderParam] || HERO_IMAGES.all;
    const heroEyebrow = newArrivals ? "Just Landed" : HERO_EYEBROWS[genderParam] || "Red Store Collection";
    const heroImagePosition = newArrivals ? NEW_ARRIVALS_HERO_POSITION : HERO_IMAGE_POSITIONS[genderParam];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/api/product/allProd`, {
                    // axios does not send an undefined param: no gender filter on the API side
                    params: {
                        gender: genderParam || undefined,
                        sort: newArrivals ? "newest" : undefined,
                        limit: newArrivals ? NEW_ARRIVALS_LIMIT : undefined,
                    },
                });
                const data = res.data.Prod || res.data || [];
                const normalized = data.length > 0 ? data : MOCK_PRODUCTS;
                setProducts(normalized);
                setFilteredProducts(normalized);
                // the slider ceiling must cover the most expensive product, otherwise
                // items above the old fixed ceiling remain inaccessible
                const ceiling = Math.max(200, ...normalized.map((p) => Math.ceil(p.price || 0)));
                setPriceCeiling(ceiling);
                setMaxPrice(ceiling);
            } catch (err) {
                console.error("API Error:", err);
                setProducts(MOCK_PRODUCTS);
                setFilteredProducts(MOCK_PRODUCTS);
                setPriceCeiling(200);
                setMaxPrice(200);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [genderParam, newArrivals]);

    // "Brand" checkbox options: derived from the actual brands of loaded products
    // (instead of a single "Red Store" checkbox that never filtered anything)
    const availableBrands = useMemo(
        () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
        [products]
    );

    useEffect(() => {
        let result = products;
        if (selectedBrands.length > 0) {
            result = result.filter((p) =>
                selectedBrands.some((brand) => p.brand?.toLowerCase().includes(brand.toLowerCase()))
            );
        }
        if (selectedSizes.length > 0) {
            // Product.sizes comes from the API as [{ size, stock }, ...] but
            // MOCK_PRODUCTS uses raw numbers [40, 41, ...]. For objects,
            // a size out of stock (stock: 0) does not count as
            // "available": without the stock > 0 guard, filtering by a size that
            // ALL products have (even at 0 stock) never changed
            // the number of displayed results.
            result = result.filter(
                (p) =>
                    p.sizes &&
                    p.sizes.some((s) =>
                        typeof s === "object"
                            ? selectedSizes.includes(s.size) && s.stock > 0
                            : selectedSizes.includes(s)
                    )
            );
        }
        result = result.filter((p) => p.price <= maxPrice);

        // Sorting never changes the number of results, only their order.
        result = result.sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                case "newest":
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case "popularity":
                    // The Product schema does not yet have a sales/views counter:
                    // until a real metric is available on the backend side, we keep
                    // the original order rather than inventing a ranking.
                    return 0;
                default:
                    return 0;
            }
        });

        setFilteredProducts(result);
    }, [selectedBrands, selectedSizes, maxPrice, sortBy, products]);

    const toggleBrand = (brand) =>
        setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
    const toggleSize = (size) =>
        setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
    const clearFilters = () => {
        setSelectedBrands([]);
        setSelectedSizes([]);
        setMaxPrice(priceCeiling);
    };
    const hasActiveFilters = selectedBrands.length > 0 || selectedSizes.length > 0 || maxPrice < priceCeiling;

    return (
        <>
            <section className="shop-hero">
                <img
                    src={heroImage}
                    alt=""
                    className="shop-hero__image"
                    style={heroImagePosition ? { objectPosition: heroImagePosition } : undefined}
                />
                <span className="shop-hero__overlay" aria-hidden="true" />
                <div className="shop-hero__content">
                    <p className="shop-hero__eyebrow">{heroEyebrow}</p>
                    <h1 className="shop-hero__title">{pageTitle}</h1>
                </div>
            </section>

            <div className="shop-page">
                <div className="shop-meta">
                    {hasActiveFilters && (
                        <div className="filter-chips">
                            {selectedBrands.map((brand) => (
                                <button
                                    key={`brand-${brand}`}
                                    type="button"
                                    className="filter-chip"
                                    onClick={() => toggleBrand(brand)}
                                >
                                    {brand}
                                    <X size={12} strokeWidth={2.5} />
                                </button>
                            ))}
                            {selectedSizes.map((size) => (
                                <button
                                    key={`size-${size}`}
                                    type="button"
                                    className="filter-chip"
                                    onClick={() => toggleSize(size)}
                                >
                                    Size: {size}
                                    <X size={12} strokeWidth={2.5} />
                                </button>
                            ))}
                            {maxPrice < priceCeiling && (
                                <button
                                    type="button"
                                    className="filter-chip"
                                    onClick={() => setMaxPrice(priceCeiling)}
                                >
                                    Max {formatPrice(maxPrice)}
                                    <X size={12} strokeWidth={2.5} />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="shop-meta__row">
                        <span className="shop-count">
                            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                        </span>
                        <div className="sort-control">
                            <label htmlFor="shop-sort" className="sort-control__label">
                                Sort by
                            </label>
                            <select
                                id="shop-sort"
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="shop-layout">
                <aside className="shop-filters">
                    <div className="filter-group">
                        <h3>Brand</h3>
                        {availableBrands.map((brand) => (
                            <label key={brand} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedBrands.includes(brand)}
                                    onChange={() => toggleBrand(brand)}
                                />
                                {brand}
                            </label>
                        ))}
                    </div>

                    <div className="filter-group">
                        <h3>Size</h3>
                        <div className="size-grid">
                            {[40, 41, 42, 43, 44, 45, 46].map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    className={`size-btn ${selectedSizes.includes(size) ? "active" : ""}`}
                                    onClick={() => toggleSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3>Max Price</h3>
                        <input
                            type="range"
                            min="0"
                            max={priceCeiling}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="price-slider"
                        />
                        <div className="price-label">Up to {formatPrice(maxPrice)}</div>
                    </div>

                    {hasActiveFilters && (
                        <button type="button" className="clear-filters-btn" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    )}
                </aside>

                <main className="shop-grid">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="product-card product-card--skeleton">
                                <div className="product-image-wrapper product-image-wrapper--skeleton" />
                                <div className="product-info">
                                    <div className="skeleton-line skeleton-line--short" />
                                    <div className="skeleton-line skeleton-line--long" />
                                    <div className="product-footer">
                                        <div className="skeleton-line skeleton-line--price" />
                                        <div className="skeleton-circle" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <p className="no-products">No products match your criteria.</p>
                    ) : (
                        filteredProducts.map((product, index) => (
                            <ProductCard key={product._id} product={product} index={index} />
                        ))
                    )}
                </main>
                </div>
            </div>
        </>
    );
};

export default Shop;