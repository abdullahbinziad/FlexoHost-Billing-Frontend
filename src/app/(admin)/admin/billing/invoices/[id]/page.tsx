"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { AdminInvoiceHeader } from "@/components/admin/invoices/AdminInvoiceHeader";
import { AdminInvoiceTabs, type AdminInvoiceTabId } from "@/components/admin/invoices/AdminInvoiceTabs";
import { AdminInvoiceSummary } from "@/components/admin/invoices/AdminInvoiceSummary";
import { AdminInvoiceItemsCard } from "@/components/admin/invoices/AdminInvoiceItemsCard";
import { AdminInvoiceTransactionsCard } from "@/components/admin/invoices/AdminInvoiceTransactionsCard";
import { AdminAddPaymentForm } from "@/components/admin/invoices/AdminAddPaymentForm";
import {
    useGetInvoiceByIdQuery,
    useUpdateInvoiceStatusMutation,
    useUpdateInvoiceMutation,
    useSendInvoiceReminderMutation,
    useAddPaymentMutation,
    useDeleteInvoiceMutation,
    type InvoiceItemPayload,
} from "@/store/api/invoiceApi";
import { toast } from "sonner";

function toDateInputValue(date: string | Date | undefined) {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
}

export default function AdminInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState<AdminInvoiceTabId>("summary");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data: invoice, isLoading, error } = useGetInvoiceByIdQuery(id, { skip: !id });
    const [updateStatus, { isLoading: isUpdating }] = useUpdateInvoiceStatusMutation();
    const [updateInvoice, { isLoading: isSaving }] = useUpdateInvoiceMutation();
    const [sendReminder, { isLoading: isSendingReminder }] = useSendInvoiceReminderMutation();
    const [addPayment, { isLoading: isAddingPayment }] = useAddPaymentMutation();
    const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();

    const [items, setItems] = useState<InvoiceItemPayload[]>([]);
    const [invoiceDate, setInvoiceDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [credit, setCredit] = useState(0);
    const [reminderType, setReminderType] = useState("invoice-payment-reminder");

    useEffect(() => {
        if (invoice) {
            setItems(
                (invoice.items || []).map((i) => ({
                    type: i.type || "HOSTING",
                    description: i.description || "",
                    amount: i.amount || 0,
                    period: i.period
                        ? {
                              startDate: i.period.startDate
                                  ? toDateInputValue(i.period.startDate)
                                  : undefined,
                              endDate: i.period.endDate
                                  ? toDateInputValue(i.period.endDate)
                                  : undefined,
                          }
                        : undefined,
                }))
            );
            setInvoiceDate(toDateInputValue(invoice.invoiceDate));
            setDueDate(toDateInputValue(invoice.dueDate));
            setCredit(invoice.credit || 0);
        }
    }, [invoice]);

    const handleStatusChange = async (status: string) => {
        try {
            await updateStatus({ id, status }).unwrap();
            toast.success(`Invoice marked as ${status.toLowerCase()}`);
        } catch {
            toast.error("Failed to update invoice status");
        }
    };

    const handleSendReminder = async () => {
        try {
            const result = await sendReminder({ id, template: reminderType }).unwrap();
            toast.success(result.message);
        } catch {
            toast.error("Failed to send reminder");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteInvoice(id).unwrap();
            toast.success("Invoice deleted");
            setShowDeleteConfirm(false);
            router.push("/admin/billing/invoices");
        } catch {
            toast.error("Failed to delete invoice");
        }
    };

    const handleSave = async () => {
        if (!invoice) return;
        const validItems = items
            .filter((i) => (i.description || "").trim())
            .map((i) => ({
                type: i.type || "HOSTING",
                description: (i.description || "").trim(),
                amount: Number(i.amount) || 0,
                period:
                    i.period?.startDate || i.period?.endDate
                        ? {
                              startDate: i.period.startDate,
                              endDate: i.period.endDate,
                          }
                        : undefined,
            }));
        if (validItems.length === 0) {
            toast.error("Add at least one item with a description");
            return;
        }
        try {
            const payload: Parameters<typeof updateInvoice>[0]["data"] = {
                items: validItems,
                credit,
            };
            if (invoiceDate) payload.invoiceDate = invoiceDate;
            if (dueDate) payload.dueDate = dueDate;

            await updateInvoice({ id, data: payload }).unwrap();
            toast.success("Invoice updated successfully");
        } catch {
            toast.error("Failed to update invoice");
        }
    };

    const handleCancel = () => {
        if (invoice) {
            setItems(
                (invoice.items || []).map((i) => ({
                    type: i.type || "HOSTING",
                    description: i.description || "",
                    amount: i.amount || 0,
                    period: i.period
                        ? {
                              startDate: i.period.startDate
                                  ? toDateInputValue(i.period.startDate)
                                  : undefined,
                              endDate: i.period.endDate
                                  ? toDateInputValue(i.period.endDate)
                                  : undefined,
                          }
                        : undefined,
                }))
            );
            setInvoiceDate(toDateInputValue(invoice.invoiceDate));
            setDueDate(toDateInputValue(invoice.dueDate));
            setCredit(invoice.credit || 0);
            toast.info("Changes discarded");
        }
    };

    const handlePrint = () => window.print();
    const handleDownload = () => window.open(`/invoices/${id}`, "_blank", "noopener");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h2 className="text-lg font-semibold">Invoice not found</h2>
                <p className="text-sm text-muted-foreground">
                    The requested invoice could not be loaded.
                </p>
                <Button variant="outline" onClick={() => router.push("/admin/billing/invoices")}>
                    Back to Invoices
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 print:pb-0">
            <AdminInvoiceHeader
                invoiceNumber={invoice.invoiceNumber}
                invoiceId={id}
                onPrint={handlePrint}
                onDownload={handleDownload}
                reminderType={reminderType}
                onReminderTypeChange={setReminderType}
                onSendReminder={handleSendReminder}
                isSendingReminder={isSendingReminder}
            />

            <AdminInvoiceTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "summary" && (
                <>
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                        {/* Left: Info panel - wider for proper button/input space */}
                        <aside className="flex-shrink-0 lg:w-[420px] lg:min-w-[380px] lg:sticky lg:top-6">
                            <AdminInvoiceSummary
                                invoice={invoice}
                                invoiceDate={invoiceDate || undefined}
                                dueDate={dueDate || undefined}
                                onInvoiceDateChange={setInvoiceDate}
                                onDueDateChange={setDueDate}
                                onStatusChange={handleStatusChange}
                                onSendReminder={handleSendReminder}
                                onDelete={() => setShowDeleteConfirm(true)}
                                isUpdating={isUpdating || isSendingReminder || isDeleting}
                                editable
                            />
                        </aside>

                        {/* Right: Editable items table - takes remaining space */}
                        <main className="flex-1 min-w-0 w-full">
                            <AdminInvoiceItemsCard
                                items={items}
                                currency={invoice.currency}
                                credit={credit}
                                onItemsChange={setItems}
                                onCreditChange={setCredit}
                                availableCredit={0}
                            />
                        </main>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <AdminInvoiceTransactionsCard
                            title="Transactions"
                            transactions={[]}
                            columns={[
                                "date",
                                "paymentMethod",
                                "transactionId",
                                "amount",
                                "fees",
                            ]}
                            currency={invoice.currency}
                        />
                        <AdminInvoiceTransactionsCard
                            title="Transaction History"
                            transactions={[]}
                            columns={[
                                "date",
                                "paymentMethod",
                                "transactionId",
                                "status",
                                "description",
                            ]}
                            currency={invoice.currency}
                        />
                    </div>
                </>
            )}

            {activeTab === "add-payment" && (
                invoice.status === "PAID" || invoice.balanceDue <= 0 ? (
                    <div className="rounded-lg border bg-card p-8 text-center">
                        <p className="text-muted-foreground">This invoice is already paid.</p>
                        <p className="text-sm text-muted-foreground mt-1">No additional payments can be recorded.</p>
                    </div>
                ) : (
                <AdminAddPaymentForm
                    currency={invoice.currency}
                    balanceDue={invoice.balanceDue}
                    onSubmit={async (data) => {
                        try {
                            await addPayment({
                                id,
                                data: {
                                    date: data.date,
                                    amount: data.amount,
                                    paymentMethod: data.paymentMethod,
                                    transactionFees: data.transactionFees,
                                    transactionId: data.transactionId,
                                    sendEmail: data.sendEmail,
                                },
                            }).unwrap();
                            toast.success("Payment recorded successfully");
                        } catch (err: any) {
                            toast.error(err?.data?.message || "Failed to record payment");
                            throw err;
                        }
                    }}
                />
                )
            )}

            {activeTab !== "summary" && activeTab !== "add-payment" && (
                <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                    <p className="font-medium capitalize">{activeTab.replace("-", " ")}</p>
                    <p className="text-sm mt-1">Coming soon</p>
                </div>
            )}

            {/* Sticky Save Bar */}
            {activeTab === "summary" && (
                <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 px-4 print:hidden">
                    <div className="max-w-4xl mx-auto flex justify-end gap-3">
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </div>
            )}
            <ConfirmActionDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Delete invoice?"
                description="This action cannot be undone. The invoice will be permanently removed."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
