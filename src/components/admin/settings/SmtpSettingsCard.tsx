"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Loader2, Send } from "lucide-react";
import type { BillingSettings } from "@/store/api/settingsApi";
import { useTestSmtpMutation } from "@/store/api/emailApi";
import { toast } from "sonner";

interface SmtpSettingsCardProps {
    form: BillingSettings;
    onChange: (key: keyof BillingSettings, value: number | string | boolean) => void;
    smtpPasswordDraft: string;
    onSmtpPasswordDraft: (value: string) => void;
    smtpPasswordClearPending: boolean;
    onSmtpPasswordClearPending: (pending: boolean) => void;
}

export function SmtpSettingsCard({
    form,
    onChange,
    smtpPasswordDraft,
    onSmtpPasswordDraft,
    smtpPasswordClearPending,
    onSmtpPasswordClearPending,
}: SmtpSettingsCardProps) {
    const [testTo, setTestTo] = useState("");
    const [testSmtp, { isLoading: isTesting }] = useTestSmtpMutation();

    const sendTest = async () => {
        const to = testTo.trim();
        if (!to) {
            toast.error("Enter an email address to receive the test.");
            return;
        }
        try {
            const data = await testSmtp({ to }).unwrap();
            toast.success(`Test sent via ${data.smtpHost}:${data.smtpPort} (${data.smtpSource}).`);
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "data" in err
                    ? (err as { data?: { message?: string } }).data?.message
                    : "Test send failed";
            toast.error(msg ?? "Test send failed");
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2 space-y-0.5">
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">SMTP and test email</CardTitle>
                </div>
                <CardDescription className="text-xs space-y-1.5">
                    <span className="block">
                        When custom SMTP is off, the API uses <code className="text-[11px]">SMTP_*</code> and{" "}
                        <code className="text-[11px]">EMAIL_FROM</code> from the server environment.
                    </span>
                    <span className="block">
                        When custom SMTP is on, host and username are stored in the database; the password is encrypted at
                        rest if <code className="text-[11px]">SETTINGS_ENCRYPTION_KEY</code> is set on the API. If you
                        leave the password field blank but <code className="text-[11px]">SMTP_PASSWORD</code> is set in
                        environment, that env password is used for sending.
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
                    <div className="space-y-0.5">
                        <Label htmlFor="smtpUseCustom" className="text-sm font-medium">
                            Use custom SMTP
                        </Label>
                        <p className="text-xs text-muted-foreground">Overrides environment variables for outbound mail.</p>
                    </div>
                    <Switch
                        id="smtpUseCustom"
                        checked={form.smtpUseCustom}
                        onCheckedChange={(checked) => onChange("smtpUseCustom", checked)}
                    />
                </div>

                {form.smtpUseCustom ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="smtpHost">SMTP host</Label>
                            <Input
                                id="smtpHost"
                                value={form.smtpHost}
                                onChange={(e) => onChange("smtpHost", e.target.value)}
                                placeholder="smtp.example.com"
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="smtpPort">Port</Label>
                            <Input
                                id="smtpPort"
                                type="number"
                                min={1}
                                max={65535}
                                className="h-9"
                                value={form.smtpPort}
                                onChange={(e) => onChange("smtpPort", parseInt(e.target.value, 10) || 587)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="emailFrom">From address</Label>
                            <Input
                                id="emailFrom"
                                type="email"
                                value={form.emailFrom}
                                onChange={(e) => onChange("emailFrom", e.target.value)}
                                placeholder="billing@yourdomain.com"
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="smtpUser">Username</Label>
                            <Input
                                id="smtpUser"
                                value={form.smtpUser}
                                onChange={(e) => onChange("smtpUser", e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="smtpPassword">Password</Label>
                            <Input
                                id="smtpPassword"
                                type="password"
                                value={smtpPasswordDraft}
                                onChange={(e) => onSmtpPasswordDraft(e.target.value)}
                                placeholder={
                                    form.smtpPasswordIsSet
                                        ? "Leave blank to keep existing password"
                                        : "App password or SMTP password"
                                }
                                autoComplete="new-password"
                            />
                            {form.smtpPasswordIsSet ? (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => onSmtpPasswordClearPending(!smtpPasswordClearPending)}
                                    >
                                        {smtpPasswordClearPending ? "Cancel remove password" : "Remove stored password on save"}
                                    </Button>
                                    {smtpPasswordClearPending ? (
                                        <span className="text-xs text-amber-600 dark:text-amber-500">
                                            Saved password will be cleared when you click Save all.
                                        </span>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                        <div className="sm:col-span-2 flex flex-col gap-2 pt-1">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="smtpSecure"
                                    checked={form.smtpSecure}
                                    onChange={(e) => onChange("smtpSecure", e.target.checked)}
                                />
                                <Label htmlFor="smtpSecure" className="text-sm font-normal cursor-pointer">
                                    Implicit TLS (typical for port 465)
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="smtpRequireTls"
                                    checked={form.smtpRequireTls}
                                    onChange={(e) => onChange("smtpRequireTls", e.target.checked)}
                                />
                                <Label htmlFor="smtpRequireTls" className="text-sm font-normal cursor-pointer">
                                    Require STARTTLS (typical for port 587)
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="smtpTlsRejectUnauthorized"
                                    checked={form.smtpTlsRejectUnauthorized}
                                    onChange={(e) => onChange("smtpTlsRejectUnauthorized", e.target.checked)}
                                />
                                <Label htmlFor="smtpTlsRejectUnauthorized" className="text-sm font-normal cursor-pointer">
                                    Reject invalid TLS certificates
                                </Label>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Custom SMTP is disabled. Configure <code className="text-xs">SMTP_HOST</code>,{" "}
                        <code className="text-xs">SMTP_PORT</code>, <code className="text-xs">SMTP_USER</code>,{" "}
                        <code className="text-xs">SMTP_PASSWORD</code>, and <code className="text-xs">EMAIL_FROM</code> on
                        the API server, or enable custom SMTP above.
                    </p>
                )}

                <div className="border-t pt-4 space-y-2">
                    <Label className="text-sm font-medium">Send test email</Label>
                    <p className="text-xs text-muted-foreground">
                        Verifies the connection, then sends one message using the active configuration (custom or
                        environment).
                    </p>
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="space-y-1.5 flex-1 min-w-[200px]">
                            <Label htmlFor="smtpTestTo" className="sr-only">
                                Test recipient
                            </Label>
                            <Input
                                id="smtpTestTo"
                                type="email"
                                placeholder="you@example.com"
                                value={testTo}
                                onChange={(e) => setTestTo(e.target.value)}
                            />
                        </div>
                        <Button type="button" size="sm" onClick={sendTest} disabled={isTesting}>
                            {isTesting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending…
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send test
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
