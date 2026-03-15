"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BadgeDollarSign } from "lucide-react";
import type { BillingSettings } from "@/store/api/settingsApi";

interface LateFeeCardProps {
    form: BillingSettings;
    onChange: (key: keyof BillingSettings, value: number | string) => void;
}

const inputCompact = "h-9 w-20 text-center px-2";

export function LateFeeCard({ form, onChange }: LateFeeCardProps) {
    const isEnabled = (form.overdueExtraChargeDays ?? 0) > 0;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2 space-y-0.5">
                <div className="flex items-center gap-2">
                    <BadgeDollarSign className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Late Fee</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    Extra charge when overdue. Set days to 0 to disable.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">Days overdue before fee</Label>
                        <Input
                            type="number"
                            min={0}
                            max={90}
                            className={inputCompact}
                            value={form.overdueExtraChargeDays}
                            onChange={(e) => onChange("overdueExtraChargeDays", parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">Amount</Label>
                        <Input
                            type="number"
                            min={0}
                            step={0.01}
                            className="h-8 w-20 text-center px-2"
                            value={form.overdueExtraChargeAmount}
                            onChange={(e) => onChange("overdueExtraChargeAmount", parseFloat(e.target.value) || 0)}
                            disabled={!isEnabled}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">Type</Label>
                        <Select
                            value={form.overdueExtraChargeType}
                            onValueChange={(v) => onChange("overdueExtraChargeType", v)}
                        >
                            <SelectTrigger disabled={!isEnabled} className="h-9 w-[8rem]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fixed</SelectItem>
                                <SelectItem value="percent">Percent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
