# State Management Examples

## ✅ Current Implementation - Correct Usage

### Redux (Global/Shared State)

#### 1. Authentication State
```tsx
// src/store/slices/authSlice.ts
// ✅ CORRECT: Used across entire app
const { user, isAuthenticated } = useAuth();
```

#### 2. Checkout State
```tsx
// src/store/slices/checkoutSlice.ts
// ✅ CORRECT: Shared across multiple checkout components
const { formData, setBillingCycle, handleCheckout } = useCheckoutRedux();
```

### Local State (Component-Specific)

#### 1. Sidebar Toggle
```tsx
// src/components/client/ClientLayout.tsx
// ✅ CORRECT: Only used in this component
const [sidebarOpen, setSidebarOpen] = useState(false);
```

#### 2. Domain Search Input
```tsx
// src/components/checkout/DomainConfiguration.tsx
// ✅ CORRECT: Temporary input before submission
const [searchQuery, setSearchQuery] = useState("");
const [selectedTld, setSelectedTld] = useState(".com");
```

#### 3. Modal/Dropdown States
```tsx
// ✅ CORRECT: UI-only state
const [isModalOpen, setIsModalOpen] = useState(false);
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
```

## When to Move to Redux

### Example: Sidebar State
**Current (Local):** ✅ Correct
```tsx
// Only used in ClientLayout
const [sidebarOpen, setSidebarOpen] = useState(false);
```

**Move to Redux if:**
- Need to open sidebar from other components
- Need to persist sidebar state across navigation
- Need to sync sidebar with other UI elements

**Would become:**
```tsx
// src/store/slices/uiSlice.ts
const { sidebarOpen, toggleSidebar } = useUI();
```

## Decision Examples

### ❌ Don't Use Redux For:
```tsx
// ❌ BAD: Too small, component-specific
const [isTooltipVisible, setIsTooltipVisible] = useState(false);
const [inputValue, setInputValue] = useState("");
const [isLoading, setIsLoading] = useState(false); // Single component
```

### ✅ Use Redux For:
```tsx
// ✅ GOOD: Shared across app
const { user } = useAuth();
const { cartItems } = useCart();
const { formData } = useCheckoutRedux();
```

### ✅ Use Local State For:
```tsx
// ✅ GOOD: Component-specific
const [isModalOpen, setIsModalOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [showSuccess, setShowSuccess] = useState(false);
```

## Hybrid Example (Best Practice)

```tsx
function CheckoutComponent() {
  // ✅ Redux: Shared checkout state
  const { formData, setBillingCycle } = useCheckoutRedux();
  
  // ✅ Local: UI-only state
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    // Component JSX
  );
}
```

## Summary

| State Type | Use | Example |
|------------|-----|---------|
| **Global/Shared** | Redux | Auth, Checkout, Cart |
| **API Data** | RTK Query | Products, Orders, Users |
| **UI Toggles** | Local useState | Modal, Dropdown, Tooltip |
| **Form Inputs** | Local useState | Search, Input fields |
| **Temporary Feedback** | Local useState | Success/Error messages |
