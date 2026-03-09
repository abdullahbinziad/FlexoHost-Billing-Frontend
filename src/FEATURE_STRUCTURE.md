# FlexoHost Billing - Frontend Feature Structure

Industry-standard structure for scalable feature modules.

## Directory Overview

```
src/
├── app/                    # Next.js App Router (pages, layouts)
├── components/             # React components
│   ├── ui/                 # Shared primitives (Button, Input, etc.)
│   ├── shared/             # Cross-feature (CurrencySwitcher, DarkModeToggle)
│   ├── client/             # Client layout (Header, Sidebar, RouteGuard)
│   ├── public/             # Public/unauthenticated layout
│   ├── invoice/            # Invoice feature (refactored)
│   ├── checkout/           # Checkout feature
│   └── admin/              # Admin feature modules
├── config/                 # Navigation, API config
├── contexts/               # React contexts (Auth, Theme, Sidebar)
├── hooks/                  # Custom hooks
├── lib/                    # App-specific utilities
│   ├── mappers/            # API → Frontend type transformers
│   └── ...
├── store/                  # Redux (slices, RTK Query APIs)
├── types/                  # TypeScript definitions
└── utils/                  # Pure utility functions
```

## Feature Module Pattern

Each feature should follow this structure:

```
components/{feature}/
├── index.ts              # Barrel export (public API)
├── {Feature}Page.tsx     # Main page/container
├── {Feature}*.tsx        # Sub-components
├── {feature}.utils.ts    # Feature-specific utilities (optional)
├── {feature}.constants.ts # Feature constants (optional)
└── use{Feature}*.ts      # Feature-specific hooks (optional)
```

### Example: Invoice (refactored)

```
invoice/
├── index.ts
├── InvoiceDetail.tsx      # Orchestrator
├── InvoiceHeader.tsx
├── InvoiceBody.tsx
├── InvoiceActions.tsx
├── useInvoicePdf.ts
├── invoice.utils.ts
└── invoice.constants.ts
```

## API Data Mapping

- **Location:** `lib/mappers/`
- **Purpose:** Transform backend API responses to frontend types
- **Usage:** Import mappers in page components, not in API layer

```ts
// lib/mappers/invoice.mapper.ts
export function mapInvoiceApiToFrontend(data: InvoiceApiResponse): Invoice { ... }
```

## Utils vs Lib

| Location | Purpose |
|----------|---------|
| `utils/` | Pure functions, no app dependencies (format, validation, errors) |
| `lib/` | App-specific (API client, mappers, constants, security) |

## Types Organization

- `types/{domain}.ts` - Domain-specific types (invoice, checkout, auth)
- `types/admin/` - Admin-specific types
- `store/api/*.ts` - API response types (when not in mappers)

## Imports

Prefer barrel imports for feature modules:

```ts
// Good
import { InvoiceDetail } from "@/components/invoice";
import { CheckoutPage } from "@/components/checkout";

// Also valid (direct)
import { InvoiceDetail } from "@/components/invoice/InvoiceDetail";
```
