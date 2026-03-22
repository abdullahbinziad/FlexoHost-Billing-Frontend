"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  useGetTicketByIdQuery,
  useAddTicketReplyMutation,
  useUpdateTicketStatusMutation,
} from "@/store/api/ticketApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, User, Headphones, MessageCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { formatDate } from "@/utils/format";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { buildAttachmentUrl } from "@/lib/safeAttachmentUrl";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TicketReplyForm } from "@/components/shared/ticket/TicketReplyForm";
import {
  TicketStatusBadge,
  TICKET_STATUS_LABELS,
} from "@/components/shared/ticket/TicketStatusBadge";
import { TicketPriorityBadge } from "@/components/shared/ticket/TicketPriorityBadge";
import { devLog } from "@/lib/devLog";

const ADMIN_STATUS_LABELS: Record<string, string> = {
  ...TICKET_STATUS_LABELS,
  answered: "Answered (waiting client)",
  customer_reply: "Customer replied",
};

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const params = useParams<{ ticketId: string }>();
  const ticketId = params.ticketId;
  const { data, isLoading, error, refetch } = useGetTicketByIdQuery(ticketId);
  const [addReply, { isLoading: isReplying }] = useAddTicketReplyMutation();
  const [updateStatus] = useUpdateTicketStatusMutation();

  const ticket = data?.ticket;
  const messages = data?.messages ?? [];
  const client = data?.client;

  const handleReply = async (args: {
    id: string;
    message: string;
    messageHtml?: string;
    attachments?: File[];
  }) => {
    await addReply(args).unwrap();
    refetch();
  };

  const handleStatusChange = async (value: string) => {
    if (!ticket) return;
    try {
      await updateStatus({ id: ticket._id, status: value as any }).unwrap();
      refetch();
      toast.success(`Status updated to ${ADMIN_STATUS_LABELS[value] ?? value}.`);
    } catch (e) {
      devLog(e);
      toast.error("Failed to update status.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <p className="text-destructive">Failed to load ticket.</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tickets
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {ticket.ticketNumber}
            </h1>
            <TicketStatusBadge
              status={ticket.status}
              label={ADMIN_STATUS_LABELS[ticket.status]}
            />
          </div>
          <p className="mt-1 text-base font-medium text-foreground sm:text-lg">
            {ticket.subject}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="capitalize">{ticket.department}</span>
            <span aria-hidden>•</span>
            <TicketPriorityBadge priority={ticket.priority} />
            <span aria-hidden>•</span>
            <span>Opened {formatDate(ticket.createdAt)}</span>
          </div>
        </div>
        <Select
          value={ticket.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="answered">Answered (waiting client)</SelectItem>
              <SelectItem value="customer_reply">Customer replied</SelectItem>
              <SelectItem value="on_hold">On hold</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Reply + Messages */}
        <div className="space-y-6 lg:col-span-2">
          {/* Reply box (only if not closed) */}
          {ticket.status !== "closed" && ticket.status !== "resolved" && (
            <Card className="border-primary/20">
              <CardHeader className="border-b bg-muted/30 py-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Reply to Ticket
                </h3>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <TicketReplyForm
                  ticketId={ticketId}
                  onSubmit={handleReply}
                  isSubmitting={isReplying}
                  onSuccess={refetch}
                  variant="card"
                  label=""
                  placeholder="Type your reply here..."
                />
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((m) => {
              const isClient = m.authorType === "client";
              return (
                <Card
                  key={m._id}
                  className={cn(
                    "overflow-hidden transition-shadow",
                    isClient
                      ? "border-muted"
                      : "border-primary/20 bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                      isClient
                        ? "bg-muted/30"
                        : "bg-primary/10 dark:bg-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          isClient
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        {isClient ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Headphones className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {isClient ? "Client" : "Support Staff"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isClient ? "Client Message" : "Staff Reply"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground sm:text-right">
                      {formatDate(m.createdAt)}
                    </p>
                  </div>
                  <CardContent className="space-y-3 p-4 text-sm leading-relaxed">
                    {m.messageHtml ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.messageHtml) }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    )}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {m.attachments.map((att, index) => {
                          const src = buildAttachmentUrl(att.url);
                          return (
                            <a
                              key={`${att.url}-${index}`}
                              href={src}
                              target="_blank"
                              rel="noreferrer"
                              className="block relative h-20 w-20 overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90 sm:h-24 sm:w-24"
                            >
                              <Image
                                src={src}
                                alt={att.filename}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {messages.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No messages yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm font-semibold">
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-medium">{ticket.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium capitalize">{ticket.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opened</span>
                <span className="font-medium">
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Response</span>
                <span className="font-medium">
                  {ticket.lastRepliedAt
                    ? formatDate(ticket.lastRepliedAt)
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm font-semibold">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Name</span>
                <span className="font-medium text-right">
                  {client
                    ? `${client.firstName} ${client.lastName}`.trim() || "—"
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Email</span>
                <span className="font-medium text-right">
                  {client?.contactEmail || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Phone</span>
                <span className="font-medium text-right">
                  {client?.phoneNumber || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium">
                  {client?.address || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Client ID</span>
                <span className="font-medium">{ticket.clientId}</span>
              </div>
            </CardContent>
            <CardFooter className="border-t p-3">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/admin/clients/${ticket.clientId}`}>
                  View Client Profile
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
