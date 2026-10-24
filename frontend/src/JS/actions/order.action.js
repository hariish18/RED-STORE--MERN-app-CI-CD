import axios from "axios";
import {
    LOAD_ORDER,
    PLACE_ORDER_SUCCESS,
    GET_ORDER_SUCCESS,
    GET_ORDERS_SUCCESS,
    FAIL_ORDER,
} from "../actionsType/order.actionType";

import { API_URL as BASE_URL } from "../../utils/api";
const API_URL = `${BASE_URL}/api/order`;

// places the order on the backend (guest or logged-in: the token is sent if it exists)
export const placeOrder = (orderData) => async (dispatch) => {
    dispatch({ type: LOAD_ORDER });
    try {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { authorization: token } } : {};
        const { data } = await axios.post(API_URL, orderData, config);
        dispatch({ type: PLACE_ORDER_SUCCESS, payload: data.order });
        return { success: true, order: data.order };
    } catch (error) {
        const msg = error.response?.data?.msg || "Failed to place order";
        dispatch({ type: FAIL_ORDER, payload: msg });
        return { success: false, error: msg };
    }
};

// fetches an order by its number (confirmation page)
export const getOrderByNumber = (orderNumber) => async (dispatch) => {
    dispatch({ type: LOAD_ORDER });
    try {
        const { data } = await axios.get(`${API_URL}/${orderNumber}`);
        dispatch({ type: GET_ORDER_SUCCESS, payload: data.order });
    } catch (error) {
        dispatch({ type: FAIL_ORDER, payload: error.response?.data?.msg });
    }
};

// fetches the orders of the logged-in user (profile page)
export const getMyOrders = () => async (dispatch) => {
    dispatch({ type: LOAD_ORDER });
    try {
        const config = { headers: { authorization: localStorage.getItem("token") } };
        const { data } = await axios.get(`${API_URL}/mine`, config);
        dispatch({ type: GET_ORDERS_SUCCESS, payload: data.orders });
    } catch (error) {
        dispatch({ type: FAIL_ORDER, payload: error.response?.data?.msg });
    }
};
