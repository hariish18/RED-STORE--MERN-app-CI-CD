import axios from "axios";
import { LOAD_CART, SET_CART, FAIL_CART, CLEAR_CART } from "../actionsType/cart.actionType";

import { API_URL } from "../../utils/api";

const authConfig = () => ({
    headers: { authorization: localStorage.getItem("token") },
});

// single source of truth for the cart on the frontend side: the Redux state is always
// populated from the server response (never computed locally), so the navbar, the
// /cart page and the checkout always display exactly the same cart
export const getCart = () => async (dispatch) => {
    const token = localStorage.getItem("token");
    if (!token) {
        dispatch({ type: SET_CART, payload: [] });
        return { success: true, items: [] };
    }
    dispatch({ type: LOAD_CART });
    try {
        const { data } = await axios.get(`${API_URL}/api/cart`, authConfig());
        const items = data.items || [];
        dispatch({ type: SET_CART, payload: items });
        return { success: true, items };
    } catch (error) {
        const msg = error.response?.data?.msg || "Failed to load cart";
        dispatch({ type: FAIL_CART, payload: msg });
        return { success: false, error: msg };
    }
};

// kept for compatibility with auth.action.js (called on login/register/current)
export const mergeServerCart = () => getCart();

// adds a product (or increments its quantity if already in the cart) - persists
// server-side (source of truth) then reloads the full cart, to recover the stock
// and totalPrice recalculated by the backend
export const addToCart = (product, size, quantity = 1) => async (dispatch, getState) => {
    if (!getState().authReducer.isAuth) {
        return { success: false, error: "Please sign in to add items to your cart." };
    }
    try {
        await axios.post(
            `${API_URL}/api/cart/add`,
            { productId: product._id, quantity, size },
            authConfig()
        );
        return dispatch(getCart());
    } catch (error) {
        const msg = error.response?.data?.msg || "Failed to add to cart";
        dispatch({ type: FAIL_CART, payload: msg });
        return { success: false, error: msg };
    }
};

// adjusts the quantity of an item already in the cart (relative delta: +1/-1 from the
// cart page buttons) by reusing /api/cart/add, which increments/decrements
export const updateCartQuantity = (productId, size, delta) => async (dispatch, getState) => {
    if (!getState().authReducer.isAuth) {
        return { success: false, error: "Please sign in to update your cart." };
    }
    try {
        await axios.post(
            `${API_URL}/api/cart/add`,
            { productId, quantity: delta, size },
            authConfig()
        );
        return dispatch(getCart());
    } catch (error) {
        const msg = error.response?.data?.msg || "Failed to update quantity";
        dispatch({ type: FAIL_CART, payload: msg });
        return { success: false, error: msg };
    }
};

// completely removes an item from the cart (all quantities combined)
export const removeFromCart = (productId, size) => async (dispatch, getState) => {
    if (!getState().authReducer.isAuth) {
        return { success: false, error: "Please sign in to update your cart." };
    }
    try {
        const sizeQuery = size != null ? `?size=${size}` : "";
        await axios.delete(`${API_URL}/api/cart/remove/${productId}${sizeQuery}`, authConfig());
        return dispatch(getCart());
    } catch (error) {
        const msg = error.response?.data?.msg || "Failed to remove item";
        dispatch({ type: FAIL_CART, payload: msg });
        return { success: false, error: msg };
    }
};

// empties the cart (end of order) - persists server-side before clearing Redux
export const clearCart = () => async (dispatch, getState) => {
    if (getState().authReducer.isAuth) {
        try {
            await axios.delete(`${API_URL}/api/cart`, authConfig());
        } catch (error) {
            // the local cart is cleared anyway (order already placed): don't block
            // the user on a post-payment cleanup error
            console.error("Error:", error.response?.data || error.message);
        }
    }
    dispatch({ type: CLEAR_CART });
};
