/**
 * Checkout Module Type Definitions
 */

export type BillingCycle = "monthly" | "quarterly" | "semiAnnually" | "annually" | "biennially" | "triennially";
export type CheckoutMode = "service" | "domain";

export interface BillingCycleOption {
  id: BillingCycle;
  label: string;
  price: number;
  pricePerMonth: number;
  originalPrice?: number;
  discount?: number;
  discountPercentage?: number;
}

export type DomainAction = "register" | "transfer" | "use-owned";

export interface DomainSearchResult {
  domain: string;
  tld: string;
  available: boolean;
  price: number;
  promotionalPrice?: number;
  period?: number;
  eppCode?: string;
}

export interface ServerLocation {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  isFree?: boolean;
  image?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BillingContact {
  id: string;
  name: string;
  email: string;
  address: Address;
  phone: string;
  currency?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  description?: string;
  supportedCountries?: string[];
}

export interface OrderItem {
  id: string;
  name: string;
  type: "hosting" | "domain" | "addon";
  billingCycle?: BillingCycle;
  price: number;
  quantity: number;
}

/** Meta returned when a promo is applied (from /promotions/validate). */
export type PromoDiscountMeta =
  | { kind: "promotion"; productBillingCycles?: string[] }
  | { kind: "affiliate" };

export interface CheckoutFormData {
  billingCycle: BillingCycle;
  domainAction: DomainAction;
  selectedDomain?: DomainSearchResult;
  serverLocation: ServerLocation;
  selectedAddons: Addon[];
  billingContact: BillingContact;
  useDefaultRegistrant: boolean;
  registrantContact?: BillingContact;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  promoDiscount?: number;
  promoDiscountMeta?: PromoDiscountMeta;
  referral?: string;
  agreeToTerms: boolean;
}

export interface OrderSummary {
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  currency: string;
}

export interface NewAccountInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  password: string;
  address: Address;
}

export interface CreateOrderPayload {
  // ── Product (required for service checkout, omitted for domain-only checkout) ──
  productId?: string;
  billingCycle?: string;
  currency: string;

  // ── Domain (conditional based on action) ──
  domain: {
    action: "register" | "transfer" | "use-owned";

    // For REGISTER
    registration?: {
      domainName: string;
      tld: string;
      period: number;
      priceOverride?: number; // Admin: override domain price
    };

    // For TRANSFER
    transfer?: {
      domainName: string;
      tld: string;
      eppCode: string;
      priceOverride?: number; // Admin: override domain price
    };

    // For USE-OWNED
    ownDomain?: {
      domainName: string;
      tld: string;
    };
  };

  // ── Server (required for service checkout) ──
  serverLocation?: string; // ID of the location

  // ── Payment ──
  paymentMethod: string; // ID of the payment method

  // ── Client Identity (one of three modes, or admin-selected) ──
  client:
  | { type: "existing"; clientId: string }
  | { type: "new"; account: NewAccountInfo }
  | { type: "guest" }
  | { type: "admin_selected"; clientId: string };

  // ── Promotions ──
  coupon?: string;
  referral?: string;

  // ── Terms ──
  agreeToTerms: boolean;

  // ── Admin options ──
  sendEmail?: boolean; // Default true; when false, skip order/invoice emails
  status?: string; // Optional initial status (admin only): PENDING_PAYMENT, ACTIVE, etc.
  qty?: number; // Quantity for product (default 1)
  productPriceOverride?: number; // Admin: override product price per unit
  generateInvoice?: boolean; // Default true; when false (admin only), create order without invoice
}
