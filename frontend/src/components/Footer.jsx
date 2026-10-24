import { useState } from "react";
import AnimatedLink from "./AnimatedLink";
import SocialLinks from "./SocialLinks";
import "./Footer.css";

// generic icons (no payment brand logos): the payment method name is written
// in plain text next to a neutral pictogram
const PAYMENT_METHODS = [
    {
        label: "Visa",
        icon: (
            <>
                <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                <path d="M2.5 10h19" />
            </>
        ),
    },
    {
        label: "Mastercard",
        icon: (
            <>
                <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                <rect x="6" y="12.5" width="4" height="3" rx="0.8" />
                <path d="M14 14h4" />
            </>
        ),
    },
    {
        label: "PayPal",
        icon: (
            <>
                <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
                <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
                <circle cx="16.5" cy="13.5" r="1.2" />
            </>
        ),
    },
];

function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubscribed(true);
        setEmail("");
    };

    return (
        <footer className="red-footer">
            <div className="red-footer__container">
                <div className="red-footer__col red-footer__col--brand">
                    <h3 className="red-footer__brand">
                        RED<span>STORE</span>
                    </h3>
                    <p className="text-small red-footer__muted">
                        Premium shoes, delivered to your door.
                    </p>
                    <SocialLinks className="red-footer__social" />
                </div>

                <nav className="red-footer__col" aria-label="Shop by category">
                    <h4>Shop by</h4>
                    <AnimatedLink to="/shop?gender=men">Men</AnimatedLink>
                    <AnimatedLink to="/shop?gender=women">Women</AnimatedLink>
                    <AnimatedLink to="/shop?gender=kids">Kids</AnimatedLink>
                    <AnimatedLink to="/sale">Sale</AnimatedLink>
                </nav>

                <nav className="red-footer__col" aria-label="Shop">
                    <h4>Shop</h4>
                    <AnimatedLink to="/shop">All Shoes</AnimatedLink>
                    <AnimatedLink to="/new-arrivals">New Arrivals</AnimatedLink>
                    <AnimatedLink to="/cart">Cart</AnimatedLink>
                </nav>

                <nav className="red-footer__col" aria-label="Company">
                    <h4>Company</h4>
                    <AnimatedLink to="/about">About Us</AnimatedLink>
                    <AnimatedLink to="/contact">Contact</AnimatedLink>
                    <AnimatedLink href="#">Returns &amp; Shipping</AnimatedLink>
                </nav>

                <div className="red-footer__col red-footer__newsletter">
                    <h4>Stay in the loop</h4>
                    <p className="text-small red-footer__muted">
                        Get new drops and offers in your inbox.
                    </p>
                    {subscribed ? (
                        <p className="red-footer__thanks">Thanks for subscribing!</p>
                    ) : (
                        <form className="red-footer__form" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                required
                                aria-label="Email address"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button type="submit">Subscribe</button>
                        </form>
                    )}
                </div>
            </div>

            <div className="red-footer__bottom">
                <p className="text-small">©2026 RedStore. All rights reserved.</p>
                <ul className="red-footer__payments" aria-label="Accepted payment methods">
                    {PAYMENT_METHODS.map(({ label, icon }) => (
                        <li key={label} className="red-footer__payment">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                {icon}
                            </svg>
                            <span>{label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}

export default Footer;
