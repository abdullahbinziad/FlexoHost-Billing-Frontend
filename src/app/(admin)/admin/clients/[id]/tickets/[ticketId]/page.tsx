"use client";

import { use } from "react";
import { AdminTicketDetailView } from "@/components/admin/tickets";

export default function AdminClientTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string; ticketId: string }>;
}) {
  const { id: clientId, ticketId } = use(params);
  return (
    <AdminTicketDetailView
      ticketId={ticketId}
      backHref={`/admin/clients/${clientId}/tickets`}
      backLabel="Back to Tickets"
    />
  );
}
