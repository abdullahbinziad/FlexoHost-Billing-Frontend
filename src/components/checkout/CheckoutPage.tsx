"use client";

import { useCheckoutRedux } from "@/hooks/useCheckoutRedux";
import { BillingCycleSelector } from "./BillingCycleSelector";
import { DomainConfiguration } from "./DomainConfiguration";
import { ServerLocationSelector } from "./ServerLocationSelector";
import { AvailableAddons } from "./AvailableAddons";
import { BillingDetailsForm } from "./BillingDetailsForm";
import { DomainRegistrantInfo } from "./DomainRegistrantInfo";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
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
  billingCycleOptions,
  serverLocations,
  availableAddons,
  billingContacts,
  paymentMethods,
}: CheckoutPageProps) {
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
    setPaymentMethod,
    setPromoCode,
    setAgreeToTerms,
    handleCheckout,
  } = useCheckoutRedux(billingCycleOptions);

  // Set default selections if not set (using useEffect would be better, but keeping it simple for now)
  if (!formData.serverLocation && serverLocations.length > 0) {
    setServerLocation(serverLocations[0]);
  }
  if (!formData.paymentMethod && paymentMethods.length > 0) {
    setPaymentMethod(paymentMethods[0]);
  }
  if (!formData.billingContact && billingContacts.length > 0) {
    setBillingContact(billingContacts[0]);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            You&apos;re almost there! Complete your order
          </h1>
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Cycle */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <BillingCycleSelector
                options={billingCycleOptions}
                selected={formData.billingCycle || "monthly"}
                onSelect={setBillingCycle}
              />
            </div>

            {/* Domain Configuration */}
            <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-lg border border-primary/20 dark:border-primary/30">
              <DomainConfiguration
                selectedAction={formData.domainAction || "register"}
                onActionChange={setDomainAction}
                onDomainSelect={setSelectedDomain}
              />
            </div>

            {/* Server Location */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <ServerLocationSelector
                locations={serverLocations}
                selected={formData.serverLocation || serverLocations[0]}
                onSelect={setServerLocation}
              />
            </div>

            {/* Available Addons */}
            {availableAddons.length > 0 && (
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <AvailableAddons
                  addons={availableAddons}
                  selectedAddons={formData.selectedAddons || []}
                  onAddonToggle={toggleAddon}
                />
              </div>
            )}

            {/* Billing Details */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
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
                  // TODO: Open create new contact modal
                  console.log("Create new contact");
                }}
              />
            </div>

            {/* Domain Registrant Info */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <DomainRegistrantInfo
                useDefault={formData.useDefaultRegistrant ?? true}
                onUseDefaultChange={setUseDefaultRegistrant}
                onCustomRegistrantChange={() => {
                  // TODO: Open custom registrant form
                  console.log("Custom registrant");
                }}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <PaymentMethodSelector
                methods={paymentMethods}
                selected={formData.paymentMethod || paymentMethods[0]}
                onSelect={setPaymentMethod}
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummaryCard
              summary={orderSummary}
              billingCycle={formData.billingCycle || "monthly"}
              serverLocation={formData.serverLocation || serverLocations[0]}
              agreeToTerms={formData.agreeToTerms || false}
              onAgreeToTermsChange={setAgreeToTerms}
              onCheckout={handleCheckout}
              onPromoCodeApply={async (code: string) => {
                // Mock validation - replace with actual API call
                // For now, accept codes starting with "PROMO" or "SAVE"
                const isValid = code.startsWith("PROMO") || code.startsWith("SAVE");
                if (isValid) {
                  setPromoCode(code);
                  return true;
                }
                return false;
              }}
              onPromoCodeRemove={() => {
                setPromoCode(undefined);
              }}
              appliedPromoCode={formData.promoCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
