"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCheckoutRedux } from "@/hooks/useCheckoutRedux";
import { useValidateCouponMutation } from "@/store/api/promotionApi";
import { BillingDetailsForm } from "./BillingDetailsForm";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Globe } from "lucide-react";

export function DomainCheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const [validateCoupon] = useValidateCouponMutation();
  const {
    formData,
    orderSummary,
    error,
    setCheckoutMode,
    setProductId,
    setBillingContact,
    setAgreeToTerms,
    setPromoCode,
    setPromoApplied,
    setNewAccountInfo,
    handleCheckout,
  } = useCheckoutRedux([], {
    productName: "Domain Registration",
    checkoutMode: "domain",
  });

  useEffect(() => {
    setCheckoutMode("domain");
    setProductId(null);
  }, [setCheckoutMode, setProductId]);

  const billingContacts =
    isAuthenticated && user
      ? [
          {
            id: String(user.id || (user as any)._id),
            name: user.name || "My Account",
            email: user.email,
            phone: (user as any).phone || "",
            address: {
              street: (user as any).address?.street || "",
              city: (user as any).address?.city || "",
              state: (user as any).address?.state || "",
              zipCode: (user as any).address?.zipCode || "",
              country: (user as any).address?.country || "",
            },
          },
        ]
      : [];

  useEffect(() => {
    if (!formData.billingContact && billingContacts.length > 0) {
      setBillingContact(billingContacts[0]);
    }
  }, [billingContacts, formData.billingContact, setBillingContact]);

  if (!formData.selectedDomain || !orderSummary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Select a domain first
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Search for a domain and choose whether you want to register or transfer it before checkout.
            </p>
            <Button asChild className="mt-6">
              <Link href="/domains/register">Go to Domain Search</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const domainName = `${formData.selectedDomain.domain}${formData.selectedDomain.tld}`;
  const actionLabel =
    formData.domainAction === "transfer" ? "Domain Transfer" : "Domain Registration";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">{actionLabel}</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Complete your domain order
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Review your selected domain, confirm billing details, and generate the invoice.
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                    {formData.domainAction === "transfer" ? (
                      <ArrowLeftRight className="h-5 w-5 text-primary" />
                    ) : (
                      <Globe className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{actionLabel}</p>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {domainName}
                    </h2>
                    {formData.selectedDomain.period ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.selectedDomain.period} year{formData.selectedDomain.period > 1 ? "s" : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href="/domains/register">Change Domain</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <BillingDetailsForm
                contacts={billingContacts}
                selectedContactId={formData.billingContact?.id || billingContacts[0]?.id || ""}
                onSelect={(id) => {
                  const contact = billingContacts.find((item) => item.id === id);
                  if (contact) {
                    setBillingContact(contact);
                  }
                }}
                onNewAccountChange={setNewAccountInfo}
              />
            </div>
          </div>

          <div>
            <OrderSummaryCard
              summary={orderSummary}
              agreeToTerms={formData.agreeToTerms || false}
              onAgreeToTermsChange={setAgreeToTerms}
              onCheckout={handleCheckout}
              hasDomain
              onPromoCodeApply={async (code: string) => {
                try {
                  const result = await validateCoupon({
                    code: code.trim().toUpperCase(),
                    subtotal: orderSummary.subtotal,
                    domainTlds: [formData.selectedDomain?.tld || ""],
                    domainBillingCycle:
                      formData.domainAction === "transfer"
                        ? "annually"
                        : formData.selectedDomain?.period === 2
                          ? "biennially"
                          : formData.selectedDomain?.period === 3
                            ? "triennially"
                            : "annually",
                    currency: orderSummary.currency,
                    clientId: formData.billingContact?.id,
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
