"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText } from "lucide-react";
import type { BillingSettings } from "@/store/api/settingsApi";

interface InvoiceSettingsCardProps {
    form: BillingSettings;
    onChange: (key: keyof BillingSettings, value: number | string | boolean) => void;
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
                    Renewal invoices are created before a service next due date and remain due on that same date.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="renewalLeadDays" className="text-sm whitespace-nowrap">Create before due</Label>
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
                        <Label htmlFor="invoiceDueDays" className="text-sm whitespace-nowrap">Other invoice due</Label>
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
                <div className="grid gap-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
                        <div className="space-y-1">
                            <Label htmlFor="renewalHostingItemTemplate" className="text-sm">Hosting renewal item</Label>
                            <Input
                                id="renewalHostingItemTemplate"
                                className="h-9 text-sm"
                                value={form.renewalHostingItemTemplate}
                                onChange={(e) => onChange("renewalHostingItemTemplate", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm">Date format</Label>
                            <Select
                                value={form.renewalItemDateFormat}
                                onValueChange={(value) => onChange("renewalItemDateFormat", value)}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="renewalDomainItemTemplate" className="text-sm">Domain renewal item</Label>
                        <Input
                            id="renewalDomainItemTemplate"
                            className="h-9 text-sm"
                            value={form.renewalDomainItemTemplate}
                            onChange={(e) => onChange("renewalDomainItemTemplate", e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <Label htmlFor="renewalShowDomainAddons" className="text-sm">Show domain addons as separate lines</Label>
                        <Switch
                            id="renewalShowDomainAddons"
                            checked={form.renewalShowDomainAddons}
                            onCheckedChange={(checked) => onChange("renewalShowDomainAddons", checked)}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Tokens: {"{packageName}"}, {"{domainName}"}, {"{yearsLabel}"}, {"{periodStart}"}, {"{periodEnd}"}, {"{periodLabel}"}, {"{serviceNumber}"}.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
