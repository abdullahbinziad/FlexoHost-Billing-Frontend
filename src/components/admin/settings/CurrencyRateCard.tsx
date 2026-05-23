"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import type { BillingSettings } from "@/store/api/settingsApi";

interface CurrencyRateCardProps {
    form: BillingSettings;
    onChange: (key: keyof BillingSettings, value: number | string) => void;
}

export function CurrencyRateCard({ form, onChange }: CurrencyRateCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2 space-y-0.5">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Currency Conversion</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    Global FX rate used across transactions, invoices, and dashboard conversions.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Label htmlFor="exchangeRateBdt" className="text-sm whitespace-nowrap">
                        1 BDT =
                    </Label>
                    <Input
                        id="exchangeRateBdt"
                        type="number"
                        min={0.000001}
                        step="0.000001"
                        className="h-9 w-32 text-center px-2"
                        value={form.exchangeRateBdt}
                        onChange={(e) => onChange("exchangeRateBdt", parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-sm text-muted-foreground">USD</span>
                </div>
            </CardContent>
        </Card>
    );
}
