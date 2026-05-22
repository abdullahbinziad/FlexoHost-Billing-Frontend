"use client";

import { useState } from "react";
import { Search, Loader2, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    useGetBillableItemsQuery,
    useBulkInvoiceOnCronMutation,
    useBulkDeleteBillableItemsMutation,
    type BillableItem,
} from "@/store/api/billableItemApi";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { EmptyState } from "@/components/shared/EmptyState";

const INVOICE_ACTION_LABELS: Record<string, string> = {
    DONT_INVOICE: "Don't Invoice",
    INVOICE_ON_CRON: "Invoice on Cron",
    ADD_TO_NEXT_INVOICE: "Add to Next Invoice",
    INVOICE_NORMAL: "Invoice Normal",
    RECUR: "Recurring",
};

function getClientName(client: BillableItem["clientId"]): string {
    if (typeof client === "object" && client) {
        const c = client as { firstName?: string; lastName?: string; companyName?: string };
        return [c.firstName, c.lastName].filter(Boolean).join(" ") || c.companyName || "—";
    }
    return "—";
}

export interface BillableItemsListProps {
    recurring?: boolean;
    uninvoiced?: boolean;
    title?: string;
    description?: string;
}

export function BillableItemsList({
    recurring = false,
    uninvoiced = false,
    title,
    description,
}: BillableItemsListProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchDraft, setSearchDraft] = useState("");
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { data, isLoading, error } = useGetBillableItemsQuery({
        page,
        limit,
        search: search || undefined,
        recurring: recurring || undefined,
        invoiced: uninvoiced ? false : undefined,
    });

    const [bulkInvoiceOnCron, { isLoading: isBulkInvoicing }] = useBulkInvoiceOnCronMutation();
    const [bulkDelete, { isLoading: isBulkDeleting }] = useBulkDeleteBillableItemsMutation();

    const items = data?.results ?? [];
    const totalResults = data?.totalResults ?? 0;
    const totalPages = data?.totalPages ?? 1;
    const formatCurrency = useFormatCurrency();

    const handleSearch = () => {
        setSearch(searchDraft.trim());
        setPage(1);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i) => i._id)));
        }
    };

    const handleBulkInvoiceOnCron = async () => {
        if (selectedIds.size === 0) {
            toast.error("Select items first");
            return;
        }
        try {
            await bulkInvoiceOnCron({ ids: Array.from(selectedIds) }).unwrap();
            toast.success("Items will be invoiced on next cron run");
            setSelectedIds(new Set());
        } catch {
            toast.error("Failed to update items");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) {
            toast.error("Select items first");
            return;
        }
        try {
            await bulkDelete({ ids: Array.from(selectedIds) }).unwrap();
            toast.success("Items deleted");
            setSelectedIds(new Set());
        } catch {
            toast.error("Failed to delete items");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        const err = error as { status?: number; data?: { message?: string } };
        const message =
            err?.data?.message ||
            (err?.status === 401 ? "Please log in to continue." : null) ||
            (err?.status === 403 ? "You do not have permission to view billable items." : null) ||
            "Failed to load billable items. Please try again.";
        return (
            <div className="p-6 text-center text-destructive">
                {message}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                            Search / Filter
                        </label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search by description..."
                                className="bg-white dark:bg-background max-w-xs"
                                value={searchDraft}
                                onChange={(e) => setSearchDraft(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <Button variant="outline" size="sm" onClick={handleSearch}>
                                <Search className="w-4 h-4 mr-1" /> Search
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {totalResults > 0 && (
                <DataTablePagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalResults}
                    pageSize={limit}
                    currentCount={items.length}
                    itemLabel="records"
                    onPageChange={setPage}
                    onPageSizeChange={(v) => {
                        setLimit(v);
                        setPage(1);
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                />
            )}

            {totalResults === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No billable items found"
                    description={
                        search
                            ? "Try adjusting your search."
                            : recurring
                                ? "Recurring items will appear here when you add them."
                                : uninvoiced
                                    ? "Uninvoiced items will appear here."
                                    : "Billable items will appear here when you add them."
                    }
                />
            ) : (
            <>
            <div className="rounded-md border bg-white dark:bg-gray-900">
                <Table>
                    <TableHeader className="bg-primary text-primary-foreground">
                        <TableRow className="hover:bg-primary border-none">
                            <TableHead className="w-[40px] text-primary-foreground">
                                <Checkbox
                                    className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                                    checked={items.length > 0 && selectedIds.size === items.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="text-primary-foreground">ID</TableHead>
                            <TableHead className="text-primary-foreground">Client Name</TableHead>
                            <TableHead className="text-primary-foreground">Description</TableHead>
                            <TableHead className="text-primary-foreground">Hours</TableHead>
                            <TableHead className="text-primary-foreground">Amount</TableHead>
                            <TableHead className="text-primary-foreground">Invoice Action</TableHead>
                            <TableHead className="text-primary-foreground">Invoiced</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                                <TableRow
                                    key={item._id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(item._id)}
                                            onCheckedChange={() => toggleSelect(item._id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{item._id.slice(-8)}</TableCell>
                                    <TableCell>{getClientName(item.clientId)}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                                    <TableCell>{item.hoursOrQty}</TableCell>
                                    <TableCell>{formatCurrency(item.amount, item.currency)}</TableCell>
                                    <TableCell>
                                        <span className="text-xs">
                                            {INVOICE_ACTION_LABELS[item.invoiceAction] ?? item.invoiceAction}
                                        </span>
                                    </TableCell>
                                    <TableCell>{item.invoiced ? "Yes" : "No"}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {totalResults > 0 && items.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">With Selected:</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkInvoiceOnCron}
                        disabled={selectedIds.size === 0 || isBulkInvoicing}
                    >
                        {isBulkInvoicing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Invoice on Next Cron Run
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={handleBulkDelete}
                        disabled={selectedIds.size === 0 || isBulkDeleting}
                    >
                        {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                    </Button>
                </div>
            )}

            {totalResults > 0 && (
                <DataTablePagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalResults}
                    pageSize={limit}
                    currentCount={items.length}
                    itemLabel="records"
                    onPageChange={setPage}
                    onPageSizeChange={(v) => {
                        setLimit(v);
                        setPage(1);
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                />
            )}
            </>
            )}
        </div>
    );
}
