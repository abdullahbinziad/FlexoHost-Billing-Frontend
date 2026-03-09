"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getServerGroups, SERVER_GROUP_OPTIONS, type ServerGroupOption } from "@/types/admin";
import { RefreshCw, Plus, Trash2, Edit, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function ServerConfigPage() {
    const { data: servers = [], isLoading: isServersLoading, refetch: refetchServers } = useGetServersQuery();
    const [deleteServer] = useDeleteServerMutation();
    const [filterGroup, setFilterGroup] = useState<"all" | ServerGroupOption>("all");

    const handleFilterChange = (value: string) => {
        setFilterGroup(value as "all" | ServerGroupOption);
    };

    const filteredServers = servers.filter((server) => {
        const serverGroupsList = getServerGroups(server);
        return filterGroup === "all" || serverGroupsList.includes(filterGroup);
    });

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
        refetchServers();
        toast.info("Refreshed server data");
    };

    if (isServersLoading) {
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
                        This is where you configure all your servers so that WHMCS can communicate with them.
                        The default server for each module is marked with an asterisk *. You must select a default server for automatic setup to function correctly.
                    </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-2">
                    <Link href="/admin/server-config/add">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Server
                        </Button>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter by group:</span>
                    <Select value={filterGroup} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All groups" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All groups</SelectItem>
                            {SERVER_GROUP_OPTIONS.map((g) => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {filterGroup !== "all" && (
                        <Button variant="ghost" size="sm" onClick={() => setFilterGroup("all")} className="h-8 px-2">
                            <X className="w-4 h-4 mr-1" /> Reset
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
                                ? "No servers configured yet. Click \"Add New Server\" to get started."
                                : "No servers match the selected group filter."}
                        </div>
                    ) : (
                        <>
                            {/* cPanel Section */}
                            {filteredServers.some(s => s.module.type === "cpanel") && (
                                <div className="bg-muted/30 px-4 py-2 font-semibold text-sm border-b">
                                    cPanel
                                </div>
                            )}
                            {filteredServers.filter(s => s.module.type === "cpanel").map((server) => (
                                <ServerRow
                                    key={server.id}
                                    server={server}
                                    onDelete={() => handleDeleteServer(server.id)}
                                />
                            ))}

                            {/* Virtualizor Section */}
                            {filteredServers.some(s => s.module.type === "virtualizor") && (
                                <div className="bg-muted/30 px-4 py-2 font-semibold text-sm border-b">
                                    Virtualizor cloud
                                </div>
                            )}
                            {filteredServers.filter(s => s.module.type === "virtualizor").map((server) => (
                                <ServerRow
                                    key={server.id}
                                    server={server}
                                    onDelete={() => handleDeleteServer(server.id)}
                                />
                            ))}
                            {/* Other/Generic Section */}
                            {filteredServers.filter(s => s.module.type !== "cpanel" && s.module.type !== "virtualizor").map((server) => (
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

function ServerRow({ server, onDelete }: { server: any, onDelete: () => void }) {
    return (
        <div className="border-b last:border-0 hover:bg-muted/5 transition-colors">
            <div className="grid grid-cols-6 gap-4 px-4 py-3 items-center">
                <div className="overflow-hidden">
                    <Link href={`/admin/server-config/${server.id}`} className="text-primary hover:underline font-medium truncate block">
                        {server.name}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                        {getServerGroups(server).map((g) => (
                            <span key={g}>{g}</span>
                        ))}
                    </div>
                    {server.module.type === "cpanel" && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {server.stats?.version && `v${server.stats.version}`}
                            {server.stats?.loadAverage && ` | Load: ${server.stats.loadAverage}`}
                        </div>
                    )}
                </div>
                <div className="text-sm font-mono truncate">{server.ipAddress}</div>
                <div className="text-sm">{server.stats?.whmcsUsage || "-"}</div>
                <div className="text-sm">{server.stats?.remoteUsage || "-"}</div>
                <div>
                    <Badge variant={server.isEnabled ? "default" : "secondary"} className={server.isEnabled ? "bg-green-500 hover:bg-green-600" : ""}>
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
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete Server">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Server?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{server.name}</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}
