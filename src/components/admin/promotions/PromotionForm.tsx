"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Promotion, CreatePromotionDTO } from "@/types/admin/coupon";
import { Tag, Percent, Calendar, Settings, Package, Globe, Search, X, ChevronDown, CreditCard } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetTldsQuery } from "@/store/api/tldApi";
import { SUPPORTED_CURRENCY_CODES } from "@/types/currency";

interface PromotionFormProps {
    initialData?: Promotion;
    onSubmit: (data: CreatePromotionDTO) => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
}

const CURRENCIES = [...SUPPORTED_CURRENCY_CODES];

const PRODUCT_BILLING_CYCLES = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semiAnnually", label: "Semi-Annually" },
    { value: "annually", label: "Annually" },
    { value: "biennially", label: "Biennially" },
    { value: "triennially", label: "Triennially" },
] as const;

const DOMAIN_BILLING_CYCLES = [
    { value: "annually", label: "1 Year" },
    { value: "biennially", label: "2 Years" },
    { value: "triennially", label: "3 Years" },
] as const;

export function PromotionForm({ initialData, onSubmit, onCancel, isSubmitting }: PromotionFormProps) {
    const [formData, setFormData] = useState<CreatePromotionDTO>({
        code: initialData?.code || "",
        name: initialData?.name || "",
        description: initialData?.description || "",
        type: initialData?.type || "percent",
        value: initialData?.value ?? 0,
        currency: initialData?.currency || "BDT",
        minOrderAmount: initialData?.minOrderAmount ?? 0,
        maxDiscountAmount: initialData?.maxDiscountAmount ?? 0,
        startDate: initialData?.startDate
            ? new Date(initialData.startDate).toISOString().slice(0, 10)
            : "",
        endDate: initialData?.endDate
            ? new Date(initialData.endDate).toISOString().slice(0, 10)
            : "",
        usageLimit: initialData?.usageLimit ?? 0,
        usagePerClient: initialData?.usagePerClient ?? 1,
        firstOrderOnly: initialData?.firstOrderOnly ?? false,
        productIds: initialData?.productIds || [],
        productTypes: initialData?.productTypes || [],
        productBillingCycles: initialData?.productBillingCycles || [],
        domainTlds: initialData?.domainTlds || [],
        domainBillingCycles: initialData?.domainBillingCycles || [],
        isActive: initialData?.isActive ?? true,
    });

    const { data: productsData, isLoading: productsLoading, error: productsError } = useGetProductsQuery(
        { limit: 500, page: 1 },
        { refetchOnMountOrArgChange: true }
    );
    const { data: tlds = [] } = useGetTldsQuery();

    const products = productsData?.products ?? [];
    const [tldSearch, setTldSearch] = useState("");

    const filteredTlds = useMemo(() => {
        if (!tldSearch.trim()) return tlds;
        const q = tldSearch.toLowerCase();
        return tlds.filter((t) => (t.tld || "").toLowerCase().includes(q));
    }, [tlds, tldSearch]);

    const selectedProducts = useMemo(() => {
        const ids = new Set(formData.productIds || []);
        return products.filter((p) => ids.has(p.id || (p as any)._id));
    }, [formData.productIds, products]);

    const selectedTldNames = useMemo(() => formData.domainTlds || [], [formData.domainTlds]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "number"
                    ? (value === "" ? 0 : Number(value))
                    : type === "checkbox"
                      ? (e.target as HTMLInputElement).checked
                      : value,
        }));
    };

    const handleCheckboxChange = (name: keyof CreatePromotionDTO, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleProductToggle = (productId: string, checked: boolean) => {
        const id = productId.startsWith("_") ? productId : productId;
        setFormData((prev) => ({
            ...prev,
            productIds: checked
                ? [...(prev.productIds || []), id]
                : (prev.productIds || []).filter((pid) => pid !== id),
        }));
    };

    const handleTldToggle = (tld: string, checked: boolean) => {
        const normalized = tld.startsWith(".") ? tld : `.${tld}`;
        setFormData((prev) => ({
            ...prev,
            domainTlds: checked
                ? [...(prev.domainTlds || []), normalized]
                : (prev.domainTlds || []).filter((t) => (t.startsWith(".") ? t : `.${t}`) !== normalized),
        }));
    };

    const handleProductBillingCycleToggle = (cycle: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            productBillingCycles: checked
                ? [...(prev.productBillingCycles || []), cycle]
                : (prev.productBillingCycles || []).filter((c) => c !== cycle),
        }));
    };

    const handleDomainBillingCycleToggle = (cycle: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            domainBillingCycles: checked
                ? [...(prev.domainBillingCycles || []), cycle]
                : (prev.domainBillingCycles || []).filter((c) => c !== cycle),
        }));
    };

    const selectAllTlds = () => {
        setFormData((prev) => ({
            ...prev,
            domainTlds: filteredTlds.map((t) => (t.tld.startsWith(".") ? t.tld : `.${t.tld}`)),
        }));
    };

    const clearAllTlds = () => {
        setFormData((prev) => ({ ...prev, domainTlds: [] }));
    };

    const generateCode = () => {
        const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        setFormData((prev) => ({ ...prev, code: randomCode }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: CreatePromotionDTO = {
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="space-y-8">
                {/* Basic Information */}
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Tag className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Promotion Details</CardTitle>
                                <CardDescription>
                                    Configure the basic promotion code and discount
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-sm font-medium">
                                    Promotion Code *
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="code"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g., SUMMER2024"
                                        required
                                        className="h-11"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generateCode}
                                        className="h-11"
                                    >
                                        Auto Generate
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Name *
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Summer Sale 2024"
                                    required
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description || ""}
                                onChange={handleChange}
                                placeholder="Internal or customer-facing description..."
                                className="min-h-[60px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-sm font-medium">
                                    Discount Type *
                                </Label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange as any}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="percent">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="value" className="text-sm font-medium">
                                    Value * {formData.type === "percent" ? "(%)" : `(${formData.currency})`}
                                </Label>
                                <Input
                                    id="value"
                                    name="value"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={formData.value}
                                    onChange={handleChange}
                                    placeholder={formData.type === "percent" ? "30" : "500"}
                                    required
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="currency" className="text-sm font-medium">
                                    Currency
                                </Label>
                                <select
                                    id="currency"
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange as any}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minOrderAmount" className="text-sm font-medium">
                                    Minimum Order Amount
                                </Label>
                                <Input
                                    id="minOrderAmount"
                                    name="minOrderAmount"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={formData.minOrderAmount || ""}
                                    onChange={handleChange}
                                    placeholder="0 = no minimum"
                                    className="h-11"
                                />
                            </div>

                            {formData.type === "percent" && (
                                <div className="space-y-2">
                                    <Label htmlFor="maxDiscountAmount" className="text-sm font-medium">
                                        Max Discount Amount (for %)
                                    </Label>
                                    <Input
                                        id="maxDiscountAmount"
                                        name="maxDiscountAmount"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={formData.maxDiscountAmount || ""}
                                        onChange={handleChange}
                                        placeholder="Cap discount amount"
                                        className="h-11"
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Date & Usage Limits */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Date & Usage Limits</CardTitle>
                                <CardDescription>
                                    Set validity period and usage restrictions
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-sm font-medium">
                                    Start Date *
                                </Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="text-sm font-medium">
                                    End Date *
                                </Label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="usageLimit" className="text-sm font-medium">
                                    Total Usage Limit
                                </Label>
                                <Input
                                    id="usageLimit"
                                    name="usageLimit"
                                    type="number"
                                    min={0}
                                    value={formData.usageLimit}
                                    onChange={handleChange}
                                    placeholder="0 = unlimited"
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="usagePerClient" className="text-sm font-medium">
                                    Uses Per Client
                                </Label>
                                <Input
                                    id="usagePerClient"
                                    name="usagePerClient"
                                    type="number"
                                    min={0}
                                    value={formData.usagePerClient}
                                    onChange={handleChange}
                                    placeholder="1"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <Checkbox
                                id="firstOrderOnly"
                                checked={formData.firstOrderOnly}
                                onCheckedChange={(c) => handleCheckboxChange("firstOrderOnly", !!c)}
                            />
                            <span className="text-sm">First order only (new customers)</span>
                        </label>
                    </CardContent>
                </Card>

                {/* Product & Domain Restrictions */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Package className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Product & Domain Restrictions</CardTitle>
                                <CardDescription>
                                    Limit to specific products and/or domain TLDs. Leave both empty to apply to all.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Products Multi-Select Dropdown */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Products
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between h-10 font-normal"
                                    >
                                        <span className="truncate">
                                            {formData.productIds?.length
                                                ? `${formData.productIds.length} product(s) selected`
                                                : "Select products..."}
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[280px] max-h-[320px] p-0"
                                    align="start"
                                >
                                    <div className="max-h-[280px] overflow-y-auto p-1">
                                        {productsLoading ? (
                                            <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                                        ) : productsError ? (
                                            <p className="text-sm text-destructive py-4 text-center">Failed to load</p>
                                        ) : products.length === 0 ? (
                                            <p className="text-sm text-muted-foreground py-4 text-center">No products found</p>
                                        ) : (
                                            products.map((product) => {
                                                const pid = product.id || (product as any)._id;
                                                const isSelected = formData.productIds?.includes(pid);
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={pid}
                                                        checked={!!isSelected}
                                                        onCheckedChange={(c) => handleProductToggle(pid, !!c)}
                                                        onSelect={(e) => e.preventDefault()}
                                                    >
                                                        <span className="truncate">{product.name}</span>
                                                        <span className="text-muted-foreground text-xs ml-1">
                                                            ({product.type}{product.group ? ` | ${product.group}` : ""})
                                                        </span>
                                                    </DropdownMenuCheckboxItem>
                                                );
                                            })
                                        )}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {selectedProducts.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedProducts.slice(0, 8).map((p) => {
                                        const pid = p.id || (p as any)._id;
                                        return (
                                            <Badge key={pid} variant="secondary" className="gap-1 pr-1">
                                                <span className="max-w-[140px] truncate">
                                                    {p.name}
                                                    <span className="text-muted-foreground font-normal ml-0.5">
                                                        ({p.type}{p.group ? ` | ${p.group}` : ""})
                                                    </span>
                                                </span>
                                                <button type="button" onClick={() => handleProductToggle(pid, false)} className="rounded-full p-0.5 hover:bg-muted">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                    {selectedProducts.length > 8 && (
                                        <Badge variant="outline">+{selectedProducts.length - 8}</Badge>
                                    )}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">Empty = applies to all products</p>
                        </div>

                        {/* Product Billing Cycle */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Product Billing Cycle
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between h-10 font-normal">
                                        <span className="truncate">
                                            {formData.productBillingCycles?.length
                                                ? `${formData.productBillingCycles.length} cycle(s) selected`
                                                : "Select product billing cycles..."}
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="min-w-[240px]">
                                    {PRODUCT_BILLING_CYCLES.map(({ value, label }) => {
                                        const isSelected = formData.productBillingCycles?.includes(value);
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={value}
                                                checked={!!isSelected}
                                                onCheckedChange={(c) => handleProductBillingCycleToggle(value, !!c)}
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                {label}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {formData.productBillingCycles?.length ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {formData.productBillingCycles.map((c) => (
                                        <Badge key={c} variant="secondary" className="gap-1 pr-1">
                                            {PRODUCT_BILLING_CYCLES.find((x) => x.value === c)?.label ?? c}
                                            <button type="button" onClick={() => handleProductBillingCycleToggle(c, false)} className="rounded-full p-0.5 hover:bg-muted">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : null}
                            <p className="text-xs text-muted-foreground">Empty = applies to all billing cycles</p>
                        </div>

                        {/* Domain TLDs Multi-Select Dropdown */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Domain TLDs
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between h-10 font-normal"
                                    >
                                        <span className="truncate">
                                            {formData.domainTlds?.length
                                                ? `${formData.domainTlds.length} TLD(s) selected`
                                                : "Select domain TLDs..."}
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[320px] p-0"
                                    align="start"
                                >
                                    <div className="p-2 border-b">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search TLDs (.com, .net...)"
                                                value={tldSearch}
                                                onChange={(e) => setTldSearch(e.target.value)}
                                                className="pl-8 h-8"
                                                onPointerDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="flex gap-1 mt-2">
                                            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllTlds}>
                                                All
                                            </Button>
                                            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={clearAllTlds}>
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="max-h-[240px] overflow-y-auto p-1">
                                        {filteredTlds.length === 0 ? (
                                            <p className="text-sm text-muted-foreground py-4 text-center">No TLDs found</p>
                                        ) : (
                                            filteredTlds.map((tld) => {
                                                const tldNorm = tld.tld.startsWith(".") ? tld.tld : `.${tld.tld}`;
                                                const isSelected = formData.domainTlds?.some(
                                                    (t) => (t.startsWith(".") ? t : `.${t}`) === tldNorm
                                                );
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={tld._id}
                                                        checked={!!isSelected}
                                                        onCheckedChange={(c) => handleTldToggle(tld.tld, !!c)}
                                                        onSelect={(e) => e.preventDefault()}
                                                    >
                                                        <span className="font-mono">{tldNorm}</span>
                                                    </DropdownMenuCheckboxItem>
                                                );
                                            })
                                        )}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {selectedTldNames.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedTldNames.slice(0, 8).map((tld) => (
                                        <Badge key={tld} variant="secondary" className="gap-1 pr-1 font-mono">
                                            {tld}
                                            <button type="button" onClick={() => handleTldToggle(tld, false)} className="rounded-full p-0.5 hover:bg-muted">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {selectedTldNames.length > 8 && (
                                        <Badge variant="outline">+{selectedTldNames.length - 8}</Badge>
                                    )}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">Empty = applies to all domain TLDs</p>
                        </div>

                        {/* Domain Billing Cycle */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Domain Billing Cycle
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between h-10 font-normal">
                                        <span className="truncate">
                                            {formData.domainBillingCycles?.length
                                                ? `${formData.domainBillingCycles.length} cycle(s) selected`
                                                : "Select domain billing cycles..."}
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="min-w-[200px]">
                                    {DOMAIN_BILLING_CYCLES.map(({ value, label }) => {
                                        const isSelected = formData.domainBillingCycles?.includes(value);
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={value}
                                                checked={!!isSelected}
                                                onCheckedChange={(c) => handleDomainBillingCycleToggle(value, !!c)}
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                {label}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {formData.domainBillingCycles?.length ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {formData.domainBillingCycles.map((c) => (
                                        <Badge key={c} variant="secondary" className="gap-1 pr-1">
                                            {DOMAIN_BILLING_CYCLES.find((x) => x.value === c)?.label ?? c}
                                            <button type="button" onClick={() => handleDomainBillingCycleToggle(c, false)} className="rounded-full p-0.5 hover:bg-muted">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : null}
                            <p className="text-xs text-muted-foreground">Empty = applies to all domain periods</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Status */}
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Settings className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Status</CardTitle>
                                <CardDescription>Enable or disable this promotion</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(c) => handleCheckboxChange("isActive", !!c)}
                            />
                            <span className="text-sm">Active (available for use)</span>
                        </label>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4 pb-8">
                    <Button type="button" variant="outline" onClick={onCancel} size="lg" className="min-w-32">
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" className="min-w-32" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
