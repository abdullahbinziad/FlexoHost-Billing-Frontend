# Types

Central type definitions for FlexoHost Billing frontend. Domain-organized for clarity and tree-shaking.

## Structure

```
types/
├── index.ts           # Barrel – re-exports all (use for convenience)
├── api.ts             # ApiResponse, PaginatedResponse, ApiError
├── auth.ts            # User, Client, AuthTokens, AuthState, etc.
├── checkout.ts        # BillingCycle, CheckoutFormData, CreateOrderPayload, etc.
├── currency.ts        # Currency, SUPPORTED_CURRENCY_CODES, DEFAULT_CURRENCIES
├── domain.ts          # Domain, DomainTableFilters, BulkAction
├── domain-manage.ts   # DomainDetails, ContactInfo, DNSRecord (detail view)
├── hosting.ts         # HostingService, ServicesRenewingSoon
├── hosting-manage.ts  # HostingServiceDetails, SidebarSection (detail view)
├── invoice.ts         # Invoice, InvoiceItem, InvoiceStatus
├── navigation.ts      # NavItem, SubMenuItem
├── vps-manage.ts      # VPSServiceDetails
│
├── admin.ts           # Barrel for admin types
└── admin/
    ├── product.ts     # Product, ProductType, CurrencyPricing
    ├── order.ts       # Order
    ├── server.ts      # ServerConfig, ServerGroup, getServerGroups
    ├── coupon.ts      # Promotion, CreatePromotionDTO, Coupon
    └── tld.ts         # TLD, TLDPricingDetail
```

## Usage

**Prefer domain imports** (better tree-shaking):

```ts
import type { Invoice } from '@/types/invoice';
import type { User } from '@/types/auth';
import type { Product } from '@/types/admin';
```

**Or use barrel**:

```ts
import type { Invoice, User, Product } from '@/types';
```

## Conventions

- **Domain files** – One file per domain (auth, checkout, invoice, etc.)
- **Detail views** – `*-manage.ts` extends base types (e.g. `DomainDetails extends Domain`)
- **Admin** – Admin-only types live in `admin/` with `admin.ts` as barrel
- **API types** – Generic `ApiResponse<T>`, `PaginatedResponse<T>` in `api.ts`
