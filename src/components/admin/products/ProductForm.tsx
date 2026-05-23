/**
 * ProductForm Component
 * 
 * Main form component for creating and editing products (hosting, VPS, etc.).
 * Supports both modal and page variants with modular sub-components.
 * 
 * Features:
 * - Product details (name, category, description, features)
 * - Multi-currency pricing with different billing cycles
 * - Module configuration for automation
 * - Free domain settings
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Product, ProductType, PaymentType, CurrencyPricing, PricingDetail } from "@/types/admin";
import { ProductDetails } from "./form/ProductDetails";
import { ProductPricing } from "./form/ProductPricing";
import { ModuleConfiguration } from "./form/ModuleConfiguration";
import { FreeDomainSettings } from "./form/FreeDomainSettings";
import { Save } from "lucide-react";

interface ProductFormProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmit: (product: Omit<Product, "id" | "createdAt" | "isHidden">) => void;
    initialData?: Product;
    variant?: "modal" | "page";
}

export function ProductForm({ open, onOpenChange, onSubmit, initialData, variant = "modal" }: ProductFormProps) {
    const defaultPricingCycle = { price: 0, setupFee: 0, renewPrice: 0, enable: false };

    // Helper to create default pricing structure
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
        name: initialData?.name || "",
        type: (initialData?.type || "hosting") as ProductType,
        group: initialData?.group || "",
        description: initialData?.description || "",
        paymentType: (initialData?.paymentType || "recurring") as PaymentType,
        pricing: (initialData?.pricing && initialData.pricing.length > 0
            ? initialData.pricing
            : [createDefaultPricing("BDT"), createDefaultPricing("USD")]) as CurrencyPricing[],
        featuresText: initialData?.features.join("\n") || "",
        features: initialData?.features || [] as string[],
        stock: initialData?.stock ? initialData.stock.toString() : "",
        // Module
        moduleName: initialData?.module?.name || "cpanel",
        serverGroup: initialData?.module?.serverGroup || "Web Hosting",
        whmPackageName: initialData?.module?.packageName || "",
        // Free Domain
        freeDomainType: (initialData?.freeDomain?.type || "none") as "none" | "once" | "recurring",
        freeDomainPaymentTerms: initialData?.freeDomain?.paymentTerms || [] as string[],
        freeDomainTlds: initialData?.freeDomain?.tlds || [] as string[],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePricingChange = (
        currencyIndex: number,
        cycle: keyof CurrencyPricing,
        field: keyof PricingDetail,
        value: any
    ) => {
        setFormData(prev => {
            const newPricing = [...prev.pricing];
            const currentCurrency = { ...newPricing[currencyIndex] };

            if (cycle === "currency") return prev;

            const currentCycle = { ...(currentCurrency[cycle] as PricingDetail) };
            // @ts-ignore
            currentCycle[field] = value;
            // @ts-ignore
            currentCurrency[cycle] = currentCycle;
            newPricing[currencyIndex] = currentCurrency;

            return { ...prev, pricing: newPricing };
        });
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

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-[1600px] space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <ProductDetails
                        formData={formData}
                        handleChange={handleChange}
                        setFormData={setFormData}
                    />

                    <ProductPricing
                        formData={formData}
                        setFormData={setFormData}
                        handlePricingChange={handlePricingChange}
                    />
                </div>

                {/* Right Column - Additional Settings */}
                <div className="space-y-6">
                    <div className="flex flex-col gap-6 lg:sticky lg:top-6">
                        <ModuleConfiguration
                            formData={formData}
                            setFormData={setFormData}
                            handleChange={handleChange}
                        />

                        <FreeDomainSettings
                            formData={formData}
                            setFormData={setFormData}
                        />

                        {/* Action Buttons */}
                        <div className="bg-card border rounded-lg p-4 shadow-sm">
                            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Actions</h3>
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => variant === "page" ? window.history.back() : onOpenChange?.(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    {initialData ? "Update Product" : "Create Product"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
