"use client";

import { useParams } from "next/navigation";
import { ClientServiceListPage } from "@/components/admin/client-details/ClientServiceListPage";

export default function ClientEmailServicesPage() {
  const params = useParams();
  const clientId = params?.id as string;

  return (
    <ClientServiceListPage
      clientId={clientId}
      type="email"
      title="Email Services"
      description="Manage this client's email-related services."
      emptyMessage="No email services for this client."
    />
  );
}
