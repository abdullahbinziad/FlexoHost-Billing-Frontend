import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "./api/baseApi";
import "./api/productApi"; // Inject product endpoints
import "./api/promotionApi"; // Inject promotion endpoints
import "./api/domainApi"; // Inject domain / registrar config endpoints
import "./api/roleApi"; // Inject role endpoints
import "./api/userApi"; // Inject user endpoints
import authReducer from "./slices/authSlice";
import activeClientReducer, { setActingAs, clearActingAs } from "./slices/activeClientSlice";
import {
  saveActingAs,
  clearActingAsStorage,
} from "./slices/activeClientPersistence";
import checkoutReducer, { clearCheckout, resetCheckout } from "./slices/checkoutSlice";
import currencyReducer from "./slices/currencySlice";
import {
  clearCheckoutStateStorage,
  loadCheckoutState,
  saveCheckoutState,
} from "./slices/checkoutPersistence";

const activeClientPersistenceMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  if (setActingAs.match(action)) {
    saveActingAs(action.payload);
  } else if (clearActingAs.match(action)) {
    clearActingAsStorage();
  }
  return result;
};

const checkoutPersistenceMiddleware: Middleware =
  (storeApi) => (next) => (action) => {
    const result = next(action);

    if (clearCheckout.match(action) || resetCheckout.match(action)) {
      clearCheckoutStateStorage();
      return result;
    }

    saveCheckoutState(storeApi.getState().checkout);
    return result;
  };

const preloadedCheckoutState = loadCheckoutState();

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    activeClient: activeClientReducer,
    checkout: checkoutReducer,
    currency: currencyReducer,
    // Add other slices here
  },
  preloadedState: preloadedCheckoutState
    ? {
        checkout: preloadedCheckoutState,
      }
    : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware,
      activeClientPersistenceMiddleware,
      checkoutPersistenceMiddleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
