"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCreateTicketMutation } from "@/store/api/ticketApi";
import { useGetClientServicesQuery } from "@/store/api/servicesApi";
import { useGetAllInvoicesQuery } from "@/store/api/invoiceApi";
import { useActiveClient } from "@/hooks/useActiveClient";
import { toast } from "sonner";
import { MessageSquarePlus, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { devLog } from "@/lib/devLog";
import { SELECT_SENTINEL, TICKET_DEPARTMENT, TICKET_PRIORITY } from "@/constants/status";

const NONE = SELECT_SENTINEL.NONE;

export default function NewTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeClientId } = useActiveClient();
  const [subject, setSubject] = useState("");
  const [department, setDepartment] =
    useState<"technical" | "billing" | "sales" | "support">(TICKET_DEPARTMENT.SUPPORT);
  const [priority, setPriority] =
    useState<"low" | "normal" | "high" | "urgent">(TICKET_PRIORITY.NORMAL);
  const [message, setMessage] = useState("");
  const [serviceId, setServiceId] = useState<string>(NONE);
  const [invoiceId, setInvoiceId] = useState<string>(NONE);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: servicesData } = useGetClientServicesQuery(
    { clientId: activeClientId ?? "", params: { limit: 100 } },
    { skip: !activeClientId }
  );
  const { data: invoicesData } = useGetAllInvoicesQuery(
    { clientId: activeClientId ?? "", limit: 50, page: 1 },
    { skip: !activeClientId }
  );
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  // Pre-fill from URL: ?serviceId=xxx or ?invoiceId=xxx (e.g. from hosting/invoice page)
  useEffect(() => {
    const sid = searchParams.get("serviceId");
    const iid = searchParams.get("invoiceId");
    if (sid) setServiceId(sid);
    if (iid) setInvoiceId(iid);
  }, [searchParams]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required.");
      return;
    }
    try {
      const ticket = await createTicket({
        subject,
        department,
        priority,
        message,
        attachments,
        ...(serviceId && serviceId !== NONE && { serviceId }),
        ...(invoiceId && invoiceId !== NONE && { invoiceId }),
      }).unwrap();
      toast.success("Ticket created successfully.");
      router.push(`/tickets/${ticket._id}`);
    } catch (err) {
      devLog(err);
      toast.error("Failed to create ticket.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <MessageSquarePlus className="h-7 w-7 text-primary" />
          Open New Ticket
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us what you need help with. Our support team will respond shortly.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Support Request</CardTitle>
          <CardDescription>
            Fill in the details below. You can attach screenshots to help us
            understand your issue faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="subject"
                className="text-sm font-medium leading-none"
              >
                Subject
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Website is down, billing question..."
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="related-service"
                  className="text-sm font-medium leading-none"
                >
                  Related service (optional)
                </label>
                <Select
                  value={serviceId}
                  onValueChange={setServiceId}
                >
                  <SelectTrigger id="related-service" className="h-11">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {(servicesData?.services ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.identifier} – {s.name || s.productType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="related-invoice"
                  className="text-sm font-medium leading-none"
                >
                  Related invoice (optional)
                </label>
                <Select
                  value={invoiceId}
                  onValueChange={setInvoiceId}
                >
                  <SelectTrigger id="related-invoice" className="h-11">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {(invoicesData?.results ?? []).map((inv) => (
                      <SelectItem key={inv._id} value={inv._id}>
                        #{inv.invoiceNumber} – {inv.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="department"
                  className="text-sm font-medium leading-none"
                >
                  Department
                </label>
                <Select
                  value={department}
                  onValueChange={(v) => setDepartment(v as any)}
                >
                  <SelectTrigger id="department" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TICKET_DEPARTMENT.SUPPORT}>General Support</SelectItem>
                    <SelectItem value={TICKET_DEPARTMENT.TECHNICAL}>Technical</SelectItem>
                    <SelectItem value={TICKET_DEPARTMENT.BILLING}>Billing</SelectItem>
                    <SelectItem value={TICKET_DEPARTMENT.SALES}>Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="priority"
                  className="text-sm font-medium leading-none"
                >
                  Priority
                </label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as any)}
                >
                  <SelectTrigger id="priority" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TICKET_PRIORITY.LOW}>Low</SelectItem>
                    <SelectItem value={TICKET_PRIORITY.NORMAL}>Normal</SelectItem>
                    <SelectItem value={TICKET_PRIORITY.HIGH}>High</SelectItem>
                    <SelectItem value={TICKET_PRIORITY.URGENT}>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-sm font-medium leading-none"
              >
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail so we can help you faster."
                className="min-h-[180px] resize-y"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Attachments (images, PDF, logs)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt,.log"
                multiple
                className="hidden"
                onChange={handleFilesChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Choose Images
              </Button>
              {attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs"
                      )}
                    >
                      <span className="max-w-[140px] truncate sm:max-w-[200px]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="rounded p-1 text-destructive transition-colors hover:bg-destructive/10"
                        aria-label="Remove attachment"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
