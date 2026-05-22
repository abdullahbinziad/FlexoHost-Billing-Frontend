"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetClientsQuery } from "@/store/api/clientApi";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useCreateBillableItemMutation } from "@/store/api/billableItemApi";
import type { ClientListItem } from "@/store/api/clientApi";
import { toast } from "sonner";

const INVOICE_ACTIONS = [
    { value: "DONT_INVOICE", label: "Don't Invoice for Now" },
    { value: "INVOICE_ON_CRON", label: "Invoice on Next Cron Run" },
    { value: "ADD_TO_NEXT_INVOICE", label: "Add to User's Next Invoice" },
    { value: "INVOICE_NORMAL", label: "Invoice as Normal for Due Date" },
    { value: "RECUR", label: "Recur Every" },
];

const RECUR_UNITS = [
    { value: "DAY", label: "Day" },
    { value: "WEEK", label: "Week" },
    { value: "MONTH", label: "Month" },
    { value: "YEAR", label: "Year" },
];

function formatDateForInput(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function AddBillableItemForm({ onSuccess }: { onSuccess?: () => void }) {
    const [clientSearch, setClientSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(null);
    const [productId, setProductId] = useState<string>("");
    const [description, setDescription] = useState("");
    const [unitType, setUnitType] = useState<"hours" | "qty">("hours");
    const [hoursOrQty, setHoursOrQty] = useState<string>("0");
    const [amount, setAmount] = useState<string>("0");
    const [invoiceAction, setInvoiceAction] = useState("DONT_INVOICE");
    const [dueDate, setDueDate] = useState(formatDateForInput(new Date()));
    const [recurEvery, setRecurEvery] = useState<string>("0");
    const [recurUnit, setRecurUnit] = useState<string>("MONTH");
    const [recurCount, setRecurCount] = useState<string>("0");
    const [invoiceCount, setInvoiceCount] = useState<string>("0");
    const [currency, setCurrency] = useState("USD");

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(clientSearch), 300);
        return () => clearTimeout(t);
    }, [clientSearch]);

    const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery(
        { search: debouncedSearch, limit: 10 },
        { skip: debouncedSearch.length < 2 }
    );
    const { data: productsData } = useGetProductsQuery({ limit: 200 });
    const [createItem, { isLoading: isSubmitting }] = useCreateBillableItemMutation();

    const clients = clientsData?.clients ?? [];
    const products = productsData?.products ?? [];
    const showClientDropdown = clientSearch.length >= 2 && !selectedClient;

    const handleSelectClient = (client: ClientListItem) => {
        setSelectedClient(client);
        setClientSearch([client.firstName, client.lastName].filter(Boolean).join(" ") || client.contactEmail || "");
    };

    const handleSubmit = async () => {
        if (!selectedClient) {
            toast.error("Please select a client");
            return;
        }
        if (!description.trim()) {
            toast.error("Description is required");
            return;
        }
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt < 0) {
            toast.error("Amount must be a valid number");
            return;
        }

        try {
            await createItem({
                clientId: selectedClient._id,
                productId: productId || undefined,
                description: description.trim(),
                unitType,
                hoursOrQty: parseFloat(hoursOrQty) || 0,
                amount: amt,
                invoiceAction,
                dueDate: new Date(dueDate).toISOString(),
                recurEvery: invoiceAction === "RECUR" ? parseInt(recurEvery, 10) || 0 : undefined,
                recurUnit: invoiceAction === "RECUR" ? recurUnit : undefined,
                recurCount: invoiceAction === "RECUR" ? parseInt(recurCount, 10) || 0 : undefined,
                currency,
            }).unwrap();

            toast.success("Billable item created");
            setDescription("");
            setAmount("0");
            setHoursOrQty("0");
            onSuccess?.();
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to create billable item");
        }
    };

    return (
        <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
            <CardHeader className="p-4 pb-2 space-y-0.5">
                <CardTitle className="text-base">Add Billable Item</CardTitle>
                <p className="text-xs text-muted-foreground">
                    Client, product, description, amount, and invoice options.
                </p>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Client</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Start typing to search clients..."
                            className="pl-9 h-10 bg-white dark:bg-background"
                            value={clientSearch}
                            onChange={(e) => {
                                setClientSearch(e.target.value);
                                if (!e.target.value) setSelectedClient(null);
                            }}
                        />
                        {showClientDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 max-h-60 overflow-auto">
                                {clientsLoading ? (
                                    <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                                    </div>
                                ) : clients.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-muted-foreground">
                                        No clients found.
                                    </div>
                                ) : (
                                    clients.map((c) => (
                                        <div
                                            key={c._id}
                                            className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm"
                                            onClick={() => handleSelectClient(c)}
                                        >
                                            <div className="font-medium">
                                                {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {c.contactEmail || c.user?.email || ""}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    {selectedClient && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Selected: {[selectedClient.firstName, selectedClient.lastName].filter(Boolean).join(" ")}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Product / Service</Label>
                    <Select value={productId || "none"} onValueChange={(v) => setProductId(v === "none" ? "" : v)}>
                        <SelectTrigger className="h-10 bg-white dark:bg-background">
                            <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {products.map((p) => {
                                const pid = (p as { _id?: string; id?: string })._id ?? p.id;
                                return (
                                <SelectItem key={pid} value={String(pid)}>
                                    {p.name}
                                </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Description</Label>
                    <Input
                        className="bg-white dark:bg-background h-10"
                        placeholder="Item description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Hours / Qty</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                step="0.1"
                                min={0}
                                className="h-10 bg-white dark:bg-background flex-1"
                                value={hoursOrQty}
                                onChange={(e) => setHoursOrQty(e.target.value)}
                            />
                            <RadioGroup value={unitType} onValueChange={(v: "hours" | "qty") => setUnitType(v)} className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <RadioGroupItem value="hours" /> Hours
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <RadioGroupItem value="qty" /> Qty
                                </label>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Amount</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min={0}
                            className="h-10 bg-white dark:bg-background"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Invoice Action</Label>
                    <RadioGroup value={invoiceAction} onValueChange={setInvoiceAction} className="space-y-2">
                        {INVOICE_ACTIONS.map((opt) => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                                <RadioGroupItem value={opt.value} />
                                {opt.label}
                            </label>
                        ))}
                    </RadioGroup>
                    {invoiceAction === "RECUR" && (
                        <div className="flex items-center gap-2 mt-2 pl-6">
                            <Input
                                type="number"
                                min={0}
                                className="h-9 w-20 bg-white dark:bg-background"
                                value={recurEvery}
                                onChange={(e) => setRecurEvery(e.target.value)}
                            />
                            <Select value={recurUnit} onValueChange={setRecurUnit}>
                                <SelectTrigger className="h-9 w-24 bg-white dark:bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {RECUR_UNITS.map((u) => (
                                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">for</span>
                            <Input
                                type="number"
                                min={0}
                                className="h-9 w-20 bg-white dark:bg-background"
                                placeholder="0 = indefinite"
                                value={recurCount}
                                onChange={(e) => setRecurCount(e.target.value)}
                            />
                            <span className="text-sm text-muted-foreground">times</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">(Next) Due Date</Label>
                        <Input
                            type="date"
                            className="h-10 bg-white dark:bg-background"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="h-10 bg-white dark:bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="BDT">BDT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Invoice Count</Label>
                        <Input
                            type="number"
                            min={0}
                            className="h-10 bg-white dark:bg-background"
                            value={invoiceCount}
                            onChange={(e) => setInvoiceCount(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
