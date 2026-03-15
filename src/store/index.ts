import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "./api/baseApi";
import "./api/productApi"; // Inject product endpoints
import "./api/promotionApi"; // Inject promotion endpoints
import "./api/roleApi"; // Inject role endpoints
import "./api/userApi"; // Inject user endpoints
import authReducer from "./slices/authSlice";
import activeClientReducer, { setActingAs, clearActingAs } from "./slices/activeClientSlice";
import {
  saveActingAs,
  clearActingAsStorage,
} from "./slices/activeClientPersistence";
import checkoutReducer from "./slices/checkoutSlice";
import currencyReducer from "./slices/currencySlice";

const activeClientPersistenceMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  if (setActingAs.match(action)) {
    saveActingAs(action.payload);
  } else if (clearActingAs.match(action)) {
    clearActingAsStorage();
  }
  return result;
};

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    activeClient: activeClientReducer,
    checkout: checkoutReducer,
    currency: currencyReducer,
    // Add other slices here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, activeClientPersistenceMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
