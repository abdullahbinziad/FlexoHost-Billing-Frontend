"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Gift,
  Globe,
  Loader2,
  Mail,
  Server,
  Share2,
  Wallet,
} from "lucide-react";
import { useActiveClient } from "@/hooks/useActiveClient";
import { useCurrency } from "@/hooks/useCurrency";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";
import { useGetClientProfileActingAsQuery, useGetMySupportPinQuery } from "@/store/api/clientApi";
import { useGetStoreProductsQuery } from "@/store/api/storeApi";
import { useGetMyAffiliateDashboardQuery } from "@/store/api/affiliateApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product, PricingDetail } from "@/types/admin/product";

type BillingCycleKey =
  | "monthly"
  | "quarterly"
  | "semiAnnually"
  | "annually"
  | "biennially"
  | "triennially";

type ProductCategory = "hosting" | "vps" | "email";

const COMMISSION_RATE = 0.2;

const BILLING_CYCLES: Array<{ id: BillingCycleKey; label: string }> = [
  { id: "monthly", label: "1 month" },
  { id: "quarterly", label: "3 months" },
  { id: "semiAnnually", label: "6 months" },
  { id: "annually", label: "12 months" },
  { id: "biennially", label: "24 months" },
  { id: "triennially", label: "36 months" },
];

const CATEGORY_META: Record<
  ProductCategory,
  { label: string; description: string; icon: typeof Globe }
> = {
  hosting: {
    label: "Hosting",
    description: "Shared and web hosting plans",
    icon: Globe,
  },
  vps: {
    label: "VPS",
    description: "Virtual private servers",
    icon: Server,
  },
  email: {
    label: "Email Service",
    description: "Professional email products",
    icon: Mail,
  },
};

