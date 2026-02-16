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
import { useGetServersQuery, useDeleteServerMutation } from "@/store/api/serverApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { ServerConfig } from "@/types/admin";

// Constants for filtering
const SERVER_GROUPS = [
    "Web Hosting",
    "BDIX Hosting",
    "Turbo Hosting",
    "Ecommerce Hosting",
    "VPS",
    "BDIX Vps"
];

const SERVER_LOCATIONS = [
    "USA",
    "Malaysia",
    "Singapore",
    "Bangladesh",
    "Germany",
    "Finland"
];

export default function ServerConfigPage() {
    const { data: servers = [], isLoading, refetch } = useGetServersQuery();
    const [deleteServer] = useDeleteServerMutation();

    const [filterGroup, setFilterGroup] = useState<string>("all");
    const [filterLocation, setFilterLocation] = useState<string>("all");

    const handleDeleteServer = async (id: string) => {
        try {
            await deleteServer(id).unwrap();
            toast.success("Server deleted successfully");
        } catch (error) {
            toast.error("Failed to delete server");
            console.error(error);
        }
    };

    const handleRefresh = () => {
        refetch();
        toast.info("Refreshed server data");
    };

    const resetFilters = () => {
        setFilterGroup("all");
        setFilterLocation("all");
    };

    // Filter servers
    const filteredServers = servers.filter((server) => {
        const matchesGroup = filterGroup === "all" || server.group === filterGroup;
        const matchesLocation = filterLocation === "all" || server.location === filterLocation;
        return matchesGroup && matchesLocation;
    });

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

                    <Select value={filterGroup} onValueChange={setFilterGroup}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Groups</SelectItem>
                            {SERVER_GROUPS.map((group) => (
                                <SelectItem key={group} value={group}>
                                    {group}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterLocation} onValueChange={setFilterLocation}>
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
                        <div>WHMCS Usage Stats</div>
                        <div>Remote Usage Stats</div>
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
                            {filteredServers.some((s) => s.module.type === "cpanel") && (
                                <div className="bg-muted/30 px-4 py-2 font-semibold text-sm border-b">
                                    cPanel
                                </div>
                            )}
                            {filteredServers
                                .filter((s) => s.module.type === "cpanel")
                                .map((server) => (
                                    <ServerRow
                                        key={server.id}
                                        server={server}
                                        onDelete={() => handleDeleteServer(server.id)}
                                    />
                                ))}

                            {/* Virtualizor Section */}
                            {filteredServers.some((s) => s.module.type === "virtualizor") && (
                                <div className="bg-muted/30 px-4 py-2 font-semibold text-sm border-b">
                                    Virtualizor cloud
                                </div>
                            )}
                            {filteredServers
                                .filter((s) => s.module.type === "virtualizor")
                                .map((server) => (
                                    <ServerRow
                                        key={server.id}
                                        server={server}
                                        onDelete={() => handleDeleteServer(server.id)}
                                    />
                                ))}

                            {/* Other/Generic Section - Grouped by request */}
                            {filteredServers
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
        </div>
    );
}

function ServerRow({ server, onDelete }: { server: ServerConfig; onDelete: () => void }) {
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
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                        {server.group && <span className="mr-2">{server.group}</span>}
                        {server.location && <span>({server.location})</span>}
                    </div>
                </div>
                <div className="text-sm font-mono truncate">{server.ipAddress}</div>
                <div className="text-sm">{server.stats?.whmcsUsage || "-"}</div>
                <div className="text-sm">{server.stats?.remoteUsage || "-"}</div>
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
