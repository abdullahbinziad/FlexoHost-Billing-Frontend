"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type DomainContact,
  type DomainContactDetails,
  type DomainDnsRecord,
  useGetAdminDomainDetailsQuery,
  useGetAdminDomainContactsQuery,
  useGetAdminDomainDnsQuery,
  useGetAdminDomainStatusOptionsQuery,
  useLazyGetAdminEppCodeQuery,
  useRenewDomainMutation,
  useUpdateAdminDomainLifecycleStatusMutation,
  useUpdateAdminDomainContactsMutation,
  useUpdateAdminDomainDnsMutation,
  useUpdateAdminDomainRegistrarLockMutation,
  useUpdateAdminNameserversMutation,
} from "@/store/api/domainApi";
import {
  type DomainRenewalJobItem,
  useAdminUpdateServiceNotesMutation,
  useAdminUpdateServiceProfileMutation,
  useGetDomainRenewalJobsQuery,
  useGetClientServiceByIdQuery,
  useMarkDomainRenewalJobRenewedMutation,
  useRetryDomainRenewalJobMutation,
  useSyncDomainRenewalJobFromRegistrarMutation,
} from "@/store/api/servicesApi";
import { useGetSupportedCurrenciesQuery } from "@/store/api/currencyApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DomainAdminNotesCard } from "@/components/admin/domain-details/DomainAdminNotesCard";
import { DomainBillingLifecycleCard } from "@/components/admin/domain-details/DomainBillingLifecycleCard";
import { DomainContactTabsCard } from "@/components/admin/domain-details/DomainContactTabsCard";
import { DomainDetailsHeader } from "@/components/admin/domain-details/DomainDetailsHeader";
import { DomainDnsRecordsCard } from "@/components/admin/domain-details/DomainDnsRecordsCard";
import { DomainManagementCard } from "@/components/admin/domain-details/DomainManagementCard";
import { DomainNameserversCard } from "@/components/admin/domain-details/DomainNameserversCard";
import { DomainOverviewCard } from "@/components/admin/domain-details/DomainOverviewCard";
import { DomainRenewalAutomationCard } from "@/components/admin/domain-details/DomainRenewalAutomationCard";

