"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Product, ProductType, PaymentType, CurrencyPricing, PricingDetail } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductFormProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmit: (product: Omit<Product, "id" | "createdAt" | "isHidden">) => void;
    initialData?: Product;
    variant?: "modal" | "page";
}

export function ProductForm({ open, onOpenChange, onSubmit, initialData, variant = "modal" }: ProductFormProps) {
    const defaultPricingCycle = { price: 0, setupFee: 0, renewPrice: 0, enable: false };

    // Helper to create default structure
    const createDefaultPricing = (currency: string) => ({
        currency,
        monthly: { ...defaultPricingCycle, enable: true },
        quarterly: { ...defaultPricingCycle },
        semiAnnually: { ...defaultPricingCycle },
        annually: { ...defaultPricingCycle },
        biennially: { ...defaultPricingCycle },
        triennially: { ...defaultPricingCycle },
    });

    const [formData, setFormData] = useState({
        name: "",
        type: "hosting" as ProductType,
        group: "",
        description: "",
        paymentType: "recurring" as PaymentType,
        pricing: [
            createDefaultPricing("BDT"),
            createDefaultPricing("USD")
        ] as CurrencyPricing[],
        featuresText: "",
        features: [] as string[],
        newFeature: "",
        stock: "",
        // Module
        moduleName: "cpanel",
        serverGroup: "default",
        whmPackageName: "",
        // Free Domain
        freeDomainType: "none" as "none" | "once" | "recurring",
        freeDomainPaymentTerms: [] as string[],
        freeDomainTlds: [] as string[],
    });

    // Load initial data
    useState(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                type: initialData.type,
                group: initialData.group || "",
                description: initialData.description,
                paymentType: initialData.paymentType || "recurring",
                pricing: initialData.pricing && initialData.pricing.length > 0
                    ? initialData.pricing
                    : [createDefaultPricing("BDT"), createDefaultPricing("USD")],
                featuresText: initialData.features.join("\n"),
                features: initialData.features,
                newFeature: "",
                stock: initialData.stock ? initialData.stock.toString() : "",
                moduleName: initialData.module?.name || "cpanel",
                serverGroup: initialData.module?.serverGroup || "default",
                whmPackageName: initialData.module?.packageName || "",
                freeDomainType: initialData.freeDomain?.type || "none",
                freeDomainPaymentTerms: initialData.freeDomain?.paymentTerms || [],
                freeDomainTlds: initialData.freeDomain?.tlds || [],
            });
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, freeDomainEnabled: checked }));
    };

    const handlePricingChange = (
        currencyIndex: number,
        cycle: keyof CurrencyPricing,
        field: keyof PricingDetail,
        value: any
    ) => {
        setFormData(prev => {
            const newPricing = [...prev.pricing];
            // deep clone for safety
            const currentCurrency = { ...newPricing[currencyIndex] };

            if (cycle === "currency") return prev; // Should not happen based on calling code

            const currentCycle = { ...(currentCurrency[cycle] as PricingDetail) };

            // @ts-ignore
            currentCycle[field] = value;
            // @ts-ignore
            currentCurrency[cycle] = currentCycle;
            newPricing[currencyIndex] = currentCurrency;

            return { ...prev, pricing: newPricing };
        });
    };

    const handleAddFeature = () => {
        if (formData.newFeature.trim()) {
            const rawFeatures = formData.newFeature.split("|").map(f => f.trim()).filter(Boolean);
            setFormData((prev) => ({
                ...prev,
                features: [...prev.features, ...rawFeatures],
                newFeature: "",
            }));
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: formData.name,
            type: formData.type,
            group: formData.group,
            description: formData.description,
            paymentType: formData.paymentType,
            pricing: formData.pricing,
            features: formData.featuresText.split("\n").map(f => f.trim()).filter(Boolean),
            stock: formData.stock ? Number(formData.stock) : undefined,
            module: {
                name: formData.moduleName,
                serverGroup: formData.serverGroup,
                packageName: formData.whmPackageName
            },
            freeDomain: {
                enabled: formData.freeDomainType !== "none",
                type: formData.freeDomainType,
                paymentTerms: formData.freeDomainPaymentTerms,
                tlds: formData.freeDomainTlds
            }
        });
        if (onOpenChange) {
            onOpenChange(false);
        }
    };

    const FormContent = (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="module">Module</TabsTrigger>
                    <TabsTrigger value="free-domain">Free Domain</TabsTrigger>
                </TabsList>

                {/* --- Package Details Tab --- */}
                <TabsContent value="details" className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Business Plan"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="group">Category / Group *</Label>
                        {formData.type === "hosting" ? (
                            <Select
                                id="group"
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a Category</option>
                                <option value="Web Hosting">Web Hosting</option>
                                <option value="Turbo Hosting">Turbo Hosting</option>
                                <option value="BDIX Hosting">BDIX Hosting</option>
                                <option value="Ecommerce Hosting">Ecommerce Hosting</option>
                            </Select>
                        ) : formData.type === "vps" ? (
                            <Select
                                id="group"
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a Category</option>
                                <option value="VPS">VPS</option>
                                <option value="Dedicated">Dedicated</option>
                                <option value="BDIX VPS">BDIX VPS</option>
                            </Select>
                        ) : (
                            <Input
                                id="group"
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                placeholder="e.g. Shared Hosting, Premium VPS"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of the package"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="featuresText">Features List</Label>
                        <textarea
                            id="featuresText"
                            name="featuresText"
                            value={formData.featuresText}
                            onChange={handleChange}
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={"SSD Separated\nUnlimited Bandwidth\nFree SSL"}
                        />
                        <p className="text-xs text-muted-foreground">Enter one feature per line.</p>
                    </div>




                </TabsContent>

                {/* --- Pricing Tab --- */}
                <TabsContent value="pricing" className="space-y-6 py-4">
                    {/* Payment Type */}
                    <div className="flex items-center gap-4">
                        <Label>Payment Type</Label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="free"
                                    checked={formData.paymentType === "free"}
                                    onChange={() => setFormData(prev => ({ ...prev, paymentType: "free" as PaymentType }))}
                                    className="accent-primary h-4 w-4"
                                />
                                <span>Free</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="one-time"
                                    checked={formData.paymentType === "one-time"}
                                    onChange={() => setFormData(prev => ({ ...prev, paymentType: "one-time" as PaymentType }))}
                                    className="accent-primary h-4 w-4"
                                />
                                <span>One Time</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="recurring"
                                    checked={formData.paymentType === "recurring"}
                                    onChange={() => setFormData(prev => ({ ...prev, paymentType: "recurring" as PaymentType }))}
                                    className="accent-primary h-4 w-4"
                                />
                                <span>Recurring</span>
                            </label>
                        </div>
                    </div>

                    {/* Pricing Table */}
                    {formData.paymentType !== "free" && (
                        <div className="border rounded-md overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-2 border-b min-w-[80px]">Currency</th>
                                        <th className="p-2 border-b w-32"></th>
                                        <th className="p-2 border-b min-w-[140px]">One Time/Monthly</th>
                                        <th className="p-2 border-b min-w-[140px]">Quarterly</th>
                                        <th className="p-2 border-b min-w-[140px]">Semi-Annually</th>
                                        <th className="p-2 border-b min-w-[140px]">Annually</th>
                                        <th className="p-2 border-b min-w-[140px]">Biennially</th>
                                        <th className="p-2 border-b min-w-[140px]">Triennially</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.pricing.map((currencyData, currencyIndex) => (
                                        <tr key={currencyData.currency} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="p-4 font-bold bg-muted/20 align-middle border-r">
                                                {currencyData.currency}
                                            </td>
                                            <td className="p-2 space-y-4 text-right pr-4 font-medium text-muted-foreground border-r">
                                                <div className="h-9 flex items-center justify-end">Setup Fee</div>
                                                <div className="h-9 flex items-center justify-end">Price</div>
                                                <div className="h-9 flex items-center justify-end">Renew Price</div>
                                                <div className="h-5 flex items-center justify-end">Enable</div>
                                            </td>

                                            {/* Cycles */}
                                            {["monthly", "quarterly", "semiAnnually", "annually", "biennially", "triennially"].map((cycleKey) => {
                                                const cycle = currencyData[cycleKey as keyof CurrencyPricing] as PricingDetail | undefined;
                                                const isEnabled = cycle?.enable ?? false;

                                                if (!cycle) return <td key={cycleKey}></td>;

                                                return (
                                                    <td key={cycleKey} className="p-2 space-y-4 border-r last:border-0 min-w-[140px]">
                                                        <Input
                                                            type="number"
                                                            className="text-center h-9"
                                                            placeholder="0.00"
                                                            value={cycle.setupFee}
                                                            onChange={(e) => handlePricingChange(currencyIndex, cycleKey as keyof CurrencyPricing, "setupFee", Number(e.target.value))}
                                                            disabled={!isEnabled}
                                                        />
                                                        <Input
                                                            type="number"
                                                            className="text-center h-9"
                                                            placeholder="0.00"
                                                            value={cycle.price}
                                                            onChange={(e) => handlePricingChange(currencyIndex, cycleKey as keyof CurrencyPricing, "price", Number(e.target.value))}
                                                            disabled={!isEnabled}
                                                        />
                                                        <Input
                                                            type="number"
                                                            className="text-center h-9"
                                                            placeholder="0.00"
                                                            value={cycle.renewPrice}
                                                            onChange={(e) => handlePricingChange(currencyIndex, cycleKey as keyof CurrencyPricing, "renewPrice", Number(e.target.value))}
                                                            disabled={!isEnabled}
                                                        />
                                                        <div className="flex justify-center h-5 items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isEnabled}
                                                                onChange={(e) => handlePricingChange(currencyIndex, cycleKey as keyof CurrencyPricing, "enable", e.target.checked)}
                                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                            />
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </TabsContent>

                {/* --- Module Tab --- */}
                <TabsContent value="module" className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                <Label htmlFor="moduleName" className="md:text-right">Module Name</Label>
                                <div className="md:col-span-3">
                                    <Select
                                        id="moduleName"
                                        name="moduleName"
                                        value={formData.moduleName}
                                        onChange={handleChange}
                                    >
                                        <option value="cpanel">cPanel</option>
                                        <option value="directadmin">DirectAdmin</option>
                                        <option value="plesk">Plesk</option>
                                        <option value="virtualizor">Virtualizor</option>
                                        <option value="none">None / Manual</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                <Label htmlFor="serverGroup" className="md:text-right">Server Group</Label>
                                <div className="md:col-span-3">
                                    <Select
                                        id="serverGroup"
                                        name="serverGroup"
                                        value={formData.serverGroup}
                                        onChange={handleChange}
                                    >
                                        <option value="default">Default</option>
                                        <option value="BDIX-01">BDIX-01</option>
                                        <option value="USA-01">USA-01</option>
                                        <option value="SG-01">SG-01</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-t pt-4">
                                <Label htmlFor="whmPackageName" className="md:text-right">WHM Package Name</Label>
                                <div className="md:col-span-3 flex items-center gap-2">
                                    <Input
                                        id="whmPackageName"
                                        name="whmPackageName"
                                        value={formData.whmPackageName}
                                        onChange={handleChange}
                                        placeholder="e.g. 2 GB BDIX"
                                    />
                                    {/* Icons placeholder as requested in layout, functional or just visual */}
                                    <div className="flex gap-1 text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- Free Domain Tab --- */}
                <TabsContent value="free-domain" className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Label className="md:text-right pt-2">Free Domain</Label>
                        <div className="md:col-span-3 space-y-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="freeDomainType"
                                    value="none"
                                    checked={formData.freeDomainType === "none"}
                                    onChange={() => setFormData(p => ({ ...p, freeDomainType: "none" }))}
                                    className="accent-primary h-4 w-4"
                                />
                                <span>None</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="freeDomainType"
                                    value="once"
                                    checked={formData.freeDomainType === "once"}
                                    onChange={() => setFormData(p => ({ ...p, freeDomainType: "once" }))}
                                    className="accent-primary h-4 w-4"
                                />
                                <span>Offer a free domain registration/transfer only (renew as normal)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="freeDomainType"
                                    value="recurring"
                                    checked={formData.freeDomainType === "recurring"}
                                    onChange={() => setFormData(p => ({ ...p, freeDomainType: "recurring" }))}
                                    className="accent-primary h-4 w-4"
                                />
                                <span>Offer a free domain registration/transfer and free renewal (if product is renewed)</span>
                            </label>
                        </div>
                    </div>

                    {formData.freeDomainType !== "none" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Label className="md:text-right pt-2">Free Domain Payment Terms</Label>
                                <div className="md:col-span-3">
                                    <select
                                        multiple
                                        className="w-full md:w-2/3 h-40 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formData.freeDomainPaymentTerms}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFormData(p => ({ ...p, freeDomainPaymentTerms: selected }));
                                        }}
                                    >
                                        <option value="One Time">One Time</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Semi-Annually">Semi-Annually</option>
                                        <option value="Annually">Annually</option>
                                        <option value="Biennially">Biennially</option>
                                        <option value="Triennially">Triennially</option>
                                    </select>
                                    <p className="text-sm text-muted-foreground mt-1">Select the payment term(s) the product must be paid with to receive a free domain</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Label className="md:text-right pt-2">Free Domain TLD's</Label>
                                <div className="md:col-span-3">
                                    <select
                                        multiple
                                        className="w-full md:w-2/3 h-40 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formData.freeDomainTlds}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFormData(p => ({ ...p, freeDomainTlds: selected }));
                                        }}
                                    >
                                        <option value=".com">.com</option>
                                        <option value=".net">.net</option>
                                        <option value=".org">.org</option>
                                        <option value=".info">.info</option>
                                        <option value=".biz">.biz</option>
                                        <option value=".xyz">.xyz</option>
                                        <option value=".shop">.shop</option>
                                        <option value=".online">.online</option>
                                    </select>
                                    <p className="text-sm text-muted-foreground mt-1">Use Ctrl + Click to select multiple payment terms and TLD's</p>
                                </div>
                            </div>
                        </>
                    )}
                </TabsContent>

            </Tabs>

            <div className={variant === "page" ? "flex justify-end gap-3 pt-4 border-t" : "pt-4"}>
                {variant === "modal" && (
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {initialData ? "Update Product" : "Create Product"}
                        </Button>
                    </DialogFooter>
                )}
                {variant === "page" && (
                    <>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {initialData ? "Update Product" : "Create Product"}
                        </Button>
                    </>
                )}
            </div>
        </form>
    );

    if (variant === "page") {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {/* Optional: Add a header specifically for the page view if desired, but page title usually handled by parent */}
                {FormContent}
            </div>
        );
    }

    return (
        <Dialog open={open ?? false} onOpenChange={onOpenChange ?? (() => { })}>
            <DialogContent className="sm:max-w-[1200px] bg-white dark:bg-gray-900 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Product" : "Add New Product"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Update product details." : "Create a new hosting or VPS package."}
                    </DialogDescription>
                </DialogHeader>
                {FormContent}
            </DialogContent>
        </Dialog>
    );
}
