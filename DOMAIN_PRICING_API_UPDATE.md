# Domain Pricing API Update Guide

## Overview
The Domain Pricing structure has been updated on the frontend to support multiple currencies (USD, BDT) and an `enable` flag for specific pricing tiers (similar to product pricing). The backend API needs to be updated to accept and return this new structure.

## 1. Updated Data Structures

### Pricing Detail Object
Each pricing node (e.g., for 1 year) now includes an `enable` boolean.

```typescript
interface TLDPricingDetail {
    register: number;
    renew: number;
    transfer: number;
    enable: boolean; // New field to toggle this specific term
}
```

### Currency Pricing Object
Pricing is now grouped by currency code, with specific keys for years `"1"`, `"2"`, and `"3"`.

```typescript
interface TLDCurrencyPricing {
    currency: string; // e.g., "USD", "BDT"
    "1": TLDPricingDetail;
    "2": TLDPricingDetail;
    "3": TLDPricingDetail;
}
```

### TLD Object
The `pricing` field in the main TLD object has changed from a flat array of tiers to an array of currency objects.

```typescript
interface TLD {
    _id: string;
    tld: string;
    // ... other existing fields ...
    
    // CHANGED: Now an array of currency objects instead of simple tiers
    pricing: TLDCurrencyPricing[]; 
}
```

## 2. Example JSON Payload

Here is an example of what the frontend will now send when creating or updating a TLD.

**POST / PATCH** `/api/v1/domains/tld`

```json
{
  "tld": "com",
  "pricing": [
    {
      "currency": "USD",
      "1": {
        "register": 10.00,
        "renew": 12.00,
        "transfer": 10.00,
        "enable": true
      },
      "2": {
        "register": 20.00,
        "renew": 24.00,
        "transfer": 20.00,
        "enable": true
      },
      "3": {
        "register": 30.00,
        "renew": 36.00,
        "transfer": 30.00,
        "enable": false
      }
    },
    {
      "currency": "BDT",
      "1": {
        "register": 1200.00,
        "renew": 1400.00,
        "transfer": 1200.00,
        "enable": true
      },
      "2": {
        "register": 2400.00,
        "renew": 2800.00,
        "transfer": 2400.00,
        "enable": true
      },
      "3": {
        "register": 3600.00,
        "renew": 4200.00,
        "transfer": 3600.00,
        "enable": false
      }
    }
  ]
}
```

## 3. Key Changes for Backend Developer

1.  **Database Schema**: Update the `pricing` field definition in the TLD model/schema to accept the nested structure shown above instead of the previous flat array.
2.  **Validation**: Update validation logic to check for the `currency` field and the nested `"1"`, `"2"`, `"3"` year keys.
3.  **Default Values**: When creating a new TLD without specific pricing, ensure the backend initializes it with this structure (or that it accepts the full structure sent by the frontend's `handleAddTld`).
