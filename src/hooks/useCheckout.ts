"use client";

import { useState, useMemo } from "react";
import type {
  CheckoutFormData,
  BillingCycle,
  DomainAction,
  ServerLocation,
  Addon,
  BillingContact,
  PaymentMethod,
  OrderSummary,
  OrderItem,
} from "@/types/checkout";

const initialFormData: Partial<CheckoutFormData> = {
  billingCycle: "triennially",
  domainAction: "register",
  selectedAddons: [],
  useDefaultRegistrant: true,
  agreeToTerms: false,
};

export function useCheckout(
  productPrice: number,
  billingCycleOptions: Array<{
    id: BillingCycle;
    price: number;
  }>
) {
  const [formData, setFormData] = useState<Partial<CheckoutFormData>>(
    initialFormData
  );

  const updateFormData = <K extends keyof CheckoutFormData>(
    key: K,
    value: CheckoutFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const orderSummary: OrderSummary = useMemo(() => {
    const items: OrderItem[] = [];

    // Add hosting product
    const selectedCycle = billingCycleOptions.find(
      (opt) => opt.id === formData.billingCycle
    );
    if (selectedCycle) {
      items.push({
        id: "hosting-1",
        name: "Hosting - Starter",
        type: "hosting",
        billingCycle: formData.billingCycle!,
        price: selectedCycle.price,
        quantity: 1,
      });
    }

    // Add domain if selected
    if (formData.selectedDomain) {
      items.push({
        id: "domain-1",
        name: `${formData.selectedDomain.domain}${formData.selectedDomain.tld}`,
        type: "domain",
        price:
          formData.selectedDomain.promotionalPrice ??
          formData.selectedDomain.price,
        quantity: 1,
      });
    }

    // Add addons
    formData.selectedAddons?.forEach((addon) => {
      items.push({
        id: `addon-${addon.id}`,
        name: addon.name,
        type: "addon",
        price: addon.promotionalPrice ?? addon.price,
        quantity: 1,
      });
    });

    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const discount = 0; // Calculate based on promo code
    const tax = 0; // Calculate based on location
    const total = subtotal - discount + tax;

    return {
      items,
      subtotal,
      discount,
      tax,
      total,
      currency: "TK",
    };
  }, [formData, billingCycleOptions]);

  const handleCheckout = () => {
    // Validate form
    if (!formData.agreeToTerms) {
      alert("Please agree to the Terms of Service");
      return;
    }

    if (!formData.billingContact) {
      alert("Please select a billing contact");
      return;
    }

    if (!formData.paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    // Process checkout
    // TODO: Implement actual checkout API call
  };

  return {
    formData,
    updateFormData,
    orderSummary,
    handleCheckout,
  };
}
