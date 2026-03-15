"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import type { BillingSettings } from "@/store/api/settingsApi";
import { DaysArrayInput } from "./DaysArrayInput";

interface DomainReminderCardProps {
    form: BillingSettings;
    onChange: (key: keyof BillingSettings, value: number | string | number[] | boolean) => void;
}

export function DomainReminderCard({ form, onChange }: DomainReminderCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2 space-y-0.5">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Domain Expiry Reminders</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    Days before domain expiry to send renewal reminder emails.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <DaysArrayInput
                    label="Days before expiry"
                    value={form.domainExpiryReminderDays ?? [90, 60, 30, 14, 7]}
                    onChange={(arr) => onChange("domainExpiryReminderDays", arr)}
                    hint="e.g. 90, 60, 30, 14, 7"
                />
            </CardContent>
        </Card>
    );
}
