import { LOAD_CART, SET_CART, FAIL_CART, CLEAR_CART } from "../actionsType/cart.actionType";

// isLoad starts at true (not false): the cart is loaded on app mount
// (see mergeServerCart in auth.action.js) - avoids a "cart empty" flash before
// the first load has had time to complete
const initialState = {
    isLoad: true,
    items: [], // { productId, title, price, image, brand, size, quantity, stock }
    errors: null,
};

const cartReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case LOAD_CART:
            return { ...state, isLoad: true };
        case SET_CART:
            return { ...state, isLoad: false, items: payload || [], errors: null };
        case FAIL_CART:
            return { ...state, isLoad: false, errors: payload };
        case CLEAR_CART:
            return { ...state, items: [] };
        default:
            return state;
    }
};

export default cartReducer;
