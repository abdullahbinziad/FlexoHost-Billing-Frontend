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
  setPromoApplied,
  setAgreeToTerms,
  setOrderSummary,
  setStep,
  nextStep,
  previousStep,
  setLoading,
  setError,
  resetCheckout,
  clearCheckout,
  setProductId,
  setReferral,
  setNewAccountInfo,
} from "@/store/slices/checkoutSlice";
import type {
  CheckoutFormData,
  CreateOrderPayload,
  NewAccountInfo,
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
import { useGetTldsQuery } from "@/store/api/tldApi";

export function useCheckoutRedux(
  billingCycleOptions: Array<{
    id: BillingCycle;
    price: number;
  }>,
  productName: string = "Hosting Product"
) {
  const dispatch = useDispatch();
  const checkout = useSelector((state: RootState) => state.checkout);
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
  const { data: tldsData } = useGetTldsQuery();
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
        name: productName,
        type: "hosting",
        billingCycle: checkout.formData.billingCycle!,
        price: selectedCycle.price,
        quantity: 1,
      });
    }

    // Add domain if selected
    if (checkout.formData.selectedDomain) {
      const selectedDomain = checkout.formData.selectedDomain;
      let computedPrice = selectedDomain.promotionalPrice ?? selectedDomain.price;

      // Dynamically calculate domain price based on current currency
      const tlds = tldsData || [];
      if (selectedDomain.tld && selectedDomain.period && tlds.length > 0) {
        const tldInfo = tlds.find((t) => t.tld === selectedDomain.tld);
        if (tldInfo) {
          const currencyPricing = tldInfo.pricing.find((p) => p.currency === selectedCurrency.code);
          if (currencyPricing) {
            const yearKey = String(selectedDomain.period) as "1" | "2" | "3";
            const pricingBlock = currencyPricing[yearKey];

            if (pricingBlock?.enable) {
              computedPrice = checkout.formData.domainAction === "transfer"
                ? pricingBlock.transfer
                : pricingBlock.register;
            }
          }
        }
      }

      items.push({
        id: "domain-1",
        name: `${selectedDomain.domain}${selectedDomain.tld}`,
        type: "domain",
        price: computedPrice,
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
    const discount = checkout.formData.promoDiscount ?? 0;
    const tax = 0; // Will be calculated based on location
    const total = subtotal - discount + tax;

    return {
      items,
      subtotal,
      discount,
      tax,
      total,
      currency: selectedCurrency.code,
    };
  }, [checkout.formData, billingCycleOptions, productName, selectedCurrency.code, tldsData]);

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
    setPromoApplied: (code: string, discountAmount: number) =>
      dispatch(setPromoApplied({ code, discountAmount })),
    setAgreeToTerms: (agree: boolean) => dispatch(setAgreeToTerms(agree)),
    setProductId: (id: string) => dispatch(setProductId(id)),
    setReferral: (ref: string | null) => dispatch(setReferral(ref)),
    setNewAccountInfo: (info: NewAccountInfo | null) => dispatch(setNewAccountInfo(info)),
    setStep: (step: number) => dispatch(setStep(step)),
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
    resetCheckout: () => dispatch(resetCheckout()),
    clearCheckout: () => dispatch(clearCheckout()),
  };

  // Build the clean order payload from Redux state
  const buildOrderPayload = (): CreateOrderPayload | null => {
    const { formData } = checkout;
    const { productId, referral } = checkout;

    if (!productId || !formData.billingCycle || !formData.serverLocation) {
      return null;
    }

    // Build domain object based on action
    const domainAction = formData.domainAction || "register";
    const selectedDomain = formData.selectedDomain;
    let domain: CreateOrderPayload["domain"];

    if (domainAction === "register" && selectedDomain) {
      domain = {
        action: "register",
        registration: {
          domainName: selectedDomain.domain + selectedDomain.tld,
          tld: selectedDomain.tld,
          period: selectedDomain.period || 1,
        },
      };
    } else if (domainAction === "transfer" && selectedDomain) {
      domain = {
        action: "transfer",
        transfer: {
          domainName: selectedDomain.domain + selectedDomain.tld,
          tld: selectedDomain.tld,
          eppCode: selectedDomain.eppCode || "",
        },
      };
    } else if (domainAction === "use-owned" && selectedDomain) {
      domain = {
        action: "use-owned",
        ownDomain: {
          domainName: selectedDomain.domain + selectedDomain.tld,
          tld: selectedDomain.tld,
        },
      };
    } else {
      domain = { action: domainAction };
    }

    // Build client identity
    let client: CreateOrderPayload["client"];
    if (formData.billingContact?.id) {
      // Logged-in user — existing client
      client = { type: "existing", clientId: formData.billingContact.id };
    } else if (checkout.newAccountInfo) {
      // New account registration with this order
      client = { type: "new", account: checkout.newAccountInfo };
    } else {
      // Guest checkout (future)
      client = { type: "guest" };
    }

    return {
      productId,
      billingCycle: formData.billingCycle,
      currency: selectedCurrency.code,
      domain,
      serverLocation: formData.serverLocation.id,
      paymentMethod: formData.paymentMethod?.id ?? "sslcommerz",
      client,
      coupon: formData.promoCode || undefined,
      referral: referral || undefined,
      agreeToTerms: formData.agreeToTerms || false,
    };
  };

  // Handle checkout
  const handleCheckout = async () => {
    // Validate form
    if (!checkout.formData.agreeToTerms) {
      dispatch(setError("Please agree to the Terms of Service"));
      return;
    }

    // Domain is mandatory — must register, transfer, or use own domain
    if (!checkout.formData.selectedDomain) {
      dispatch(setError("Please configure a domain name for your hosting product."));
      return;
    }

    if (!checkout.productId) {
      dispatch(setError("Product not found. Please try again."));
      return;
    }

    if (!checkout.formData.billingContact) {
      dispatch(setError("Please select a billing contact"));
      return;
    }

    if (!checkout.formData.serverLocation) {
      dispatch(setError("Please select a server location"));
      return;
    }

    const payload = buildOrderPayload();
    if (!payload) {
      dispatch(setError("Incomplete order data. Please fill all required fields."));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const result = await createOrder(payload).unwrap();

      // Clear checkout state on success
      dispatch(resetCheckout());

      // Redirect to the newly generated invoice page
      if (result.invoiceId) {
        window.location.href = `/invoices/${result.invoiceId}`;
      } else {
        // Fallback to order page if no invoice was generated
        window.location.href = `/orders/${result.order?.orderId}`;
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
