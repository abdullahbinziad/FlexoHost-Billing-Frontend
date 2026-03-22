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
import { SmtpSettingsCard } from "@/components/admin/settings";

export default function AdminSmtpSettingsPage() {
    const { data, isLoading, error } = useGetSettingsQuery();
    const [updateBilling, { isLoading: isSaving }] = useUpdateBillingSettingsMutation();
    const [form, setForm] = useState<BillingSettings>(DEFAULT_BILLING_SETTINGS);
    const [smtpPasswordDraft, setSmtpPasswordDraft] = useState("");
    const [smtpPasswordClearPending, setSmtpPasswordClearPending] = useState(false);

    useEffect(() => {
        if (data?.billing) {
            setForm({ ...DEFAULT_BILLING_SETTINGS, ...data.billing });
        }
    }, [data]);

    const handleChange = (key: keyof BillingSettings, value: number | string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            const patch: BillingSettingsPatch = {
                smtpUseCustom: form.smtpUseCustom,
                smtpHost: form.smtpHost,
                smtpPort: form.smtpPort,
                smtpUser: form.smtpUser,
                smtpSecure: form.smtpSecure,
                smtpRequireTls: form.smtpRequireTls,
                smtpTlsRejectUnauthorized: form.smtpTlsRejectUnauthorized,
                emailFrom: form.emailFrom,
            };
            if (smtpPasswordClearPending) {
                patch.smtpPassword = null;
            } else if (smtpPasswordDraft.trim()) {
                patch.smtpPassword = smtpPasswordDraft.trim();
            }
            await updateBilling(patch).unwrap();
            setSmtpPasswordDraft("");
            setSmtpPasswordClearPending(false);
            toast.success("SMTP settings saved");
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "data" in err
                    ? (err as { data?: { message?: string } }).data?.message
                    : "Failed to save SMTP settings";
            toast.error(msg ?? "Failed to save SMTP settings");
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
            <div className="p-6 text-destructive">Failed to load settings. Please try again later.</div>
        );
    }

    return (
        <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">SMTP configuration</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Outbound mail server credentials and a one-off test message.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                </Button>
            </div>

            <SmtpSettingsCard
                form={form}
                onChange={handleChange}
                smtpPasswordDraft={smtpPasswordDraft}
                onSmtpPasswordDraft={setSmtpPasswordDraft}
                smtpPasswordClearPending={smtpPasswordClearPending}
                onSmtpPasswordClearPending={setSmtpPasswordClearPending}
            />
        </div>
    );
}
