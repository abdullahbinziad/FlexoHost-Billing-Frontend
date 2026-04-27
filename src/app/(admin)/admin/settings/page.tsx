"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    useGetSettingsQuery,
    useUpdateBillingSettingsMutation,
    type BillingSettings,
    type BillingSettingsPatch,
    DEFAULT_BILLING_SETTINGS,
} from "@/store/api/settingsApi";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
    DefaultStaffRoleCard,
    InvoiceSettingsCard,
    ServiceEnforcementCard,
    ReminderEmailCard,
    DomainReminderCard,
    LateFeeCard,
    CurrencyRateCard,
    SettingsPageFrame,
} from "@/components/admin/settings";

export default function AdminSettingsPage() {
    const { data, isLoading, error } = useGetSettingsQuery();
    const [updateBilling, { isLoading: isSaving }] = useUpdateBillingSettingsMutation();
    const [form, setForm] = useState<BillingSettings>(DEFAULT_BILLING_SETTINGS);

    useEffect(() => {
        if (data?.billing) {
            setForm({ ...DEFAULT_BILLING_SETTINGS, ...data.billing });
        }
    }, [data]);

    const handleChange = (key: keyof BillingSettings, value: number | string | number[] | boolean | null) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            const patch: BillingSettingsPatch = { ...form };
            await updateBilling(patch).unwrap();
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
        <SettingsPageFrame
            title="Billing & Reminders"
            description="Automation rules for invoices, renewals, suspension, termination, and reminder emails."
            actions={
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save all
                </Button>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <DefaultStaffRoleCard form={form} onChange={handleChange} />
                <CurrencyRateCard form={form} onChange={handleChange} />
                <InvoiceSettingsCard form={form} onChange={handleChange} />
                <ServiceEnforcementCard form={form} onChange={handleChange} />
                <ReminderEmailCard form={form} onChange={handleChange} />
                <DomainReminderCard form={form} onChange={handleChange} />
                <LateFeeCard form={form} onChange={handleChange} />
            </div>
        </SettingsPageFrame>
    );
}
