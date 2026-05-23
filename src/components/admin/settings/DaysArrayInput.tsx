"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DaysArrayInputProps {
    label: string;
    value: number[];
    onChange: (arr: number[]) => void;
    placeholder?: string;
    hint?: string;
}

function parseDaysInput(s: string): number[] {
    return s
        .split(/[,\s]+/)
        .map((x) => parseInt(x.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0);
}

export function DaysArrayInput({ label, value, onChange, placeholder, hint }: DaysArrayInputProps) {
    const str = (value ?? []).join(", ");
    return (
        <div className="space-y-1">
            <Label className="text-sm">{label}</Label>
            <Input
                className="h-9 text-sm"
                placeholder={placeholder ?? "e.g. 30, 14, 7, 3, 1"}
                value={str}
                onChange={(e) => {
                    const arr = parseDaysInput(e.target.value);
                    onChange(arr.length > 0 ? arr : []);
                }}
            />
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}
