"use client";

import { useParams } from "next/navigation";
import { useGetClientByIdQuery } from "@/store/api/clientApi";
import { ClientDetailsHeader } from "./ClientDetailsHeader";
import { ClientTabs } from "./ClientTabs";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/utils/format";

export function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const id = params?.id as string;

    const { data: client, isLoading, error } = useGetClientByIdQuery(id, { skip: !id });

    const getEmail = () =>
        client?.contactEmail || (client?.user as { email?: string })?.email || "—";

    const getStatus = () => {
        const active = (client?.user as { active?: boolean })?.active;
        return active !== false ? "Active" : "Inactive";
    };

    const formatAddress = () => {
        if (!client?.address) return undefined;
        const a = client.address as { street?: string; city?: string; state?: string; postCode?: string; country?: string };
        const parts = [a.street, a.city, a.state, a.postCode, a.country].filter(Boolean);
        return parts.length ? parts.join(", ") : undefined;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="p-6 text-center text-destructive">
                Client not found or failed to load.
            </div>
        );
    }

    const headerClient = {
        id: client.clientId ?? client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        companyName: client.companyName,
        email: getEmail(),
        status: getStatus(),
        address: formatAddress(),
        created: client.createdAt ? formatDate(client.createdAt) : undefined,
    };

    return (
        <div className="space-y-6">
            <ClientDetailsHeader client={headerClient} />
            <ClientTabs clientId={id} />
            <main className="min-h-[400px]">{children}</main>
        </div>
    );
}
