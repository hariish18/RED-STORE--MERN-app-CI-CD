import { createStore, applyMiddleware, compose } from "redux";
import { composeWithDevTools } from "@redux-devtools/extension";
import { thunk } from "redux-thunk";
import rootReducer from "../reducers/index";

// DevTools enabled only in dev: import.meta.env.DEV is the native Vite flag
// (true with `vite`/`vite dev`, false in the prod build), to never
// expose the Redux state to a visitor on the live site.
const composeEnhancers = import.meta.env.DEV ? composeWithDevTools : compose;

const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk))
);

export default store;
