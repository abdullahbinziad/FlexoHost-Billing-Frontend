"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert } from "lucide-react";
import type { BillingSettings } from "@/store/api/settingsApi";
import { DaysArrayInput } from "./DaysArrayInput";

interface ServiceEnforcementCardProps {
    form: BillingSettings;
    onChange: (key: keyof BillingSettings, value: number | string | number[]) => void;
}

const inputCompact = "h-9 w-20 text-center px-2";

export function ServiceEnforcementCard({ form, onChange }: ServiceEnforcementCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2 space-y-0.5">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Suspension & Termination</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    When unpaid invoices trigger suspension and when suspended services are terminated.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="daysBeforeSuspend" className="text-sm whitespace-nowrap">Days overdue before suspend</Label>
                        <Input
                            id="daysBeforeSuspend"
                            type="number"
                            min={0}
                            max={90}
                            className={inputCompact}
                            value={form.daysBeforeSuspend}
                            onChange={(e) => onChange("daysBeforeSuspend", parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="daysBeforeTermination" className="text-sm whitespace-nowrap">Days suspended before termination</Label>
                        <Input
                            id="daysBeforeTermination"
                            type="number"
                            min={1}
                            max={365}
                            className={inputCompact}
                            value={form.daysBeforeTermination}
                            onChange={(e) => onChange("daysBeforeTermination", parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>
                <DaysArrayInput
                    label="Termination warning (days before termination)"
                    value={form.terminationWarningDays ?? [7, 3, 1]}
                    onChange={(arr) => onChange("terminationWarningDays", arr)}
                    hint="Optional reminders for suspended services"
                />
            </CardContent>
        </Card>
    );
}
