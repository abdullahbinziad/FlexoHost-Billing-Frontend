"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
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
import { useCurrency } from "@/hooks/useCurrency";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatDate } from "@/utils/format";
import { useGetStoreProductsQuery } from "@/store/api/storeApi";
import { useGetMyAffiliateDashboardQuery } from "@/store/api/affiliateApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type ReferralProductRowModel = {
  product: Product;
  productRef: string;
  cyclePricing: PricingDetail;
  affiliateLink: string;
  estimatedCommission: number;
  categoryMeta: (typeof CATEGORY_META)[ProductCategory];
  Icon: (typeof CATEGORY_META)[ProductCategory]["icon"];
  allFeatures: string[];
  hasDiscount: boolean;
  discountAmount: number;
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
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("hosting");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycleKey>("annually");
  const [siteOrigin, setSiteOrigin] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  const { data: storeProductsData, isLoading, isFetching, isError } = useGetStoreProductsQuery({
    limit: 200,
    sort: "name",
  });
  const { data: affiliateDashboard, isLoading: isAffiliateDashboardLoading } =
    useGetMyAffiliateDashboardQuery();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteOrigin(window.location.origin);
    }
  }, []);

  const referralCode = affiliateDashboard?.profile?.referralCode?.trim().toUpperCase() || "";

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

  const referralProductRows = useMemo((): ReferralProductRowModel[] => {
    return filteredProducts
      .map((product) => {
        const cyclePricing = getCyclePricing(product, selectedCurrency.code, selectedBillingCycle);
        if (!cyclePricing) return null;
        const productRef = getProductReference(product);
        const affiliateLink = buildAffiliateLink({
          origin: siteOrigin || "",
          product,
          billingCycle: selectedBillingCycle,
          currencyCode: selectedCurrency.code,
          referralCode,
        });
        const estimatedCommission = cyclePricing.price * COMMISSION_RATE;
        const categoryMeta = CATEGORY_META[selectedCategory];
        const allFeatures = (product.features || []).filter(Boolean);
        const hasDiscount = cyclePricing.renewPrice > cyclePricing.price;
        const discountAmount = hasDiscount ? cyclePricing.renewPrice - cyclePricing.price : 0;
        return {
          product,
          productRef,
          cyclePricing,
          affiliateLink,
          estimatedCommission,
          categoryMeta,
          Icon: categoryMeta.icon,
          allFeatures,
          hasDiscount,
          discountAmount,
        };
      })
      .filter((row): row is ReferralProductRowModel => row !== null);
  }, [
    filteredProducts,
    referralCode,
    selectedBillingCycle,
    selectedCategory,
    selectedCurrency.code,
    siteOrigin,
  ]);

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

  if (isLoading || isFetching || isAffiliateDashboardLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center px-4 sm:min-h-[320px]">
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
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {!embedded && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">Refer & Earn</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Share product packages with your friends and earn commission from successful purchases.
            </p>
          </div>
          <Card className="w-full shrink-0 lg:w-64">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Account credit</CardTitle>
              <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">
                {formatCurrency(
                  affiliateDashboard?.clientCreditBalance || 0,
                  affiliateDashboard?.clientCreditCurrency || selectedCurrency.code
                )}
              </p>
              <p className="text-xs text-muted-foreground">Available in your client account</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold sm:text-xl">Approved for payout</CardTitle>
            <CardDescription>
              Amount eligible after qualification. Progress reflects your payout threshold.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {formatCurrency(approvedAmount, selectedCurrency.code)}
            </div>
            <div className="space-y-2">
              <Progress value={thresholdProgress} className="h-2" />
              <p className="text-right text-sm text-muted-foreground">
                {leftUntilPayout > 0
                  ? `${formatCurrency(leftUntilPayout, selectedCurrency.code)} left until payout`
                  : "Ready for payout"}
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <span className="block text-xs font-medium uppercase text-muted-foreground">Payout method</span>
                <span className="mt-1 block font-medium text-foreground">Account credit / Manual payout</span>
              </div>
              <div className="min-w-0 sm:text-right">
                <span className="block text-xs font-medium uppercase text-muted-foreground">Referral code</span>
                <span className="mt-1 block break-all font-semibold text-foreground">
                  {referralCode || "Unavailable"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total paid out</CardTitle>
              <Gift className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">
                {formatCurrency(paidOutAmount + creditedAmount, selectedCurrency.code)}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime payouts and credits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total referrals</CardTitle>
              <Share2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{totalReferrals}</div>
              <p className="text-xs text-muted-foreground">Clients referred</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {!referralCode && (
        <div
          className="flex gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
          role="status"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <p>
            Your affiliate referral code is not available yet (complete enrollment or open My earnings if
            setup is still in progress). Links cannot be copied until it appears there.
          </p>
        </div>
      )}

      <Card className="min-w-0">
        <CardHeader className="space-y-4 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold">Referral products</CardTitle>
            <CardDescription>
              Choose a product type and billing period. Share links include your referral code.
            </CardDescription>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="referral-product-type">Product type</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as ProductCategory)}
              >
                <SelectTrigger id="referral-product-type" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_META) as ProductCategory[]).map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_META[category].label} ({categoryCounts[category]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral-billing-cycle">Billing period</Label>
              <Select
                value={selectedBillingCycle}
                onValueChange={(value) => setSelectedBillingCycle(value as BillingCycleKey)}
              >
                <SelectTrigger id="referral-billing-cycle" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="min-w-0 p-0">
          {referralProductRows.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground lg:px-6">
              No {CATEGORY_META[selectedCategory].label.toLowerCase()} products are available for the
              selected billing period.
            </div>
          ) : (
            <>
              <div className="space-y-4 p-4 lg:hidden">
                {referralProductRows.map((row) => {
                  const {
                    product,
                    productRef,
                    cyclePricing,
                    affiliateLink,
                    estimatedCommission,
                    categoryMeta,
                    Icon,
                    allFeatures,
                    hasDiscount,
                    discountAmount,
                  } = row;
                  const copied = copiedKey === `${productRef}:${selectedBillingCycle}`;
                  const isExpanded = Boolean(expandedProducts[productRef]);
                  const visibleFeatures = isExpanded ? allFeatures : allFeatures.slice(0, 4);

                  return (
                    <div
                      key={productRef}
                      className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5 shrink-0 rounded-md bg-muted p-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-medium">{product.name}</div>
                            <Badge variant="secondary">{categoryMeta.label}</Badge>
                            {selectedCategory === "hosting" &&
                            product.group?.toLowerCase().includes("business") ? (
                              <Badge variant="outline" className="font-normal">
                                Popular
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {product.description || categoryMeta.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCycleLabel}
                            <span className="px-1.5">·</span>
                            {selectedCurrency.code}
                            {cyclePricing.setupFee > 0 ? (
                              <>
                                <span className="px-1.5">·</span>
                                Setup {formatCurrency(cyclePricing.setupFee, selectedCurrency.code)}
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Package details
                        </p>
                        <div className="space-y-2">
                          {visibleFeatures.length > 0 ? (
                            visibleFeatures.map((feature) => (
                              <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>{feature}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Feature list is not available for this package yet.
                            </p>
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
                      </div>

                      <div className="grid grid-cols-1 gap-4 border-y border-border py-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Buyer pays
                          </p>
                          <p className="text-lg font-semibold tracking-tight">
                            {formatCurrency(cyclePricing.price, selectedCurrency.code)}
                          </p>
                          <p className="text-xs text-muted-foreground">for {selectedCycleLabel.toLowerCase()}</p>
                          {hasDiscount ? (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-muted-foreground line-through">
                                {formatCurrency(cyclePricing.renewPrice, selectedCurrency.code)}
                              </p>
                              <p className="text-xs font-medium text-foreground">
                                Discount {formatCurrency(discountAmount, selectedCurrency.code)}
                              </p>
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Renewal {formatCurrency(cyclePricing.renewPrice, selectedCurrency.code)}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Your commission
                          </p>
                          <p className="text-lg font-semibold tracking-tight text-foreground">
                            {formatCurrency(estimatedCommission, selectedCurrency.code)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(COMMISSION_RATE * 100)}% commission rate
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Earned when the referral completes payment.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          className="w-full"
                          onClick={() => handleCopyLink(product)}
                          disabled={!referralCode}
                        >
                          <Copy className="mr-2 h-4 w-4 shrink-0" />
                          {copied ? "Copied" : "Copy link"}
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={affiliateLink || "#"} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4 shrink-0" />
                            Open checkout
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden min-w-0 border-t lg:block">
                <Table className="w-full whitespace-normal">
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
                    {referralProductRows.map((row) => {
                      const {
                        product,
                        productRef,
                        cyclePricing,
                        affiliateLink,
                        estimatedCommission,
                        categoryMeta,
                        Icon,
                        allFeatures,
                        hasDiscount,
                        discountAmount,
                      } = row;
                      const copied = copiedKey === `${productRef}:${selectedBillingCycle}`;
                      const isExpanded = Boolean(expandedProducts[productRef]);
                      const visibleFeatures = isExpanded ? allFeatures : allFeatures.slice(0, 4);

                      return (
                        <TableRow key={productRef}>
                          <TableCell className="align-top">
                            <div className="flex min-w-[220px] max-w-md items-start gap-3 sm:min-w-[280px] sm:max-w-none">
                              <div className="mt-0.5 rounded-md bg-muted p-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-base font-medium">{product.name}</div>
                                  <Badge variant="secondary">{categoryMeta.label}</Badge>
                                  {selectedCategory === "hosting" &&
                                  product.group?.toLowerCase().includes("business") ? (
                                    <Badge variant="outline" className="font-normal">
                                      Popular
                                    </Badge>
                                  ) : null}
                                </div>
                                <div className="max-w-xl text-sm text-muted-foreground">
                                  {product.description || categoryMeta.description}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {selectedCycleLabel}
                                  <span className="px-1.5">·</span>
                                  {selectedCurrency.code}
                                  {cyclePricing.setupFee > 0 ? (
                                    <>
                                      <span className="px-1.5">·</span>
                                      Setup{" "}
                                      {formatCurrency(cyclePricing.setupFee, selectedCurrency.code)}
                                    </>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="min-w-[180px] max-w-md space-y-2 sm:min-w-[260px] sm:max-w-none">
                              {visibleFeatures.length > 0 ? (
                                visibleFeatures.map((feature) => (
                                  <div
                                    key={feature}
                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                  >
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
                              <div className="text-lg font-semibold tracking-tight">
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
                                  <div className="text-xs font-medium text-foreground">
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
                              <div className="text-lg font-semibold tracking-tight text-foreground">
                                {formatCurrency(estimatedCommission, selectedCurrency.code)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round(COMMISSION_RATE * 100)}% commission rate
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Earned when the referral completes payment.
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex flex-col items-stretch justify-end gap-2 sm:flex-row sm:items-center sm:justify-end">
                              <Button
                                type="button"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => handleCopyLink(product)}
                                disabled={!referralCode}
                              >
                                <Copy className="mr-2 h-4 w-4 shrink-0" />
                                {copied ? "Copied" : "Copy"}
                              </Button>
                              <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                                <Link href={affiliateLink || "#"} target="_blank">
                                  <ExternalLink className="mr-2 h-4 w-4 shrink-0" />
                                  Open
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {(affiliateDashboard?.referrals?.length || 0) > 0 && (
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Latest referral activity</CardTitle>
            <CardDescription>Recent tracked referrals from your affiliate dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 p-0">
            <div className="min-w-0 overflow-x-auto border-t">
              <Table className="min-w-[560px] whitespace-normal">
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
                      referral.referredClientId?.contactEmail ||
                      `${referral.referredClientId?.firstName || "Unknown"} ${referral.referredClientId?.lastName || ""}`.trim();

                    return (
                      <TableRow key={`${referral._id}-${index}`}>
                        <TableCell>{inviteLabel || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {referral.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(referral.qualifiedAt || referral.createdAt)}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
