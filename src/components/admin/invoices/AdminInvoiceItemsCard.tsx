"use client";

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
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { Plus, Trash2, X } from "lucide-react";
import type { InvoiceItemPayload } from "@/store/api/invoiceApi";

interface AdminInvoiceItemsCardProps {
    items: InvoiceItemPayload[];
    currency: string;
    credit: number;
    onItemsChange: (items: InvoiceItemPayload[]) => void;
    onCreditChange?: (credit: number) => void;
    /** Client's available credit balance (for "Add Credit" - placeholder 0 if not from API) */
    availableCredit?: number;
}

export function AdminInvoiceItemsCard({
    items,
    currency,
    credit,
    onItemsChange,
    onCreditChange,
    availableCredit = 0,
}: AdminInvoiceItemsCardProps) {
    const formatCurrency = useFormatCurrency();
    const subTotal = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const total = subTotal;
    const balanceDue = total - (credit || 0);

    const updateItem = (index: number, field: keyof InvoiceItemPayload, value: unknown) => {
        const next = [...items];
        const item = { ...next[index] };
        if (field === "amount") item.amount = Number(value) || 0;
        else if (field === "description") item.description = String(value);
        else if (field === "type") item.type = String(value) || "HOSTING";
        next[index] = item;
        onItemsChange(next);
    };

    const addItem = () => {
        onItemsChange([...items, { type: "HOSTING", description: "", amount: 0 }]);
    };

    const removeItem = (index: number) => {
        onItemsChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4 rounded-lg border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Invoice Items
                </h3>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5 h-8">
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                </Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-12 font-medium">#</TableHead>
                            <TableHead className="font-medium">Description</TableHead>
                            <TableHead className="w-32 font-medium text-right">Amount</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No items. Click Add Item to add one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item, idx) => (
                                <TableRow key={idx} className="group">
                                    <TableCell className="font-medium text-muted-foreground">
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={item.description}
                                            onChange={(e) => updateItem(idx, "description", e.target.value)}
                                            placeholder="Item description"
                                            className="h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 group-hover:bg-muted/30 rounded"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={item.amount || ""}
                                            onChange={(e) => updateItem(idx, "amount", e.target.value)}
                                            placeholder="0"
                                            className="h-8 text-right w-28"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeItem(idx)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Totals & Credit */}
            <div className="flex flex-wrap justify-end gap-4">
                <div className="w-full min-w-[260px] max-w-sm rounded-md border bg-muted/30 p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sub Total</span>
                        <span>{formatCurrency(subTotal, currency)}</span>
                    </div>

                    {/* Add Credit to Invoice */}
                    {onCreditChange ? (
                        <div className="space-y-1.5 pt-2 border-t">
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Add Credit to Invoice
                                </span>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={credit}
                                    onChange={(e) => onCreditChange(Number(e.target.value) || 0)}
                                    className="h-8 w-24 text-right"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(availableCredit, currency)} Available
                            </p>
                        </div>
                    ) : null}

                    {/* Remove Credit from Invoice */}
                    {onCreditChange ? (
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Remove Credit from Invoice
                                </span>
                                <span className="text-sm font-medium tabular-nums">
                                    {credit.toFixed(2)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1 text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={() => onCreditChange(0)}
                                    disabled={credit <= 0}
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Remove
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(credit, currency)} Applied
                            </p>
                        </div>
                    ) : null}

                    {!onCreditChange && credit > 0 && (
                        <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-muted-foreground">Credit</span>
                            <span>{formatCurrency(credit, currency)}</span>
                        </div>
                    )}

                    <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total Due</span>
                        <span className="text-primary">{formatCurrency(total, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Balance</span>
                        <span
                            className={
                                balanceDue > 0 ? "font-medium text-rose-600 dark:text-rose-400" : ""
                            }
                        >
                            {formatCurrency(balanceDue, currency)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
