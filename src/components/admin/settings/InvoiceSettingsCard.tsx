"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import type { BillingSettings } from "@/store/api/settingsApi";

interface InvoiceSettingsCardProps {
    form: BillingSettings;
    onChange: (key: keyof BillingSettings, value: number | string) => void;
}

const inputCompact = "h-9 w-20 text-center px-2";

export function InvoiceSettingsCard({ form, onChange }: InvoiceSettingsCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2 space-y-0.5">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Invoices & Renewals</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    When invoices are created and when they become due.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="renewalLeadDays" className="text-sm whitespace-nowrap">Renewal lead days</Label>
                        <Input
                            id="renewalLeadDays"
                            type="number"
                            min={1}
                            max={90}
                            className={inputCompact}
                            value={form.renewalLeadDays}
                            onChange={(e) => onChange("renewalLeadDays", parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="invoiceDueDays" className="text-sm whitespace-nowrap">Invoice due days</Label>
                        <Input
                            id="invoiceDueDays"
                            type="number"
                            min={1}
                            max={90}
                            className={inputCompact}
                            value={form.invoiceDueDays}
                            onChange={(e) => onChange("invoiceDueDays", parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
