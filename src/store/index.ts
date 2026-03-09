import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "./api/baseApi";
import "./api/productApi"; // Inject product endpoints
import "./api/promotionApi"; // Inject promotion endpoints
import authReducer from "./slices/authSlice";
import checkoutReducer from "./slices/checkoutSlice";
import currencyReducer from "./slices/currencySlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    checkout: checkoutReducer,
    currency: currencyReducer,
    // Add other slices here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
