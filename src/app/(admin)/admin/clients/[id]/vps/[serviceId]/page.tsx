"use client";

import { useParams } from "next/navigation";
import { ClientServiceDetailContent } from "@/components/admin/services/ClientServiceDetailContent";

export default function ClientVpsDetailPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const serviceId = params?.serviceId as string;

  return <ClientServiceDetailContent clientId={clientId} serviceId={serviceId} />;
}
