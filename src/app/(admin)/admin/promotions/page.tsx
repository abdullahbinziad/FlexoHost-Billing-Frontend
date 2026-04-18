"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
    useGetPromotionsQuery,
    useDeletePromotionMutation,
    useTogglePromotionActiveMutation,
} from "@/store/api/promotionApi";
import { Plus, Search, Pencil, Trash2, Power, PowerOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

export default function PromotionsPage() {
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);

    const { data, isLoading, error } = useGetPromotionsQuery({
        isActive: filter === "all" ? undefined : filter === "active",
        page,
        limit: 20,
        search: search || undefined,
    });

    const [deletePromotion] = useDeletePromotionMutation();
    const [toggleActive] = useTogglePromotionActiveMutation();

    const promotions = data?.promotions || [];
    const pagination = data?.pagination;

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        try {
            await toggleActive({ id, isActive: !currentActive }).unwrap();
            toast.success(currentActive ? "Promotion deactivated" : "Promotion activated");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update promotion");
        }
    };

    const handleDelete = async () => {
        if (!promotionToDelete) return;
        try {
            await deletePromotion(promotionToDelete).unwrap();
            toast.success("Promotion deleted");
            setPromotionToDelete(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete promotion");
        }
    };

    const formatDate = (d: string) => {
        try {
            const date = new Date(d);
            return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return "-";
        }
    };

    const copyPromoCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Code copied to clipboard");
        } catch {
            toast.error("Failed to copy code");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Promotions / Coupons</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {pagination
                            ? `${pagination.totalItems} Records, Page ${pagination.currentPage} of ${pagination.totalPages}`
                            : "Loading..."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === "active" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setFilter("active");
                            setPage(1);
                        }}
                    >
                        Active
                    </Button>
                    <Button
                        variant={filter === "inactive" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setFilter("inactive");
                            setPage(1);
                        }}
                    >
                        Inactive
                    </Button>
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setFilter("all");
                            setPage(1);
                        }}
                    >
                        All
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-center gap-4 flex-wrap">
                <Link href="/admin/promotions/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Promotion
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by code or name..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-8 w-64"
                        />
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center text-muted-foreground">
                            Loading promotions...
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-destructive">
                            Failed to load promotions. Please try again.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                                    <TableHead className="text-primary-foreground">Code</TableHead>
                                    <TableHead className="text-primary-foreground">Name</TableHead>
                                    <TableHead className="text-primary-foreground">Type</TableHead>
                                    <TableHead className="text-primary-foreground">Value</TableHead>
                                    <TableHead className="text-primary-foreground">Uses</TableHead>
                                    <TableHead className="text-primary-foreground">Start</TableHead>
                                    <TableHead className="text-primary-foreground">End</TableHead>
                                    <TableHead className="text-primary-foreground">Status</TableHead>
                                    <TableHead className="text-primary-foreground w-[180px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {promotions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                            No promotions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    promotions.map((promo) => (
                                        <TableRow key={promo._id}>
                                            <TableCell>
                                                <button
                                                    type="button"
                                                    className="inline-flex max-w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left font-mono font-medium hover:bg-muted/80 transition-colors cursor-pointer"
                                                    title="Click to copy"
                                                    onClick={() => void copyPromoCode(promo.code)}
                                                >
                                                    <span className="truncate">{promo.code}</span>
                                                    <Copy className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                                                </button>
                                            </TableCell>
                                            <TableCell>{promo.name}</TableCell>
                                            <TableCell className="capitalize">{promo.type}</TableCell>
                                            <TableCell>
                                                {promo.type === "percent"
                                                    ? `${promo.value}%`
                                                    : `${promo.currency || "BDT"} ${promo.value}`}
                                            </TableCell>
                                            <TableCell>
                                                {promo.usageCount}/
                                                {promo.usageLimit === 0 ? "∞" : promo.usageLimit}
                                            </TableCell>
                                            <TableCell>{formatDate(promo.startDate)}</TableCell>
                                            <TableCell>{formatDate(promo.endDate)}</TableCell>
                                            <TableCell>
                                                <Badge variant={promo.isActive ? "default" : "secondary"}>
                                                    {promo.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        title={promo.isActive ? "Deactivate" : "Activate"}
                                                        onClick={() =>
                                                            handleToggleActive(promo._id, promo.isActive)
                                                        }
                                                    >
                                                        {promo.isActive ? (
                                                            <PowerOff className="w-4 h-4 text-amber-600" />
                                                        ) : (
                                                            <Power className="w-4 h-4 text-green-600" />
                                                        )}
                                                    </Button>
                                                    <Link href={`/admin/promotions/${promo._id}`}>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4 text-blue-600" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                        title="Delete"
                                                        onClick={() => setPromotionToDelete(promo._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            {pagination ? (
                <DataTablePagination
                    page={page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.itemsPerPage}
                    currentCount={promotions.length}
                    itemLabel="records"
                    onPageChange={setPage}
                />
            ) : null}

            <ConfirmActionDialog
                open={!!promotionToDelete}
                onOpenChange={(open) => !open && setPromotionToDelete(null)}
                title="Delete promotion?"
                description="This action cannot be undone. The promotion will be permanently removed."
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </div>
    );
}
