import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Row, Col, Card, InputNumber, Button, Input, Empty, Divider, Typography, Skeleton } from "antd";
import { DeleteOutlined, ShoppingOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { getCart, updateCartQuantity, removeFromCart } from "../JS/actions/cart.action";
import { TAX_RATE, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, selectSubtotal } from "../JS/selectors/cart.selectors";
import { formatPrice } from "../utils/format";
import { STORE_BRAND } from "../utils/brand";
import Reveal from "../components/Reveal";
import "./Cart.css";

const { Title, Text } = Typography;

// Common "empty page" state (not logged in, error, empty cart): antd Empty + action
const CartMessage = ({ title, description, action }) => (
    <div className="cart-page">
        <Reveal className="cart-empty">
            <Empty
                image={<ShoppingOutlined className="cart-empty__icon" />}
                description={
                    <>
                        <Title level={3} className="cart-empty__title">{title}</Title>
                        <Text type="secondary">{description}</Text>
                    </>
                }
            >
                {action}
            </Empty>
        </Reveal>
    </div>
);

const SummaryRow = ({ label, value }) => (
    <div className="cart-summary__row">
        <Text type="secondary">{label}</Text>
        <Text>{value}</Text>
    </div>
);

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAuth = useSelector((state) => state.authReducer.isAuth);
    const token = localStorage.getItem("token");

    const items = useSelector((state) => state.cartReducer.items);
    const isLoad = useSelector((state) => state.cartReducer.isLoad);
    const errors = useSelector((state) => state.cartReducer.errors);
    const totalPrice = useSelector(selectSubtotal);

    const [updatingKey, setUpdatingKey] = useState(null);
    const [promoError, setPromoError] = useState("");
    // increments after a failed update to reset the InputNumber (uncontrolled)
    // and clear an input rejected by the server
    const [resetTick, setResetTick] = useState(0);
    // synchronous lock: a click on -/+ followed by blur should not send
    // the same update twice while the first request is in flight
    const pendingRef = useRef(false);

    const itemKey = (item) => `${item.productId}-${item.size ?? "default"}`;

    // focal point of the product image (imageFocus, optional) -> CSS variables read by .cart-line__thumb
    const thumbStyle = (focus) =>
        focus?.x != null && focus?.y != null
            ? { "--thumb-focus": `${focus.x}% ${focus.y}%`, "--thumb-zoom": focus.zoom ?? 1 }
            : undefined;

    useEffect(() => {
        if (isAuth && token) dispatch(getCart());
    }, [dispatch, isAuth, token]);

    // The cart API works with deltas (+n / -n): we send the difference from the current quantity
    const handleQuantityChange = async (item, nextQuantity) => {
        const next = Math.round(Number(nextQuantity));
        if (!Number.isFinite(next) || next < 1 || next === item.quantity) {
            setResetTick((t) => t + 1);
            return;
        }
        if (pendingRef.current) return;
        pendingRef.current = true;
        const key = itemKey(item);
        setUpdatingKey(key);
        const result = await dispatch(updateCartQuantity(item.productId, item.size, next - item.quantity));
        if (!result.success) {
            toast.error(result.error || "Error updating cart");
            setResetTick((t) => t + 1);
        }
        pendingRef.current = false;
        setUpdatingKey(null);
    };

    const handleRemove = async (item) => {
        const key = itemKey(item);
        setUpdatingKey(key);
        const result = await dispatch(removeFromCart(item.productId, item.size));
        if (result.success) toast.success("Item removed from cart");
        else toast.error(result.error || "Error removing item");
        setUpdatingKey(null);
    };

    // No promo codes exist yet on the backend: we validate the input and
    // clearly indicate it rather than applying a fake discount
    const handleApplyPromo = (value) => {
        const code = value.trim();
        setPromoError(code ? `"${code}" is not a valid promo code` : "Please enter a promo code");
    };

    const tax = totalPrice * TAX_RATE;
    const shipping = totalPrice === 0 || totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const orderTotal = totalPrice + tax + shipping;

    if (!isAuth || !token) {
        return (
            <CartMessage
                title="Sign in to view your cart"
                description="Your cart is saved to your account once you're logged in."
                action={
                    <Button type="primary" size="large" onClick={() => navigate("/login")}>
                        Sign In
                    </Button>
                }
            />
        );
    }

    const isInitialLoading = isLoad && items.length === 0;

    if (isInitialLoading) {
        return (
            <div className="cart-page">
                <div className="cart-page__header">
                    <Title level={1}>Your Cart</Title>
                </div>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card><Skeleton avatar={{ shape: "square", size: 104 }} active /></Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card><Skeleton active /></Card>
                    </Col>
                </Row>
            </div>
        );
    }

    if (errors && items.length === 0) {
        return (
            <CartMessage
                title="Something went wrong"
                description={errors}
                action={
                    <Button type="primary" size="large" onClick={() => dispatch(getCart())}>
                        Retry
                    </Button>
                }
            />
        );
    }

    if (items.length === 0) {
        return (
            <CartMessage
                title="Your cart is empty"
                description="Looks like you haven't added any shoes yet."
                action={
                    <Button type="primary" size="large" icon={<ShoppingOutlined />} onClick={() => navigate("/shop")}>
                        Continue Shopping
                    </Button>
                }
            />
        );
    }

    const itemCount = items.reduce((n, item) => n + item.quantity, 0);

    return (
        <div className="cart-page">
            <Reveal className="cart-page__header">
                <Title level={1}>Your Cart</Title>
                <Text type="secondary">
                    {itemCount} {itemCount > 1 ? "items" : "item"}
                </Text>
            </Reveal>

            <Row gutter={[24, 24]} align="top">
                <Col xs={24} lg={16}>
                    <div className="cart-page__items">
                        <AnimatePresence>
                            {items.map((item) => {
                                const key = itemKey(item);
                                const isUpdating = updatingKey === key;
                                // stock returned by getCart; if unknown, no client-side cap
                                const maxQuantity = item.stock > 0 ? Math.max(item.stock, item.quantity) : undefined;

                                return (
                                    <motion.div
                                        key={key}
                                        layout
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -24 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <Card hoverable className="cart-line">
                                            <div className="cart-line__body">
                                                <Link
                                                    to={`/shop/${item.productId}`}
                                                    className="cart-line__thumb"
                                                    style={thumbStyle(item.imageFocus)}
                                                >
                                                    <img src={item.image || "/vite.svg"} alt={item.title} />
                                                </Link>

                                                <div className="cart-line__info">
                                                    <Text type="secondary" className="cart-line__brand">
                                                        {item.brand || STORE_BRAND}
                                                    </Text>
                                                    <Link to={`/shop/${item.productId}`} className="cart-line__title">
                                                        {item.title}
                                                    </Link>
                                                    {item.size != null && (
                                                        <Text type="secondary">Size: {item.size}</Text>
                                                    )}
                                                </div>

                                                <InputNumber
                                                    key={`${key}-${item.quantity}-${resetTick}`}
                                                    className="cart-line__qty"
                                                    aria-label={`Quantity for ${item.title}`}
                                                    min={1}
                                                    max={maxQuantity}
                                                    precision={0}
                                                    defaultValue={item.quantity}
                                                    disabled={isUpdating}
                                                    mode="spinner"
                                                    // arrows/buttons: immediate update; keyboard input:
                                                    // validated on field blur or Enter (not on every keystroke)
                                                    onStep={(value) => handleQuantityChange(item, value)}
                                                    onPressEnter={(e) => e.target.blur()}
                                                    onBlur={(e) => handleQuantityChange(item, e.target.value)}
                                                />

                                                <Text strong className="cart-line__price">
                                                    {formatPrice(item.price * item.quantity)}
                                                </Text>

                                                <Button
                                                    type="text"
                                                    danger
                                                    shape="circle"
                                                    icon={<DeleteOutlined />}
                                                    className="cart-line__remove"
                                                    aria-label={`Remove ${item.title}`}
                                                    loading={isUpdating}
                                                    onClick={() => handleRemove(item)}
                                                />
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Order Summary" className="cart-summary">
                        <SummaryRow label="Subtotal" value={formatPrice(totalPrice)} />
                        <SummaryRow label="Tax" value={formatPrice(tax)} />
                        <SummaryRow label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
                        {shipping > 0 && (
                            <Text type="secondary" className="cart-summary__note">
                                Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
                            </Text>
                        )}

                        <Divider className="cart-summary__divider" />

                        <label htmlFor="cart-promo-code" className="cart-promo__label">
                            Promo code
                        </label>
                        <Input.Search
                            id="cart-promo-code"
                            placeholder="Enter code"
                            enterButton="Apply"
                            allowClear
                            status={promoError ? "error" : undefined}
                            onChange={() => promoError && setPromoError("")}
                            onSearch={handleApplyPromo}
                        />
                        {promoError && (
                            <Text type="danger" className="cart-promo__error">
                                {promoError}
                            </Text>
                        )}

                        <Divider className="cart-summary__divider" />

                        <div className="cart-summary__row cart-summary__row--total">
                            <Text strong>Total</Text>
                            <Text strong className="cart-summary__total">
                                {formatPrice(orderTotal)}
                            </Text>
                        </div>

                        <Button
                            type="primary"
                            danger
                            size="large"
                            block
                            className="cart-summary__checkout"
                            onClick={() => navigate("/checkout")}
                        >
                            Proceed to Checkout
                        </Button>
                        <Button
                            type="link"
                            block
                            icon={<ArrowLeftOutlined />}
                            className="cart-summary__continue"
                            onClick={() => navigate("/shop")}
                        >
                            Continue Shopping
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Cart;
