"use client";

import { ServerForm } from "@/components/admin/servers/ServerForm";
import { ServerConfig } from "@/types/admin";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";
import { useGetServerQuery, useUpdateServerMutation } from "@/store/api/serverApi";
import { use } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditServerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const { data: server, isLoading: isFetching } = useGetServerQuery(id);
    const [updateServer, { isLoading: isUpdating }] = useUpdateServerMutation();

    const handleSubmit = async (data: Omit<ServerConfig, "id">) => {
        try {
            await updateServer({ id, data }).unwrap();
            toast.success("Server updated successfully");
            router.push("/admin/server-config");
        } catch (error) {
            toast.error("Failed to update server");
            console.error(error);
        }
    };

    const handleCancel = () => {
        router.push("/admin/server-config");
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
