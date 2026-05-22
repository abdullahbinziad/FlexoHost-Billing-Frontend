"use client";

import { useParams } from "next/navigation";
import { AdminTicketDetailView } from "@/components/admin/tickets";

export default function AdminTicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = params.ticketId;
  if (!ticketId) {
    return null;
  }
  return (
    <AdminTicketDetailView ticketId={ticketId} backHref="/admin/tickets" backLabel="Back to Tickets" />
  );
}
