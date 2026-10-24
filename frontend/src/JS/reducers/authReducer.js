// import action types
import { LOAD_AUTH, SUCCESS_AUTH, FAIL_AUTH, CURRENT_AUTH, LOGOUT_AUTH, UPDATE_USER_SUCCESS } from "../actionsType/auth.actionType";





//initial state
const initialState = {
    isLoad: false,
    user: null,
    errors: [],
    success: [],
    isAuth: false,


}

//pure function
const authReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        // when loading is in progress
        case LOAD_AUTH:
            return { ...state, isLoad: true }
        // on successful registration or login
        case SUCCESS_AUTH:
            return { ...state, isLoad: false, user: payload.user, success: payload.msg, isAuth: true }

        // when the user is already logged in
        case CURRENT_AUTH:
            return { ...state, isLoad: false, user: payload.user, isAuth: true }
        // on profile or address update
        case UPDATE_USER_SUCCESS:
            return { ...state, isLoad: false, user: payload.user, errors: [] }
        // on logout
        case FAIL_AUTH:
            return { ...state, isLoad: false, errors: payload}
        case LOGOUT_AUTH:
            localStorage.removeItem("token")
            return { ...state, isLoad: false, user: {}, success: [], errors: [], isAuth: false }
        default:
            return state ;
    } 
};

export default authReducer;