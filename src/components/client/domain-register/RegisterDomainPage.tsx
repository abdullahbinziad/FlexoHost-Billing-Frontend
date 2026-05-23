"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PromotionalBanner } from "@/components/shared/PromotionalBanner";
import { useCheckoutRedux } from "@/hooks/useCheckoutRedux";
import { DomainConfiguration } from "@/components/client/checkout/DomainConfiguration";
import { TldPricingGrid } from "./TldPricingGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DomainAction } from "@/types/checkout";
import { ArrowRight, Globe, Search, Sparkles } from "lucide-react";

interface RegisterDomainPageProps {
  initialAction?: Extract<DomainAction, "register" | "transfer">;
}

export function RegisterDomainPage({
  initialAction = "register",
}: RegisterDomainPageProps) {
  const router = useRouter();
  const {
    formData,
    setCheckoutMode,
    setProductId,
    setDomainAction,
    setSelectedDomain,
  } = useCheckoutRedux([], {
    productName: "Domain Registration",
    checkoutMode: "domain",
  });

  useEffect(() => {
    setCheckoutMode("domain");
    setProductId(null);
    if (formData.domainAction !== initialAction) {
      setDomainAction(initialAction);
      setSelectedDomain(undefined);
    }
  }, [
    formData.domainAction,
    initialAction,
    setCheckoutMode,
    setDomainAction,
    setProductId,
    setSelectedDomain,
  ]);

  const selectedDomainName = formData.selectedDomain
    ? `${formData.selectedDomain.domain}${formData.selectedDomain.tld}`
    : null;
  const isTransferMode = initialAction === "transfer";
  const badgeLabel = isTransferMode ? "Domain Transfer" : "Domain Registration";
  const title = isTransferMode
    ? "Transfer your domain to FlexoHost"
    : "Find your perfect domain name";
  const description = isTransferMode
    ? "Move your domain to us with a live availability check, transfer pricing, and invoice-ready checkout."
    : "Secure your brand identity with our powerful domain search. Choose from over 1000+ TLDs and get started instantly.";
  const promoTitle = isTransferMode
    ? "Transfer special: move your domain and keep everything managed in one place"
    : "New Year deal: Get domain + free business email";
  const promoDescription = isTransferMode
    ? "Start your transfer with the EPP code from your current registrar, then complete checkout and invoicing in one flow."
    : "Choose a domain with .ai, .io, .net, or .org for 2 years or longer and get 1 year of free email.";

  const handleActionChange = (action: DomainAction) => {
    if (action === "transfer" && initialAction !== "transfer") {
      router.push("/domains/transfers");
      return;
    }
    if (action === "register" && initialAction !== "register") {
      router.push("/domains/register");
      return;
    }
    setDomainAction(action);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pb-16 pt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-5xl mx-auto text-center space-y-5">
            <div className="flex justify-center">
              <Badge variant="secondary" className="mb-4">
                <Globe className="w-3 h-3 mr-1" />
                {badgeLabel}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {description}
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-5 md:p-8 space-y-7">
                <DomainConfiguration
                  selectedAction={formData.domainAction || "register"}
                  selectedDomain={formData.selectedDomain}
                  onActionChange={handleActionChange}
                  onDomainSelect={setSelectedDomain}
                  allowedActions={["register", "transfer"]}
                />

                {selectedDomainName ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 dark:border-primary/30 dark:bg-primary/10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary">
                          Ready for checkout
                        </p>
                        <p className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {selectedDomainName}
                        </p>
                      </div>
                      <Button asChild size="lg" className="min-w-[220px]">
                        <Link href="/checkout?mode=domain">
                          Continue to Checkout
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-5 text-sm md:text-base text-gray-500">
              <span className="flex items-center"><Search className="w-3 h-3 mr-1" /> Instant Availability Check</span>
              <span className="flex items-center"><Sparkles className="w-3 h-3 mr-1" /> Live TLD Pricing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Pricing Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Popular Extensions
            </h3>
            <Badge variant="outline">Dynamic</Badge>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <TldPricingGrid />
          </div>
        </div>

        {/* Promotional Banner */}
        {/* <PromotionalBanner
          title={promoTitle}
          description={promoDescription}
          variant="default"
        /> */}
      </div>
    </div>
  );
}
