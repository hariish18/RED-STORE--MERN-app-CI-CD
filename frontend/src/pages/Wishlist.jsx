import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { getWishlist } from "../JS/actions/wishlist.action";
import SectionHeading from "../components/SectionHeading";
import ProductGrid from "../components/ProductGrid";
import Reveal from "../components/Reveal";
import "./Wishlist.css";

const Wishlist = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = useSelector((state) => state.authReducer.user);
    const { items, isLoad } = useSelector((state) => state.wishlistReducer);

    useEffect(() => {
        // checks the token locally (synchronous), not `user` in Redux: `user` stays null
        // while current() (dispatched globally by App.jsx) resolves after a
        // reload, which would otherwise wrongly redirect a logged-in user to /login
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }
        dispatch(getWishlist());
    }, [dispatch, navigate, token]);

    if (!token || !user) return null;

    return (
        <div className="wishlist-page">
            <div className="section">
                <Reveal>
                    <SectionHeading title="My Wishlist" />
                    {!isLoad && items.length > 0 && (
                        <p className="wishlist-page__count">
                            {items.length} product{items.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </Reveal>

                {isLoad ? (
                    <p className="text-small home__muted">Loading wishlist…</p>
                ) : items.length === 0 ? (
                    <Reveal className="wishlist-empty">
                        <Heart size={56} strokeWidth={1.5} className="wishlist-empty__icon" aria-hidden="true" />
                        <p className="wishlist-empty__text">You haven&apos;t saved any shoes yet.</p>
                        <Link to="/shop" className="btn-primary">
                            Shop Now
                        </Link>
                    </Reveal>
                ) : (
                    <ProductGrid products={items} />
                )}
            </div>
        </div>
    );
};

export default Wishlist;
