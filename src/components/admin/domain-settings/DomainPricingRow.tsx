"use client";

import { Lightbulb, Settings, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { TLD } from "@/types/admin";

interface DomainPricingRowProps {
    tld: TLD;
    isSelected: boolean;
    onToggleSelect: (id: string, checked: boolean) => void;
    onOpenPricing: (tld: TLD) => void;
    onUpdateRegistrar: (id: string, registrar: string) => void;
    onDelete: (id: string) => void;
    onToggleSpotlight: (tld: TLD) => void;
    onUpdateStatus: (tld: TLD) => void;
}

export function DomainPricingRow({
    tld,
    isSelected,
    onToggleSelect,
    onOpenPricing,
    onUpdateRegistrar,
    onDelete,
    onToggleSpotlight,
    onUpdateStatus,
}: DomainPricingRowProps) {
    const getBadgeColor = (badge: string | null | undefined) => {
        switch (badge) {
            case "NEW":
                return "bg-green-500 hover:bg-green-600";
            case "HOT":
                return "bg-red-500 hover:bg-red-600";
            case "SALE":
                return "bg-orange-500 hover:bg-orange-600";
            default:
                return "";
        }
    };

    return (
        <TableRow>
            <TableCell>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(c) => onToggleSelect(tld._id, !!c)}
                />
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-[140px]">
                        <Input defaultValue={tld.tld} className="h-9 pr-16 font-medium" />
                        {tld.label && (
                            <Badge
                                className={`absolute right-1 top-1.5 h-6 text-[10px] pointer-events-none ${getBadgeColor(
                                    tld.label
                                )}`}
                            >
                                {tld.label}
                            </Badge>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 ${tld.isSpotlight
                            ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                            : "text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100"
                            }`}
                        onClick={() => onToggleSpotlight(tld)}
                    >
                        <Lightbulb className="w-4 h-4" />
                    </Button>
                </div>
            </TableCell>
            <TableCell>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onOpenPricing(tld)}
                >
                    Pricing
                </Button>
            </TableCell>
            <TableCell>
                <Select
                    value={tld.autoRegistration?.provider || "None"}
                    onValueChange={(val) => onUpdateRegistrar(tld._id, val)}
                >
                    <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Select Registrar" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Dynadot">Dynadot</SelectItem>
                        <SelectItem value="Namely Partner">Namely Partner</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell>
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 text-xs font-semibold ${tld.status === "active" ? "text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30" : "text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"}`}
                        onClick={() => onUpdateStatus(tld)}
                    >
                        {tld.status === "active" ? "Active" : "Inactive"}
                    </Button>
                    <div className="flex flex-col">
                        <ArrowUp className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                        <ArrowDown className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(tld._id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
