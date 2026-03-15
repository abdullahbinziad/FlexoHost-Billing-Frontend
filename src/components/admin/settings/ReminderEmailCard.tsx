"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail } from "lucide-react";
import type { BillingSettings } from "@/store/api/settingsApi";
import { DaysArrayInput } from "./DaysArrayInput";

interface ReminderEmailCardProps {
    form: BillingSettings;
    onChange: (key: keyof BillingSettings, value: number | string | number[] | boolean) => void;
}

export function ReminderEmailCard({ form, onChange }: ReminderEmailCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2 space-y-0.5">
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Invoice Reminder Emails</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    Flexible reminder schedule. Add or remove days for each stage. Comma-separated.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <DaysArrayInput
                        label="Pre-reminder (days before due)"
                        value={form.preReminderDays ?? [30, 14, 7, 3, 1]}
                        onChange={(arr) => onChange("preReminderDays", arr)}
                        hint="e.g. 30, 14, 7, 3, 1"
                    />
                    <DaysArrayInput
                        label="Overdue reminders (days overdue)"
                        value={form.overdueReminderDays ?? [1, 3, 7, 14, 30]}
                        onChange={(arr) => onChange("overdueReminderDays", arr)}
                        hint="e.g. 1, 3, 7, 14, 30"
                    />
                    <DaysArrayInput
                        label="Suspend warning (days before suspend)"
                        value={form.suspendWarningDays ?? [3, 1]}
                        onChange={(arr) => onChange("suspendWarningDays", arr)}
                        hint="Warnings at X days before suspension"
                    />
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <Label htmlFor="due-today" className="text-sm">Send &quot;Due today&quot; reminder</Label>
                    <Switch
                        id="due-today"
                        checked={form.reminderDueTodayEnabled ?? true}
                        onCheckedChange={(v) => onChange("reminderDueTodayEnabled", v)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
