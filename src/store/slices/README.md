# Redux Slices

This directory contains Redux Toolkit slices for state management.

## Current Slices

### `authSlice.ts`
Authentication state management
- **State**: token, user, isAuthenticated
- **Actions**: setCredentials, clearCredentials

### `checkoutSlice.ts`
Checkout/Order state management
- **State**: formData, orderSummary, isLoading, error, step
- **Actions**: 
  - Form updates: setBillingCycle, setDomainAction, setSelectedDomain, etc.
  - Navigation: setStep, nextStep, previousStep
  - Order: setOrderSummary
  - Utility: setLoading, setError, resetCheckout, clearCheckout

### `currencySlice.ts`
Currency state management
- **State**: availableCurrencies, selectedCurrency
- **Actions**: 
  - setCurrency: Change selected currency
  - addCurrency: Add new currency programmatically (code only)
  - removeCurrency: Remove currency programmatically
  - setAvailableCurrencies: Set all available currencies at once

**Adding Currencies:**
Currencies are added programmatically in code, not through UI. To add a currency:

```tsx
import { useDispatch } from "react-redux";
import { addCurrency } from "@/store/slices/currencySlice";

// In your component or initialization code
dispatch(addCurrency({
  code: "EUR",
  name: "Euro",
  symbol: "€",
  locale: "de-DE"
}));
```

Or update `src/types/currency.ts` DEFAULT_CURRENCIES array.

## Future Slices

- `uiSlice.ts` - UI state (modals, sidebars, etc.)
- `notificationsSlice.ts` - Notification state
- `cartSlice.ts` - Shopping cart state (if needed separately)
- `productsSlice.ts` - Product catalog state
- etc.
