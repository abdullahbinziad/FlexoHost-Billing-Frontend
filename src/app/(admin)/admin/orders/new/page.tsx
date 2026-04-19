"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search, Plus, User, Globe, Server,
    ShoppingCart, Trash2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BackButton } from "@/components/ui/back-button";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useGetClientsQuery } from "@/store/api/clientApi";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetTldsQuery } from "@/store/api/tldApi";
import { useGetOrderConfigQuery } from "@/store/api/orderApi";
import { useCreateOrderMutation } from "@/store/api/checkoutApi";
import { useValidateCouponMutation } from "@/store/api/promotionApi";
import type { ClientListItem } from "@/store/api/clientApi";
import type { Product } from "@/types/admin";
import type { TLD } from "@/types/admin";
import { toast } from "sonner";
import { SELECT_SENTINEL } from "@/constants/status";

const FALLBACK_PAYMENT_METHODS = [
    { id: "manual", name: "Manual / Bank Transfer" },
    { id: "invoice", name: "Invoice" },
    { id: "stripe", name: "Stripe" },
    { id: "paypal", name: "PayPal" },
    { id: "sslcommerz", name: "SSLCommerz" },
];

type ProductRow = {
    id: string;
    productId: string;
    domain: string;
    billingCycle: string;
    serverLocation: string;
    quantity: number;
    priceOverride: string;
};

type DomainRow = {
    id: string;
    type: "register" | "transfer";
    domain: string;
    tld: string;
    period: string;
    eppCode: string;
    priceOverride: string;
};

const ORDER_STATUS_OPTIONS = [
    { value: "PENDING_PAYMENT", label: "Pending" },
    { value: "ACTIVE", label: "Active" },
    { value: "PROCESSING", label: "Processing" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "FRAUD", label: "Fraud" },
] as const;

const BILLING_CYCLES = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semiAnnually", label: "Semi-Annually" },
    { value: "annually", label: "Annually" },
    { value: "biennially", label: "Biennially" },
    { value: "triennially", label: "Triennially" },
] as const;

function getProductPrice(product: Product, currency: string, cycle: string): number {
    const pricing = product.pricing?.find((p: any) => p.currency === currency);
    if (!pricing) return 0;
    const cyclePricing = (pricing as any)[cycle];
    return cyclePricing?.price ?? 0;
}

function getEnabledBillingCycles(product: Product | undefined, currency: string): { value: string; label: string }[] {
    if (!product || !product.pricing) return BILLING_CYCLES.map((bc) => ({ value: bc.value, label: bc.label }));
    const pricing = product.pricing.find((p: any) => p.currency === currency);
    if (!pricing) return BILLING_CYCLES.map((bc) => ({ value: bc.value, label: bc.label }));
    return BILLING_CYCLES.filter((bc) => (pricing as any)[bc.value]?.enable).map((bc) => ({ value: bc.value, label: bc.label }));
}

function getTldPrice(tld: TLD, currency: string, period: string, action: "register" | "transfer"): number {
    const pricing = tld.pricing?.find((p: any) => p.currency === currency);
    if (!pricing) return 0;
    const periodPricing = (pricing as any)[period];
    if (!periodPricing?.enable) return 0;
    return action === "register" ? periodPricing.register : periodPricing.transfer;
}

function validateDomainName(name: string): string | null {
    const trimmed = (name || "").trim();
    if (!trimmed) return "Domain name is required";
    if (/\s/.test(trimmed)) return "Domain name cannot contain spaces";
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(trimmed)) return "Invalid domain name format";
    if (trimmed.length > 63) return "Domain name too long";
    return null;
}

