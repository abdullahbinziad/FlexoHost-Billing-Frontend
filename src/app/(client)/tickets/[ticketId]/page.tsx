"use client";

import { useRouter, useParams } from "next/navigation";
import {
  useGetTicketByIdQuery,
  useAddTicketReplyMutation,
  useMarkTicketResolvedMutation,
} from "@/store/api/ticketApi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Headphones, CheckCircle, RefreshCw } from "lucide-react";
import { formatDate } from "@/utils/format";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { buildAttachmentUrl } from "@/lib/safeAttachmentUrl";
import { cn } from "@/lib/utils";
import { TicketReplyForm } from "@/components/shared/ticket/TicketReplyForm";
import { toast } from "sonner";
import { TicketStatusBadge, TICKET_STATUS_LABELS } from "@/components/shared/ticket/TicketStatusBadge";
import { TicketPriorityBadge } from "@/components/shared/ticket/TicketPriorityBadge";
import { devLog } from "@/lib/devLog";

const CLIENT_STATUS_LABELS: Record<string, string> = {
  ...TICKET_STATUS_LABELS,
  answered: "Answered (waiting on you)",
  customer_reply: "Your reply sent",
  resolved: "Resolved",
};

export default function ClientTicketDetailPage() {
  const router = useRouter();
  const params = useParams<{ ticketId: string }>();
  const ticketId = params.ticketId;
  const { data, isLoading, error, refetch, isFetching } = useGetTicketByIdQuery(ticketId);
  const [addReply, { isLoading: isReplying }] = useAddTicketReplyMutation();
  const [markResolved, { isLoading: isResolving }] = useMarkTicketResolvedMutation();

  const ticket = data?.ticket;
  const messages = data?.messages ?? [];

  const handleReply = async (args: {
    id: string;
    message: string;
    messageHtml?: string;
    attachments?: File[];
  }) => {
    await addReply(args).unwrap();
    refetch();
  };

  const handleMarkResolved = async () => {
    try {
      await markResolved(ticketId).unwrap();
      refetch();
      toast.success("Ticket marked as resolved.");
    } catch (e) {
      devLog(e);
      toast.error("Failed to mark ticket as resolved.");
    }
  };

  const isClosedOrResolved =
    ticket?.status === "closed" || ticket?.status === "resolved";

  const handleReloadMessages = async () => {
    const result = await refetch();
    if (result.error) {
      toast.error("Could not refresh replies.");
      return;
    }
    toast.success("Replies updated.");
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
      {/* Back + Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                {ticket.ticketNumber}
              </h1>
              <TicketStatusBadge
                status={ticket.status}
                label={CLIENT_STATUS_LABELS[ticket.status]}
              />
              {!isClosedOrResolved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkResolved}
                  disabled={isResolving}
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/50"
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  {isResolving ? "Marking..." : "Mark as Resolved"}
                </Button>
              )}
            </div>
            <p className="mt-1 text-base font-medium text-foreground sm:text-lg">
              {ticket.subject}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="capitalize">{ticket.department}</span>
              <span aria-hidden>•</span>
              <TicketPriorityBadge priority={ticket.priority} />
              <span aria-hidden>•</span>
              <span>Created {formatDate(ticket.createdAt)}</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReloadMessages}
            disabled={isFetching}
            className="shrink-0"
            aria-label="Reload replies"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
            Reload
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((m) => {
          const isClient = m.authorType === "client";
          return (
            <div
              key={m._id}
              className={cn(
                "rounded-xl border p-4 shadow-sm transition-shadow",
                isClient
                  ? "ml-0 mr-0 border-primary/20 bg-primary/5 dark:bg-primary/10 sm:ml-8"
                  : "mr-0 ml-0 border-muted bg-card sm:mr-8"
              )}
            >
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      isClient
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
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
                      {isClient ? "You" : "Support"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-sm">
                {m.messageHtml ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none leading-relaxed [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.messageHtml) }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                )}
              </div>
              {m.attachments && m.attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
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
            </div>
          );
        })}
        {messages.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No messages yet. Be the first to reply.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply box */}
      {!isClosedOrResolved && (
        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <TicketReplyForm
              ticketId={ticketId}
              onSubmit={handleReply}
              isSubmitting={isReplying}
              onSuccess={refetch}
              variant="plain"
              label="Your Reply"
              placeholder="Type your reply here..."
            />
          </CardContent>
        </Card>
      )}

      {isClosedOrResolved && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            This ticket is{" "}
            {ticket.status === "resolved" ? "resolved" : "closed"}. Open a new
            ticket if you need further assistance.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
