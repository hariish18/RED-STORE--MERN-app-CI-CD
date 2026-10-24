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

const initialState = {
    isLoad: false,
    products: [],
    product: null,
    myProducts: [],
    errors: null,
    // dedicated state for the "New Arrivals" section (home page) - separate from `products`
    // to avoid interfering with the "related products" of ProductDetail
    isLoadNewArrivals: false,
    newArrivals: [],
    newArrivalsErrors: null,
    // dedicated state for the "Sale" page - same reasoning as New Arrivals above
    isLoadSaleProducts: false,
    saleProducts: [],
    saleProductsErrors: null,
};

const productReducer = (state = initialState, { type, payload } = {}) => {
    switch (type) {
        case LOAD_PROD:
            return { ...state, isLoad: true };
        case GET_PRODUCTS:
            return { ...state, isLoad: false, products: payload || [] };
        case GET_ONE_PRODUCT:
            return { ...state, isLoad: false, product: payload || null };
        case GET_MY_PRODUCT:
            return { ...state, isLoad: false, myProducts: payload || [] };
        case ADD_PRODUCT:
            return { ...state, isLoad: false, myProducts: [...state.myProducts, payload] };
        case EDIT_PRODUCT:
            return {
                ...state,
                isLoad: false,
                myProducts: state.myProducts.map((p) => (p._id === payload._id ? payload : p)),
                product: state.product?._id === payload._id ? payload : state.product,
            };
        case DELETE_PRODUCT:
            return {
                ...state,
                isLoad: false,
                myProducts: state.myProducts.filter((p) => p._id !== payload),
            };
        case FAIL_PROD:
            return { ...state, isLoad: false, errors: payload };
        case LOAD_NEW_ARRIVALS:
            return { ...state, isLoadNewArrivals: true };
        case GET_NEW_ARRIVALS:
            return { ...state, isLoadNewArrivals: false, newArrivals: payload || [] };
        case FAIL_NEW_ARRIVALS:
            return { ...state, isLoadNewArrivals: false, newArrivalsErrors: payload };
        case LOAD_SALE_PRODUCTS:
            return { ...state, isLoadSaleProducts: true };
        case GET_SALE_PRODUCTS:
            return { ...state, isLoadSaleProducts: false, saleProducts: payload || [] };
        case FAIL_SALE_PRODUCTS:
            return { ...state, isLoadSaleProducts: false, saleProductsErrors: payload };
        default:
            return state;
    }
};

export default productReducer;
