import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_CURRENCIES, type Currency } from "@/types/currency";

interface CurrencyState {
  availableCurrencies: Currency[];
  selectedCurrency: Currency;
}

const initialState: CurrencyState = {
  availableCurrencies: DEFAULT_CURRENCIES,
  selectedCurrency: DEFAULT_CURRENCIES[0], // USD by default
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      const currency = state.availableCurrencies.find(
        (c) => c.code === action.payload
      );
      if (currency) {
        state.selectedCurrency = currency;
      }
    },
    // Add currency programmatically (for code/Redux only, not UI)
    addCurrency: (state, action: PayloadAction<Currency>) => {
      // Check if currency already exists
      const exists = state.availableCurrencies.some(
        (c) => c.code === action.payload.code
      );
      if (!exists) {
        state.availableCurrencies.push(action.payload);
      }
    },
    // Remove currency programmatically
    removeCurrency: (state, action: PayloadAction<string>) => {
      // Don't allow removing the currently selected currency
      if (action.payload !== state.selectedCurrency.code) {
        state.availableCurrencies = state.availableCurrencies.filter(
          (c) => c.code !== action.payload
        );
      }
    },
    // Set all available currencies at once
    setAvailableCurrencies: (state, action: PayloadAction<Currency[]>) => {
      state.availableCurrencies = action.payload;
      // If selected currency is not in new list, reset to first currency
      const selectedExists = action.payload.some(
        (c) => c.code === state.selectedCurrency.code
      );
      if (!selectedExists && action.payload.length > 0) {
        state.selectedCurrency = action.payload[0];
      }
    },
  },
});

export const { setCurrency, addCurrency, removeCurrency, setAvailableCurrencies } =
  currencySlice.actions;
export default currencySlice.reducer;
