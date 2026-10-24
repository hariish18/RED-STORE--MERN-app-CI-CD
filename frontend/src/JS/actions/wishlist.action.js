import axios from "axios";
import {
    LOAD_WISHLIST,
    SET_WISHLIST,
    ADD_WISHLIST_ITEM,
    REMOVE_WISHLIST_ITEM,
    FAIL_WISHLIST,
} from "../actionsType/wishlist.actionType";

import { API_URL } from "../../utils/api";

const authConfig = () => ({
    headers: { authorization: localStorage.getItem("token") },
});

// fetches the wishlist of the logged-in user (populated products, not just IDs)
export const getWishlist = () => async (dispatch) => {
    dispatch({ type: LOAD_WISHLIST });
    try {
        const { data } = await axios.get(`${API_URL}/api/auth/wishlist`, authConfig());
        dispatch({ type: SET_WISHLIST, payload: data.wishlist || [] });
    } catch (error) {
        dispatch({ type: FAIL_WISHLIST, payload: error.response?.data?.message });
    }
};

// adds a product (already available client-side, e.g. from ProductCard) - optimistic
// immediate update, the server call follows behind
export const addToWishlist = (product) => async (dispatch) => {
    dispatch({ type: ADD_WISHLIST_ITEM, payload: product });
    try {
        await axios.post(`${API_URL}/api/auth/wishlist/${product._id}`, {}, authConfig());
    } catch (error) {
        dispatch({ type: REMOVE_WISHLIST_ITEM, payload: product._id });
        dispatch({ type: FAIL_WISHLIST, payload: error.response?.data?.message });
    }
};

export const removeFromWishlist = (productId) => async (dispatch, getState) => {
    const previous = getState().wishlistReducer.items.find((p) => p._id === productId);
    dispatch({ type: REMOVE_WISHLIST_ITEM, payload: productId });
    try {
        await axios.delete(`${API_URL}/api/auth/wishlist/${productId}`, authConfig());
    } catch (error) {
        if (previous) dispatch({ type: ADD_WISHLIST_ITEM, payload: previous });
        dispatch({ type: FAIL_WISHLIST, payload: error.response?.data?.message });
    }
};
