"use client";

import { useState } from "react";
import { Info, Lightbulb, Plus, X as XIcon, Loader2 } from "lucide-react";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TLD, TLDCurrencyPricing, TLDPricingDetail } from "@/types/admin";
import {
    useGetTldsQuery,
    useCreateTldMutation,
    useUpdateTldMutation,
    useDeleteTldMutation,
} from "@/store/api/tldApi";
import { toast } from "sonner";
import { DomainPricingModal } from "./DomainPricingModal";
import { DomainPricingRow } from "./DomainPricingRow";

import { defaultPricingDetail, defaultCurrencyPricing } from "@/lib/domain-constants";

export function DomainPricingTable() {
    const { data: tlds = [], isLoading } = useGetTldsQuery();
    const [createTld, { isLoading: isCreating }] = useCreateTldMutation();
    const [updateTld] = useUpdateTldMutation();
    const [deleteTld] = useDeleteTldMutation();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // New TLD State
    const [newTldName, setNewTldName] = useState("");
    const [newTldRegistrar, setNewTldRegistrar] = useState("None");

    // Pricing Modal State
    const [isPricingOpen, setIsPricingOpen] = useState(false);
    const [currentEditingTld, setCurrentEditingTld] = useState<TLD | null>(null);

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(tlds.map(t => t._id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleSelect = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) newSelected.add(id);
        else newSelected.delete(id);
        setSelectedIds(newSelected);
    };

    // Spotlight Logic
    const spotlightTlds = tlds.filter(t => t.isSpotlight);

    const handleToggleSpotlight = async (tld: TLD) => {
        const newStatus = !tld.isSpotlight;
        try {
            await updateTld({ id: tld._id, body: { isSpotlight: newStatus } }).unwrap();
            toast.success(newStatus ? `Added ${tld.tld} to spotlight` : `Removed ${tld.tld} from spotlight`);
        } catch (error) {
            toast.error("Failed to update spotlight status");
        }
    };

    const handleOpenPricing = (tld: TLD) => {
        setCurrentEditingTld(tld);
        setIsPricingOpen(true);
    };

    // General Updates
    const handleUpdateRegistrar = async (id: string, registrar: string) => {
        try {
            const enabled = registrar !== "None";
            const provider = registrar === "None" ? "" : registrar;
            await updateTld({
                id,
                body: {
                    autoRegistration: { enabled, provider }
                }
            }).unwrap();
            toast.success("Registrar updated");
        } catch (error) {
            toast.error("Failed to update registrar");
        }
    };

    const handleUpdateStatus = async (tld: TLD) => {
        const newStatus = tld.status === "active" ? "inactive" : "active";
        try {
            await updateTld({ id: tld._id, body: { status: newStatus } }).unwrap();
            toast.success(`TLD status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteTld = async (id: string) => {
        if (!confirm("Are you sure you want to delete this TLD?")) return;
        try {
            await deleteTld(id).unwrap();
            toast.success("TLD deleted");
        } catch (error) {
            toast.error("Failed to delete TLD");
        }
    };

    const handleAddTld = async () => {
        if (!newTldName) return;

        try {
            const apiPricing: TLDCurrencyPricing[] = [
                defaultCurrencyPricing("USD"),
                defaultCurrencyPricing("BDT")
            ];

            await createTld({
                tld: newTldName,
                serial: tlds.length + 1,
                isSpotlight: false,
                pricing: apiPricing,
                features: {
                    dnsManagement: true,
                    emailForwarding: true,
                    idProtection: true
                },
                autoRegistration: {
                    enabled: newTldRegistrar !== "None",
                    provider: newTldRegistrar === "None" ? "" : newTldRegistrar
                },
                status: "active"
            }).unwrap();

            toast.success("TLD added successfully");
            setNewTldName("");
            setNewTldRegistrar("None");
        } catch (error) {
            toast.error("Failed to add TLD");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Info Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 flex gap-3 text-sm text-blue-700 dark:text-blue-300">
                <Info className="w-5 h-5 shrink-0" />
                <p>
                    You have registrars enabled that support automatic TLD and Pricing synchronisation. No sync has been performed yet.
                    <span className="font-semibold underline cursor-pointer ml-1">Click here to sync now</span>
                </p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                This is where you configure the TLDs that you want to allow clients to register or transfer to you. As well as pricing, you can set which addons are offered with each TLD, if an EPP code is required, if registration is automated and if so, with which registrar.
            </p>

            {/* Spotlight TLDs */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 font-medium text-sm text-gray-700 dark:text-gray-300 shrink-0">
                    Spotlight TLDs <Lightbulb className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                    {spotlightTlds.map(tld => (
                        <div key={tld._id} className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-1 text-sm shadow-sm">
                            <span className="mr-2">{tld.tld}</span>
                            <button onClick={() => handleToggleSpotlight(tld)} className="text-gray-400 hover:text-red-500">
                                <XIcon className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {/* Placeholder for adding to spotlight */}
                    <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded px-3 py-1 text-sm text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                        + Add TLD
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="border rounded-md overflow-hidden bg-white dark:bg-gray-900">
                <Table>
                    <TableHeader className="bg-slate-900 dark:bg-slate-950">
                        <TableRow className="hover:bg-slate-900 dark:hover:bg-slate-950">
                            <TableHead className="w-[40px] text-white">
                                <Checkbox
                                    checked={tlds.length > 0 && selectedIds.size === tlds.length}
                                    onCheckedChange={toggleSelectAll}
                                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-900"
                                />
                            </TableHead>
                            <TableHead className="text-white font-semibold">TLD</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                            <TableHead className="text-white font-semibold w-[200px]">Auto Registration</TableHead>
                            <TableHead className="w-[120px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tlds.map((tld) => (
                            <DomainPricingRow
                                key={tld._id}
                                tld={tld}
                                isSelected={selectedIds.has(tld._id)}
                                onToggleSelect={toggleSelect}
                                onOpenPricing={handleOpenPricing}
                                onUpdateRegistrar={handleUpdateRegistrar}
                                onDelete={handleDeleteTld}
                                onToggleSpotlight={handleToggleSpotlight}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))}

                        {/* Add New Row */}
                        <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                            <TableCell></TableCell>
                            <TableCell>
                                <Input
                                    placeholder="Add TLD (eg. com)"
                                    className="h-9"
                                    value={newTldName}
                                    onChange={(e) => setNewTldName(e.target.value)}
                                />
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                                <Select value={newTldRegistrar} onValueChange={setNewTldRegistrar}>
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
                                <div className="flex items-center justify-end">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-1 h-8"
                                        onClick={handleAddTld}
                                        disabled={!newTldName || isCreating}
                                    >
                                        <Plus className="w-3 h-3" /> Add
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Pricing Modal */}
            <DomainPricingModal
                open={isPricingOpen}
                onOpenChange={setIsPricingOpen}
                tld={currentEditingTld}
            />
        </div>
    );
}
