import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../JS/actions/auth.action";
import { selectCartCount } from "../JS/selectors/cart.selectors";
import { formatPrice } from "../utils/format";
import "./BarNav.css";

import { API_URL } from "../utils/api";

const ACCOUNT_ICON = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
        <path
            d="M4.5 20c1.4-3.6 4.4-5.6 7.5-5.6s6.1 2 7.5 5.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
    </svg>
);

function BarNav() {
    const user = useSelector((state) => state.authReducer.user);
    const cartCount = useSelector(selectCartCount);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // CURRENT PAGE DETECTION
    const isHome = location.pathname === '/';

    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [rawSuggestions, setRawSuggestions] = useState([]);
    const suggestions = query.trim() ? rawSuggestions : [];
    const searchBoxRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const q = query.trim();
        if (!q) return;
        // Also cancels in-flight request: otherwise a slow response for "l" could
        // arrive after "le" and overwrite correct suggestions
        const controller = new AbortController();
        const timer = setTimeout(() => {
            axios
                .get(`${API_URL}/api/product/search`, { params: { q }, signal: controller.signal })
                .then(({ data }) => setRawSuggestions((data.Prod || []).slice(0, 5)))
                .catch((err) => {
                    if (!axios.isCancel(err)) setRawSuggestions([]);
                });
        }, 300);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
                setRawSuggestions([]);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = query.trim();
        navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
        setSearchOpen(false);
        setRawSuggestions([]);
        setQuery("");
    };

    const goToSuggestion = (productId) => {
        navigate(`/shop/${productId}`);
        setSearchOpen(false);
        setRawSuggestions([]);
        setQuery("");
    };

    return (
        <Navbar
            expand="lg"
            fixed="top"
            className={`red-navbar ${isHome ? "red-navbar--home" : "red-navbar--solid"} ${scrolled ? "red-navbar--scrolled" : ""}`}
        >
            <Container fluid className="red-navbar__container">
                <Navbar.Brand as={Link} to="/" className="red-navbar__brand">
                    <span className="red-navbar__mark">R</span>
                    RED<span>STORE</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-nav" className="red-navbar__toggle" />
                <Navbar.Collapse id="main-nav" className="red-navbar__collapse">
                    <Nav className="red-navbar__links">
                        <Nav.Link as={NavLink} to="/" end>
                            Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/shop?gender=men">
                            Men
                        </Nav.Link>
                        <Nav.Link as={Link} to="/shop?gender=women">
                            Women
                        </Nav.Link>
                        <Nav.Link as={Link} to="/shop?gender=kids">
                            Kids
                        </Nav.Link>
                        <Nav.Link as={Link} to="/new-arrivals">
                            New Arrivals
                        </Nav.Link>
                        <Nav.Link as={Link} to="/sale">
                            Sale
                        </Nav.Link>
                        <Nav.Link as={Link} to="/contact">
                            Contact
                        </Nav.Link>
                    </Nav>

                    <div className="red-navbar__actions">
                        <form className="red-navbar__search" onSubmit={handleSearch} ref={searchBoxRef}>
                            {searchOpen && (
                                <motion.input
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 180, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    type="search"
                                    autoFocus
                                    placeholder="Search shoes…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onBlur={() => !query && setSearchOpen(false)}
                                    aria-label="Search products"
                                />
                            )}
                            <AnimatePresence>
                                {suggestions.length > 0 && (
                                    <motion.ul
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="red-navbar__suggestions"
                                    >
                                        {suggestions.map((p) => (
                                            <li key={p._id}>
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        goToSuggestion(p._id);
                                                    }}
                                                >
                                                    <img src={p.imageProd || "/vite.svg"} alt="" />
                                                    <span className="red-navbar__suggestion-info">
                                                        <span className="red-navbar__suggestion-title">{p.title}</span>
                                                        <span className="red-navbar__suggestion-price">
                                                            {formatPrice(p.price)}
                                                        </span>
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                            <button
                                type="button"
                                className="red-navbar__icon-btn"
                                aria-label="Search"
                                onClick={() => setSearchOpen((open) => !open)}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                                    <line
                                        x1="16.4"
                                        y1="16.4"
                                        x2="21"
                                        y2="21"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </form>

                        <NavDropdown
                            title={ACCOUNT_ICON}
                            id="account-nav-dropdown"
                            align="end"
                            className="red-navbar__account"
                        >
                            {user ? (
                                <>
                                    <NavDropdown.ItemText className="red-navbar__account-hi">
                                        Hi, {user.name}
                                    </NavDropdown.ItemText>
                                    <NavDropdown.Item as={Link} to="/profile">
                                        Profile
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/wishlist">
                                        Wishlist
                                    </NavDropdown.Item>
                                    {user.role === "admin" && (
                                        <>
                                            <NavDropdown.Item as={Link} to="/admin/products">
                                                Add Product
                                            </NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/dashboard/admin">
                                                Dashboard
                                            </NavDropdown.Item>
                                        </>
                                    )}
                                    <NavDropdown.Item
                                        as="button"
                                        className="red-navbar__account-logout"
                                        onClick={() => dispatch(logout(navigate))}
                                    >
                                        Logout
                                    </NavDropdown.Item>
                                </>
                            ) : (
                                <>
                                    <NavDropdown.Item as={Link} to="/login">
                                        Login
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/register">
                                        Register
                                    </NavDropdown.Item>
                                </>
                            )}
                        </NavDropdown>

                        <Link to="/cart" className="red-navbar__cart" aria-label="Cart">
                            <motion.span
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="red-navbar__cart-icon"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M17 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 21a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                {cartCount > 0 && (
                                    <motion.span
                                        key={cartCount}
                                        initial={{ scale: 0.6 }}
                                        animate={{ scale: 1 }}
                                        className="red-navbar__cart-badge"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </motion.span>
                        </Link>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default BarNav;