"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
    setReferral,
    setNewAccountInfo,
    handleCheckout,
  } = useCheckoutRedux(billingCycleOptions, productName);

  const [validateCoupon] = useValidateCouponMutation();
  const selectedServerLocation = formData.serverLocation || serverLocations[0];
  const normalizedReferral = referral?.trim().toUpperCase();
  const isReferralDiscountApplied =
    Boolean(normalizedReferral) &&
    formData.promoCode === normalizedReferral &&
    (orderSummary?.discount ?? 0) > 0;

  // Store product ID in checkout state on mount
  useEffect(() => {
    setCheckoutMode("service");
    if (product?._id || product?.id) {
      setProductId(product._id || product.id);
    }
    if (referral) {
      setReferral(referral);
    }
  }, [product, referral, setCheckoutMode, setProductId, setReferral]);

  useEffect(() => {
    if (!normalizedReferral) return;
    if ((orderSummary?.subtotal ?? 0) <= 0) return;
    if (formData.promoCode && formData.promoCode !== normalizedReferral) return;
    if (formData.promoCode === normalizedReferral && (formData.promoDiscount ?? 0) > 0) return;

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
          productTypes: product?.type ? [product.type] : undefined,
          productBillingCycle: formData.billingCycle,
          domainTlds,
          domainBillingCycle: formData.selectedDomain ? domainBillingCycle : undefined,
        }).unwrap();

        if (!isCancelled && result.valid && result.discountAmount != null) {
          setPromoApplied(normalizedReferral, result.discountAmount);
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
    orderSummary?.subtotal,
    formData.promoCode,
    formData.promoDiscount,
    formData.billingContact?.id,
    formData.billingCycle,
    formData.selectedDomain,
    product,
    selectedCurrency.code,
    setPromoApplied,
    validateCoupon,
  ]);

  // Set default selections
  useEffect(() => {
    // Set default billing cycle if not set
    if (!formData.billingCycle && billingCycleOptions.length > 0) {
      const initial = initialBillingCycle && billingCycleOptions.find(opt => opt.id === initialBillingCycle)
        ? initialBillingCycle
        : billingCycleOptions[0].id;
      setBillingCycle(initial as any);
    }

    if (!formData.serverLocation && serverLocations.length > 0) {
      setServerLocation(serverLocations[0]);
    }
    if (!formData.billingContact && billingContacts.length > 0) {
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
              hasDomain={!!formData.selectedDomain}
              onPromoCodeApply={async (code: string) => {
                const subtotal = orderSummary?.subtotal ?? 0;
                if (subtotal <= 0) return false;
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
                    productTypes: product?.type ? [product.type] : undefined,
                    productBillingCycle: formData.billingCycle,
                    domainTlds,
                    domainBillingCycle: formData.selectedDomain ? domainBillingCycle : undefined,
                  }).unwrap();
                  if (result.valid && result.discountAmount != null) {
                    setPromoApplied(code.trim().toUpperCase(), result.discountAmount);
                    return true;
                  }
                  return false;
                } catch {
                  return false;
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