function isEmailProduct(product: Product) {
  const haystack = [
    product.group,
    product.name,
    product.description,
    product.module?.packageName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes("email");
}

function matchesCategory(product: Product, category: ProductCategory) {
  if (category === "vps") return product.type === "vps";
  if (category === "email") return isEmailProduct(product);
  return product.type === "hosting" && !isEmailProduct(product);
}

function getCurrencyPricing(product: Product, currencyCode: string) {
  return product.pricing?.find((pricing) => pricing.currency === currencyCode) ?? product.pricing?.[0];
}

function getCyclePricing(
  product: Product,
  currencyCode: string,
  billingCycle: BillingCycleKey
): PricingDetail | null {
  const currencyPricing = getCurrencyPricing(product, currencyCode);
  const pricing = currencyPricing?.[billingCycle];
  if (!pricing?.enable) return null;
  return pricing;
}

function getProductReference(product: Product) {
  const extendedProduct = product as Product & { _id?: string; pid?: number };
  return String(extendedProduct.id || extendedProduct._id || extendedProduct.pid || "");
}

function buildAffiliateLink(params: {
  origin: string;
  product: Product;
  billingCycle: BillingCycleKey;
  currencyCode: string;
  referralCode: string;
}) {
  const productRef = getProductReference(params.product);
  const query = new URLSearchParams({
    product: productRef,
    billing_cycle: params.billingCycle,
    billing_currency: params.currencyCode,
    ref: params.referralCode,
  });

  return `${params.origin}/checkout?${query.toString()}`;
}

export function ReferHostingPage({ embedded = false }: { embedded?: boolean }) {
  const { selectedCurrency } = useCurrency();
  const formatCurrency = useFormatCurrency();
  const { activeClientId, isActingAs } = useActiveClient();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("hosting");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycleKey>("annually");
  const [siteOrigin, setSiteOrigin] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  const { data: storeProductsData, isLoading, isFetching, isError } = useGetStoreProductsQuery({
    limit: 200,
    sort: "name",
  });
  const { data: supportPinData, isLoading: isSupportPinLoading } = useGetMySupportPinQuery(undefined, {
    skip: isActingAs,
  });
  const { data: actingAsProfile } = useGetClientProfileActingAsQuery(activeClientId!, {
    skip: !isActingAs || !activeClientId,
  });
  const { data: affiliateDashboard } = useGetMyAffiliateDashboardQuery();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteOrigin(window.location.origin);
    }
  }, []);

  const referralCode =
    supportPinData?.supportPin ||
    actingAsProfile?.client?.supportPin ||
    activeClientId ||
    "";

  const allProducts = useMemo(() => storeProductsData?.products ?? [], [storeProductsData?.products]);

  const categoryCounts = useMemo(() => {
    return {
      hosting: allProducts.filter((product) => matchesCategory(product, "hosting")).length,
      vps: allProducts.filter((product) => matchesCategory(product, "vps")).length,
      email: allProducts.filter((product) => matchesCategory(product, "email")).length,
    };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (!matchesCategory(product, selectedCategory)) return false;
      return Boolean(getCyclePricing(product, selectedCurrency.code, selectedBillingCycle));
    });
  }, [allProducts, selectedBillingCycle, selectedCategory, selectedCurrency.code]);

  const selectedCycleLabel =
    BILLING_CYCLES.find((cycle) => cycle.id === selectedBillingCycle)?.label || selectedBillingCycle;
  const selectedSummary = affiliateDashboard?.summaryByCurrency?.[selectedCurrency.code];
  const approvedAmount = selectedSummary?.approved || 0;
  const paidOutAmount = selectedSummary?.paidOut || 0;
  const creditedAmount = selectedSummary?.credited || 0;
  const totalReferrals = affiliateDashboard?.profile?.referredClientsCount || 0;
  const payoutThreshold = affiliateDashboard?.profile?.payoutThreshold ?? 0;
  const thresholdProgress = payoutThreshold > 0 ? Math.min(100, (approvedAmount / payoutThreshold) * 100) : 0;
  const leftUntilPayout = Math.max(0, payoutThreshold - approvedAmount);

  const handleCopyLink = async (product: Product) => {
    if (!referralCode) return;

    const link = buildAffiliateLink({
      origin: siteOrigin || "",
      product,
      billingCycle: selectedBillingCycle,
      currencyCode: selectedCurrency.code,
      referralCode,
    });

    await navigator.clipboard.writeText(link);
    setCopiedKey(`${getProductReference(product)}:${selectedBillingCycle}`);
    window.setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleProductFeatures = (productRef: string) => {
    setExpandedProducts((current) => ({
      ...current,
      [productRef]: !current[productRef],
    }));
  };

  if (isLoading || isFetching || isSupportPinLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unable to load referral products</CardTitle>
          <CardDescription>Try refreshing the page in a moment.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Refer & Earn</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share product packages with your friends and earn commission from successful purchases.
            </p>
          </div>
          <div className="flex items-center rounded-full border bg-card px-4 py-2 text-sm shadow-sm">
            <Wallet className="mr-2 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Account credit:</span>
            <span className="ml-2 font-semibold">
              {formatCurrency(
                affiliateDashboard?.clientCreditBalance || 0,
                affiliateDashboard?.clientCreditCurrency || selectedCurrency.code
              )}
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <Card className="rounded-3xl border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">
              Referrals commission payout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="text-5xl font-semibold text-primary">
              {formatCurrency(approvedAmount, selectedCurrency.code)}
            </div>
            <div className="space-y-2">
              <Progress value={thresholdProgress} className="h-2" />
              <div className="text-right text-sm text-muted-foreground">
                {leftUntilPayout > 0
                  ? `${formatCurrency(leftUntilPayout, selectedCurrency.code)} left until payout`
                  : "Ready for payout"}
              </div>
            </div>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <div>
                Payout method: <span className="font-medium text-foreground">Account credit / Manual payout</span>
              </div>
              <div>
                Referral code: <span className="font-semibold text-foreground">{referralCode || "Unavailable"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-3xl shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-muted p-3">
                <Gift className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-3xl font-semibold">
                  {formatCurrency(paidOutAmount + creditedAmount, selectedCurrency.code)}
                </div>
                <div className="text-sm text-muted-foreground">Total paid out</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-muted p-3">
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-3xl font-semibold">{totalReferrals}</div>
                <div className="text-sm text-muted-foreground">Total referrals</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!referralCode && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="pt-6 text-sm text-amber-900 dark:text-amber-200">
            Your referral code is not ready yet, so links cannot be copied right now.
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_META) as ProductCategory[]).map((category) => {
                const meta = CATEGORY_META[category];
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      selectedCategory === category
                        ? "border-primary text-primary shadow-sm"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {meta.label} ({categoryCounts[category]})
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {BILLING_CYCLES.map((cycle) => (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() => setSelectedBillingCycle(cycle.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    selectedBillingCycle === cycle.id
                      ? "border-primary text-primary shadow-sm"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  {cycle.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Package details</TableHead>
                <TableHead className="text-right">Buyer pays</TableHead>
                <TableHead className="text-right">Your commission</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No {CATEGORY_META[selectedCategory].label.toLowerCase()} products are available for the selected billing period.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const productRef = getProductReference(product);
                  const cyclePricing = getCyclePricing(product, selectedCurrency.code, selectedBillingCycle);
                  if (!cyclePricing) return null;

                  const affiliateLink = buildAffiliateLink({
                    origin: siteOrigin || "",
                    product,
                    billingCycle: selectedBillingCycle,
                    currencyCode: selectedCurrency.code,
                    referralCode,
                  });
                  const estimatedCommission = cyclePricing.price * COMMISSION_RATE;
                  const copied = copiedKey === `${productRef}:${selectedBillingCycle}`;
                  const categoryMeta = CATEGORY_META[selectedCategory];
                  const Icon = categoryMeta.icon;
                  const allFeatures = (product.features || []).filter(Boolean);
                  const isExpanded = Boolean(expandedProducts[productRef]);
                  const visibleFeatures = isExpanded ? allFeatures : allFeatures.slice(0, 4);
                  const hasDiscount = cyclePricing.renewPrice > cyclePricing.price;
                  const discountAmount = hasDiscount ? cyclePricing.renewPrice - cyclePricing.price : 0;

                  return (
                    <TableRow key={productRef}>
                      <TableCell className="align-top">
                        <div className="flex items-start gap-3 min-w-[280px]">
                          <div className="mt-0.5 rounded-full bg-muted p-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-medium text-base">{product.name}</div>
                              <Badge variant="secondary">{categoryMeta.label}</Badge>
                              {selectedCategory === "hosting" && product.group?.toLowerCase().includes("business") ? (
                                <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                                  Most popular
                                </Badge>
                              ) : null}
                            </div>
                            <div className="text-sm text-muted-foreground max-w-xl">
                              {product.description || categoryMeta.description}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span className="rounded-full bg-muted px-2.5 py-1">
                                Billing: {selectedCycleLabel}
                              </span>
                              <span className="rounded-full bg-muted px-2.5 py-1">
                                Currency: {selectedCurrency.code}
                              </span>
                              {cyclePricing.setupFee > 0 ? (
                                <span className="rounded-full bg-muted px-2.5 py-1">
                                  Setup fee: {formatCurrency(cyclePricing.setupFee, selectedCurrency.code)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="min-w-[260px] space-y-2">
                          {visibleFeatures.length > 0 ? (
                            visibleFeatures.map((feature) => (
                              <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                <span>{feature}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Feature list is not available for this package yet.
                            </div>
                          )}
                          {allFeatures.length > 4 ? (
                            <button
                              type="button"
                              onClick={() => toggleProductFeatures(productRef)}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {isExpanded
                                ? "Show fewer features"
                                : `Show all features (${allFeatures.length})`}
                            </button>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <div className="space-y-2">
                          <div className="text-lg font-semibold">
                            {formatCurrency(cyclePricing.price, selectedCurrency.code)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            for {selectedCycleLabel.toLowerCase()}
                          </div>
                          {hasDiscount ? (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground line-through">
                                {formatCurrency(cyclePricing.renewPrice, selectedCurrency.code)}
                              </div>
                              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Discount {formatCurrency(discountAmount, selectedCurrency.code)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Renewal {formatCurrency(cyclePricing.renewPrice, selectedCurrency.code)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <div className="space-y-2">
                          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(estimatedCommission, selectedCurrency.code)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(COMMISSION_RATE * 100)}% commission rate
                          </div>
                          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            You earn when your friend pays successfully.
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleCopyLink(product)}
                            disabled={!referralCode}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            {copied ? "Copied" : "Copy"}
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={affiliateLink || "#"} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(affiliateDashboard?.referrals?.length || 0) > 0 && (
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Latest referral activity</CardTitle>
            <CardDescription>Recent tracked referrals from your affiliate dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date purchased</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(affiliateDashboard?.referrals || []).slice(0, 5).map((referral, index) => {
                  const relatedCommission = (affiliateDashboard?.commissions || []).find(
                    (commission) => commission.referralCode === referral.referralCode
                  );
                  const inviteLabel =
                    referral.referredClientId?.contactEmail
                    || `${referral.referredClientId?.firstName || "Unknown"} ${referral.referredClientId?.lastName || ""}`.trim();

                  return (
                    <TableRow key={`${referral._id}-${index}`}>
                      <TableCell>{inviteLabel || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {referral.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(referral.qualifiedAt || referral.createdAt)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {relatedCommission
                          ? formatCurrency(
                              relatedCommission.commissionAmount,
                              relatedCommission.currency || selectedCurrency.code
                            )
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
