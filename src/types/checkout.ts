/**
 * Checkout Module Type Definitions
 */

export type BillingCycle = "monthly" | "annually" | "biennially" | "triennially";

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

export interface BillingContact {
  id: string;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    countryCode: string;
  };
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
