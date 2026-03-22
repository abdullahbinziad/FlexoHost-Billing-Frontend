"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { CheckoutPage } from "@/components/client/checkout/CheckoutPage";
import { DomainCheckoutPage } from "@/components/client/checkout/DomainCheckoutPage";
import { useGetStoreProductQuery } from "@/store/api/storeApi";
import { useGetCheckoutDataQuery } from "@/store/api/checkoutApi";
import { setCurrency } from "@/store/slices/currencySlice";
import { useAuth } from "@/hooks/useAuth";
import type { ServerLocation, BillingContact, PaymentMethod, Addon } from "@/types/checkout";
import { devLog } from "@/lib/devLog";

function normalizeServerLocations(locations: ServerLocation[] | undefined): ServerLocation[] {
  return (locations ?? []).map((location) => {
    const countryCode = String(location.countryCode || "").toUpperCase().slice(0, 2);
    return {
      id: String(location.id),
      country: location.country || location.id,
      countryCode: countryCode || "US",
      flag: location.flag || "",
    };
  });
}

export default function Checkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();

  const productId = searchParams.get("pid") || searchParams.get("product_id") || searchParams.get("product");
  const mode = searchParams.get("mode");
  const billingCurrency = searchParams.get("billing_currency") || searchParams.get("currency");
  const billingCycle = searchParams.get("billing_cycle") || searchParams.get("period");
  const referral = searchParams.get("referral") || searchParams.get("ref");

  // Handle Currency Switch
  useEffect(() => {
    if (billingCurrency) {
      dispatch(setCurrency(billingCurrency.toUpperCase()));
    }
  }, [billingCurrency, dispatch]);

  // Fetch Product Data
  const { data: product, isLoading, error } = useGetStoreProductQuery(
    productId as string,
    { skip: !productId || mode === "domain" }
  );
  const { data: checkoutData } = useGetCheckoutDataQuery(undefined, { skip: mode === "domain" });

  // Redirect if no product ID or error
  useEffect(() => {
    if (mode === "domain") {
      return;
    }
    if (!productId) {
      router.push("/");
    } else if (error) {
      // Optional: Show toast or error before redirecting
      devLog("Failed to load product", error);
      router.push("/");
    }
  }, [mode, productId, error, router]);

  if (mode === "domain") {
    return <DomainCheckoutPage referral={referral || undefined} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we are rerouting, return null to avoid flashing content
  if (!productId || error || !product) {
    return null;
  }

  const serverLocations = normalizeServerLocations(checkoutData?.serverLocations);
  const availableAddons: Addon[] = checkoutData?.availableAddons ?? [];
  const paymentMethods: PaymentMethod[] = checkoutData?.paymentMethods ?? [];

  return (
    <CheckoutPage
      productName={product.name}
      basePrice={0} // Calculated from billing cycle options
      billingCycleOptions={[]} // Dynamically generated in CheckoutPage from product data
      serverLocations={serverLocations}
      availableAddons={availableAddons}
      billingContacts={
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
          : []
      }
      paymentMethods={paymentMethods}
      product={product}
      initialBillingCycle={billingCycle || undefined}
      referral={referral || undefined}
    />
  );
}
