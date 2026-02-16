# Checkout Module

A comprehensive, modular checkout system for the hosting billing platform.

## Folder Structure

```
src/
├── components/
│   └── checkout/
│       ├── BillingCycleSelector.tsx    # Billing cycle selection (Monthly, Annually, etc.)
│       ├── DomainConfiguration.tsx      # Domain registration/transfer/use-owned
│       ├── ServerLocationSelector.tsx  # Server location selection with flags
│       ├── AddonCard.tsx                # Individual addon card component
│       ├── AvailableAddons.tsx          # Container for all available addons
│       ├── BillingDetailsForm.tsx       # Billing contact selection
│       ├── DomainRegistrantInfo.tsx     # Domain registrant information
│       ├── PaymentMethodSelector.tsx   # Payment method selection
│       ├── OrderSummaryCard.tsx        # Order summary sidebar
│       └── CheckoutPage.tsx             # Main checkout page orchestrator
├── types/
│   └── checkout.ts                     # TypeScript type definitions
├── hooks/
│   └── useCheckout.ts                  # Checkout state management hook
└── utils/
    └── checkout.ts                     # Checkout utility functions
```

## Components

### BillingCycleSelector
Displays billing cycle options (Monthly, Annually, Biennially, Triennially) with pricing and discount badges.

### DomainConfiguration
Handles domain registration, transfer, or using an owned domain. Includes domain search and popular TLD selection.

### ServerLocationSelector
Radio button selection for server locations with country flags.

### AvailableAddons
Container component that displays all available addons using AddonCard components.

### AddonCard
Individual addon card with add/remove functionality.

### BillingDetailsForm
Displays billing contacts and allows selection or creation of new contact.

### DomainRegistrantInfo
Allows users to specify alternative registrant information or use default billing contact.

### PaymentMethodSelector
Radio button selection for payment methods with logos.

### OrderSummaryCard
Sticky sidebar component showing order summary, totals, terms checkbox, and checkout button.

### CheckoutPage
Main orchestrator component that combines all checkout sections and manages the overall layout.

## Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Modular component architecture
- ✅ Type-safe with TypeScript
- ✅ Reusable components
- ✅ Clean separation of concerns
- ✅ State management with custom hook
- ✅ Beautiful UI with Tailwind CSS

## Usage

```tsx
import { CheckoutPage } from "@/components/checkout/CheckoutPage";

<CheckoutPage
  productName="Hosting - Starter"
  basePrice={958}
  billingCycleOptions={billingCycleOptions}
  serverLocations={serverLocations}
  availableAddons={addons}
  billingContacts={contacts}
  paymentMethods={paymentMethods}
/>
```

## Responsive Design

- **Mobile**: Single column layout, order summary stacks below
- **Tablet**: Two column layout for addons, single column for main sections
- **Desktop**: Three column grid with sticky order summary sidebar
