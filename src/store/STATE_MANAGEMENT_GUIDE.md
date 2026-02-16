# State Management Guide

## Decision Tree: Redux vs Local State

### Use Redux When:
✅ **Shared State** - Data needed across multiple components/pages
✅ **Persistent State** - Data that should survive page navigation
✅ **Complex State** - State with complex logic or calculations
✅ **API State** - Server data that needs caching (use RTK Query)
✅ **Global UI State** - Sidebar open/close, theme, notifications
✅ **Business Logic State** - Cart, checkout, user preferences

**Examples:**
- Authentication state (authSlice)
- Checkout form data (checkoutSlice)
- Shopping cart
- User profile
- API responses (RTK Query)

### Use Local useState When:
✅ **Component-Specific** - Only used within one component
✅ **Temporary UI State** - Modal open/close, dropdown toggle, form input focus
✅ **Derived State** - Can be calculated from props or other state
✅ **Simple Toggles** - Boolean flags for UI interactions
✅ **Form Inputs** - Input values before submission (unless form is shared)

**Examples:**
- Modal `isOpen` state
- Dropdown `isExpanded` state
- Input field value (before form submission)
- Local loading state for a single component
- Temporary UI feedback (show/hide messages)

## Patterns

### Pattern 1: Redux for Global State
```tsx
// ✅ Use Redux for checkout form (shared across components)
const { formData, setBillingCycle } = useCheckoutRedux();

// ✅ Use Redux for auth (needed everywhere)
const { user, isAuthenticated } = useAuth();
```

### Pattern 2: Local State for UI
```tsx
// ✅ Use local state for modal toggle (component-specific)
const [isModalOpen, setIsModalOpen] = useState(false);

// ✅ Use local state for dropdown (component-specific)
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

// ✅ Use local state for form input (before submission)
const [searchQuery, setSearchQuery] = useState("");
```

### Pattern 3: Hybrid Approach
```tsx
// Redux for shared data
const { formData, setBillingCycle } = useCheckoutRedux();

// Local state for UI interactions
const [isSearchFocused, setIsSearchFocused] = useState(false);
const [showTooltip, setShowTooltip] = useState(false);
```

## Best Practices

1. **Start Local, Move to Redux When Needed**
   - Begin with `useState` for component-specific state
   - Move to Redux when state needs to be shared

2. **Keep Redux Slices Focused**
   - One slice per domain (auth, checkout, cart, etc.)
   - Don't create slices for single-use components

3. **Use RTK Query for All API Calls**
   - Automatic caching
   - Loading/error states
   - Cache invalidation

4. **Component State for UI Only**
   - Animations, transitions, tooltips
   - Form validation feedback
   - Temporary messages

## Examples in This Project

### ✅ Redux (Global State)
- `authSlice` - User authentication (needed everywhere)
- `checkoutSlice` - Checkout form (shared across checkout components)
- RTK Query APIs - All server data

### ✅ Local State (Component-Specific)
- Sidebar mobile menu toggle (`ClientLayout`)
- Search input focus state
- Modal open/close states
- Dropdown expanded states
- Temporary validation messages

## Migration Path

If you find yourself:
- Passing props through multiple components → Move to Redux
- Duplicating state in multiple places → Move to Redux
- Needing state after navigation → Move to Redux
- Only using state in one component → Keep as local state
