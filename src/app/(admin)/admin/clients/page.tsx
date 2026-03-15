"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetClientsQuery } from "@/store/api/clientApi";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/utils/format";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

export default function ViewSearchClients() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    // Draft inputs
    const [searchDraft, setSearchDraft] = useState("");
    const [supportPinDraft, setSupportPinDraft] = useState("");
    // Applied filters (only change on Search)
    const [search, setSearch] = useState("");
    const [supportPin, setSupportPin] = useState("");

    const { data, isLoading, error } = useGetClientsQuery({
        page,
        limit,
        ...(search && { search }),
        ...(supportPin && { supportPin }),
    });

    const clients = data?.clients ?? [];
    const total = data?.total ?? 0;
    const pages = data?.pages ?? 1;

    const handleSearch = () => {
        setPage(1);
        setSearch(searchDraft.trim());
        setSupportPin(supportPinDraft.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const getEmail = (client: (typeof clients)[0]) =>
        client.contactEmail || (client.user as { email?: string })?.email || "—";

    const getStatus = (client: (typeof clients)[0]) => {
        const active = (client.user as { active?: boolean })?.active;
        return active !== false ? "Active" : "Inactive";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-destructive">
                Failed to load clients. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    View/Search Clients
                </h1>
            </div>

            {/* Search Filter Section */}
            <Card className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Search by Name / Company / Phone / Email
                            </label>
                            <Input
                                placeholder="e.g. John, john@example.com, FlexoHost, +1 555 123..."
                                className="bg-white dark:bg-background"
                                value={searchDraft}
                                onChange={(e) => setSearchDraft(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            {/* Future: extend this search to domains, services, etc. */}
                        </div>
                        <div className="space-y-1.5 flex-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Search by Support PIN (exact)
                            </label>
                            <Input
                                placeholder="6-digit Support PIN"
                                className="bg-white dark:bg-background"
                                value={supportPinDraft}
                                onChange={(e) =>
                                    setSupportPinDraft(e.target.value.replace(/\D/g, "").slice(0, 6))
                                }
                                onKeyDown={handleKeyDown}
                                inputMode="numeric"
                                maxLength={6}
                            />
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchDraft("");
                                    setSupportPinDraft("");
                                    setSearch("");
                                    setSupportPin("");
                                    setPage(1);
                                }}
                            >
                                Reset
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleSearch}
                            >
                                <Search className="w-4 h-4 mr-2" /> Search
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <DataTablePagination
                page={page}
                totalPages={pages}
                totalItems={total}
                pageSize={limit}
                currentCount={clients.length}
                itemLabel="records"
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                    setLimit(value);
                    setPage(1);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
            />

            {/* Clients Table */}
            <div className="rounded-md border bg-white dark:bg-gray-900">
                <Table>
                    <TableHeader className="bg-blue-900">
                        <TableRow className="hover:bg-blue-900/90 border-none">
                            <TableHead className="w-[40px] text-white"><Checkbox className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-blue-900" /></TableHead>
                            <TableHead className="w-[80px] text-white">
                                <div className="flex items-center gap-1 cursor-pointer">
                                    ID <ChevronDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="text-white font-semibold">First Name</TableHead>
                            <TableHead className="text-white font-semibold">Last Name</TableHead>
                            <TableHead className="text-white font-semibold">Company Name</TableHead>
                            <TableHead className="text-white font-semibold">Email Address</TableHead>
                            <TableHead className="text-white font-semibold">Services</TableHead>
                            <TableHead className="text-white font-semibold">Created</TableHead>
                            <TableHead className="text-right text-white font-semibold pr-4">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                    No clients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients
                                .filter((c) => {
                                    const status = getStatus(c);
                                    return true; // status filter can be added later if needed
                                })
                                .map((client) => (
                                    <TableRow key={client._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <TableCell><Checkbox /></TableCell>
                                        <TableCell className="font-medium text-blue-600">
                                            <Link href={`/admin/clients/${client._id}`} className="hover:underline">
                                                {client.clientId}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-blue-600 font-medium">
                                            <Link href={`/admin/clients/${client._id}`} className="hover:underline">
                                                {client.firstName}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-blue-600 font-medium">
                                            <Link href={`/admin/clients/${client._id}`} className="hover:underline">
                                                {client.lastName}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-300">
                                            <Link href={`/admin/clients/${client._id}`} className="hover:underline">
                                                {client.companyName || "—"}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-blue-600">
                                            <Link href={`/admin/clients/${client._id}`} className="hover:underline">
                                                {getEmail(client)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>—</TableCell>
                                        <TableCell className="text-gray-500">{formatDate(client.createdAt)}</TableCell>
                                        <TableCell className="text-right pr-4">
                                            <Badge
                                                className={`uppercase text-[10px] px-1.5 py-0.5 rounded-sm ${
                                                    getStatus(client) === "Active"
                                                        ? "bg-green-500 hover:bg-green-600"
                                                        : "bg-gray-500 hover:bg-gray-600"
                                                }`}
                                            >
                                                {getStatus(client)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
