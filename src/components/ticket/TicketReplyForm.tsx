"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RichTextEditor } from "./RichTextEditor";
import { devLog } from "@/lib/devLog";

interface TicketReplyFormProps {
  ticketId: string;
  onSuccess?: () => void;
  onSubmit: (args: {
    id: string;
    message: string;
    messageHtml?: string;
    attachments?: File[];
  }) => Promise<void>;
  isSubmitting: boolean;
  /** Wrapper for admin (Card) or client (plain div) */
  variant?: "card" | "plain";
  /** Label for the reply section */
  label?: string;
  /** Placeholder for text editor */
  placeholder?: string;
}

export function TicketReplyForm({
  ticketId,
  onSuccess,
  onSubmit,
  isSubmitting,
  variant = "plain",
  label = "Your Reply",
  placeholder = "Type your reply here...",
}: TicketReplyFormProps) {
  const [message, setMessage] = useState("");
  const [messageHtml, setMessageHtml] = useState("");
  const [editorKey, setEditorKey] = useState(0);

  const handleEditorChange = (html: string, text: string) => {
    setMessageHtml(html);
    setMessage(text);
  };

  const handleReply = async () => {
    if (!message.trim()) {
      toast.error("Reply message cannot be empty.");
      return;
    }
    try {
      await onSubmit({
        id: ticketId,
        message,
        messageHtml: messageHtml || undefined,
      });
      setMessage("");
      setMessageHtml("");
      setEditorKey((k) => k + 1);
      onSuccess?.();
      toast.success("Reply sent.");
    } catch (e) {
      devLog(e);
      toast.error("Failed to send reply.");
    }
  };

  const content = (
    <>
      <RichTextEditor
        key={editorKey}
        content=""
        onChange={handleEditorChange}
        placeholder={placeholder}
        minHeight="140px"
      />
      <div className="flex justify-end mt-2">
        <Button onClick={handleReply} disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </>
  );

  if (variant === "card") {
    return (
      <div className="space-y-4">
        {label && <h3 className="text-sm font-semibold">{label}</h3>}
        <div className="space-y-4">{content}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-2">{content}</div>
    </div>
  );
}