const dnsRecordTypes: DomainDnsRecord["type"][] = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "forward", "stealth", "email"];
const fallbackLifecycleStatusOptions = [
  { value: "PENDING_REGISTRATION", label: "Pending Registration" },
  { value: "PENDING_TRANSFER", label: "Pending Transfer" },
  { value: "ACTIVE", label: "Active" },
  { value: "GRACE_PERIOD_EXPIRED", label: "Grace Period (Expired)" },
  { value: "REDEMPTION_PERIOD_EXPIRED", label: "Redemption Period (Expired)" },
  { value: "EXPIRED", label: "Expired" },
  { value: "TRANSFERRED_AWAY", label: "Transferred Away" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FRAUD", label: "Fraud" },
];
const billingCycleOptions = ["monthly", "quarterly", "semiannually", "annually", "biennially", "triennially", "one-time"];

function createEmptyContact(): DomainContact {
  return {
    organization: "",
    name: "",
    email: "",
    phonecc: "",
    phonenum: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  };
}

function createEmptyContacts(): DomainContactDetails {
  return {
    registrant: createEmptyContact(),
    admin: createEmptyContact(),
    tech: createEmptyContact(),
    billing: createEmptyContact(),
  };
}

function createEmptyDnsRecord(): DomainDnsRecord {
  return {
    type: "A",
    name: "",
    value: "",
    ttl: 3600,
  };
}

function toDateInputValue(value?: string) {
  if (!value || value === "—") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export default function DomainDetailsPage({
  params,
}: {
  params: Promise<{ id: string; domainId: string }>;
}) {
  const router = useRouter();
  const { id: clientId, domainId } = use(params);

  const { data: service, isLoading, error } = useGetClientServiceByIdQuery(
    { clientId, serviceId: domainId },
    { skip: !clientId || !domainId }
  );

  const domainName = service?.domain ?? service?.identifier ?? "";
  const { data: domainDetails, error: detailsError } = useGetAdminDomainDetailsQuery(
    { domainName, clientId },
    { skip: !domainName }
  );
  const { data: contactDetails, isLoading: contactsLoading, error: contactsError } = useGetAdminDomainContactsQuery(
    { domainName, clientId },
    { skip: !domainName }
  );
  const { data: dnsRecordsData, isLoading: dnsLoading, error: dnsError } = useGetAdminDomainDnsQuery(
    { domainName, clientId },
    { skip: !domainName }
  );
  const { data: statusOptionsData } = useGetAdminDomainStatusOptionsQuery();
  const { data: supportedCurrenciesData } = useGetSupportedCurrenciesQuery();
  const {
    data: renewalJobsResponse,
    isFetching: isRenewalJobsFetching,
    refetch: refetchRenewalJobs,
  } = useGetDomainRenewalJobsQuery(
    { serviceId: domainId, limit: 1 },
    { skip: !domainId }
  );

  const [updateNameservers, { isLoading: isSavingNameservers }] = useUpdateAdminNameserversMutation();
  const [updateRegistrarLock, { isLoading: isSavingLock }] = useUpdateAdminDomainRegistrarLockMutation();
  const [updateContacts, { isLoading: isSavingContacts }] = useUpdateAdminDomainContactsMutation();
  const [updateDns, { isLoading: isSavingDns }] = useUpdateAdminDomainDnsMutation();
  const [renewDomain, { isLoading: isRenewing }] = useRenewDomainMutation();
  const [updateNotes, { isLoading: isSavingNotes }] = useAdminUpdateServiceNotesMutation();
  const [updateLifecycleStatus, { isLoading: isSavingLifecycleStatus }] = useUpdateAdminDomainLifecycleStatusMutation();
  const [updateProfile, { isLoading: isSavingProfile }] = useAdminUpdateServiceProfileMutation();
  const [getEppCode, { isLoading: isLoadingEpp }] = useLazyGetAdminEppCodeQuery();
  const [retryRenewalJob, { isLoading: isRetryingRenewalJob }] = useRetryDomainRenewalJobMutation();
  const [syncRenewalJob, { isLoading: isSyncingRenewalJob }] = useSyncDomainRenewalJobFromRegistrarMutation();
  const [markRenewalJobRenewed, { isLoading: isMarkingRenewalJob }] = useMarkDomainRenewalJobRenewedMutation();

  const [nameservers, setNameservers] = useState<string[]>(["", ""]);
  const [registrarLock, setRegistrarLock] = useState(false);
  const [contacts, setContacts] = useState<DomainContactDetails>(createEmptyContacts());
  const [dnsRecords, setDnsRecords] = useState<DomainDnsRecord[]>([createEmptyDnsRecord()]);
  const [dnsPage, setDnsPage] = useState(1);
  const [dnsPageSize, setDnsPageSize] = useState(10);
  const [adminNotes, setAdminNotes] = useState("");
  const [eppCode, setEppCode] = useState("");
  const [editableStatus, setEditableStatus] = useState("ACTIVE");
  const [editableRegistrationDate, setEditableRegistrationDate] = useState("");
  const [editableNextDueDate, setEditableNextDueDate] = useState("");
  const [editableBillingCycle, setEditableBillingCycle] = useState("annually");
  const [editableFirstPaymentAmount, setEditableFirstPaymentAmount] = useState("0");
  const [editableRecurringAmount, setEditableRecurringAmount] = useState("0");
  const [editableCurrency, setEditableCurrency] = useState("BDT");
  const [selectedRenewalJob, setSelectedRenewalJob] = useState<DomainRenewalJobItem | null>(null);
  const [manualExpiryDate, setManualExpiryDate] = useState("");
  const [manualTransactionId, setManualTransactionId] = useState("");
  const [manualNote, setManualNote] = useState("");
  const lifecycleStatusOptions = statusOptionsData?.lifecycleStatuses?.length
    ? statusOptionsData.lifecycleStatuses
    : fallbackLifecycleStatusOptions;
  const currencyOptions = (supportedCurrenciesData?.currencies?.length
    ? supportedCurrenciesData.currencies
    : [
        { code: "BDT", name: "Bangladeshi Taka" },
        { code: "USD", name: "US Dollar" },
      ]).map((currency) => ({
        value: currency.code,
        label: `${currency.code} - ${currency.name}`,
      }));
  const paginatedDnsRecords = useMemo(
    () => dnsRecords.slice((dnsPage - 1) * dnsPageSize, dnsPage * dnsPageSize),
    [dnsRecords, dnsPage, dnsPageSize]
  );

  useEffect(() => {
    setAdminNotes(service?.adminNotes ?? "");
  }, [service?.adminNotes]);

  useEffect(() => {
    if (!service) return;
    setEditableStatus(String(domainDetails?.lifecycleStatus || "ACTIVE").toUpperCase());
    setEditableRegistrationDate(toDateInputValue(service.billing?.registrationDate));
    setEditableNextDueDate(toDateInputValue(service.billing?.nextDueDate));
    setEditableBillingCycle(String(service.pricing?.billingCycle || "annually").toLowerCase());
    setEditableFirstPaymentAmount(String(service.billing?.firstPaymentAmount ?? 0));
    setEditableRecurringAmount(String(service.pricing?.amount ?? service.billing?.recurringAmount ?? 0));
    setEditableCurrency(String(service.billing?.currency || service.pricing?.currency || "BDT").toUpperCase());
  }, [domainDetails?.lifecycleStatus, service]);

  useEffect(() => {
    if (!domainDetails) return;
    setNameservers(domainDetails.nameservers?.length ? domainDetails.nameservers : ["", ""]);
    setRegistrarLock(!!domainDetails.locked);
  }, [domainDetails]);

  useEffect(() => {
    if (contactDetails) {
      setContacts({
        registrant: { ...createEmptyContact(), ...contactDetails.registrant },
        admin: { ...createEmptyContact(), ...contactDetails.admin },
        tech: { ...createEmptyContact(), ...contactDetails.tech },
        billing: { ...createEmptyContact(), ...contactDetails.billing },
      });
    }
  }, [contactDetails]);

  useEffect(() => {
    if (dnsRecordsData) {
      setDnsRecords(dnsRecordsData.length ? dnsRecordsData : [createEmptyDnsRecord()]);
      setDnsPage(1);
    }
  }, [dnsRecordsData]);

  const lifecycleStatus = domainDetails?.lifecycleStatus ?? domainDetails?.status ?? "—";
  const lifecycleLabel = lifecycleStatusOptions.find((item) => item.value === lifecycleStatus)?.label ?? lifecycleStatus;
  const registrarStatus = domainDetails?.status && domainDetails.status !== domainDetails.lifecycleStatus ? domainDetails.status : "";
  const registrarExpiry = domainDetails?.expirationDate || "—";
  const latestRenewalJob = renewalJobsResponse?.data?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="font-medium text-destructive">Domain not found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          It may have been deleted or the link is incorrect.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/admin/clients/${clientId}/domains`}>Back to Domains</Link>
        </Button>
      </div>
    );
  }

  const handleNameserverChange = (index: number, value: string) => {
    setNameservers((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const addNameserver = () => {
    setNameservers((current) => [...current, ""]);
  };

  const removeNameserver = (index: number) => {
    setNameservers((current) => (current.length <= 2 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  };

  const handleSaveNameservers = async () => {
    const cleaned = nameservers.map((item) => item.trim()).filter(Boolean);
    if (cleaned.length < 2) {
      toast.error("At least two nameservers are required.");
      return;
    }

    try {
      await updateNameservers({ domainName, clientId, nameservers: cleaned }).unwrap();
      setNameservers(cleaned);
      toast.success("Nameservers updated.");
    } catch {
      toast.error("Failed to update nameservers.");
    }
  };

  const handleSaveRegistrarLock = async () => {
    try {
      await updateRegistrarLock({ domainName, clientId, locked: registrarLock }).unwrap();
      toast.success("Registrar lock updated.");
    } catch {
      toast.error("Failed to update registrar lock.");
    }
  };

  const updateContactField = (
    section: keyof DomainContactDetails,
    field: keyof DomainContact,
    value: string
  ) => {
    setContacts((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const handleSaveContacts = async () => {
    try {
      await updateContacts({ domainName, clientId, contacts }).unwrap();
      toast.success("Contact information updated.");
    } catch {
      toast.error("Failed to update contact information.");
    }
  };

  const updateDnsField = (
    index: number,
    field: keyof DomainDnsRecord,
    value: string | number
  ) => {
    setDnsRecords((current) =>
      current.map((record, recordIndex) =>
        recordIndex === index ? { ...record, [field]: value } : record
      )
    );
  };

  const addDnsRecord = () => {
    setDnsRecords((current) => [...current, createEmptyDnsRecord()]);
    setDnsPage(Math.ceil((dnsRecords.length + 1) / dnsPageSize) || 1);
  };

  const removeDnsRecord = (index: number) => {
    setDnsRecords((current) =>
      current.length <= 1 ? current : current.filter((_, recordIndex) => recordIndex !== index)
    );
  };

  const handleSaveDns = async () => {
    const cleanedRecords = dnsRecords
      .map((record) => ({
        ...record,
        name: record.name?.trim() || undefined,
        value: record.value.trim(),
        ttl: record.ttl ? Number(record.ttl) : undefined,
        priority: record.priority ? Number(record.priority) : undefined,
      }))
      .filter((record) => record.value);

    if (cleanedRecords.length === 0) {
      toast.error("Add at least one DNS record before saving.");
      return;
    }

    try {
      await updateDns({ domainName, clientId, records: cleanedRecords }).unwrap();
      setDnsRecords(cleanedRecords);
      toast.success("DNS records updated.");
    } catch {
      toast.error("Failed to update DNS records.");
    }
  };

  const handleRenewDomain = async () => {
    try {
      const response = await renewDomain({ domainName, clientId }).unwrap();
      toast.success(response.message || "Domain renewal invoice created.");
      if (response.data?.invoiceId) {
        router.push(`/admin/clients/${clientId}/invoices/${response.data.invoiceId}`);
      }
    } catch {
      toast.error("Failed to create domain renewal invoice.");
    }
  };

  const openManualRenewalDialog = (job?: DomainRenewalJobItem) => {
    if (!job) return;
    setSelectedRenewalJob(job);
    setManualExpiryDate(job.renewedUntil ? new Date(job.renewedUntil).toISOString().slice(0, 10) : "");
    setManualTransactionId(job.registrarTransactionId || "");
    setManualNote(job.manualResolutionNote || "");
  };

  const handleRetryRenewalJob = async () => {
    if (!latestRenewalJob) return;
    try {
      await retryRenewalJob({ jobId: latestRenewalJob._id }).unwrap();
      toast.success("Domain renewal job queued for retry.");
      await refetchRenewalJobs();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to retry domain renewal job.");
    }
  };

  const handleSyncRenewalJob = async () => {
    if (!latestRenewalJob) return;
    try {
      await syncRenewalJob({ jobId: latestRenewalJob._id }).unwrap();
      toast.success("Domain renewal job synced from registrar.");
      await refetchRenewalJobs();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to sync domain renewal job.");
    }
  };

  const handleMarkRenewalJobRenewed = async () => {
    if (!selectedRenewalJob) return;
    if (!manualExpiryDate) {
      toast.error("Expiry date is required.");
      return;
    }
    try {
      await markRenewalJobRenewed({
        jobId: selectedRenewalJob._id,
        expiresAt: manualExpiryDate,
        registrarTransactionId: manualTransactionId || undefined,
        note: manualNote || undefined,
      }).unwrap();
      toast.success("Domain renewal marked as manually renewed.");
      setSelectedRenewalJob(null);
      await refetchRenewalJobs();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark renewal as complete.");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateNotes({ serviceId: domainId, clientId, adminNotes }).unwrap();
      toast.success("Admin notes saved.");
    } catch {
      toast.error("Failed to save admin notes.");
    }
  };

  const handleSaveBillingSettings = async () => {
    const firstPaymentAmount = Number(editableFirstPaymentAmount || 0);
    const recurringAmount = Number(editableRecurringAmount || 0);
    const selectedCurrency = editableCurrency.trim().toUpperCase();
    if (!Number.isFinite(firstPaymentAmount) || firstPaymentAmount < 0) {
      toast.error("First registration amount must be a valid non-negative number.");
      return;
    }
    if (!Number.isFinite(recurringAmount) || recurringAmount < 0) {
      toast.error("Recurring amount must be a valid non-negative number.");
      return;
    }
    if (!currencyOptions.some((option) => option.value === selectedCurrency)) {
      toast.error("Select a supported currency.");
      return;
    }

    try {
      await updateLifecycleStatus({
        serviceId: domainId,
        clientId,
        lifecycleStatus: editableStatus,
        reason: "Manual admin lifecycle update from domain detail page",
      }).unwrap();
      await updateProfile({
        serviceId: domainId,
        clientId,
        registrationDate: editableRegistrationDate || undefined,
        nextDueDate: editableNextDueDate || undefined,
        billingCycle: editableBillingCycle,
        firstPaymentAmount,
        recurringAmount,
        currency: selectedCurrency,
      }).unwrap();
      toast.success("Billing and lifecycle settings saved.");
    } catch (saveError: any) {
      toast.error(saveError?.data?.message || "Failed to save billing and lifecycle settings.");
    }
  };

  const handleGetEppCode = async () => {
    try {
      const result = await getEppCode({ domainName, clientId }).unwrap();
      setEppCode(result.eppCode || "Not available");
      toast.success("EPP code loaded.");
    } catch {
      setEppCode("Not available");
      toast.error("Failed to load EPP code.");
    }
  };

  return (
    <div className="space-y-6">
      <DomainDetailsHeader
        clientId={clientId}
        domainName={domainName}
        lifecycleStatus={lifecycleStatus}
        lifecycleLabel={lifecycleLabel}
        packageName={service.packageName}
        isRenewing={isRenewing}
        onRenew={handleRenewDomain}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DomainOverviewCard
            domainName={domainName}
            serviceId={domainId}
            productName={service.packageName}
            registrarStatus={registrarStatus}
            registrar={domainDetails?.registrar}
          />

          <DomainBillingLifecycleCard
            lifecycleStatus={editableStatus}
            lifecycleStatusOptions={lifecycleStatusOptions}
            billingCycle={editableBillingCycle}
            billingCycleOptions={billingCycleOptions}
            registrationDate={editableRegistrationDate}
            nextDueDate={editableNextDueDate}
            firstPaymentAmount={editableFirstPaymentAmount}
            recurringAmount={editableRecurringAmount}
            currency={editableCurrency}
            currencyOptions={currencyOptions}
            registrarExpiry={registrarExpiry}
            registrarStatus={registrarStatus}
            lastRegistrarSyncAt={domainDetails?.lastRegistrarSyncAt}
            isSaving={isSavingLifecycleStatus || isSavingProfile}
            onLifecycleStatusChange={setEditableStatus}
            onBillingCycleChange={setEditableBillingCycle}
            onRegistrationDateChange={setEditableRegistrationDate}
            onNextDueDateChange={setEditableNextDueDate}
            onFirstPaymentAmountChange={setEditableFirstPaymentAmount}
            onRecurringAmountChange={setEditableRecurringAmount}
            onCurrencyChange={setEditableCurrency}
            onSave={handleSaveBillingSettings}
          />

          <DomainNameserversCard
            nameservers={nameservers}
            isSaving={isSavingNameservers}
            error={detailsError}
            onChange={handleNameserverChange}
            onAdd={addNameserver}
            onRemove={removeNameserver}
            onSave={handleSaveNameservers}
          />

          <DomainContactTabsCard
            contacts={contacts}
            isLoading={contactsLoading}
            isSaving={isSavingContacts}
            error={contactsError}
            onChange={updateContactField}
            onSave={handleSaveContacts}
          />

          <DomainDnsRecordsCard
            records={dnsRecords}
            paginatedRecords={paginatedDnsRecords}
            recordTypes={dnsRecordTypes}
            page={dnsPage}
            pageSize={dnsPageSize}
            isLoading={dnsLoading}
            isSaving={isSavingDns}
            error={dnsError}
            onChange={updateDnsField}
            onAdd={addDnsRecord}
            onRemove={removeDnsRecord}
            onSave={handleSaveDns}
            onPageChange={setDnsPage}
            onPageSizeChange={(value) => {
              setDnsPageSize(value);
              setDnsPage(1);
            }}
          />

          <DomainAdminNotesCard
            notes={adminNotes}
            isSaving={isSavingNotes}
            onChange={setAdminNotes}
            onSave={handleSaveNotes}
          />
        </div>

        <div className="space-y-6">
          <DomainManagementCard
            registrarLock={registrarLock}
            eppCode={eppCode}
            isSavingLock={isSavingLock}
            isLoadingEpp={isLoadingEpp}
            onRegistrarLockChange={setRegistrarLock}
            onSaveRegistrarLock={handleSaveRegistrarLock}
            onGetEppCode={handleGetEppCode}
          />

          <DomainRenewalAutomationCard
            job={latestRenewalJob}
            isLoading={isRenewalJobsFetching || isRetryingRenewalJob || isSyncingRenewalJob || isMarkingRenewalJob}
            onRetry={handleRetryRenewalJob}
            onSync={handleSyncRenewalJob}
            onMarkRenewed={() => openManualRenewalDialog(latestRenewalJob)}
          />
        </div>
      </div>

      <Dialog open={Boolean(selectedRenewalJob)} onOpenChange={(open) => !open && setSelectedRenewalJob(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Mark Domain Manually Renewed</DialogTitle>
            <DialogDescription>
              Confirm the registrar renewal was completed outside the billing system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Domain</label>
              <Input value={selectedRenewalJob?.domainName || ""} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">New registrar expiry date</label>
              <Input type="date" value={manualExpiryDate} onChange={(event) => setManualExpiryDate(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Registrar transaction ID</label>
              <Input value={manualTransactionId} onChange={(event) => setManualTransactionId(event.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Admin note</label>
              <Textarea value={manualNote} onChange={(event) => setManualNote(event.target.value)} placeholder="Renewed manually from registrar portal." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRenewalJob(null)}>Cancel</Button>
            <Button onClick={handleMarkRenewalJobRenewed} disabled={isMarkingRenewalJob}>
              {isMarkingRenewalJob ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Mark Renewed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 text-sm text-muted-foreground">
        Domain updates are saved section by section so admin/staff can change only what is needed.
      </div>
    </div>
  );
}
