"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGetSettingsQuery, useUpdateBillingSettingsMutation, type BillingSettings } from "@/store/api/settingsApi";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
    DefaultStaffRoleCard,
    InvoiceSettingsCard,
    ServiceEnforcementCard,
    ReminderEmailCard,
    DomainReminderCard,
    LateFeeCard,
} from "@/components/admin/settings";

const DEFAULT_BILLING: BillingSettings = {
    renewalLeadDays: 7,
    daysBeforeSuspend: 5,
    daysBeforeTermination: 30,
    invoiceDueDays: 7,
    overdueExtraChargeDays: 0,
    overdueExtraChargeAmount: 0,
    overdueExtraChargeType: "fixed",
    reminderPreDays: 7,
    reminderOverdue1Days: 3,
    reminderOverdue2Days: 7,
    reminderOverdue3Days: 14,
    preReminderDays: [30, 14, 7, 3, 1],
    overdueReminderDays: [1, 3, 7, 14, 30],
    suspendWarningDays: [3, 1],
    terminationWarningDays: [7, 3, 1],
    domainExpiryReminderDays: [90, 60, 30, 14, 7],
    reminderDueTodayEnabled: true,
};

export default function AdminSettingsPage() {
    const { data, isLoading, error } = useGetSettingsQuery();
    const [updateBilling, { isLoading: isSaving }] = useUpdateBillingSettingsMutation();
    const [form, setForm] = useState<BillingSettings>(DEFAULT_BILLING);

    useEffect(() => {
        if (data?.billing) {
            setForm({ ...DEFAULT_BILLING, ...data.billing });
        }
    }, [data]);

    const handleChange = (key: keyof BillingSettings, value: number | string | number[] | boolean | null) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            await updateBilling(form).unwrap();
            toast.success("Billing settings saved successfully");
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "data" in err
                ? (err as { data?: { message?: string } }).data?.message
                : "Failed to save settings";
            toast.error(msg ?? "Failed to save settings");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-destructive">
                Failed to load settings. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Billing automation, suspension, termination, and reminders.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save all
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <DefaultStaffRoleCard form={form} onChange={handleChange} />
                <InvoiceSettingsCard form={form} onChange={handleChange} />
                <ServiceEnforcementCard form={form} onChange={handleChange} />
                <ReminderEmailCard form={form} onChange={handleChange} />
                <DomainReminderCard form={form} onChange={handleChange} />
                <LateFeeCard form={form} onChange={handleChange} />
            </div>
        </div>
    );
}