export default function AddNewOrderPage() {
    const router = useRouter();
    const formatCurrency = useFormatCurrency();

    const [clientSearch, setClientSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("manual");
    const [promoCode, setPromoCode] = useState("");
    const [promoDiscount, setPromoDiscount] = useState<number>(0);
    const [currency, setCurrency] = useState<string>("USD");
    const [sendEmail, setSendEmail] = useState(true);
    const [redirectToOrder, setRedirectToOrder] = useState(true);
    const [generateInvoice, setGenerateInvoice] = useState(true);
    const [orderStatus, setOrderStatus] = useState("PENDING_PAYMENT");

    const [products, setProducts] = useState<ProductRow[]>([
        {
            id: "1",
            productId: SELECT_SENTINEL.NONE,
            domain: "",
            billingCycle: "annually",
            serverLocation: SELECT_SENTINEL.AUTO,
            quantity: 1,
            priceOverride: "",
        }
    ]);
    const [domains, setDomains] = useState<DomainRow[]>([]);

    // Debounce client search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(clientSearch), 300);
        return () => clearTimeout(t);
    }, [clientSearch]);

    const { data: orderConfig } = useGetOrderConfigQuery();
    const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery(
        { search: debouncedSearch, limit: 10 },
        { skip: debouncedSearch.length < 2 }
    );
    const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({ limit: 100 });
    const { data: tlds = [], isLoading: tldsLoading } = useGetTldsQuery();
    const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();
    const [validateCoupon, { isLoading: promoValidating }] = useValidateCouponMutation();

    const paymentMethods = orderConfig?.paymentMethods?.length ? orderConfig.paymentMethods : FALLBACK_PAYMENT_METHODS;
    const serverLocations = orderConfig?.serverLocations?.length ? orderConfig.serverLocations : [{ id: "Auto", name: "Auto" }];
    const supportedCurrencies = orderConfig?.supportedCurrencies?.length ? orderConfig.supportedCurrencies : ["USD", "BDT"];

    useEffect(() => {
        if (supportedCurrencies.length && !supportedCurrencies.includes(currency)) {
            setCurrency(supportedCurrencies[0]);
        }
    }, [supportedCurrencies, currency]);

    const allProducts = productsData?.products ?? [];
    const hostingVpsProducts = allProducts.filter(
        (p) => p.type === "hosting" || p.type === "vps"
    );

    useEffect(() => {
        setProducts((prev) =>
            prev.map((p) => {
                const prod = hostingVpsProducts.find((x) => (x.id ?? (x as any)._id) === p.productId);
                const enabled = getEnabledBillingCycles(prod, currency);
                if (enabled.length && !enabled.some((bc) => bc.value === p.billingCycle)) {
                    return { ...p, billingCycle: enabled[0].value };
                }
                return p;
            })
        );
    }, [currency, productsData]);

    const addProductRow = () => {
        setProducts([...products, {
            id: Math.random().toString(36).slice(2, 9),
            productId: SELECT_SENTINEL.NONE, domain: "", billingCycle: "annually", serverLocation: SELECT_SENTINEL.AUTO, quantity: 1, priceOverride: ""
        }]);
    };
    const removeProductRow = (id: string) => {
        setProducts(products.filter((p) => p.id !== id));
    };
    const updateProduct = (id: string, field: keyof ProductRow, value: string | number) => {
        setProducts(products.map((p) => {
            if (p.id !== id) return p;
            const next = { ...p, [field]: value };
            if (field === "productId" || field === "billingCycle") {
                const prod = hostingVpsProducts.find((x) => (x.id ?? (x as any)._id) === next.productId);
                const enabled = getEnabledBillingCycles(prod, currency);
                if (enabled.length && !enabled.some((bc) => bc.value === next.billingCycle)) {
                    next.billingCycle = enabled[0].value;
                }
            }
            return next;
        }));
    };

    const addDomainRow = () => {
        setDomains([...domains, {
            id: Math.random().toString(36).slice(2, 9),
            type: "register", domain: "", tld: SELECT_SENTINEL.NONE, period: "1", eppCode: "", priceOverride: ""
        }]);
    };
    const removeDomainRow = (id: string) => {
        setDomains(domains.filter((d) => d.id !== id));
    };
    const updateDomain = (id: string, field: keyof DomainRow, value: string) => {
        setDomains(domains.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
    };

    const hasProduct = products.some((p) => p.productId && p.productId !== SELECT_SENTINEL.NONE);
    const hasDomain = domains.some((d) => d.domain && d.tld && d.tld !== SELECT_SENTINEL.NONE);

    const calculateTotal = useCallback(() => {
        let total = 0;
        products.forEach((p) => {
            if (!p.productId || p.productId === SELECT_SENTINEL.NONE) return;
            const prod = hostingVpsProducts.find((x) => (x.id ?? (x as any)._id) === p.productId);
            let price = prod ? getProductPrice(prod, currency, p.billingCycle) : 0;
            if (p.priceOverride) price = parseFloat(p.priceOverride) || price;
            total += price * p.quantity;
        });
        domains.forEach((d) => {
            if (!d.domain || !d.tld || d.tld === SELECT_SENTINEL.NONE) return;
            const tldObj = tlds.find((t) => (t.tld || "").replace(/^\./, "") === d.tld.replace(/^\./, ""));
            let price = tldObj ? getTldPrice(tldObj, currency, d.period, d.type) : 0;
            if (d.priceOverride) price = parseFloat(d.priceOverride) || price;
            total += price;
        });
        return Math.max(0, total - promoDiscount);
    }, [products, domains, hostingVpsProducts, tlds, currency, promoDiscount]);

    const totalAmount = calculateTotal();
    const subtotalBeforePromo = useCallback(() => {
        let t = 0;
        products.forEach((p) => {
            if (!p.productId || p.productId === SELECT_SENTINEL.NONE) return;
            const prod = hostingVpsProducts.find((x) => (x.id ?? (x as any)._id) === p.productId);
            let price = prod ? getProductPrice(prod, currency, p.billingCycle) : 0;
            if (p.priceOverride) price = parseFloat(p.priceOverride) || price;
            t += price * p.quantity;
        });
        domains.forEach((d) => {
            if (!d.domain || !d.tld || d.tld === SELECT_SENTINEL.NONE) return;
            const tldObj = tlds.find((t) => (t.tld || "").replace(/^\./, "") === d.tld.replace(/^\./, ""));
            let price = tldObj ? getTldPrice(tldObj, currency, d.period, d.type) : 0;
            if (d.priceOverride) price = parseFloat(d.priceOverride) || price;
            t += price;
        });
        return t;
    }, [products, domains, hostingVpsProducts, tlds, currency]);

    const handleValidatePromo = async () => {
        if (!promoCode?.trim()) {
            setPromoDiscount(0);
            return;
        }
        if (!selectedClient) {
            toast.error("Select a client first to validate promo");
            return;
        }
        const subtotal = subtotalBeforePromo();
        if (subtotal <= 0) {
            toast.error("Add items first to validate promo");
            return;
        }
        try {
            const res = await validateCoupon({
                code: promoCode.trim(),
                subtotal,
                currency,
                clientId: selectedClient._id,
            }).unwrap();
            if (res.valid && res.discountAmount != null) {
                setPromoDiscount(res.discountAmount);
                toast.success(`Promo applied: ${res.discountAmount} ${currency} off`);
            } else {
                setPromoDiscount(0);
                toast.error("Invalid or expired promo code");
            }
        } catch {
            setPromoDiscount(0);
            toast.error("Invalid or expired promo code");
        }
    };

    useEffect(() => {
        if (!promoCode?.trim()) setPromoDiscount(0);
    }, [promoCode]);

    const handleSelectClient = (client: ClientListItem) => {
        setSelectedClient(client);
        setClientSearch(`${client.firstName} ${client.lastName}`.trim() || client.contactEmail || client.user?.email || "");
        if (client.accountCreditCurrency && supportedCurrencies.includes(client.accountCreditCurrency)) {
            setCurrency(client.accountCreditCurrency);
        }
    };

    const handleSubmit = async () => {
        if (!selectedClient) {
            toast.error("Please select a client");
            return;
        }
        if (!hasProduct && !hasDomain) {
            toast.error("Please add at least one product or domain");
            return;
        }

        const firstProduct = products.find((p) => p.productId && p.productId !== SELECT_SENTINEL.NONE);
        const firstDomain = domains.find((d) => d.domain && d.tld && d.tld !== SELECT_SENTINEL.NONE);

        if (firstDomain) {
            const domainErr = validateDomainName(firstDomain.domain);
            if (domainErr) {
                toast.error(domainErr);
                return;
            }
            if (firstDomain.type === "transfer" && !firstDomain.eppCode?.trim()) {
                toast.error("EPP code is required for domain transfer");
                return;
            }
        }

        if (firstProduct?.domain?.trim()) {
            const parts = firstProduct.domain.trim().split(/\.(.+)/);
            const namePart = parts[0] || "";
            const domainErr = validateDomainName(namePart);
            if (domainErr) {
                toast.error(`Product domain: ${domainErr}`);
                return;
            }
        }

        const serverLoc = firstProduct?.serverLocation === SELECT_SENTINEL.AUTO ? "Auto" : (firstProduct?.serverLocation || "Auto");

        if (firstProduct) {
            // Product order (with optional domain)
            const product = hostingVpsProducts.find((x) => (x.id ?? (x as any)._id) === firstProduct.productId);
            if (!product) {
                toast.error("Product not found");
                return;
            }

            const domainPayload: any = { action: "use-owned" as const };
            if (firstDomain && firstDomain.domain && firstDomain.tld) {
                const tldVal = firstDomain.tld.startsWith(".") ? firstDomain.tld : `.${firstDomain.tld}`;
                const domainName = firstDomain.domain.includes(".")
                    ? firstDomain.domain
                    : `${firstDomain.domain}.${firstDomain.tld.replace(/^\./, "")}`;
                if (firstDomain.type === "register") {
                    domainPayload.action = "register";
                    domainPayload.registration = {
                        domainName,
                        tld: tldVal,
                        period: parseInt(firstDomain.period) || 1,
                        ...(firstDomain.priceOverride && { priceOverride: parseFloat(firstDomain.priceOverride) || undefined }),
                    };
                } else {
                    domainPayload.action = "transfer";
                    domainPayload.transfer = {
                        domainName,
                        tld: tldVal,
                        eppCode: firstDomain.eppCode || "N/A",
                        ...(firstDomain.priceOverride && { priceOverride: parseFloat(firstDomain.priceOverride) || undefined }),
                    };
                }
            } else if (firstProduct.domain) {
                const [name, ext] = firstProduct.domain.split(/\.(.+)/);
                domainPayload.ownDomain = {
                    domainName: firstProduct.domain,
                    tld: ext ? `.${ext}` : "",
                };
            }

            const productPriceOverrideVal = firstProduct.priceOverride ? parseFloat(firstProduct.priceOverride) : undefined;

            try {
                const res = await createOrder({
                    client: { type: "admin_selected", clientId: selectedClient._id },
                    productId: firstProduct.productId,
                    billingCycle: firstProduct.billingCycle,
                    currency,
                    domain: domainPayload,
                    serverLocation: serverLoc,
                    paymentMethod,
                    coupon: promoCode || undefined,
                    agreeToTerms: true,
                    sendEmail,
                    status: orderStatus,
                    qty: firstProduct.quantity,
                    generateInvoice,
                    ...(productPriceOverrideVal != null && !Number.isNaN(productPriceOverrideVal) && { productPriceOverride: productPriceOverrideVal }),
                }).unwrap();

                toast.success("Order created successfully");
                const orderId = String((res as any)?.order?.id ?? (res as any)?.order?.orderId ?? "");
                if (redirectToOrder && orderId) {
                    router.push(`/admin/orders/${orderId}`);
                } else {
                    router.push("/admin/orders");
                }
            } catch (err: any) {
                toast.error(err?.data?.message || err?.message || "Failed to create order");
            }
            return;
        }

        if (firstDomain && firstDomain.domain && firstDomain.tld) {
            const tldVal = firstDomain.tld.startsWith(".") ? firstDomain.tld : `.${firstDomain.tld}`;
            const domainName = firstDomain.domain.includes(".")
                ? firstDomain.domain
                : `${firstDomain.domain}.${firstDomain.tld.replace(/^\./, "")}`;
            const domainPayload: any =
                firstDomain.type === "register"
                    ? {
                        action: "register" as const,
                        registration: {
                            domainName,
                            tld: tldVal,
                            period: parseInt(firstDomain.period) || 1,
                            ...(firstDomain.priceOverride && { priceOverride: parseFloat(firstDomain.priceOverride) || undefined }),
                        },
                    }
                    : {
                        action: "transfer" as const,
                        transfer: {
                            domainName,
                            tld: tldVal,
                            eppCode: firstDomain.eppCode || "N/A",
                            ...(firstDomain.priceOverride && { priceOverride: parseFloat(firstDomain.priceOverride) || undefined }),
                        },
                    };

            try {
                const res = await createOrder({
                    client: { type: "admin_selected", clientId: selectedClient._id },
                    currency,
                    domain: domainPayload,
                    paymentMethod,
                    coupon: promoCode || undefined,
                    agreeToTerms: true,
                    sendEmail,
                    status: orderStatus,
                    generateInvoice,
                }).unwrap();

                toast.success("Order created successfully");
                const orderId = String((res as any)?.order?.id ?? (res as any)?.order?.orderId ?? "");
                if (redirectToOrder && orderId) {
                    router.push(`/admin/orders/${orderId}`);
                } else {
                    router.push("/admin/orders");
                }
            } catch (err: any) {
                toast.error(err?.data?.message || err?.message || "Failed to create order");
            }
        }
    };

    const showClientDropdown = clientSearch.length >= 2 && !selectedClient;
    const clients = clientsData?.clients ?? [];

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BackButton href="/admin/orders" label="Back to Orders" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Create New Order
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manually create a new order for a client.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-8 space-y-6">
                    {/* 1. Client & Settings */}
                    <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
                        <CardHeader className="p-4 pb-2 space-y-0.5">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-base">Client & Order Settings</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Select client, currency, payment method, and order options.
                            </p>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Client</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Start typing to search clients..."
                                        className="pl-9 h-10 bg-white dark:bg-background"
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            if (!e.target.value) setSelectedClient(null);
                                        }}
                                    />
                                    {showClientDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 max-h-60 overflow-auto">
                                            {clientsLoading ? (
                                                <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                                                </div>
                                            ) : clients.length === 0 ? (
                                                <div className="px-4 py-2 text-sm text-muted-foreground">
                                                    No clients found. Try a different search.
                                                </div>
                                            ) : (
                                                clients.map((client) => (
                                                    <div
                                                        key={client._id}
                                                        className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-800 last:border-0"
                                                        onClick={() => handleSelectClient(client)}
                                                    >
                                                        <div className="font-medium">
                                                            {[client.firstName, client.lastName].filter(Boolean).join(" ") || "—"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {client.contactEmail || client.user?.email || ""}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                {selectedClient && (
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                        Selected: {[selectedClient.firstName, selectedClient.lastName].filter(Boolean).join(" ")}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className="h-10 bg-white dark:bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {supportedCurrencies.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="h-10 bg-white dark:bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.map((pm) => (
                                                <SelectItem key={pm.id} value={pm.id}>
                                                    {pm.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Promotion Code</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            className="h-10 flex-1 bg-white dark:bg-background"
                                            placeholder="Optional"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-10 shrink-0"
                                            onClick={handleValidatePromo}
                                            disabled={promoValidating || !promoCode?.trim() || !selectedClient}
                                        >
                                            {promoValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-10 shrink-0"
                                            asChild
                                        >
                                            <Link href="/admin/promotions" target="_blank">
                                                <Plus className="w-4 h-4 mr-1" /> New Promo
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Order Status</Label>
                                    <Select value={orderStatus} onValueChange={setOrderStatus}>
                                        <SelectTrigger className="h-10 bg-white dark:bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ORDER_STATUS_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Initial status (e.g. Active for manual/paid orders)</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox id="sendEmail" checked={sendEmail} onCheckedChange={(c) => setSendEmail(!!c)} />
                                    <span className="text-sm">Send order & invoice emails to client</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox id="redirectToOrder" checked={redirectToOrder} onCheckedChange={(c) => setRedirectToOrder(!!c)} />
                                    <span className="text-sm">Redirect to order detail after create</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox id="generateInvoice" checked={generateInvoice} onCheckedChange={(c) => setGenerateInvoice(!!c)} />
                                    <span className="text-sm">Generate invoice for this order</span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Products / Services */}
                    <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
                        <CardHeader className="p-4 pb-2 space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-base">Products & Services</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Add hosting or VPS products. Optionally attach a domain to each product.
                            </p>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-4">
                            {products.map((product) => (
                                <div key={product.id} className="relative rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 p-4 group">
                                    {products.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeProductRow(product.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium">Product</Label>
                                            <Select
                                                value={product.productId}
                                                onValueChange={(val) => updateProduct(product.id, "productId", val)}
                                            >
                                                <SelectTrigger className="bg-white dark:bg-background h-10">
                                                    <SelectValue placeholder="Select Product..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={SELECT_SENTINEL.NONE}>— None —</SelectItem>
                                                    {productsLoading && (
                                                        <SelectItem value="__loading__" disabled>
                                                            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</span>
                                                        </SelectItem>
                                                    )}
                                                    {!productsLoading && hostingVpsProducts.length === 0 && (
                                                        <SelectItem value="__empty__" disabled>No hosting/VPS products</SelectItem>
                                                    )}
                                                    {hostingVpsProducts.map((p) => {
                                                        const pid = p.id ?? (p as any)._id;
                                                        const price = getProductPrice(p, currency, product.billingCycle);
                                                        return (
                                                            <SelectItem key={pid} value={String(pid)}>
                                                                {p.name} — {formatCurrency(price, currency)}/{product.billingCycle}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium">Domain (optional)</Label>
                                            <Input
                                                className="bg-white dark:bg-background h-10"
                                                placeholder="example.com — use your own domain"
                                                value={product.domain}
                                                onChange={(e) => updateProduct(product.id, "domain", e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                For register/transfer, add a domain in the section below.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium">Billing Cycle</Label>
                                            <Select
                                                value={product.billingCycle}
                                                onValueChange={(val) => updateProduct(product.id, "billingCycle", val)}
                                            >
                                                <SelectTrigger className="bg-white dark:bg-background h-10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getEnabledBillingCycles(
                                                        hostingVpsProducts.find((x) => (x.id ?? (x as any)._id) === product.productId),
                                                        currency
                                                    ).map((bc) => (
                                                        <SelectItem key={bc.value} value={bc.value}>
                                                            {bc.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {product.productId && product.productId !== SELECT_SENTINEL.NONE && (
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium">Server Location</Label>
                                                <Select
                                                    value={product.serverLocation}
                                                    onValueChange={(val) => updateProduct(product.id, "serverLocation", val)}
                                                >
                                                    <SelectTrigger className="bg-white dark:bg-background h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={SELECT_SENTINEL.AUTO}>Auto</SelectItem>
                                                        {serverLocations.map((loc) => (
                                                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium">Quantity</Label>
                                            <Input
                                                type="number"
                                                className="bg-white dark:bg-background h-10"
                                                min={1}
                                                value={product.quantity}
                                                onChange={(e) => updateProduct(product.id, "quantity", parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium">Price Override</Label>
                                            <Input
                                                className="bg-white dark:bg-background h-10"
                                                placeholder="0.00"
                                                value={product.priceOverride}
                                                onChange={(e) => updateProduct(product.id, "priceOverride", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                variant="outline"
                                className="w-full border-dashed py-5 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                                onClick={addProductRow}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Another Product
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 3. Domains */}
                    <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
                        <CardHeader className="p-4 pb-2 space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-base">Domain Registration / Transfer</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Add standalone domains for registration or transfer.
                            </p>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-4">
                            {domains.length === 0 ? (
                                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                                    No domains added. Add a domain for standalone registration or transfer.
                                </div>
                            ) : (
                                domains.map((domain) => (
                                    <div key={domain.id} className="relative rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 p-4 group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeDomainRow(domain.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                        <div className="mb-4">
                                            <Label className="text-sm font-medium mb-2 block">Type</Label>
                                            <RadioGroup
                                                value={domain.type}
                                                onValueChange={(val: "register" | "transfer") => updateDomain(domain.id, "type", val)}
                                                className="flex gap-6"
                                            >
                                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                    <RadioGroupItem value="register" id={`r-${domain.id}`} />
                                                    Register
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                    <RadioGroupItem value="transfer" id={`t-${domain.id}`} />
                                                    Transfer
                                                </label>
                                            </RadioGroup>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium">Domain</Label>
                                                <Input
                                                    className="bg-white dark:bg-background h-10"
                                                    placeholder="example"
                                                    value={domain.domain}
                                                    onChange={(e) => updateDomain(domain.id, "domain", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium">TLD</Label>
                                                <Select
                                                    value={domain.tld}
                                                    onValueChange={(val) => updateDomain(domain.id, "tld", val)}
                                                >
                                                    <SelectTrigger className="bg-white dark:bg-background h-10">
                                                        <SelectValue placeholder="Select TLD" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={SELECT_SENTINEL.NONE}>— Select —</SelectItem>
                                                        {tldsLoading && (
                                                            <SelectItem value="__loading__" disabled>
                                                                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</span>
                                                            </SelectItem>
                                                        )}
                                                        {!tldsLoading && tlds.length === 0 && (
                                                            <SelectItem value="__empty__" disabled>No TLDs configured</SelectItem>
                                                        )}
                                                        {tlds.map((t) => {
                                                            const ext = (t.tld || "").replace(/^\./, "");
                                                            const price = getTldPrice(t, currency, domain.period, domain.type);
                                                            return (
                                                                <SelectItem key={t._id} value={ext}>
                                                                    .{ext} — {formatCurrency(price, currency)}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium">Period</Label>
                                                <Select
                                                    value={domain.period}
                                                    onValueChange={(val) => updateDomain(domain.id, "period", val)}
                                                >
                                                    <SelectTrigger className="bg-white dark:bg-background h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1 Year</SelectItem>
                                                        <SelectItem value="2">2 Years</SelectItem>
                                                        <SelectItem value="3">3 Years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {domain.type === "transfer" && (
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm font-medium">EPP Code</Label>
                                                    <Input
                                                        className="bg-white dark:bg-background h-10"
                                                        placeholder="Required for transfer"
                                                        value={domain.eppCode}
                                                        onChange={(e) => updateDomain(domain.id, "eppCode", e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium">Price Override</Label>
                                            <Input
                                                className="bg-white dark:bg-background max-w-xs h-10"
                                                placeholder="0.00"
                                                value={domain.priceOverride}
                                                onChange={(e) => updateDomain(domain.id, "priceOverride", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}

                            <Button
                                variant="outline"
                                className="w-full border-dashed py-5 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                                onClick={addDomainRow}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Domain
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: SUMMARY */}
                <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-6">
                    <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
                        <CardHeader className="p-4 pb-2 space-y-0.5 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-base">Order Summary</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {!hasProduct && !hasDomain ? (
                                <div className="text-center py-8 text-sm text-muted-foreground">
                                    Add products or domains to see the summary.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {products
                                        .filter((p) => p.productId && p.productId !== SELECT_SENTINEL.NONE)
                                        .map((p) => {
                                            const prod = hostingVpsProducts.find((x) => (x.id ?? (x as any)._id) === p.productId);
                                            const price = prod ? getProductPrice(prod, currency, p.billingCycle) : 0;
                                            const displayPrice = p.priceOverride ? parseFloat(p.priceOverride) || price : price;
                                            return (
                                                <div key={p.id} className="flex justify-between items-start text-sm">
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {prod ? prod.name : "Select Product"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {p.domain && `${p.domain} • `}{p.billingCycle}
                                                            {p.quantity > 1 && ` • ×${p.quantity}`}
                                                        </p>
                                                    </div>
                                                    <span className="font-medium">
                                                        {formatCurrency(displayPrice * p.quantity, currency)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    {domains
                                        .filter((d) => d.domain && d.tld && d.tld !== SELECT_SENTINEL.NONE)
                                        .map((d) => {
                                            const tldObj = tlds.find((t) => (t.tld || "").replace(/^\./, "") === d.tld.replace(/^\./, ""));
                                            const price = tldObj ? getTldPrice(tldObj, currency, d.period, d.type) : 0;
                                            const displayPrice = d.priceOverride ? parseFloat(d.priceOverride) || price : price;
                                            return (
                                                <div key={d.id} className="flex justify-between items-start text-sm">
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            Domain {d.type === "register" ? "Registration" : "Transfer"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {d.domain ? `${d.domain}.${d.tld}` : "(No domain)"} • {d.period} Year(s)
                                                        </p>
                                                    </div>
                                                    <span className="font-medium">
                                                        {formatCurrency(displayPrice, currency)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Sub Total</span>
                                    <span>{formatCurrency(subtotalBeforePromo(), currency)}</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                        <span>Promo Discount</span>
                                        <span>-{formatCurrency(promoDiscount, currency)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Tax (0%)</span>
                                    <span>{formatCurrency(0, currency)}</span>
                                </div>
                            </div>
                        </CardContent>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-lg font-bold text-primary">{formatCurrency(totalAmount, currency)}</span>
                            </div>
                            <Button
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Order"
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
