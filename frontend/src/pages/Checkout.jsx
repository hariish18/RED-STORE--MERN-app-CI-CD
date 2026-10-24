import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { placeOrder } from "../JS/actions/order.action";
import { getCart, clearCart } from "../JS/actions/cart.action";
import {
    TAX_RATE,
    SHIPPING_COST,
    FREE_SHIPPING_THRESHOLD,
    selectCartItems,
} from "../JS/selectors/cart.selectors";
import { API_URL, getAuthHeaders } from "../utils/api";
import { formatPrice } from "../utils/format";
import { STORE_BRAND } from "../utils/brand";
import CheckoutSteps from "./checkout/CheckoutSteps";
import ShippingStep from "./checkout/ShippingStep";
import PaymentStep from "./checkout/PaymentStep";
import ReviewStep from "./checkout/ReviewStep";
import "./checkout/Checkout.css";

const STRIPE_PUBLISHABLE_KEY =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: "16px",
            color: "#1d1d1d",
            fontFamily: '"Inter", system-ui, sans-serif',
            "::placeholder": { color: "#6c757d" },
        },
        invalid: { color: "#d62828" },
    },
    hidePostalCode: true,
};

const calcItemsTotal = (cartItems) =>
    cartItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
    );

function CheckoutContent() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    const reduxItems = useSelector(selectCartItems);
    const reduxItemsRef = useRef(reduxItems);
    reduxItemsRef.current = reduxItems;

    const [items, setItems] = useState(reduxItems);
    const [loadingCart, setLoadingCart] = useState(true);
    const [error, setError] = useState(null);

    const [loadingStripe, setLoadingStripe] = useState(true);
    const [stripeReady, setStripeReady] = useState(false);

    const [step, setStep] = useState(1);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: "",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
    });
    const [paymentInfo, setPaymentInfo] = useState({ method: "card" });
    const [isPlacing, setIsPlacing] = useState(false);
    const [placeError, setPlaceError] = useState(null);
    const [cardError, setCardError] = useState(null);
    const [cardComplete, setCardComplete] = useState(false);

    // ✅ CENTRALIZED ERROR HANDLING FUNCTION
    const handleStripeError = (message) => {
        toast.error(message);
        setPlaceError(message);
    };

    // Stripe is ready when useStripe + useElements are available
    useEffect(() => {
        if (!stripePromise) {
            setLoadingStripe(false);
            return;
        }

        stripePromise
            .then(() => {
                if (stripe && elements) {
                    setStripeReady(true);
                    setLoadingStripe(false);
                }
            })
            .catch(() => setLoadingStripe(false));
    }, [stripe, elements]);

    useEffect(() => {
        if (stripe && elements) {
            setStripeReady(true);
            setLoadingStripe(false);
        }
    }, [stripe, elements]);

    const fetchCart = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        setLoadingCart(true);
        setError(null);

        const result = await dispatch(getCart());
        if (result.success) {
            const cartItems = result.items;
            if (cartItems.length === 0) {
                navigate("/cart");
                setLoadingCart(false);
                return;
            }
            setItems(cartItems);
        } else {
            const fallback = reduxItemsRef.current;
            if (fallback.length > 0) {
                setItems(fallback);
            } else {
                setError(result.error || "Unable to load your cart. Please try again.");
            }
        }
        setLoadingCart(false);
    }, [dispatch, navigate]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const subtotal = useMemo(() => calcItemsTotal(items), [items]);

    const { tax, shipping, total } = useMemo(() => {
        const taxAmount = subtotal * TAX_RATE;
        const shippingAmount =
            subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        return {
            tax: taxAmount,
            shipping: shippingAmount,
            total: subtotal + taxAmount + shippingAmount,
        };
    }, [subtotal]);

    const handlePay = async () => {
        if (loadingStripe || !stripeReady || !stripe || !elements) {
            handleStripeError("Stripe is still loading. Please wait.");
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            handleStripeError("Go back to the payment step and enter your card.");
            return;
        }

        if (cardError) {
            handleStripeError(cardError);
            return;
        }

        if (total <= 0) {
            handleStripeError("Cart total is invalid.");
            return;
        }

        setIsPlacing(true);
        setPlaceError(null);

        try {
            const { data } = await axios.post(
                `${API_URL}/api/payment/create-payment-intent`,
                { totalPrice: total },
                { headers: getAuthHeaders() }
            );

            if (!data?.clientSecret) {
                throw new Error("Missing client secret from server");
            }

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                data.clientSecret,
                { payment_method: { card: cardElement } }
            );

            if (stripeError || paymentIntent?.status !== "succeeded") {
                handleStripeError(stripeError?.message || "Payment was not completed.");
                return;
            }

            const orderResult = await dispatch(
                placeOrder({
                    items: items.map(({ productId, title, price, size, quantity, image }) => ({
                        productId,
                        title,
                        price,
                        size,
                        quantity,
                        image,
                    })),
                    shippingInfo,
                    payment: {
                        method: "card",
                        status: "paid",
                        transactionId: paymentIntent.id,
                    },
                    subtotal,
                    tax,
                    shipping,
                    total,
                })
            );

            if (!orderResult.success) {
                handleStripeError(orderResult.error || "Failed to place order.");
                return;
            }

            await dispatch(clearCart());
            toast.success("Payment successful!");
            navigate(`/order-confirmation/${orderResult.order.orderNumber}`);
        } catch (err) {
            console.error(err.response?.data?.msg || err.message);
            handleStripeError(err.response?.data?.msg || err.message || "Payment failed.");
        } finally {
            setIsPlacing(false);
        }
    };

    if (loadingCart && items.length === 0) {
        return (
            <div className="checkout-page">
                <h1>Checkout</h1>
                <p className="text-small home__muted">Loading your cart…</p>
            </div>
        );
    }

    if (error && items.length === 0) {
        return (
            <div className="checkout-page">
                <h1>Checkout</h1>
                <p className="checkout-form__error checkout-form__error--block">{error}</p>
                <div className="checkout-form__actions">
                    <button type="button" className="btn-primary" onClick={fetchCart}>
                        Retry
                    </button>
                    <Link to="/shop" className="btn-secondary">
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) return null;

    const payDisabled = loadingStripe || !stripeReady || isPlacing || total <= 0;

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            <CheckoutSteps current={step} />

            <div className="checkout-page__layout">
                <div className="checkout-page__main">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <ShippingStep
                                key="shipping"
                                initialData={shippingInfo}
                                onNext={(data) => {
                                    setShippingInfo(data);
                                    setStep(2);
                                }}
                            />
                        )}
                        {step === 3 && (
                            <ReviewStep
                                key="review"
                                shippingInfo={shippingInfo}
                                paymentInfo={paymentInfo}
                                items={items}
                                subtotal={subtotal}
                                tax={tax}
                                shipping={shipping}
                                total={total}
                                onBack={() => setStep(2)}
                                onPlaceOrder={handlePay}
                                isPlacing={isPlacing}
                                payDisabled={payDisabled}
                                loadingStripe={loadingStripe}
                                placeError={placeError}
                            />
                        )}
                    </AnimatePresence>

                    {/* CardElement always mounted after step 2 (required for confirmCardPayment) */}
                    {step >= 2 && (
                        <div
                            className={
                                step === 3 ? "checkout-stripe-persist--hidden" : "checkout-stripe-persist"
                            }
                            aria-hidden={step === 3}
                        >
                            <PaymentStep
                                cardError={cardError}
                                onBack={() => setStep(1)}
                                onNext={(data) => {
                                    if (cardError) {
                                        toast.error(cardError);
                                        return;
                                    }
                                    if (!cardComplete) {
                                        toast.error("Please complete your card details.");
                                        return;
                                    }
                                    setPaymentInfo(data);
                                    setStep(3);
                                }}
                            >
                                <CardElement
                                    options={CARD_ELEMENT_OPTIONS}
                                    onChange={(event) => {
                                        setCardError(event.error ? event.error.message : null);
                                        setCardComplete(event.complete);
                                    }}
                                />
                            </PaymentStep>
                        </div>
                    )}
                </div>

                <div className="checkout-page__summary">
                    <h4>Order Total</h4>
                    {items.map((item) => (
                        <div key={`${item.productId}-${item.size}`} className="review-item">
                            <span className="review-item__detail">
                                <span className="review-item__brand">{STORE_BRAND}</span>
                                <span>{item.title} × {item.quantity}</span>
                            </span>
                            <span>
                                {formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                            </span>
                        </div>
                    ))}
                    <div className="review-item">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="review-item">
                        <span>Tax</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="review-item">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                    </div>
                    <div className="review-item review-item--total">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <Link to="/shop" className="checkout-page__back-shop">
                        ← Back to Shop
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Checkout() {
    if (!stripePromise) {
        return (
            <div className="checkout-page">
                <h1>Checkout</h1>
                <p className="checkout-form__error checkout-form__error--block">
                    Stripe key missing. Set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.
                </p>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <CheckoutContent />
        </Elements>
    );
}