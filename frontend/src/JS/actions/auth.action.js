import { LOAD_AUTH, SUCCESS_AUTH, FAIL_AUTH, CURRENT_AUTH, LOGOUT_AUTH, UPDATE_USER_SUCCESS } from "../actionsType/auth.actionType";
import axios from "axios";
import { mergeServerCart } from "./cart.action";
import { getWishlist } from "./wishlist.action";

import { API_URL } from "../../utils/api";

// The backend does not return a single error format: validation
// (express-validator) returns { errors: [{msg, path, ...}] }, while
// "business" errors (email already used, etc.) return { message }. Neither
// route ever returns { msg } at the root level, so reading
// error.response.data.msg directly always returns undefined.
const extractAuthError = (error) => {
    const data = error.response?.data;
    if (data?.errors?.length) return data.errors.map((e) => e.msg).join(" ");
    if (data?.message) return data.message;
    return "Something went wrong. Please try again.";
};

// action that handles user registration
export const register = (newUser, navigate) => async (dispatch) => {
    dispatch({ type: LOAD_AUTH })
    try {
        const result = await axios.post(`${API_URL}/api/auth/register`, newUser)
        localStorage.setItem("token", result.data.token);
        dispatch({ type: SUCCESS_AUTH, payload: result.data })
        dispatch(mergeServerCart())
        dispatch(getWishlist())
        // navigate to profile if success
        navigate('/profile')

    } catch (error) {
        dispatch({ type: FAIL_AUTH, payload: extractAuthError(error) });
    }
};
// action that handles user login
export const login = (user , navigate ) => async (dispatch) => {
    dispatch({ type: LOAD_AUTH })
    try {
        const result = await axios.post(`${API_URL}/api/auth/login`, user)
        localStorage.setItem("token", result.data.token);
        dispatch({ type: SUCCESS_AUTH, payload: result.data })
        dispatch(mergeServerCart())
        dispatch(getWishlist())
        navigate('/profile')
    } catch (error) {
        dispatch({ type: FAIL_AUTH, payload: extractAuthError(error) });
    }
};
// action that handles the currently logged-in user
export const current = () => async (dispatch) => {
    dispatch({ type: LOAD_AUTH });
    try {
        const config = {
            headers: {
                authorization: localStorage.getItem("token")
            }
        
    }
        const result = await axios.get(`${API_URL}/api/auth/current`, config)
    dispatch({ type: CURRENT_AUTH, payload: result.data })
    dispatch(mergeServerCart())
    dispatch(getWishlist())
} catch {
    // current() runs silently on every App mount, including
    // for a non-logged-in visitor (no token / expired token): this is
    // not an error to display on Login/Register pages, just the
    // "not logged in" state. So we do not populate `errors` here.
    dispatch({ type: FAIL_AUTH, payload: null });
}
}
// log out: logout
export const logout = (navigate) => async (dispatch) => {
    dispatch({ type: LOGOUT_AUTH })
    navigate('/login')
};

// updates profile information (name, email, phone, optional password)
export const updateProfile = (updates) => async (dispatch) => {
    try {
        const config = { headers: { authorization: localStorage.getItem("token") } };
        const result = await axios.patch(`${API_URL}/api/auth/profile`, updates, config);
        dispatch({ type: UPDATE_USER_SUCCESS, payload: result.data });
        return { success: true };
    } catch (error) {
        const msg = extractAuthError(error);
        dispatch({ type: FAIL_AUTH, payload: msg });
        return { success: false, error: msg };
    }
};

// adds a shipping address to the profile
export const addAddress = (address) => async (dispatch) => {
    try {
        const config = { headers: { authorization: localStorage.getItem("token") } };
        const result = await axios.post(`${API_URL}/api/auth/addresses`, address, config);
        dispatch({ type: UPDATE_USER_SUCCESS, payload: result.data });
        return { success: true };
    } catch (error) {
        return { success: false, error: extractAuthError(error) };
    }
};

// updates an existing address
export const updateAddress = (addressId, address) => async (dispatch) => {
    try {
        const config = { headers: { authorization: localStorage.getItem("token") } };
        const result = await axios.patch(`${API_URL}/api/auth/addresses/${addressId}`, address, config);
        dispatch({ type: UPDATE_USER_SUCCESS, payload: result.data });
        return { success: true };
    } catch (error) {
        return { success: false, error: extractAuthError(error) };
    }
};

// password reset request (ForgotPassword page) - no dispatch: no other
// component needs this state; the page manages its own success/error display
export const forgotPassword = async (email) => {
    try {
        const { data } = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
        return { success: true, message: data.message };
    } catch (error) {
        return { success: false, error: extractAuthError(error) };
    }
};

// applies the new password (ResetPassword page)
export const resetPassword = async (token, password) => {
    try {
        const { data } = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
        return { success: true, message: data.message };
    } catch (error) {
        return { success: false, error: extractAuthError(error) };
    }
};

// removes an address from the profile
export const deleteAddress = (addressId) => async (dispatch) => {
    try {
        const config = { headers: { authorization: localStorage.getItem("token") } };
        const result = await axios.delete(`${API_URL}/api/auth/addresses/${addressId}`, config);
        dispatch({ type: UPDATE_USER_SUCCESS, payload: result.data });
        return { success: true };
    } catch (error) {
        return { success: false, error: extractAuthError(error) };
    }
};