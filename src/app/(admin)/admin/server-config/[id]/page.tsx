"use client";

import { ServerForm } from "@/components/admin/servers/ServerForm";
import { devLog } from "@/lib/devLog";
import { ServerConfig } from "@/types/admin";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";
import { useGetServerQuery, useUpdateServerMutation, useSyncServerAccountsMutation } from "@/store/api/serverApi";
import { use } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EditServerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const { data: server, isLoading: isFetching, refetch } = useGetServerQuery(id);
    const [updateServer, { isLoading: isUpdating }] = useUpdateServerMutation();
    const [syncAccounts, { isLoading: isSyncing }] = useSyncServerAccountsMutation();

    const handleSubmit = async (data: Omit<ServerConfig, "id">) => {
        try {
            await updateServer({ id, data }).unwrap();
            toast.success("Server updated successfully");
            router.push("/admin/server-config");
        } catch (error) {
            toast.error("Failed to update server");
            devLog(error);
        }
    };

    const handleCancel = () => {
        router.push("/admin/server-config");
    };

    const handleSyncAccounts = async () => {
        try {
            const result = await syncAccounts(id).unwrap();
            toast.success(`Accounts: ${result.count} / ${result.maxAccounts}`);
            refetch();
        } catch (err: unknown) {
            const message = err && typeof err === "object" && "data" in err
                ? (err as { data?: { message?: string } }).data?.message
                : "Failed to sync accounts";
            toast.error(message ?? "Failed to sync accounts");
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!server) {
        return <div>Server not found</div>;
    }

    const isCpanel = server.module?.type === "cpanel";
    const accountsDisplay =
        server.accountCount != null
            ? `${server.accountCount} / ${server.maxAccounts ?? 200}`
            : "—";
    const lastSynced = server.accountCountSyncedAt
        ? new Date(server.accountCountSyncedAt).toLocaleString()
        : null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Edit Server: ${server.name}`}
                description="Update hosting server configuration."
                breadcrumbs={[
                    { label: "Server Config", href: "/admin/server-config" },
                    { label: server.name }
                ]}
                backHref="/admin/server-config"
            />
            {isCpanel && (
                <Card>
                    <CardHeader className="pb-2">
                        <span className="text-sm font-medium">cPanel accounts</span>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-4">
                        <div className="text-sm">
                            <span className="text-muted-foreground">Accounts: </span>
                            <span className="font-medium">{accountsDisplay}</span>
                            {lastSynced && (
                                <span className="text-muted-foreground text-xs ml-2">
                                    Last synced: {lastSynced}
                                </span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSyncAccounts}
                            disabled={isSyncing}
                            title="Sync account count from WHM"
                        >
                            {isSyncing ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Sync accounts
                        </Button>
                    </CardContent>
                </Card>
            )}
            {isUpdating ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <ServerForm
                    initialData={server}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
