"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Globe,
  Calendar,
  Shield,
  Server,
  Settings,
  Key,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import Link from "next/link";
import {
  type DomainContact,
  type DomainContactDetails,
  type DomainDnsRecord,
  useGetAdminDomainDetailsQuery,
  useGetAdminDomainContactsQuery,
  useGetAdminDomainDnsQuery,
  useLazyGetAdminEppCodeQuery,
  useRenewDomainMutation,
  useUpdateAdminDomainContactsMutation,
  useUpdateAdminDomainDnsMutation,
  useUpdateAdminDomainRegistrarLockMutation,
  useUpdateAdminNameserversMutation,
} from "@/store/api/domainApi";
import {
  useAdminUpdateServiceNotesMutation,
  useGetClientServiceByIdQuery,
} from "@/store/api/servicesApi";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { formatDate } from "@/utils/format";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DOMAIN_STATUS } from "@/constants/status";

const contactSections: Array<keyof DomainContactDetails> = ["registrant", "admin", "tech", "billing"];

const dnsRecordTypes: DomainDnsRecord["type"][] = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "forward", "stealth", "email"];

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

export default function DomainDetailsPage({
  params,
}: {
  params: Promise<{ id: string; domainId: string }>;
}) {
  const { id: clientId, domainId } = use(params);

  const { data: service, isLoading, error } = useGetClientServiceByIdQuery(
    { clientId, serviceId: domainId },
    { skip: !clientId || !domainId }
  );

  const domainName = service?.domain ?? service?.identifier ?? "";
  const { data: domainDetails, isLoading: detailsLoading, error: detailsError } = useGetAdminDomainDetailsQuery(
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

  const [updateNameservers, { isLoading: isSavingNameservers }] = useUpdateAdminNameserversMutation();
  const [updateRegistrarLock, { isLoading: isSavingLock }] = useUpdateAdminDomainRegistrarLockMutation();
  const [updateContacts, { isLoading: isSavingContacts }] = useUpdateAdminDomainContactsMutation();
  const [updateDns, { isLoading: isSavingDns }] = useUpdateAdminDomainDnsMutation();
  const [renewDomain, { isLoading: isRenewing }] = useRenewDomainMutation();
  const [updateNotes, { isLoading: isSavingNotes }] = useAdminUpdateServiceNotesMutation();
  const [getEppCode, { isLoading: isLoadingEpp }] = useLazyGetAdminEppCodeQuery();

  const [nameservers, setNameservers] = useState<string[]>(["", ""]);
  const [registrarLock, setRegistrarLock] = useState(false);
  const [contacts, setContacts] = useState<DomainContactDetails>(createEmptyContacts());
  const [dnsRecords, setDnsRecords] = useState<DomainDnsRecord[]>([createEmptyDnsRecord()]);
  const [dnsPage, setDnsPage] = useState(1);
  const [dnsPageSize, setDnsPageSize] = useState(10);
  const [adminNotes, setAdminNotes] = useState("");
  const [eppCode, setEppCode] = useState("");
  const paginatedDnsRecords = useMemo(
    () => dnsRecords.slice((dnsPage - 1) * dnsPageSize, dnsPage * dnsPageSize),
    [dnsRecords, dnsPage, dnsPageSize]
  );

  useEffect(() => {
    setAdminNotes(service?.adminNotes ?? "");
  }, [service?.adminNotes]);

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

  const status = domainDetails?.status ?? service?.rawStatus ?? service?.status ?? "—";
  const nextDue = domainDetails?.expirationDate || service?.billing?.nextDueDate || "—";
  const registrationDate = service?.billing?.registrationDate || "—";

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
      await renewDomain({ domainName, clientId, years: 1 }).unwrap();
      toast.success("Domain renewal request submitted.");
    } catch {
      toast.error("Failed to renew domain.");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground mb-2" asChild>
            <Link href={`/admin/clients/${clientId}/domains`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Domains
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {domainName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={
                    status === DOMAIN_STATUS.ACTIVE
                      ? "bg-green-500 hover:bg-green-600"
                      : status === DOMAIN_STATUS.SUSPENDED
                        ? "bg-amber-500"
                        : "bg-gray-500"
                  }
                >
                  {status}
                </Badge>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{service.packageName ?? "Domain"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`https://${domainName}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Visit Site
            </a>
          </Button>
          <Button onClick={handleRenewDomain} disabled={isRenewing}>
            {isRenewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Renew Domain
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                Domain Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain Name</label>
                  <Input value={domainName} className="font-medium" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service ID</label>
                  <Input value={domainId} className="font-mono text-sm" readOnly />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</label>
                  <Input value={service.packageName ?? "—"} readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <Input value={status} readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registrar</label>
                  <Input value={domainDetails?.registrar || "—"} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-500" />
                Nameservers
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleSaveNameservers} disabled={isSavingNameservers}>
                {isSavingNameservers ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailsError ? (
                <p className="text-sm text-destructive">Failed to load live domain details.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nameservers.map((value, index) => (
                      <div key={`${index}-${index + 1}`} className="relative flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">NS{index + 1}</span>
                          <Input
                            className="pl-12"
                            placeholder={`Nameserver ${index + 1}`}
                            value={value}
                            onChange={(event) => handleNameserverChange(index, event.target.value)}
                          />
                        </div>
                        {nameservers.length > 2 ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeNameserver(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={addNameserver}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Nameserver
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                Contact Information
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleSaveContacts} disabled={isSavingContacts || contactsLoading}>
                {isSavingContacts ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Contacts
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactsError ? (
                <p className="text-sm text-destructive">Failed to load registrar contact details.</p>
              ) : (
                contactSections.map((section) => (
                  <div key={section} className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-sm font-semibold capitalize">{section}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Contact name"
                        value={contacts[section].name ?? ""}
                        onChange={(event) => updateContactField(section, "name", event.target.value)}
                      />
                      <Input
                        placeholder="Organization"
                        value={contacts[section].organization ?? ""}
                        onChange={(event) => updateContactField(section, "organization", event.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        value={contacts[section].email ?? ""}
                        onChange={(event) => updateContactField(section, "email", event.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Code"
                          value={contacts[section].phonecc ?? ""}
                          onChange={(event) => updateContactField(section, "phonecc", event.target.value)}
                        />
                        <div className="col-span-2">
                          <Input
                            placeholder="Phone number"
                            value={contacts[section].phonenum ?? ""}
                            onChange={(event) => updateContactField(section, "phonenum", event.target.value)}
                          />
                        </div>
                      </div>
                      <Input
                        placeholder="Address line 1"
                        value={contacts[section].address1 ?? ""}
                        onChange={(event) => updateContactField(section, "address1", event.target.value)}
                      />
                      <Input
                        placeholder="Address line 2"
                        value={contacts[section].address2 ?? ""}
                        onChange={(event) => updateContactField(section, "address2", event.target.value)}
                      />
                      <Input
                        placeholder="City"
                        value={contacts[section].city ?? ""}
                        onChange={(event) => updateContactField(section, "city", event.target.value)}
                      />
                      <Input
                        placeholder="State / Region"
                        value={contacts[section].state ?? ""}
                        onChange={(event) => updateContactField(section, "state", event.target.value)}
                      />
                      <Input
                        placeholder="Postal code"
                        value={contacts[section].zip ?? ""}
                        onChange={(event) => updateContactField(section, "zip", event.target.value)}
                      />
                      <Input
                        placeholder="Country"
                        value={contacts[section].country ?? ""}
                        onChange={(event) => updateContactField(section, "country", event.target.value)}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-500" />
                DNS Records
              </CardTitle>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={addDnsRecord}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
                <Button size="sm" variant="outline" onClick={handleSaveDns} disabled={isSavingDns || dnsLoading}>
                  {isSavingDns ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save DNS
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dnsError ? (
                <p className="text-sm text-destructive">Failed to load DNS records.</p>
              ) : (
                paginatedDnsRecords.map((record, pageIndex) => {
                  const index = (dnsPage - 1) * dnsPageSize + pageIndex;
                  return (
                  <div key={`${record.type}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-lg border p-4">
                    <div className="md:col-span-2">
                      <Select
                        value={record.type}
                        onValueChange={(value) => updateDnsField(index, "type", value as DomainDnsRecord["type"])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {dnsRecordTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Host"
                        value={record.name ?? ""}
                        onChange={(event) => updateDnsField(index, "name", event.target.value)}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Input
                        placeholder="Value"
                        value={record.value}
                        onChange={(event) => updateDnsField(index, "value", event.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        placeholder="TTL"
                        type="number"
                        value={record.ttl ?? ""}
                        onChange={(event) => updateDnsField(index, "ttl", Number(event.target.value) || 0)}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        placeholder="Prio"
                        type="number"
                        value={record.priority ?? ""}
                        onChange={(event) => updateDnsField(index, "priority", Number(event.target.value) || 0)}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button type="button" variant="outline" size="icon" onClick={() => removeDnsRecord(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )})
              )}
              {!dnsError ? (
                <DataTablePagination
                  page={dnsPage}
                  totalPages={Math.ceil(dnsRecords.length / dnsPageSize) || 1}
                  totalItems={dnsRecords.length}
                  pageSize={dnsPageSize}
                  currentCount={paginatedDnsRecords.length}
                  itemLabel="DNS records"
                  onPageChange={setDnsPage}
                  onPageSizeChange={(value) => {
                    setDnsPageSize(value);
                    setDnsPage(1);
                  }}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Admin Notes</CardTitle>
              <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={isSavingNotes}>
                {isSavingNotes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Notes
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add private notes about this domain..."
                className="min-h-[100px]"
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Dates & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Registration Date</label>
                <Input type="text" value={registrationDate ? formatDate(registrationDate, "short") : "—"} readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Next Due Date</label>
                <Input type="text" value={nextDue ? formatDate(nextDue, "short") : "—"} readOnly />
              </div>
              <Separator className="my-2" />
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Recurring</label>
                <Input
                  value={
                    service.billing
                      ? `${service.billing.currency ?? ""} ${service.billing.recurringAmount ?? 0} / ${service.billing.billingCycle ?? ""}`
                      : "—"
                  }
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Live Details Sync</label>
                <Input type="text" value={detailsLoading ? "Refreshing..." : "Available"} readOnly />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Registrar Lock</label>
                  <p className="text-xs text-muted-foreground">Prevent unauthorized transfers</p>
                </div>
                <Switch checked={registrarLock} onCheckedChange={setRegistrarLock} />
              </div>
              <Separator />
              <Button variant="outline" onClick={handleSaveRegistrarLock} disabled={isSavingLock}>
                {isSavingLock ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                Save Lock Setting
              </Button>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium">EPP Code</label>
                <div className="flex gap-2">
                  <Input value={eppCode} readOnly placeholder="Fetch EPP code when needed" />
                  <Button variant="outline" onClick={handleGetEppCode} disabled={isLoadingEpp}>
                    {isLoadingEpp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Feature Coverage</label>
                  <p className="text-xs text-muted-foreground">This admin page now edits real registrar-backed data.</p>
                </div>
                <Badge variant="outline">Editable</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 text-sm text-muted-foreground">
        Domain updates are saved section by section so admin/staff can change only what is needed.
      </div>
    </div>
  );
}
