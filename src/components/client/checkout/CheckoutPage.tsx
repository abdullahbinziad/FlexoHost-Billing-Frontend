"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import type { RootState } from "@/store";
import { useCheckoutRedux } from "@/hooks/useCheckoutRedux";
import { useValidateCouponMutation } from "@/store/api/promotionApi";
import { BillingCycleSelector } from "./BillingCycleSelector";
import { DomainConfiguration } from "./DomainConfiguration";
import { ServerLocationSelector } from "./ServerLocationSelector";

import { BillingDetailsForm } from "./BillingDetailsForm";
import { OrderSummaryCard } from "./OrderSummaryCard";
import type {
  BillingCycleOption,
  ServerLocation,
  Addon,
  BillingContact,
  PaymentMethod,
} from "@/types/checkout";
import { normalizeBillingCycleKey } from "@/utils/promoDiscount";

interface CheckoutPageProps {
  productName: string;
  basePrice: number;
  billingCycleOptions: BillingCycleOption[];
  serverLocations: ServerLocation[];
  availableAddons: Addon[];
  billingContacts: BillingContact[];
  paymentMethods: PaymentMethod[];
}

export function CheckoutPage({
  productName,
  basePrice,
  billingCycleOptions: initialBillingCycleOptions,
  serverLocations,
  availableAddons,
  billingContacts,
  paymentMethods,
  product,
  initialBillingCycle,
  referral,
}: CheckoutPageProps & {
  product?: any; // Replace with proper Product type
  initialBillingCycle?: string;
  referral?: string;
}) {
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);

  // Generate billing cycle options from product if available
  const billingCycleOptions = useMemo(() => {
    if (!product || !product.pricing) return initialBillingCycleOptions;

    // Find pricing for selected currency
    const currencyPricing = product.pricing.find(
      (p: any) => p.currency === selectedCurrency.code
    ) || product.pricing[0]; // Fallback to first pricing if currency not found

    if (!currencyPricing) return initialBillingCycleOptions;

    const cycles: Array<keyof typeof currencyPricing> = [
      "monthly",
      "quarterly",
      "semiAnnually",
      "annually",
      "biennially",
      "triennially",
    ];

    return cycles
      .filter((cycle) => {
        const pricing = currencyPricing[cycle];
        return pricing && typeof pricing === "object" && pricing.enable;
      })
      .map((cycle) => {
        const pricing = currencyPricing[cycle];
        // Calculate price per month based on cycle duration
        let months = 1;
        switch (cycle) {
          case "quarterly": months = 3; break;
          case "semiAnnually": months = 6; break;
          case "annually": months = 12; break;
          case "biennially": months = 24; break;
          case "triennially": months = 36; break;
        }

        return {
          id: cycle as any,
          label: (cycle as string).charAt(0).toUpperCase() + (cycle as string).slice(1).replace(/([A-Z])/g, ' $1'),
          price: pricing.price,
          pricePerMonth: Math.round(pricing.price / months),
        };
      });
  }, [product, selectedCurrency.code, initialBillingCycleOptions]);

  const {
    formData,
    orderSummary,
    isLoading,
    error,
    setBillingCycle,
    setDomainAction,
    setSelectedDomain,
    setServerLocation,
    toggleAddon,
    setBillingContact,
    setUseDefaultRegistrant,
    setPromoCode,
    setPromoApplied,
    setAgreeToTerms,
    setCheckoutMode,
    setProductId,
    setProductType,
    setReferral,
    setNewAccountInfo,
    handleCheckout,
  } = useCheckoutRedux(billingCycleOptions, productName);

  const [validateCoupon] = useValidateCouponMutation();
  const promoCartValidateSeq = useRef(0);
  const selectedServerLocation = formData.serverLocation || serverLocations[0];
  const normalizedReferral = referral?.trim().toUpperCase();
  const isReferralDiscountApplied =
    Boolean(normalizedReferral) &&
    formData.promoCode === normalizedReferral &&
    (orderSummary?.discount ?? 0) > 0;

  const couponBillingCycleAllowList = useMemo(() => {
    const m = formData.promoDiscountMeta;
    if (m?.kind === "promotion" && m.productBillingCycles?.length) {
      return m.productBillingCycles;
    }
    return null;
  }, [formData.promoDiscountMeta]);

  // Store product ID in checkout state on mount
  useEffect(() => {
    setCheckoutMode("service");
    if (product?._id || product?.id) {
      setProductId(product._id || product.id);
      const typeSlug =
        product?.type != null
          ? String(product.type)
          : (product as { category?: string })?.category != null
            ? String((product as { category?: string }).category)
            : null;
      setProductType(typeSlug);
    } else {
      setProductId(null);
      setProductType(null);
    }
    if (referral?.trim()) {
      setReferral(referral.trim().toUpperCase());
    }
  }, [product, referral, setCheckoutMode, setProductId, setProductType, setReferral]);

  // Apply referral from URL and prefer it over stale persisted promo state.
  // Keep retrying on cart/context changes until it is actually applied.
  useEffect(() => {
    if (!normalizedReferral) return;
    if ((orderSummary?.subtotal ?? 0) <= 0) return;

    const existingPromoCode = formData.promoCode?.trim().toUpperCase();
    const hasSameReferralAlreadyApplied =
      existingPromoCode === normalizedReferral && (formData.promoDiscount ?? 0) > 0;
    if (hasSameReferralAlreadyApplied) return;

    // Clear stale persisted promo so referral link can take precedence immediately.
    if (existingPromoCode && existingPromoCode !== normalizedReferral) {
      setPromoCode(undefined);
    }

    let isCancelled = false;

    const applyReferralDiscount = async () => {
      try {
        const domainTlds = formData.selectedDomain?.tld
          ? [formData.selectedDomain.tld.startsWith(".") ? formData.selectedDomain.tld : `.${formData.selectedDomain.tld}`]
          : [];
        const domainPeriod = formData.selectedDomain?.period ?? 1;
        const domainBillingCycle =
          domainPeriod === 1 ? "annually" : domainPeriod === 2 ? "biennially" : "triennially";

        const result = await validateCoupon({
          code: normalizedReferral,
          subtotal: orderSummary?.subtotal ?? 0,
          currency: selectedCurrency.code,
          clientId: formData.billingContact?.id,
          productIds: product?._id || product?.id ? [String(product._id || product.id)] : undefined,
          productTypes:
            product?.type != null
              ? [String(product.type)]
              : (product as { category?: string })?.category != null
                ? [String((product as { category?: string }).category)]
                : undefined,
          productBillingCycle: formData.billingCycle,
          domainTlds,
          domainBillingCycle: formData.selectedDomain ? domainBillingCycle : undefined,
        }).unwrap();

        if (!isCancelled && result.valid && result.discountAmount != null) {
          setPromoApplied(normalizedReferral, result.discountAmount, result.discountMeta);
        }
      } catch {
        // Ignore invalid referral discounts and leave checkout usable.
      }
    };

    void applyReferralDiscount();

    return () => {
      isCancelled = true;
    };
  }, [
    normalizedReferral,
    formData.promoCode,
    formData.promoDiscount,
    orderSummary?.subtotal,
    formData.billingContact?.id,
    formData.billingCycle,
    formData.selectedDomain,
    product,
    selectedCurrency.code,
    setPromoCode,
    setPromoApplied,
    validateCoupon,
  ]);

  // Keep promo discount in sync with the server whenever the cart changes (billing cycle, domain, subtotal, etc.).
  // Client-side meta recompute can drift (e.g. product id string shape); the API is the source of truth.
  useEffect(() => {
    const code = formData.promoCode?.trim();
    if (!code) return;
    const subtotal = orderSummary?.subtotal ?? 0;
    if (subtotal <= 0) return;

    const seq = ++promoCartValidateSeq.current;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        const domainTlds = formData.selectedDomain?.tld
          ? [formData.selectedDomain.tld.startsWith(".") ? formData.selectedDomain.tld : `.${formData.selectedDomain.tld}`]
          : [];
        const domainPeriod = formData.selectedDomain?.period ?? 1;
        const domainBillingCycle =
          domainPeriod === 1 ? "annually" : domainPeriod === 2 ? "biennially" : "triennially";

        const result = await validateCoupon({
          code: code.toUpperCase(),
          subtotal,
          currency: selectedCurrency.code,
          clientId: formData.billingContact?.id,
          productIds: product?._id || product?.id ? [String(product._id || product.id)] : undefined,
          productTypes:
            product?.type != null
              ? [String(product.type)]
              : (product as { category?: string })?.category != null
                ? [String((product as { category?: string }).category)]
                : undefined,
          productBillingCycle: formData.billingCycle,
          domainTlds,
          domainBillingCycle: formData.selectedDomain ? domainBillingCycle : undefined,
        }).unwrap();

        if (cancelled || seq !== promoCartValidateSeq.current) return;
        if (result.valid && result.discountAmount != null) {
          setPromoApplied(code.toUpperCase(), result.discountAmount, result.discountMeta);
        }
      } catch (err: unknown) {
        const msg =
          typeof err === "object" && err !== null && "data" in err
            ? (err as { data?: { message?: string } }).data?.message
            : undefined;
        if (msg && /billing cycle|coupon|domain|product|minimum|order/i.test(msg)) {
          toast.error(msg);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [
    formData.promoCode,
    orderSummary?.subtotal,
    formData.billingContact?.id,
    formData.billingCycle,
    formData.selectedDomain?.tld,
    formData.selectedDomain?.period,
    formData.domainAction,
    product,
    selectedCurrency.code,
    setPromoApplied,
    validateCoupon,
  ]);

  // Set default selections
  useEffect(() => {
    if (billingCycleOptions.length === 0) return;

    const current = formData.billingCycle;
    const isCurrentInOptions = Boolean(
      current && billingCycleOptions.some((opt) => opt.id === current)
    );

    // Snap to a valid cycle when unset, invalid for this product, or URL requests a matching option
    if (!isCurrentInOptions) {
      const fromQuery = initialBillingCycle?.trim();
      const exactUrl = fromQuery
        ? billingCycleOptions.find((opt) => opt.id === fromQuery)
        : undefined;
      const normUrl = fromQuery
        ? billingCycleOptions.find(
            (opt) =>
              normalizeBillingCycleKey(String(opt.id)) ===
              normalizeBillingCycleKey(fromQuery)
          )
        : undefined;
      const next = (exactUrl ?? normUrl ?? billingCycleOptions[0]).id;
      setBillingCycle(next as any);
    }

    if (!formData.serverLocation && serverLocations.length > 0) {
      setServerLocation(serverLocations[0]);
    }
    const hasValidBillingContact =
      Boolean(formData.billingContact?.id) &&
      billingContacts.some((contact) => contact.id === formData.billingContact?.id);

    if (!hasValidBillingContact && billingContacts.length > 0) {
      setBillingContact(billingContacts[0]);
    }
  }, [
    formData.billingCycle,
    formData.serverLocation,
    formData.billingContact,
    billingCycleOptions,
    serverLocations,
    billingContacts,
    initialBillingCycle,
    setBillingCycle,
    setServerLocation,
    setBillingContact,
  ]);

  // If the applied coupon only allows certain cycles, move off an ineligible selection.
  useEffect(() => {
    if (!couponBillingCycleAllowList?.length) return;
    const current = formData.billingCycle;
    if (!current) return;
    const ok = couponBillingCycleAllowList.some(
      (c) => normalizeBillingCycleKey(c) === normalizeBillingCycleKey(String(current))
    );
    if (ok) return;
    const next = billingCycleOptions.find((opt) =>
      couponBillingCycleAllowList.some(
        (c) => normalizeBillingCycleKey(c) === normalizeBillingCycleKey(String(opt.id))
      )
    );
    if (next) setBillingCycle(next.id as any);
  }, [couponBillingCycleAllowList, formData.billingCycle, billingCycleOptions, setBillingCycle]);

  // Set initial billing cycle if provided and valid
  // This needs to happen efficiently without causing infinite loops
  // Moving this logic to useCheckoutRedux or initializing state with it would be better
  // For now, we rely on the user manually selecting if it differs, or passing it to useCheckoutRedux

  return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {product ? `Configure ${product.name}` : "You're almost there! Complete your order"}
          </h1>
          {isReferralDiscountApplied && normalizedReferral ? (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 dark:border-primary/30 dark:bg-primary/10">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                Discount for the referral applied from link code{" "}
                <span className="font-semibold text-primary">{normalizedReferral}</span>.
              </p>
            </div>
          ) : null}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Cycle */}
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <BillingCycleSelector
                options={billingCycleOptions}
                selected={(formData.billingCycle || initialBillingCycle || "monthly") as any}
                onSelect={setBillingCycle}
                couponAllowedBillingCycles={couponBillingCycleAllowList ?? undefined}
                appliedCouponCode={formData.promoCode}
              />
            </div>

            {/* Domain Configuration */}
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800 min-w-0">
              <DomainConfiguration
                selectedAction={formData.domainAction || "register"}
                selectedDomain={formData.selectedDomain}
                onActionChange={setDomainAction}
                onDomainSelect={setSelectedDomain}
              />
            </div>

            {/* Server Location */}
            {selectedServerLocation ? (
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <ServerLocationSelector
                  locations={serverLocations}
                  selected={selectedServerLocation}
                  onSelect={setServerLocation}
                />
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-4 sm:p-6 rounded-lg">
                Server locations are not available right now. Please try again shortly.
              </div>
            )}


            {/* Billing Details */}
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <BillingDetailsForm
                contacts={billingContacts}
                selectedContactId={
                  formData.billingContact?.id || billingContacts[0]?.id
                }
                onSelect={(id) => {
                  const contact = billingContacts.find((c) => c.id === id);
                  if (contact) {
                    setBillingContact(contact);
                  }
                }}
                onCreateNew={() => {
                }}
                onNewAccountChange={setNewAccountInfo}
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummaryCard
              summary={orderSummary}
              billingCycle={(formData.billingCycle || initialBillingCycle || "monthly") as any}
              serverLocation={selectedServerLocation}
              agreeToTerms={formData.agreeToTerms || false}
              onAgreeToTermsChange={setAgreeToTerms}
              onCheckout={handleCheckout}
              checkoutLoading={isLoading}
              hasDomain={!!formData.selectedDomain}
              onPromoCodeApply={async (code: string) => {
                const subtotal = orderSummary?.subtotal ?? 0;
                if (subtotal <= 0) {
                  return { success: false, error: "Order subtotal must be greater than 0." };
                }
                try {
                  const domainTlds = formData.selectedDomain?.tld
                    ? [formData.selectedDomain.tld.startsWith(".") ? formData.selectedDomain.tld : `.${formData.selectedDomain.tld}`]
                    : [];
                  const domainPeriod = formData.selectedDomain?.period ?? 1;
                  const domainBillingCycle = domainPeriod === 1 ? "annually" : domainPeriod === 2 ? "biennially" : "triennially";

                  const result = await validateCoupon({
                    code: code.trim().toUpperCase(),
                    subtotal,
                    currency: selectedCurrency.code,
                    clientId: formData.billingContact?.id,
                    productIds: product?._id || product?.id ? [String(product._id || product.id)] : undefined,
                    productTypes:
                      product?.type != null
                        ? [String(product.type)]
                        : (product as { category?: string })?.category != null
                          ? [String((product as { category?: string }).category)]
                          : undefined,
                    productBillingCycle: formData.billingCycle,
                    domainTlds,
                    domainBillingCycle: formData.selectedDomain ? domainBillingCycle : undefined,
                  }).unwrap();
                  if (result.valid && result.discountAmount != null) {
                    setPromoApplied(code.trim().toUpperCase(), result.discountAmount, result.discountMeta);
                    return { success: true };
                  }
                  return { success: false, error: "Invalid or expired promo code." };
                } catch (error: any) {
                  return {
                    success: false,
                    error:
                      error?.data?.message ||
                      error?.data?.error ||
                      "Failed to apply promo code.",
                  };
                }
              }}
              onPromoCodeRemove={() => {
                setPromoCode(undefined);
              }}
              appliedPromoCode={formData.promoCode}
              appliedDiscountLabel={isReferralDiscountApplied ? "Discount for the referral" : "Promo Code Applied"}
              discountLineLabel={isReferralDiscountApplied ? "Discount for the referral" : "Discount"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
