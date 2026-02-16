import { ClientDetailsHeader } from "@/components/admin/client-details/ClientDetailsHeader";
import { ClientTabs } from "@/components/admin/client-details/ClientTabs";

// Mock Data for the selected client
const mockClient = {
    id: 118,
    firstName: "Moshiur",
    lastName: "Rahman",
    companyName: "CareUp Beauty Store",
    email: "moshiur.r4n@gmail.com",
    status: "Active",
    address: "Dhaka, Bangladesh",
    created: "06/02/2026",
    role: "Client"
};

export default function ClientLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    // In a real application, you would fetch the client data here using the ID.
    // const client = await getClient(params.id);

    // For this design implementation, we use the mock client with the ID from params
    const client = { ...mockClient, id: params.id };

    return (
        <div className="space-y-6">
            <ClientDetailsHeader client={client} />
            <ClientTabs clientId={params.id} />
            <main className="min-h-[400px]">
                {children}
            </main>
        </div>
    );
}
