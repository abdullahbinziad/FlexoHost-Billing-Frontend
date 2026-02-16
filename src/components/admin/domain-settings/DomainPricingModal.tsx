"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { TLD, TLDPricingTier } from "@/types/admin";
import { useUpdateTldMutation } from "@/store/api/tldApi";
import { toast } from "sonner";

interface PricingTier {
    register: number;
    renew: number;
    transfer: number;
}

interface PricingData {
    "1": PricingTier;
    "2": PricingTier;
    "3": PricingTier;
}

const defaultPricing: PricingData = {
    "1": { register: 10, renew: 12, transfer: 10 },
    "2": { register: 20, renew: 24, transfer: 20 },
    "3": { register: 30, renew: 36, transfer: 30 },
};

interface DomainPricingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tld: TLD | null;
}

export function DomainPricingModal({ open, onOpenChange, tld }: DomainPricingModalProps) {
    const [updateTld, { isLoading: isUpdating }] = useUpdateTldMutation();
    const [tempPricing, setTempPricing] = useState<PricingData>(defaultPricing);

    useEffect(() => {
        if (open && tld) {
            setTempPricing(mapApiPricingToState(tld.pricing));
        }
    }, [open, tld]);

    const mapApiPricingToState = (apiPricing: TLDPricingTier[]): PricingData => {
        const pricingState: PricingData = JSON.parse(JSON.stringify(defaultPricing));
        apiPricing.forEach((tier) => {
            const yearKey = String(tier.year) as "1" | "2" | "3";
            if (pricingState[yearKey]) {
                pricingState[yearKey] = {
                    register: tier.register,
                    renew: tier.renew,
                    transfer: tier.transfer,
                };
            }
        });
        return pricingState;
    };

    const updatePricing = (year: "1" | "2" | "3", type: keyof PricingTier, value: string) => {
        const numValue = parseFloat(value) || 0;
        setTempPricing((prev) => ({
            ...prev,
            [year]: {
                ...prev[year],
                [type]: numValue,
            },
        }));
    };

    const handleSavePricing = async () => {
        if (!tld) return;

        const apiPricing: TLDPricingTier[] = [
            { year: 1, ...tempPricing["1"] },
            { year: 2, ...tempPricing["2"] },
            { year: 3, ...tempPricing["3"] },
        ];

        try {
            await updateTld({
                id: tld._id,
                body: { pricing: apiPricing },
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
            <DialogContent className="sm:max-w-[90vw]">
                <DialogHeader>
                    <DialogTitle>Edit Pricing: {tld.tld}</DialogTitle>
                    <DialogDescription>
                        Set the registration, renewal, and transfer pricing for this TLD.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead>Registration</TableHead>
                                <TableHead>Renewal</TableHead>
                                <TableHead>Transfer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {["1", "2", "3"].map((year) => (
                                <TableRow key={year}>
                                    <TableCell className="font-medium">
                                        {year} Year{year !== "1" && "s"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                value={tempPricing[year as keyof PricingData]?.register ?? 0}
                                                onChange={(e) =>
                                                    updatePricing(year as any, "register", e.target.value)
                                                }
                                                className="w-24"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                value={tempPricing[year as keyof PricingData]?.renew ?? 0}
                                                onChange={(e) =>
                                                    updatePricing(year as any, "renew", e.target.value)
                                                }
                                                className="w-24"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                value={tempPricing[year as keyof PricingData]?.transfer ?? 0}
                                                onChange={(e) =>
                                                    updatePricing(year as any, "transfer", e.target.value)
                                                }
                                                className="w-24"
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
