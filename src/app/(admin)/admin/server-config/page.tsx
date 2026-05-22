"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Plus, Trash2, Edit, Filter, X } from "lucide-react";
import { useGetServersQuery, useDeleteServerMutation, useSyncServerAccountsMutation } from "@/store/api/serverApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { devLog } from "@/lib/devLog";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getServerGroups, SERVER_GROUP_OPTIONS, type ServerConfig, type ServerGroupOption } from "@/types/admin";

const SERVER_LOCATIONS = [
    "USA",
    "Malaysia",
    "Singapore",
    "Bangladesh",
    "Germany",
    "Finland",
] as const;

type FilterGroup = "all" | ServerGroupOption;
type FilterLocation = "all" | (typeof SERVER_LOCATIONS)[number];

export default function ServerConfigPage() {
    const { data: servers = [], isLoading, refetch } = useGetServersQuery();
    const [deleteServer] = useDeleteServerMutation();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [filterGroup, setFilterGroup] = useState<FilterGroup>("all");
    const [filterLocation, setFilterLocation] = useState<FilterLocation>("all");

    const handleGroupChange = (value: string) => {
        setFilterGroup(value as FilterGroup);
        setPage(1);
    };
    const handleLocationChange = (value: string) => {
        setFilterLocation(value as FilterLocation);
        setPage(1);
    };

    const handleDeleteServer = async (id: string) => {
        try {
            await deleteServer(id).unwrap();
            toast.success("Server deleted successfully");
        } catch (error) {
            toast.error("Failed to delete server");
            devLog(error);
        }
    };

    const handleRefresh = () => {
        refetch();
        toast.info("Refreshed server data");
    };

    const resetFilters = () => {
        setFilterGroup("all");
        setFilterLocation("all");
        setPage(1);
    };

    // Filter servers (server can be in multiple groups)
    const filteredServers = servers.filter((server) => {
        const serverGroups = getServerGroups(server);
        const matchesGroup = filterGroup === "all" || serverGroups.includes(filterGroup);
        const matchesLocation = filterLocation === "all" || server.location === filterLocation;
        return matchesGroup && matchesLocation;
    });
    const paginatedServers = filteredServers.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredServers.length / pageSize) || 1;

    // Get unique groups and locations for filter options
    // These are now derived from constants, not server data
    // const uniqueGroups = Array.from(new Set(servers.map((s) => s.group).filter(Boolean))); // Removed
    // const uniqueLocations = Array.from(new Set(servers.map((s) => s.location).filter(Boolean))); // Removed

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Servers</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configure your servers for WHMCS communication.
                        Default servers are marked with an asterisk (*).
                    </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Link href="/admin/server-config/add">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Server
                    </Button>
                </Link>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <Select value={filterGroup} onValueChange={handleGroupChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Groups</SelectItem>
                            {SERVER_GROUP_OPTIONS.map((group) => (
                                <SelectItem key={group} value={group}>
                                    {group}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterLocation} onValueChange={handleLocationChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {SERVER_LOCATIONS.map((location) => (
                                <SelectItem key={location} value={location}>
                                    {location}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(filterGroup !== "all" || filterLocation !== "all") && (
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 lg:px-3">
                            <X className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Servers Table */}
            <Card>
                <CardHeader className="bg-primary text-primary-foreground">
                    <div className="grid grid-cols-6 gap-4 font-semibold">
                        <div>Server Name</div>
                        <div>IP Address</div>
                        <div>Accounts</div>
                        <div>WHMCS Usage Stats</div>
                        <div>Status</div>
                        <div></div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredServers.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {servers.length === 0
                                ? 'No servers configured yet. Click "Add New Server" to get started.'
                                : "No servers match your current filters."}
                        </div>
                    ) : (
                        <>
                            {/* cPanel Section */}
                            {paginatedServers.some((s) => s.module.type === "cpanel") && (
                                <div className="bg-muted/30 px-4 py-2 font-semibold text-sm border-b">
                                    cPanel
                                </div>
                            )}
                            {paginatedServers
                                .filter((s) => s.module.type === "cpanel")
                                .map((server) => (
                                    <ServerRow
                                        key={server.id}
                                        server={server}
                                        onDelete={() => handleDeleteServer(server.id)}
                                    />
                                ))}

                            {/* Virtualizor Section */}
                            {paginatedServers.some((s) => s.module.type === "virtualizor") && (
                                <div className="bg-muted/30 px-4 py-2 font-semibold text-sm border-b">
                                    Virtualizor cloud
                                </div>
                            )}
                            {paginatedServers
                                .filter((s) => s.module.type === "virtualizor")
                                .map((server) => (
                                    <ServerRow
                                        key={server.id}
                                        server={server}
                                        onDelete={() => handleDeleteServer(server.id)}
                                    />
                                ))}

                            {/* Other/Generic Section - Grouped by request */}
                            {paginatedServers
                                .filter((s) => s.module.type !== "cpanel" && s.module.type !== "virtualizor")
                                .map((server) => (
                                    <ServerRow
                                        key={server.id}
                                        server={server}
                                        onDelete={() => handleDeleteServer(server.id)}
                                    />
                                ))}
                        </>
                    )}
                </CardContent>
            </Card>
            <DataTablePagination
                page={page}
                totalPages={totalPages}
                totalItems={filteredServers.length}
                pageSize={pageSize}
                currentCount={paginatedServers.length}
                itemLabel="servers"
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(1);
                }}
            />
        </div>
    );
}

function ServerRow({ server, onDelete }: { server: ServerConfig; onDelete: () => void }) {
    const [syncAccounts, { isLoading: isSyncing }] = useSyncServerAccountsMutation();
    const isCpanel = server.module?.type === "cpanel";
    const accountsDisplay =
        server.accountCount != null
            ? `${server.accountCount} / ${server.maxAccounts ?? 200}`
            : "—";

    const handleSyncAccounts = async () => {
        try {
            const result = await syncAccounts(server.id).unwrap();
            toast.success(`Accounts: ${result.count} / ${result.maxAccounts}`);
        } catch (err: unknown) {
            const message = err && typeof err === "object" && "data" in err
                ? (err as { data?: { message?: string } }).data?.message
                : "Failed to sync accounts";
            toast.error(message ?? "Failed to sync accounts");
        }
    };

    return (
        <div className="border-b last:border-0 hover:bg-muted/5 transition-colors">
            <div className="grid grid-cols-6 gap-4 px-4 py-3 items-center">
                <div className="overflow-hidden">
                    <Link
                        href={`/admin/server-config/${server.id}`}
                        className="text-primary hover:underline font-medium truncate block"
                    >
                        {server.name}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                        {getServerGroups(server).map((g) => (
                            <span key={g}>{g}</span>
                        ))}
                        {server.location && <span>({server.location})</span>}
                    </div>
                </div>
                <div className="text-sm font-mono truncate">{server.ipAddress}</div>
                <div className="text-sm flex items-center gap-2">
                    {accountsDisplay}
                    {isCpanel && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            onClick={handleSyncAccounts}
                            disabled={isSyncing}
                            title="Sync account count from WHM"
                        >
                            {isSyncing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                            )}
                        </Button>
                    )}
                </div>
                <div className="text-sm">{server.stats?.whmcsUsage || "-"}</div>
                <div>
                    <Badge
                        variant={server.isEnabled ? "default" : "secondary"}
                        className={server.isEnabled ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                        {server.isEnabled ? "Active" : "Disabled"}
                    </Badge>
                </div>
                <div className="flex gap-2 justify-end">
                    <Link href={`/admin/server-config/${server.id}`}>
                        <Button size="icon" variant="ghost" title="Edit Server">
                            <Edit className="w-4 h-4" />
                        </Button>
                    </Link>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete Server"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Server?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{server.name}</strong>? This action
                                    cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
