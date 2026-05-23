"use client";

import { useParams } from "next/navigation";
import { ClientServiceListPage } from "@/components/admin/client-details/ClientServiceListPage";

export default function ClientHostingPage() {
  const params = useParams();
  const clientId = params?.id as string;

  return (
    <ClientServiceListPage
      clientId={clientId}
      type="hosting"
      title="Hosting"
      description="Manage this client's hosting services and packages."
      emptyMessage="No hosting services for this client."
    />
  );
}
