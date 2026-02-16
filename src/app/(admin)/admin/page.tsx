"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServerGroupForm } from "@/components/admin/servers/ServerGroupForm";
import { ServerGroup } from "@/types/admin";
import { RefreshCw, Plus, Trash2, Edit } from "lucide-react";
import {
    useGetServersQuery,
    useGetServerGroupsQuery,
    useCreateServerGroupMutation,
    useDeleteServerMutation,
    useDeleteServerGroupMutation
} from "@/store/api/serverApi";
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
    const { data: serverGroups = [], isLoading: isGroupsLoading, refetch: refetchGroups } = useGetServerGroupsQuery();

    const [createServerGroup] = useCreateServerGroupMutation();
    const [deleteServer] = useDeleteServerMutation();
    const [deleteServerGroup] = useDeleteServerGroupMutation();

    const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);

    const handleCreateGroup = async (data: Omit<ServerGroup, "id">) => {
        try {
            await createServerGroup(data).unwrap();
            toast.success("Server group created successfully");
            setIsGroupFormOpen(false);
        } catch (error) {
            toast.error("Failed to create server group");
            console.error(error);
        }
    };

    const handleDeleteServer = async (id: string) => {
        try {
            await deleteServer(id).unwrap();
            toast.success("Server deleted successfully");
        } catch (error) {
            toast.error("Failed to delete server");
            console.error(error);
        }
    };

    const handleDeleteGroup = async (id: string) => {
        try {
            await deleteServerGroup(id).unwrap();
            toast.success("Server group deleted successfully");
        } catch (error) {
            toast.error("Failed to delete server group");
            console.error(error);
        }
    };

    const handleRefresh = () => {
        refetchServers();
        refetchGroups();
        toast.info("Refreshed server data");
    };

    const availableServersForGroup = servers.map(s => ({ id: s.id, name: s.name }));

    if (isServersLoading || isGroupsLoading) {
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

            <div className="flex gap-2">
                <Link href="/admin/server-config/add">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Server
                    </Button>
                </Link>
                <Button variant="outline" onClick={() => setIsGroupFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Group
                </Button>
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
                    {servers.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No servers configured yet. Click "Add New Server" to get started.
                        </div>
                    ) : (
                        <>
                            {/* cPanel Section */}
                            {servers.some(s => s.module.type === "cpanel") && (
                                <div className="bg-muted/30 px-4 py-2 font-semibold text-sm border-b">
                                    cPanel
                                </div>
                            )}
                            {servers.filter(s => s.module.type === "cpanel").map((server) => (
                                <ServerRow
                                    key={server.id}
                                    server={server}
                                    onDelete={() => handleDeleteServer(server.id)}
                                />
                            ))}

                            {/* Virtualizor Section */}
                            {servers.some(s => s.module.type === "virtualizor") && (
                                <div className="bg-muted/30 px-4 py-2 font-semibold text-sm border-b">
                                    Virtualizor cloud
                                </div>
                            )}
                            {servers.filter(s => s.module.type === "virtualizor").map((server) => (
                                <ServerRow
                                    key={server.id}
                                    server={server}
                                    onDelete={() => handleDeleteServer(server.id)}
                                />
                            ))}
                            {/* Other/Generic Section */}
                            {servers.filter(s => s.module.type !== "cpanel" && s.module.type !== "virtualizor").map((server) => (
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

            {/* Groups Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Groups</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Server groups allow you to configure sets of servers to assign products to and have new orders rotate around servers within that group or fill until full.
                    </p>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Group Name</TableHead>
                                <TableHead>Fill Type</TableHead>
                                <TableHead>Servers</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {serverGroups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No server groups found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                serverGroups.map((group) => (
                                    <TableRow key={group.id}>
                                        <TableCell className="font-medium">{group.name}</TableCell>
                                        <TableCell>
                                            {group.fillType === "least-full"
                                                ? "Add to the least full server"
                                                : "Fill active server until full then switch to next least used"}
                                        </TableCell>
                                        <TableCell>{group.servers.join(", ")}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="ghost">Edit</Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="ghost" className="text-destructive">Delete</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the server group.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteGroup(group.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Server Group Form Modal */}
            <ServerGroupForm
                open={isGroupFormOpen}
                onOpenChange={setIsGroupFormOpen}
                onSubmit={handleCreateGroup}
                availableServers={availableServersForGroup}
            />
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
                    {server.module.type === "cpanel" && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
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
