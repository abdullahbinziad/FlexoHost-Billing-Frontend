"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecipientPicker, type RecipientItem } from "./RecipientPicker";
import { SendResultSummary } from "./SendResultSummary";
import { useSendBulkEmailMutation } from "@/store/api/emailApi";
import type { SendBulkEmailResponse } from "@/store/api/emailApi";
import { toast } from "sonner";

export interface EmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-selected recipients (e.g. from clients list or client detail) */
  initialRecipients?: RecipientItem[];
  defaultSubject?: string;
  defaultMessage?: string;
  /** Pre-filled HTML body (when using HTML template) */
  defaultHtml?: string;
  onSuccess?: (result: SendBulkEmailResponse) => void;
  mode?: "modal" | "inline";
}

const PLACEHOLDER_HINT = "Use {{firstName}} and {{lastName}} for personalization.";

/** Strip HTML tags for plain-text fallback. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function EmailComposer({
  open,
  onOpenChange,
  initialRecipients = [],
  defaultSubject = "",
  defaultMessage = "",
  defaultHtml = "",
  onSuccess,
  mode = "modal",
}: EmailComposerProps) {
  const [selectedClients, setSelectedClients] = useState<RecipientItem[]>([]);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [htmlBody, setHtmlBody] = useState(defaultHtml);
  const [bodyMode, setBodyMode] = useState<"plain" | "html">(
    defaultHtml ? "html" : "plain"
  );
  const [result, setResult] = useState<SendBulkEmailResponse | null>(null);

  const [sendBulkEmail, { isLoading: isSending }] = useSendBulkEmailMutation();

  // Sync state when modal opens. Only depend on `open` to avoid infinite loop
  useEffect(() => {
    if (open) {
      setSelectedClients(initialRecipients);
      setSubject(defaultSubject);
      setMessage(defaultMessage);
      setHtmlBody(defaultHtml);
      setBodyMode(defaultHtml ? "html" : "plain");
      setResult(null);
    }
  }, [open]);

  const handleSend = async () => {
    if (selectedClients.length === 0) {
      toast.error("Select at least one recipient");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    const useHtml = bodyMode === "html" && htmlBody.trim();
    const plainText = bodyMode === "plain" ? message.trim() : stripHtml(htmlBody);
    if (!plainText && !useHtml) {
      toast.error("Message or HTML body is required");
      return;
    }

    try {
      const res = await sendBulkEmail({
        clientIds: selectedClients.map((c) => c.id),
        subject: subject.trim(),
        message: plainText || "(HTML email)",
        ...(useHtml && { html: htmlBody.trim() }),
      }).unwrap();

      setResult(res);
      if (res.sent > 0) {
        toast.success(`Sent to ${res.sent} of ${res.total} recipient(s)`);
      } else if (res.failed > 0) {
        toast.error(
          "No emails were sent. If you see SMTP or authentication errors below, fix SMTP_* on the API server."
        );
      }
      if (res.failed > 0 && res.sent > 0) {
        toast.warning(`${res.failed} recipient(s) could not receive the email`);
      }
      onSuccess?.(res);

      if (res.failed === 0) {
        onOpenChange(false);
      }
    } catch (err: unknown) {
      const e = err as {
        data?: {
          message?: string;
          error?: { hint?: string; detail?: string; code?: string; smtpHost?: string; smtpPort?: number; smtpSource?: string };
        };
      };
      const msg = e?.data?.message || "Failed to send email";
      const hint = e?.data?.error?.hint;
      const detail = e?.data?.error?.detail;
      const code = e?.data?.error?.code;
      const meta = e?.data?.error;
      const parts: string[] = [];
      if (detail) parts.push(detail.length > 400 ? `${detail.slice(0, 400)}…` : detail);
      if (code) parts.push(`Code: ${code}`);
      if (meta?.smtpHost != null && meta?.smtpPort != null) {
        parts.push(`SMTP: ${meta.smtpHost}:${meta.smtpPort} (${meta.smtpSource ?? "?"})`);
      }
      if (hint) parts.push(hint);
      const description = parts.length ? parts.join("\n\n") : undefined;
      if (description) {
        toast.error(msg, { description });
      } else {
        toast.error(msg);
      }
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setResult(null);
    onOpenChange(nextOpen);
  };

  const content = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Recipients</Label>
        <RecipientPicker
          selectedClients={selectedClients}
          onSelectionChange={setSelectedClients}
          maxRecipients={100}
          disabled={!!result}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="compose-subject">Subject</Label>
        <Input
          id="compose-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          maxLength={200}
          disabled={!!result}
        />
      </div>

      <div className="space-y-2">
        <Label>Body</Label>
        <div className="inline-flex h-10 items-center rounded-md bg-muted p-1 gap-1">
          <button
            type="button"
            onClick={() => setBodyMode("plain")}
            disabled={!!result}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              bodyMode === "plain"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Plain text
          </button>
          <button
            type="button"
            onClick={() => setBodyMode("html")}
            disabled={!!result}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              bodyMode === "html"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            HTML template
          </button>
        </div>
        {bodyMode === "plain" ? (
          <Textarea
            id="compose-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message... Use {{firstName}} and {{lastName}} for personalization."
            rows={8}
            maxLength={10000}
            disabled={!!result}
            className="resize-none font-mono text-sm mt-2"
          />
        ) : (
          <Textarea
            id="compose-html"
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            placeholder="<p>Hello {{firstName}},</p>&#10;<p>Your HTML content here...</p>"
            rows={12}
            maxLength={50000}
            disabled={!!result}
            className="resize-none font-mono text-sm mt-2"
          />
        )}
        <p className="text-xs text-muted-foreground">{PLACEHOLDER_HINT}</p>
      </div>

      {result && (
        <div className="space-y-2">
          <Label>Result</Label>
          <SendResultSummary
            sent={result.sent}
            failed={result.failed}
            total={result.total}
            results={result.results}
          />
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => handleOpenChange(false)}>
        {result ? "Close" : "Cancel"}
      </Button>
      {!result && (
        <Button
          onClick={handleSend}
          disabled={
            selectedClients.length === 0 ||
            !subject.trim() ||
            (bodyMode === "plain" ? !message.trim() : !htmlBody.trim()) ||
            isSending
          }
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>
      )}
    </div>
  );

  if (mode === "inline") {
    return (
      <div className="space-y-6">
        {content}
        {footer}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            Send an email to one or more clients. Use {"{{firstName}}"} and {"{{lastName}}"} for personalization.
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
