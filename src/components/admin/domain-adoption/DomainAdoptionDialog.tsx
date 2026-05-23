"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetClientsQuery } from "@/store/api/clientApi";
import { useAdoptExistingRegistrarDomainMutation } from "@/store/api/domainApi";

const BILLING_CYCLES = [
  { value: "annually", label: "Annually" },
  { value: "biennially", label: "Biennially" },
  { value: "triennially", label: "Triennially" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semiannually", label: "Semi-annually" },
];

function defaultNextDueDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

interface DomainAdoptionDialogProps {
  open: boolean;
  domainName: string;
  registrar?: string;
  onOpenChange: (open: boolean) => void;
  onAdopted?: () => void;
}

export function DomainAdoptionDialog({
  open,
  domainName,
  registrar,
  onOpenChange,
  onAdopted,
}: DomainAdoptionDialogProps) {
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [billingCycle, setBillingCycle] = useState("annually");
  const [nextDueDate, setNextDueDate] = useState(defaultNextDueDate);
  const [currency, setCurrency] = useState("USD");
  const [recurring, setRecurring] = useState("0");
  const [reason, setReason] = useState("Silent import from existing registrar account");

  const { data: clientsData, isFetching: isSearchingClients } = useGetClientsQuery({
    page: 1,
    limit: 20,
    search: clientSearch.trim() || undefined,
  });
  const [adoptDomain, { isLoading: isAdopting }] = useAdoptExistingRegistrarDomainMutation();

  const clients = clientsData?.clients ?? [];
  const selectedClient = useMemo(
    () => clients.find((client) => client._id === selectedClientId),
    [clients, selectedClientId]
  );

  useEffect(() => {
    const clientCurrency = selectedClient?.accountCreditCurrency?.trim().toUpperCase();
    if (clientCurrency) {
      setCurrency(clientCurrency);
    }
  }, [selectedClient?.accountCreditCurrency]);

  const handleSubmit = async () => {
    if (!domainName) {
      toast.error("Domain name is missing.");
      return;
    }
    if (!selectedClientId) {
      toast.error("Select a client first.");
      return;
    }
    if (!nextDueDate) {
      toast.error("Next due date is required.");
      return;
    }

    const recurringAmount = Number(recurring || 0);
    if (!Number.isFinite(recurringAmount) || recurringAmount < 0) {
      toast.error("Recurring price must be a valid non-negative number.");
      return;
    }

    try {
      await adoptDomain({
        clientId: selectedClientId,
        domainName,
        registrar,
        billingCycle,
        nextDueDate,
        priceSnapshot: {
          recurring: recurringAmount,
          total: recurringAmount,
          currency: currency.trim().toUpperCase() || "USD",
        },
        reason: reason.trim() || undefined,
      }).unwrap();
      toast.success(`${domainName} assigned to ${selectedClient?.companyName || selectedClient?.firstName || "client"}`);
      onAdopted?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to assign existing registrar domain.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Existing Registrar Domain</DialogTitle>
          <DialogDescription>
            Add this already-registered domain to a client account without sending a new order or registration email.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Domain</Label>
            <Input value={domainName} disabled />
          </div>
          <div className="space-y-2">
            <Label>Registrar</Label>
            <Input value={registrar || "registrar"} disabled />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Search client</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Name, company, email, or client ID"
              value={clientSearch}
              onChange={(event) => setClientSearch(event.target.value)}
            />
            <Button type="button" variant="outline" disabled={isSearchingClients}>
              {isSearchingClients ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Client</Label>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No clients found.</p>
              ) : (
                clients.map((client) => (
                  <SelectItem key={client._id} value={client._id}>
                    {[client.companyName, `${client.firstName} ${client.lastName}`.trim(), client.contactEmail || client.user?.email]
                      .filter(Boolean)
                      .join(" - ")}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Billing cycle</Label>
            <Select value={billingCycle} onValueChange={setBillingCycle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BILLING_CYCLES.map((cycle) => (
                  <SelectItem key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Next due date</Label>
            <Input type="date" value={nextDueDate} onChange={(event) => setNextDueDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Recurring price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={recurring}
            onChange={(event) => setRecurring(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Internal reason</Label>
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isAdopting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isAdopting}>
            {isAdopting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning
              </>
            ) : (
              "Assign to Client"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
