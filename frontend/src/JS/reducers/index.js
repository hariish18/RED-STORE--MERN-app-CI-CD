import { combineReducers } from "redux";
import authReducer from "./authReducer";
import productReducer from "./productReducer";
import cartReducer from "./cartReducer";
import orderReducer from "./orderReducer";
import paymentReducer from "./paymentReducer";
import wishlistReducer from "./wishlistReducer";
// Combine reducers
const rootReducer = combineReducers({
    authReducer,
    productReducer,
    cartReducer,
    orderReducer,
    paymentReducer,
    wishlistReducer,
});
export default rootReducer;