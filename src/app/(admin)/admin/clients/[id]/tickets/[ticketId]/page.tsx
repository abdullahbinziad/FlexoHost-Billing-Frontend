"use client";

import { use, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, MessageCircle, MoreHorizontal, Paperclip, Send } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useAddTicketReplyMutation,
} from "@/store/api/ticketApi";
import type { TicketStatus } from "@/store/api/ticketApi";
import { formatDateTime } from "@/utils/format";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { Loader2 } from "lucide-react";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "answered", label: "Answered" },
  { value: "customer_reply", label: "Customer Reply" },
  { value: "on_hold", label: "On Hold" },
  { value: "in_progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
  { value: "resolved", label: "Resolved" },
];

function statusBadge(status: TicketStatus): string {
  if (status === "resolved" || status === "closed") return "bg-gray-500 hover:bg-gray-600";
  if (status === "open" || status === "customer_reply") return "bg-amber-500 hover:bg-amber-600";
  return "bg-green-500 hover:bg-green-600";
}

export default function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string; ticketId: string }>;
}) {
  const { id: clientId, ticketId } = use(params);
  const [replyText, setReplyText] = useState("");
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesPageSize, setMessagesPageSize] = useState(10);

  const { data, isLoading, error } = useGetTicketByIdQuery(ticketId, { skip: !ticketId });
  const [updateStatus] = useUpdateTicketStatusMutation();
  const [addReply, { isLoading: isSending }] = useAddTicketReplyMutation();

  const ticket = data?.ticket;
  const messages = data?.messages ?? [];
  const client = data?.client;
  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const paginatedMessages = orderedMessages.slice(
    (messagesPage - 1) * messagesPageSize,
    messagesPage * messagesPageSize
  );

  const handleStatusChange = (status: TicketStatus) => {
    updateStatus({ id: ticketId, status }).catch(() => {});
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    addReply({ id: ticketId, message: replyText.trim() })
      .then(() => setReplyText(""))
      .catch(() => {});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="font-medium text-destructive">Ticket not found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          It may have been deleted or the link is incorrect.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/admin/clients/${clientId}/tickets`}>Back to Tickets</Link>
        </Button>
      </div>
    );
  }

  const clientName =
    client?.firstName || client?.lastName
      ? [client.firstName, client.lastName].filter(Boolean).join(" ")
      : "Client";

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" asChild>
          <Link href={`/admin/clients/${clientId}/tickets`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            #{ticket.ticketNumber} – {ticket.subject}
            <Badge className={statusBadge(ticket.status)}>{ticket.status.replace(/_/g, " ")}</Badge>
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span>Department: {ticket.department}</span>
            <span>•</span>
            <span>Priority: {ticket.priority}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Merge Ticket</DropdownMenuItem>
              <DropdownMenuItem>Block Sender</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete Ticket</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="py-3 bg-gray-50 dark:bg-gray-800/50 border-b">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Reply to Ticket
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Textarea
                placeholder="Type your reply here..."
                className="min-h-[150px]"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4 mr-2" /> Attach Files
                </Button>
                <Button onClick={handleSendReply} disabled={isSending || !replyText.trim()}>
                  {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Send className="w-4 h-4 mr-2" /> Send Reply
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  No messages yet.
                </CardContent>
              </Card>
            ) : (
              paginatedMessages.map((msg) => {
                const isStaff = msg.authorType === "staff" || msg.authorType === "system";
                return (
                  <Card
                    key={msg._id}
                    className={
                      isStaff
                        ? "border-blue-100 dark:border-blue-900 overflow-hidden"
                        : "overflow-hidden"
                    }
                  >
                    <div
                      className={
                        isStaff
                          ? "flex flex-col sm:flex-row justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-100 dark:border-blue-900"
                          : "flex flex-col sm:flex-row justify-between bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b"
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                            isStaff ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            {isStaff ? (msg.authorType === "system" ? "System" : "Support Staff") : clientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {isStaff ? "Staff" : "Client"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 sm:text-right mt-2 sm:mt-0">
                        {formatDateTime(msg.createdAt)}
                      </div>
                    </div>
                    <CardContent className="p-4 text-sm leading-relaxed">
                      {msg.messageHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.messageHtml) }} />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          {messages.length > 0 ? (
            <DataTablePagination
              page={messagesPage}
              totalPages={Math.ceil(messages.length / messagesPageSize) || 1}
              totalItems={messages.length}
              pageSize={messagesPageSize}
              currentCount={paginatedMessages.length}
              itemLabel="messages"
              onPageChange={setMessagesPage}
              onPageSizeChange={(value) => {
                setMessagesPageSize(value);
                setMessagesPage(1);
              }}
            />
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-gray-500 block">Department</span>
                <span className="font-medium capitalize">{ticket.department}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Submitted</span>
                <span className="font-medium">{formatDateTime(ticket.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Last Updated</span>
                <span className="font-medium">
                  {ticket.lastRepliedAt ? formatDateTime(ticket.lastRepliedAt) : formatDateTime(ticket.updatedAt)}
                </span>
              </div>
              {client?.contactEmail && (
                <div>
                  <span className="text-gray-500 block">Contact</span>
                  <span className="font-medium text-blue-600">{client.contactEmail}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
