"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { TLD, TLDCurrencyPricing, TLDPricingDetail } from "@/types/admin";
import { useUpdateTldMutation } from "@/store/api/tldApi";
import { toast } from "sonner";

import { defaultPricingDetail, defaultCurrencyPricing } from "@/lib/domain-constants";
import { SUPPORTED_CURRENCY_CODES } from "@/types/currency";

interface DomainPricingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tld: TLD | null;
}

export function DomainPricingModal({ open, onOpenChange, tld }: DomainPricingModalProps) {
    const [updateTld, { isLoading: isUpdating }] = useUpdateTldMutation();
    const [pricingState, setPricingState] = useState<TLDCurrencyPricing[]>([]);

    useEffect(() => {
        if (open && tld) {
            // Initialize with existing pricing or defaults for USD and BDT
            const currencies = [...SUPPORTED_CURRENCY_CODES];
            const currentPricing = tld.pricing || [];

            const newPricingState = currencies.map(currency => {
                const existing = currentPricing.find(p => p.currency === currency);
                if (existing) {
                    return JSON.parse(JSON.stringify(existing));
                }
                return defaultCurrencyPricing(currency);
            });

            setPricingState(newPricingState);
        }
    }, [open, tld]);

    const updatePricing = (
        currencyIndex: number,
        year: "1" | "2" | "3",
        field: keyof TLDPricingDetail,
        value: any
    ) => {
        setPricingState(prev => {
            const newState = [...prev];
            const currencyPricing = { ...newState[currencyIndex] };
            const yearPricing = { ...currencyPricing[year] };

            if (field === "enable") {
                yearPricing[field] = value as boolean;
            } else {
                yearPricing[field] = parseFloat(value) || 0;
            }

            currencyPricing[year] = yearPricing;
            newState[currencyIndex] = currencyPricing;
            return newState;
        });
    };

    const handleSavePricing = async () => {
        if (!tld) return;

        try {
            await updateTld({
                id: tld._id,
                body: { pricing: pricingState },
            }).unwrap();
            toast.success("Pricing updated successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update pricing");
        }
    };

    if (!tld) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Edit Pricing: {tld.tld}</DialogTitle>
                    <DialogDescription>
                        Set the registration, renewal, and transfer pricing for this TLD across different currencies.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Tabs defaultValue="USD">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            {pricingState.map((p) => (
                                <TabsTrigger key={p.currency} value={p.currency}>
                                    {p.currency}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {pricingState.map((currencyPricing, index) => (
                            <TabsContent key={currencyPricing.currency} value={currencyPricing.currency}>
                                <div className="border rounded-md overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Period</TableHead>
                                                <TableHead>Registration</TableHead>
                                                <TableHead>Renewal</TableHead>
                                                <TableHead>Transfer</TableHead>
                                                <TableHead className="text-center w-[100px]">Enable</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(["1", "2", "3"] as const).map((year) => {
                                                const details = currencyPricing[year];
                                                const isEnabled = details.enable;

                                                return (
                                                    <TableRow key={year}>
                                                        <TableCell className="font-medium">
                                                            {year} Year{year !== "1" && "s"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {currencyPricing.currency === "USD" ? "$" : "৳"}
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    value={details.register}
                                                                    onChange={(e) => updatePricing(index, year, "register", e.target.value)}
                                                                    disabled={!isEnabled}
                                                                    className="w-24"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {currencyPricing.currency === "USD" ? "$" : "৳"}
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    value={details.renew}
                                                                    onChange={(e) => updatePricing(index, year, "renew", e.target.value)}
                                                                    disabled={!isEnabled}
                                                                    className="w-24"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {currencyPricing.currency === "USD" ? "$" : "৳"}
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    value={details.transfer}
                                                                    onChange={(e) => updatePricing(index, year, "transfer", e.target.value)}
                                                                    disabled={!isEnabled}
                                                                    className="w-24"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-center">
                                                                <Checkbox
                                                                    checked={isEnabled}
                                                                    onCheckedChange={(checked) =>
                                                                        updatePricing(index, year, "enable", checked === true)
                                                                    }
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSavePricing} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Pricing
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
