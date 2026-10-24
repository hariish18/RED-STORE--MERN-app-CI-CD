import axios from "axios";
import {
    PAYMENT_LOADING,
    PAYMENT_SUCCESS,
    PAYMENT_FAIL,
    PAYMENT_RESET,
} from "../actionsType/payment.actionType";

import { API_URL } from "../../utils/api";

// Payment is processed server-side (/api/payment/process) rather than simulated in the
// browser, so a client cannot forge a success. No Stripe key is configured on the
// backend either: the controller simulates a gateway (even the "always declined" test
// card), but the result is authoritative server-side.
export const processPayment = (paymentDetails, amount) => async (dispatch) => {
    dispatch({ type: PAYMENT_LOADING });
    try {
        const { data } = await axios.post(`${API_URL}/api/payment/process`, {
            method: paymentDetails.method,
            cardNumber: paymentDetails.cardNumber,
            expiry: paymentDetails.expiry,
            cvv: paymentDetails.cvv,
            amount,
        });
        dispatch({ type: PAYMENT_SUCCESS, payload: data.transactionId });
        return { success: true, transactionId: data.transactionId };
    } catch (error) {
        const message = error.response?.data?.msg || "Payment failed. Please try again.";
        dispatch({ type: PAYMENT_FAIL, payload: message });
        return { success: false, error: message };
    }
};

export const resetPayment = () => ({ type: PAYMENT_RESET });
