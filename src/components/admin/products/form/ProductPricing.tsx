/**
 * ProductPricing Component
 * 
 * Handles pricing configuration for different billing cycles and currencies.
 * Supports free, one-time, and recurring payment types.
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import type { PaymentType, CurrencyPricing, PricingDetail } from "@/types/admin";

interface ProductPricingProps {
    formData: {
        paymentType: PaymentType;
        pricing: CurrencyPricing[];
    };
    setFormData: (updater: (prev: any) => any) => void;
    handlePricingChange: (
        currencyIndex: number,
        cycle: keyof CurrencyPricing,
        field: keyof PricingDetail,
        value: any
    ) => void;
}

export function ProductPricing({ formData, setFormData, handlePricingChange }: ProductPricingProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Pricing Configuration</CardTitle>
                        <CardDescription>Set pricing for different billing cycles</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Payment Type */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Type</Label>
                    <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="paymentType"
                                value="free"
                                checked={formData.paymentType === "free"}
                                onChange={() => setFormData(prev => ({ ...prev, paymentType: "free" as PaymentType }))}
                                className="accent-primary h-4 w-4"
                            />
                            <span className="text-sm">Free</span>
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
                            <span className="text-sm">One Time</span>
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
                            <span className="text-sm">Recurring</span>
                        </label>
                    </div>
                </div>

                {/* Pricing Table */}
                {formData.paymentType !== "free" && (
                    <div className="border rounded-lg overflow-x-auto">
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
            </CardContent>
        </Card>
    );
}
