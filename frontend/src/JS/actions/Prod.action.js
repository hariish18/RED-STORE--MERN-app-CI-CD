import axios from "axios";
import {
    LOAD_PROD,
    GET_PRODUCTS,
    GET_ONE_PRODUCT,
    GET_MY_PRODUCT,
    ADD_PRODUCT,
    EDIT_PRODUCT,
    DELETE_PRODUCT,
    FAIL_PROD,
    LOAD_NEW_ARRIVALS,
    GET_NEW_ARRIVALS,
    FAIL_NEW_ARRIVALS,
    LOAD_SALE_PRODUCTS,
    GET_SALE_PRODUCTS,
    FAIL_SALE_PRODUCTS,
} from "../actionsType/Prod.actionType";

import { API_URL as BASE_URL } from "../../utils/api";
export const API_URL = `${BASE_URL}/api/product`;

// authentication header (raw token, without Bearer prefix)
const authConfig = () => ({
    headers: { authorization: localStorage.getItem("token") },
});

// GET ALL PRODUCTS (optional filters: { gender, category })
export const getAllProducts = (filters = {}) => async (dispatch) => {
    dispatch({ type: LOAD_PROD });
    try {
        const params = new URLSearchParams(
            Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
        );
        const query = params.toString();
        const { data } = await axios.get(`${API_URL}/allProd${query ? `?${query}` : ""}`);
        dispatch({ type: GET_PRODUCTS, payload: data.Prod });
    } catch (error) {
        dispatch({ type: FAIL_PROD, payload: error.response?.data?.msg });
        console.error("Error:", error.response?.data || error.message);
    }
};

// SEARCH PRODUCTS (title/description/category/brand) - same payload shape as
// getAllProducts, so it reuses the same action type (productReducer doesn't need
// to know anything more)
export const searchProducts = (q) => async (dispatch) => {
    dispatch({ type: LOAD_PROD });
    try {
        const { data } = await axios.get(`${API_URL}/search`, { params: { q } });
        dispatch({ type: GET_PRODUCTS, payload: data.Prod });
    } catch (error) {
        dispatch({ type: FAIL_PROD, payload: error.response?.data?.msg });
        console.error("Error:", error.response?.data || error.message);
    }
};

// GET NEW ARRIVALS (home page) - most recent products, limited count.
// Dedicated state (see Prod.actionType.js) to avoid overwriting `products`, already used
// by ProductDetail for "related products".
export const getNewArrivals = (limit = 8) => async (dispatch) => {
    dispatch({ type: LOAD_NEW_ARRIVALS });
    try {
        const { data } = await axios.get(`${API_URL}/allProd`, { params: { sort: "newest", limit } });
        dispatch({ type: GET_NEW_ARRIVALS, payload: data.Prod });
    } catch (error) {
        dispatch({ type: FAIL_NEW_ARRIVALS, payload: error.response?.data?.msg });
        console.error("Error:", error.response?.data || error.message);
    }
};

// GET SALE PRODUCTS (/sale page) - products with isOnSale: true. Dedicated state
// (see Prod.actionType.js), same reasoning as getNewArrivals.
export const getSaleProducts = () => async (dispatch) => {
    dispatch({ type: LOAD_SALE_PRODUCTS });
    try {
        const { data } = await axios.get(`${API_URL}/allProd`, { params: { onSale: true } });
        dispatch({ type: GET_SALE_PRODUCTS, payload: data.Prod });
    } catch (error) {
        dispatch({ type: FAIL_SALE_PRODUCTS, payload: error.response?.data?.msg });
        console.error("Error:", error.response?.data || error.message);
    }
};

// GET PRODUCT BY ID
export const getProductById = (id) => async (dispatch) => {
    dispatch({ type: LOAD_PROD });
    try {
        const { data } = await axios.get(`${API_URL}/prod/${id}`);
        dispatch({ type: GET_ONE_PRODUCT, payload: data.prodToGet });
    } catch (error) {
        dispatch({ type: FAIL_PROD, payload: error.response?.data?.msg });
        console.error("Error:", error.response?.data || error.message);
    }
};

// GET MY PRODUCTS (products created by the logged-in user)
export const getMyProducts = () => async (dispatch) => {
    dispatch({ type: LOAD_PROD });
    try {
        const { data } = await axios.get(`${API_URL}/myProd`, authConfig());
        dispatch({ type: GET_MY_PRODUCT, payload: data.myListProd });
    } catch (error) {
        dispatch({ type: FAIL_PROD, payload: error.response?.data?.msg });
        console.error("Error:", error.response?.data || error.message);
    }
};

// ADD PRODUCT (newProduct can be a JSON object or FormData if images are attached)
export const addProduct = (newProduct) => async (dispatch) => {
    dispatch({ type: LOAD_PROD });
    try {
        const { data } = await axios.post(`${API_URL}/addProd`, newProduct, authConfig());
        dispatch({ type: ADD_PRODUCT, payload: data.newProd });
        return { success: true, product: data.newProd };
    } catch (error) {
        const msg = error.response?.data?.msg || "Failed to add product";
        dispatch({ type: FAIL_PROD, payload: msg });
        console.error("Error:", error.response?.data || error.message);
        return { success: false, error: msg };
    }
};

// EDIT PRODUCT
export const editProduct = (id, updatedProduct) => async (dispatch) => {
    dispatch({ type: LOAD_PROD });
    try {
        const { data } = await axios.put(`${API_URL}/${id}`, updatedProduct, authConfig());
        dispatch({ type: EDIT_PRODUCT, payload: data.prodToUpdate });
    } catch (error) {
        dispatch({ type: FAIL_PROD, payload: error.response?.data?.msg });
        console.error("Error:", error.response?.data || error.message);
    }
};

// DELETE PRODUCT
export const deleteProduct = (id) => async (dispatch) => {
    dispatch({ type: LOAD_PROD });
    try {
        await axios.delete(`${API_URL}/${id}`, authConfig());
        dispatch({ type: DELETE_PRODUCT, payload: id });
    } catch (error) {
        dispatch({ type: FAIL_PROD, payload: error.response?.data?.msg });
        console.error("Error:", error.response?.data || error.message);
    }
};
