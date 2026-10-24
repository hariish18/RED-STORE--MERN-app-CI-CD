// Loading
export const LOAD_PROD = "LOAD_PROD";
// Success
export const GET_PRODUCTS = "GET_PRODUCTS";
export const GET_ONE_PRODUCT = "GET_ONE_PRODUCT";
export const GET_MY_PRODUCT = "GET_MY_PRODUCT";
export const ADD_PRODUCT = "ADD_PRODUCT";
export const EDIT_PRODUCT = "EDIT_PRODUCT";
export const DELETE_PRODUCT = "DELETE_PRODUCT";

// Failure
export const FAIL_PROD = "FAIL_PROD";

// new arrivals (home page): separate state from `products`/`isLoad` above, which is
// already consumed by ProductDetail for "related products" - reusing GET_PRODUCTS
// here would overwrite that state with a limited/sorted list and break that page.
export const LOAD_NEW_ARRIVALS = "LOAD_NEW_ARRIVALS";
export const GET_NEW_ARRIVALS = "GET_NEW_ARRIVALS";
export const FAIL_NEW_ARRIVALS = "FAIL_NEW_ARRIVALS";

// sale products (/sale page): same reasoning as New Arrivals above,
// dedicated state so as not to overwrite `products`/`newArrivals`.
export const LOAD_SALE_PRODUCTS = "LOAD_SALE_PRODUCTS";
export const GET_SALE_PRODUCTS = "GET_SALE_PRODUCTS";
export const FAIL_SALE_PRODUCTS = "FAIL_SALE_PRODUCTS";
