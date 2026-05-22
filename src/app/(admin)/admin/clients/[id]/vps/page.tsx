"use client";

import { useParams } from "next/navigation";
import { ClientServiceListPage } from "@/components/admin/client-details/ClientServiceListPage";

export default function ClientVpsPage() {
  const params = useParams();
  const clientId = params?.id as string;

  return (
    <ClientServiceListPage
      clientId={clientId}
      type="vps"
      title="VPS"
      description="Manage this client's VPS services."
      emptyMessage="No VPS services for this client."
    />
  );
}
