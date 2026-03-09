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

export default function ViewSearchClients() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("any");

    const { data, isLoading, error, refetch } = useGetClientsQuery({
        page,
        limit,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(companyName && { companyName }),
    });

    const clients = data?.clients ?? [];
    const total = data?.total ?? 0;
    const pages = data?.pages ?? 1;

    const handleSearch = () => {
        setPage(1);
        refetch();
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
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">First Name</label>
                            <Input
                                placeholder="Search by first name"
                                className="bg-white dark:bg-background"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                            <Input
                                placeholder="Search by last name"
                                className="bg-white dark:bg-background"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                            <Input
                                placeholder="Search by company"
                                className="bg-white dark:bg-background"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-white dark:bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2 items-end">
                        <Button variant="outline" onClick={() => { setFirstName(""); setLastName(""); setCompanyName(""); setPage(1); refetch(); }}>
                            Reset
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSearch}>
                            <Search className="w-4 h-4 mr-2" /> Search
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Results Info Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground bg-white dark:bg-gray-900 p-2 rounded-md border border-dashed border-gray-200 dark:border-gray-800">
                <span>
                    {total} Record{total !== 1 ? "s" : ""} Found
                    {total > 0 && `, Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, total)}`}
                </span>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    {pages > 1 && (
                        <div className="flex items-center gap-2">
                            <span>Page:</span>
                            <Select value={String(page)} onValueChange={(v) => setPage(Number(v))}>
                                <SelectTrigger className="w-16 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                        <SelectItem key={p} value={String(p)}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span>Per page:</span>
                        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-14 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

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
                                    if (statusFilter === "any") return true;
                                    const status = getStatus(c);
                                    return statusFilter === "active" ? status === "Active" : status === "Inactive";
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
