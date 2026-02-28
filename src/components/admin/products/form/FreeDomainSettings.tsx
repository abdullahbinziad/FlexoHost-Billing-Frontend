/**
 * FreeDomainSettings Component
 * 
 * Handles free domain configuration including domain type, payment terms, and TLDs.
 * Allows products to offer free domain registration or transfer.
 */

"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe } from "lucide-react";

interface FreeDomainSettingsProps {
    formData: {
        freeDomainType: "none" | "once" | "recurring";
        freeDomainPaymentTerms: string[];
        freeDomainTlds: string[];
    };
    setFormData: (updater: (prev: any) => any) => void;
}

export function FreeDomainSettings({ formData, setFormData }: FreeDomainSettingsProps) {
    const paymentTerms = ["One Time", "Monthly", "Quarterly", "Semi-Annually", "Annually", "Biennially", "Triennially"];
    const tlds = [".com", ".net", ".org", ".info", ".biz", ".xyz", ".shop", ".online"];

    const handlePaymentTermChange = (term: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            freeDomainPaymentTerms: checked
                ? [...prev.freeDomainPaymentTerms, term]
                : prev.freeDomainPaymentTerms.filter((t: string) => t !== term)
        }));
    };

    const handleTldChange = (tld: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            freeDomainTlds: checked
                ? [...prev.freeDomainTlds, tld]
                : prev.freeDomainTlds.filter((t: string) => t !== tld)
        }));
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Globe className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Free Domain Settings</CardTitle>
                        <CardDescription>Configure free domain offerings with this product</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Free Domain Type */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Free Domain Type</Label>
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="freeDomainType"
                                value="none"
                                checked={formData.freeDomainType === "none"}
                                onChange={() => setFormData(p => ({ ...p, freeDomainType: "none" }))}
                                className="accent-primary h-4 w-4"
                            />
                            <span className="text-sm">None</span>
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
                            <span className="text-sm">Offer a free domain registration/transfer only (renew as normal)</span>
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
                            <span className="text-sm">Offer a free domain registration/transfer and free renewal (if product is renewed)</span>
                        </label>
                    </div>
                </div>

                {formData.freeDomainType !== "none" && (
                    <>
                        {/* Payment Terms */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">
                                Free Domain Payment Terms
                                <span className="text-xs text-muted-foreground ml-2">
                                    (Select the payment term(s) required to receive a free domain)
                                </span>
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
                                {paymentTerms.map((term) => (
                                    <label key={term} className="flex items-center space-x-2 cursor-pointer">
                                        <Checkbox
                                            checked={formData.freeDomainPaymentTerms.includes(term)}
                                            onCheckedChange={(checked) => handlePaymentTermChange(term, !!checked)}
                                        />
                                        <span className="text-sm">{term}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* TLDs */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">
                                Free Domain TLDs
                                <span className="text-xs text-muted-foreground ml-2">
                                    (Select which domain extensions are eligible)
                                </span>
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
                                {tlds.map((tld) => (
                                    <label key={tld} className="flex items-center space-x-2 cursor-pointer">
                                        <Checkbox
                                            checked={formData.freeDomainTlds.includes(tld)}
                                            onCheckedChange={(checked) => handleTldChange(tld, !!checked)}
                                        />
                                        <span className="text-sm font-mono">{tld}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
