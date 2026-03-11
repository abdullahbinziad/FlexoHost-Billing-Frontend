"use client";

import { ServerForm } from "@/components/admin/servers/ServerForm";
import { ServerConfig } from "@/types/admin";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";
import { useAddServerMutation } from "@/store/api/serverApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AddServerPage() {
    const router = useRouter();
    const [addServer, { isLoading }] = useAddServerMutation();

    const handleSubmit = async (data: Omit<ServerConfig, "id">) => {
        if (data.module?.type === "cpanel" && !(data.module?.apiToken ?? "").trim()) {
            toast.error("API Token is required for cPanel servers (needed for account creation and package listing)");
            return;
        }
        try {
            await addServer(data).unwrap();
            toast.success("Server created successfully");
            router.push("/admin/server-config");
        } catch (error) {
            toast.error("Failed to create server");
            console.error(error);
        }
    };

    const handleCancel = () => {
        router.push("/admin/server-config");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Server"
                description="Configure a new hosting server connection."
                breadcrumbs={[
                    { label: "Server Config", href: "/admin/server-config" },
                    { label: "Add New Server" }
                ]}
                backHref="/admin/server-config"
            />
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <ServerForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
