# Redux Store Architecture

This project uses **Redux Toolkit** with **RTK Query** for state management and API calls.

## Store Structure

```
src/store/
├── index.ts                 # Store configuration
├── slices/                  # Redux slices (local state)
│   ├── authSlice.ts        # Authentication state
│   └── checkoutSlice.ts     # Checkout/Order state
└── api/                     # RTK Query API endpoints
    ├── baseApi.ts          # Base API configuration
    ├── authApi.ts          # Auth endpoints
    ├── checkoutApi.ts      # Checkout endpoints
    ├── clientApi.ts        # Client panel endpoints
    └── adminApi.ts         # Admin panel endpoints
```

## State Management Strategy

### Redux Slices (Local State)
Used for:
- **UI State**: Authentication, checkout form data, navigation steps
- **Client-side calculations**: Order summaries, form validation
- **Temporary state**: Loading indicators, error messages

**Current Slices:**
1. **authSlice** - User authentication state
2. **checkoutSlice** - Checkout form and order state

### RTK Query (Server State)
Used for:
- **API calls**: All backend communication
- **Caching**: Automatic caching of API responses
- **Cache invalidation**: Tag-based cache management

**Current APIs:**
1. **authApi** - Login, logout, token refresh
2. **checkoutApi** - Order creation, promo validation, domain search
3. **clientApi** - Client-specific endpoints (to be implemented)
4. **adminApi** - Admin-specific endpoints (to be implemented)

## Checkout Module - Redux Integration

The checkout module now uses **Redux** for all state management:

### Checkout Slice (`checkoutSlice.ts`)
- **State**: formData, orderSummary, isLoading, error, step
- **Actions**: All form field updates, navigation, order processing

### Checkout API (`checkoutApi.ts`)
- `getCheckoutData` - Fetch checkout configuration
- `createOrder` - Submit order
- `validatePromoCode` - Validate promo codes
- `searchDomain` - Check domain availability

### Usage Hook (`useCheckoutRedux.ts`)
Custom hook that:
- Connects to Redux store
- Provides typed actions
- Calculates order summary
- Handles checkout submission

## Benefits of Redux Integration

1. **Centralized State**: All checkout state in one place
2. **Persistence**: Can easily persist to localStorage if needed
3. **Time Travel Debugging**: Redux DevTools support
4. **Predictable Updates**: All state changes through actions
5. **Type Safety**: Full TypeScript support
6. **Cache Management**: RTK Query handles API caching automatically

## Example Usage

```tsx
import { useCheckoutRedux } from "@/hooks/useCheckoutRedux";

function CheckoutComponent() {
  const {
    formData,
    orderSummary,
    isLoading,
    error,
    setBillingCycle,
    setServerLocation,
    handleCheckout,
  } = useCheckoutRedux(billingCycleOptions);

  return (
    // Your component JSX
  );
}
```

## Adding New Slices

1. Create slice in `src/store/slices/`
2. Import and add to store in `src/store/index.ts`
3. Export actions and selectors
4. Create typed hooks if needed

## Adding New API Endpoints

1. Add endpoint to appropriate API file in `src/store/api/`
2. Use `api.injectEndpoints()` pattern
3. Export generated hooks
4. Add appropriate tags for cache invalidation
