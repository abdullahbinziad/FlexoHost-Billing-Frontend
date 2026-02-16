"use client";

import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import type {
  BillingCycleOption,
  ServerLocation,
  Addon,
  BillingContact,
  PaymentMethod,
} from "@/types/checkout";

// Mock data - Replace with actual API calls
const mockBillingCycleOptions: BillingCycleOption[] = [
  {
    id: "monthly",
    label: "Monthly",
    price: 958,
    pricePerMonth: 958,
  },
  {
    id: "annually",
    label: "Annually",
    price: 8047,
    pricePerMonth: 671,
    originalPrice: 11496,
    discount: 3449,
    discountPercentage: 30,
  },
  {
    id: "biennially",
    label: "Biennially",
    price: 13795,
    pricePerMonth: 575,
    originalPrice: 22992,
    discount: 9197,
    discountPercentage: 40,
  },
  {
    id: "triennially",
    label: "Triennially",
    price: 17244,
    pricePerMonth: 479,
    originalPrice: 34488,
    discount: 17244,
    discountPercentage: 50,
  },
];

const mockServerLocations: ServerLocation[] = [
  { id: "usa", country: "USA", countryCode: "US", flag: "🇺🇸" },
  { id: "malaysia", country: "Malaysia", countryCode: "MY", flag: "🇲🇾" },
  { id: "singapore", country: "Singapore", countryCode: "SG", flag: "🇸🇬" },
  { id: "bangladesh", country: "Bangladesh", countryCode: "BD", flag: "🇧🇩" },
  { id: "germany", country: "Germany", countryCode: "DE", flag: "🇩🇪" },
  { id: "finland", country: "Finland", countryCode: "FI", flag: "🇫🇮" },
];

const mockAddons: Addon[] = [
  {
    id: "sitejet",
    name: "Sitejet - AI Powered Website Builder",
    description:
      "Sitejet offers a fully integrated website builder with AI-powered features to create stunning websites effortlessly.",
    price: 0,
    isFree: true,
  },
  {
    id: "wp-toolkit",
    name: "WP Toolkit Deluxe",
    description:
      "WP Toolkit Deluxe gives you advanced features for managing WordPress installations with ease.",
    price: 0,
    isFree: true,
  },
];

const mockBillingContacts: BillingContact[] = [
  {
    id: "1",
    name: "ABDULLAH BIN ZIAD",
    email: "abdullahbinziad@gmail.com",
    address: {
      street: "Khordo",
      city: "Kalaroa",
      state: "Satkhira",
      zipCode: "9414",
      country: "Bangladesh",
      countryCode: "BD",
    },
    phone: "+880.1772-065894",
    currency: "NGN",
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "sslcommerz",
    name: "SSLCommerz - Nagad, Rocket, Upay & BD Cards",
    logo: "/logos/sslcommerz.svg",
  },
  { id: "bkash", name: "bKash Payment", logo: "/logos/bkash.svg" },
];

export default function Checkout() {
  return (
    <CheckoutPage
      productName="Hosting - Starter"
      basePrice={958}
      billingCycleOptions={mockBillingCycleOptions}
      serverLocations={mockServerLocations}
      availableAddons={mockAddons}
      billingContacts={mockBillingContacts}
      paymentMethods={mockPaymentMethods}
    />
  );
}
