"use client";

import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect } from "react";
import type { RootState } from "@/store";
import {
  setBillingCycle,
  setDomainAction,
  setSelectedDomain,
  setServerLocation,
  toggleAddon,
  setBillingContact,
  setUseDefaultRegistrant,
  setRegistrantContact,
  setPaymentMethod,
  setPromoCode,
  setAgreeToTerms,
  setOrderSummary,
  setStep,
  nextStep,
  previousStep,
  setLoading,
  setError,
  resetCheckout,
  clearCheckout,
} from "@/store/slices/checkoutSlice";
import type {
  CheckoutFormData,
  BillingCycle,
  DomainAction,
  ServerLocation,
  Addon,
  BillingContact,
  PaymentMethod,
  DomainSearchResult,
  OrderSummary,
  OrderItem,
} from "@/types/checkout";
import { useCreateOrderMutation } from "@/store/api/checkoutApi";

export function useCheckoutRedux(
  billingCycleOptions: Array<{
    id: BillingCycle;
    price: number;
  }>
) {
  const dispatch = useDispatch();
  const checkout = useSelector((state: RootState) => state.checkout);
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();

  // Calculate order summary based on form data
  const orderSummary: OrderSummary = useMemo(() => {
    const items: OrderItem[] = [];

    // Add hosting product
    const selectedCycle = billingCycleOptions.find(
      (opt) => opt.id === checkout.formData.billingCycle
    );
    if (selectedCycle) {
      items.push({
        id: "hosting-1",
        name: "Hosting - Starter",
        type: "hosting",
        billingCycle: checkout.formData.billingCycle!,
        price: selectedCycle.price,
        quantity: 1,
      });
    }

    // Add domain if selected
    if (checkout.formData.selectedDomain) {
      items.push({
        id: "domain-1",
        name: `${checkout.formData.selectedDomain.domain}${checkout.formData.selectedDomain.tld}`,
        type: "domain",
        price:
          checkout.formData.selectedDomain.promotionalPrice ??
          checkout.formData.selectedDomain.price,
        quantity: 1,
      });
    }

    // Add addons
    checkout.formData.selectedAddons?.forEach((addon) => {
      items.push({
        id: `addon-${addon.id}`,
        name: addon.name,
        type: "addon",
        price: addon.promotionalPrice ?? addon.price,
        quantity: 1,
      });
    });

    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const discount = checkout.formData.promoCode ? 0 : 0; // Will be calculated from promo code
    const tax = 0; // Will be calculated based on location
    const total = subtotal - discount + tax;

    return {
      items,
      subtotal,
      discount,
      tax,
      total,
      currency: "TK",
    };
  }, [checkout.formData, billingCycleOptions]);

  // Update order summary in Redux when it changes
  useEffect(() => {
    dispatch(setOrderSummary(orderSummary));
  }, [orderSummary, dispatch]);

  // Actions
  const actions = {
    setBillingCycle: (cycle: BillingCycle) => dispatch(setBillingCycle(cycle)),
    setDomainAction: (action: DomainAction) => dispatch(setDomainAction(action)),
    setSelectedDomain: (domain: DomainSearchResult | undefined) =>
      dispatch(setSelectedDomain(domain)),
    setServerLocation: (location: ServerLocation) =>
      dispatch(setServerLocation(location)),
    toggleAddon: (addon: Addon) => dispatch(toggleAddon(addon)),
    setBillingContact: (contact: BillingContact) =>
      dispatch(setBillingContact(contact)),
    setUseDefaultRegistrant: (useDefault: boolean) =>
      dispatch(setUseDefaultRegistrant(useDefault)),
    setRegistrantContact: (contact: BillingContact | undefined) =>
      dispatch(setRegistrantContact(contact)),
    setPaymentMethod: (method: PaymentMethod) =>
      dispatch(setPaymentMethod(method)),
    setPromoCode: (code: string | undefined) => dispatch(setPromoCode(code)),
    setAgreeToTerms: (agree: boolean) => dispatch(setAgreeToTerms(agree)),
    setStep: (step: number) => dispatch(setStep(step)),
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
    resetCheckout: () => dispatch(resetCheckout()),
    clearCheckout: () => dispatch(clearCheckout()),
  };

  // Handle checkout
  const handleCheckout = async () => {
    // Validate form
    if (!checkout.formData.agreeToTerms) {
      dispatch(setError("Please agree to the Terms of Service"));
      return;
    }

    if (!checkout.formData.billingContact) {
      dispatch(setError("Please select a billing contact"));
      return;
    }

    if (!checkout.formData.paymentMethod) {
      dispatch(setError("Please select a payment method"));
      return;
    }

    if (!checkout.formData.serverLocation) {
      dispatch(setError("Please select a server location"));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const result = await createOrder({
        formData: checkout.formData as CheckoutFormData,
        orderSummary,
      }).unwrap();

      // Handle success
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        // Redirect to order confirmation
        window.location.href = `/orders/${result.orderId}`;
      }
    } catch (error: any) {
      dispatch(
        setError(error?.data?.message || "Failed to create order. Please try again.")
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    // State
    formData: checkout.formData,
    orderSummary: checkout.orderSummary || orderSummary,
    isLoading: checkout.isLoading || isCreatingOrder,
    error: checkout.error,
    step: checkout.step,
    // Actions
    ...actions,
    handleCheckout,
  };
}
