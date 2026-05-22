"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { type ActivityLogEntry, useGetActivityLogQuery } from "@/store/api/activityLogApi";
import {
  useGetClientByIdQuery,
  useSendClientEmailMutation,
} from "@/store/api/clientApi";
import { formatDateTime } from "@/utils/format";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

function getMeta(entry: ActivityLogEntry): Record<string, unknown> | undefined {
  return entry.meta && typeof entry.meta === "object"
    ? (entry.meta as Record<string, unknown>)
    : undefined;
}

function getMetaString(entry: ActivityLogEntry, key: string): string | undefined {
  const value = getMeta(entry)?.[key];
  return typeof value === "string" ? value : undefined;
}

function getActorLabel(entry: ActivityLogEntry): string {
  if (entry.actorType === "system") return "System";
  if (entry.actorId && typeof entry.actorId === "object" && "email" in entry.actorId) {
    return entry.actorId.email || "Staff";
  }
  if (entry.userId && typeof entry.userId === "object" && "email" in entry.userId) {
    return entry.userId.email || "Staff";
  }
  return "Staff";
}

function getSourceLabel(source?: string): string {
  if (!source) return "Unknown";
  return source
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ClientEmailsPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const [page, setPage] = useState(1);
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { data, isLoading, error } = useGetActivityLogQuery({
    clientId,
    category: "email",
    page,
    limit: 20,
  });
  const { data: client, isLoading: isLoadingClient } = useGetClientByIdQuery(clientId, {
    skip: !clientId,
  });
  const [sendClientEmail, { isLoading: isSending }] = useSendClientEmailMutation();

  const recipientEmail = useMemo(
    () => client?.contactEmail || client?.user?.email || "",
    [client]
  );

  const entries = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleSendEmail = async () => {
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedSubject || !trimmedMessage) {
      toast.error("Subject and message are required.");
      return;
    }

    if (!recipientEmail) {
      toast.error("This client does not have an email address.");
      return;
    }

    try {
      await sendClientEmail({
        clientId,
        subject: trimmedSubject,
        message: trimmedMessage,
      }).unwrap();

      toast.success("Email sent to client.");
      setComposeOpen(false);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send email.");
    }
  };

  return (
    <>
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">Email History</CardTitle>
            <p className="text-sm text-muted-foreground">
              Full email history for this client, including automated notices and manual staff emails.
            </p>
          </div>
          <Button
            onClick={() => setComposeOpen(true)}
            disabled={isLoadingClient || !recipientEmail}
            title={!recipientEmail ? "Client has no email address" : undefined}
          >
            <Send className="w-4 h-4 mr-2" />
            Compose Email
          </Button>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          {!recipientEmail && !isLoadingClient ? (
            <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
              This client does not currently have a deliverable email address on file.
            </div>
          ) : null}

          <div className="rounded-md border bg-white dark:bg-gray-900">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Date Sent</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Sent By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-destructive">
                      Failed to load email history.
                    </TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No email history exists for this client yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => {
                    const subjectText = getMetaString(entry, "subject") || entry.message;
                    const bodyPreview =
                      getMetaString(entry, "bodyPreview") ||
                      getMetaString(entry, "reminderType") ||
                      entry.message;
                    const to = getMetaString(entry, "to") || recipientEmail || "Unknown";
                    const status = entry.status || (entry.type === "email_failed" ? "failure" : "success");

                    return (
                      <TableRow key={entry._id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                          {formatDateTime(entry.createdAt)}
                        </TableCell>
                        <TableCell className="min-w-[320px]">
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <div className="font-medium">{subjectText}</div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                                {bodyPreview}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {to}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status === "failure" ? "destructive" : "secondary"}
                            className="capitalize"
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getSourceLabel(entry.source)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getActorLabel(entry)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalResults}
            pageSize={20}
            currentCount={entries.length}
            itemLabel="entries"
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>
              Send a custom email to this client and keep it in the client email history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                To
              </label>
              <Input value={recipientEmail || "No email available"} readOnly />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Subject
              </label>
              <Input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Enter email subject"
                maxLength={200}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Message
              </label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write your message to the client"
                rows={10}
                maxLength={10000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setComposeOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendEmail}
              disabled={isSending || !recipientEmail}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
