"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { DOMAIN_SYNC_STATE } from "@/constants/status";
import {
  useBulkSyncAdminDomainsMutation,
  useGetAdminDomainsQuery,
  useGetAdminRegistrarConfigsQuery,
  useImportAdminRegistrarDomainsMutation,
  useReconcileAdminRegistrarDomainsMutation,
  useSyncAdminDomainMutation,
} from "@/store/api/domainApi";
import { formatDateTime } from "@/utils/format";

const ALL_VALUE = "all";

export default function AdminDomainsInventoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [registrarFilter, setRegistrarFilter] = useState(ALL_VALUE);
  const [serviceStatusFilter, setServiceStatusFilter] = useState(ALL_VALUE);
  const [transferStatusFilter, setTransferStatusFilter] = useState(ALL_VALUE);
  const [syncStateFilter, setSyncStateFilter] = useState(ALL_VALUE);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedRegistrarKey, setSelectedRegistrarKey] = useState("");
  const [selectedMissingDomains, setSelectedMissingDomains] = useState<Set<string>>(new Set());

  const { data: registrarConfigs = [] } = useGetAdminRegistrarConfigsQuery();
  const {
    data: inventoryResponse,
    isLoading,
    isFetching,
    error,
  } = useGetAdminDomainsQuery({
    page,
    limit: pageSize,
    search: searchTerm || undefined,
    registrar: registrarFilter !== ALL_VALUE ? registrarFilter : undefined,
    serviceStatus: serviceStatusFilter !== ALL_VALUE ? serviceStatusFilter : undefined,
    transferStatus: transferStatusFilter !== ALL_VALUE ? transferStatusFilter : undefined,
    syncState: syncStateFilter !== ALL_VALUE ? syncStateFilter : undefined,
    sortBy: "domainName",
    sortOrder: "asc",
  });
  const [syncDomain, { isLoading: isSyncingSingle }] = useSyncAdminDomainMutation();
  const [bulkSyncDomains, { isLoading: isBulkSyncing }] = useBulkSyncAdminDomainsMutation();
  const [reconcileRegistrar, { data: reconcileResult, isLoading: isReconciling }] =
    useReconcileAdminRegistrarDomainsMutation();
  const [importRegistrarDomains, { isLoading: isImporting }] =
    useImportAdminRegistrarDomainsMutation();

  const results = inventoryResponse?.results ?? [];
  const totalResults = inventoryResponse?.totalResults ?? 0;
  const totalPages = inventoryResponse?.totalPages ?? 1;
  const activeRegistrarConfigs = useMemo(
    () => registrarConfigs.filter((item) => item.implemented),
    [registrarConfigs]
  );

  const resetSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(results.map((item) => item.serviceId)));
      return;
    }
    resetSelection();
  };

  const toggleSelectOne = (serviceId: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(serviceId);
      } else {
        next.delete(serviceId);
      }
      return next;
    });
  };

  const handleSearch = () => {
    setSearchTerm(searchDraft.trim());
    setPage(1);
    resetSelection();
  };

  const handleSingleSync = async (serviceId: string, domainName: string) => {
    try {
      await syncDomain({ serviceId }).unwrap();
      toast.success(`Synced ${domainName}`);
    } catch (syncError: any) {
      toast.error(syncError?.data?.message || `Failed to sync ${domainName}`);
    }
  };

  const handleBulkSync = async (mode: "selected" | "filtered") => {
    try {
      const result = await bulkSyncDomains(
        mode === "selected" && selectedIds.size > 0
          ? { serviceIds: Array.from(selectedIds) }
          : {
              search: searchTerm || undefined,
              registrar: registrarFilter !== ALL_VALUE ? registrarFilter : undefined,
              serviceStatus: serviceStatusFilter !== ALL_VALUE ? serviceStatusFilter : undefined,
              transferStatus: transferStatusFilter !== ALL_VALUE ? transferStatusFilter : undefined,
              syncState: syncStateFilter !== ALL_VALUE ? syncStateFilter : undefined,
            }
      ).unwrap();
      toast.success(`Bulk sync finished. ${result.synced} synced, ${result.failed} failed.`);
      resetSelection();
    } catch (syncError: any) {
      toast.error(syncError?.data?.message || "Bulk sync failed");
    }
  };

  const handleReconcile = async () => {
    if (!selectedRegistrarKey) {
      toast.error("Select a registrar first");
      return;
    }
    try {
      const result = await reconcileRegistrar({ registrarKey: selectedRegistrarKey }).unwrap();
      setSelectedMissingDomains(new Set(result.missingDomains.map((item) => item.domainName)));
      toast.success(`Reconciled ${result.totalDomains} registrar domains`);
    } catch (reconcileError: any) {
      toast.error(reconcileError?.data?.message || "Registrar reconciliation failed");
    }
  };

  const handleImportSelected = async () => {
    if (!selectedRegistrarKey || selectedMissingDomains.size === 0) {
      toast.error("Select missing domains to import");
      return;
    }
    try {
      const result = await importRegistrarDomains({
        registrarKey: selectedRegistrarKey,
        domains: Array.from(selectedMissingDomains),
      }).unwrap();
      toast.success(`Imported ${result.importedCount} domains for tracking`);
    } catch (importError: any) {
      toast.error(importError?.data?.message || "Failed to import registrar domains");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Domain Inventory
          </h1>
          <p className="text-sm text-muted-foreground">
            Search all client domains, sync them from registrars, and reconcile missing registrar domains.
          </p>
        </div>
        {(isFetching || isSyncingSingle || isBulkSyncing) ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating domain inventory...
          </div>
        ) : null}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Search / Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Search domains
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Domain, registrar, client name, email, service number..."
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
            <div className="grid w-full gap-4 md:grid-cols-3 xl:w-auto xl:grid-cols-4">
              <div className="min-w-[180px]">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Registrar
                </label>
                <Select
                  value={registrarFilter}
                  onValueChange={(value) => {
                    setRegistrarFilter(value);
                    setPage(1);
                    resetSelection();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All registrars</SelectItem>
                    {activeRegistrarConfigs.map((registrar) => (
                      <SelectItem key={registrar.key} value={registrar.key}>
                        {registrar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[180px]">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Service status
                </label>
                <Select
                  value={serviceStatusFilter}
                  onValueChange={(value) => {
                    setServiceStatusFilter(value);
                    setPage(1);
                    resetSelection();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[180px]">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Transfer status
                </label>
                <Select
                  value={transferStatusFilter}
                  onValueChange={(value) => {
                    setTransferStatusFilter(value);
                    setPage(1);
                    resetSelection();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All transfer states</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[180px]">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Sync state
                </label>
                <Select
                  value={syncStateFilter}
                  onValueChange={(value) => {
                    setSyncStateFilter(value);
                    setPage(1);
                    resetSelection();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All sync states</SelectItem>
                    <SelectItem value={DOMAIN_SYNC_STATE.FRESH}>Fresh</SelectItem>
                    <SelectItem value={DOMAIN_SYNC_STATE.STALE}>Stale</SelectItem>
                    <SelectItem value={DOMAIN_SYNC_STATE.NEVER}>Never synced</SelectItem>
                    <SelectItem value={DOMAIN_SYNC_STATE.FAILED}>Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={isBulkSyncing}
              onClick={() => handleBulkSync("selected")}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Selected
            </Button>
            <Button
              variant="outline"
              disabled={isBulkSyncing}
              onClick={() => handleBulkSync("filtered")}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Filtered Results
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSearchDraft("");
                setSearchTerm("");
                setRegistrarFilter(ALL_VALUE);
                setServiceStatusFilter(ALL_VALUE);
                setTransferStatusFilter(ALL_VALUE);
                setSyncStateFilter(ALL_VALUE);
                setPage(1);
                resetSelection();
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing Domains</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-white dark:bg-gray-900">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={results.length > 0 && results.every((item) => selectedIds.has(item.serviceId))}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Registrar</TableHead>
                  <TableHead>Service Status</TableHead>
                  <TableHead>Sync</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      Loading domains...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-destructive">
                      Failed to load domain inventory.
                    </TableCell>
                  </TableRow>
                ) : results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No domains matched the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((item) => (
                    <TableRow key={item.serviceId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(item.serviceId)}
                          onCheckedChange={(checked) => toggleSelectOne(item.serviceId, Boolean(checked))}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-blue-600">{item.domainName}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.serviceNumber || "No service number"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.clientName || "Unknown client"}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.clientEmail || item.clientCompanyName || "No client email"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{item.registrar || "—"}</span>
                          {item.transferStatus ? (
                            <span className="text-xs text-muted-foreground">
                              Transfer: {item.transferStatus}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{item.serviceStatus}</Badge>
                          {item.registrarStatus ? <Badge variant="secondary">{item.registrarStatus}</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              item.syncState === DOMAIN_SYNC_STATE.FAILED
                                ? "destructive"
                                : item.syncState === DOMAIN_SYNC_STATE.FRESH
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {item.syncState || "unknown"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.lastRegistrarSyncAt ? formatDateTime(item.lastRegistrarSyncAt) : "Never synced"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.expiresAt ? formatDateTime(item.expiresAt) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSingleSync(item.serviceId, item.domainName)}
                            disabled={isSyncingSingle}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/clients/${item.clientId}/domains/${item.serviceId}`}>
                              Open
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalResults}
            pageSize={pageSize}
            currentCount={results.length}
            itemLabel="domains"
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
            pageSizeOptions={[20, 50, 100]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registrar Reconcile / Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="w-full md:max-w-xs">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Registrar
              </label>
              <Select value={selectedRegistrarKey} onValueChange={setSelectedRegistrarKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select registrar" />
                </SelectTrigger>
                <SelectContent>
                  {activeRegistrarConfigs.map((registrar) => (
                    <SelectItem key={registrar.key} value={registrar.key}>
                      {registrar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleReconcile} disabled={isReconciling}>
                {isReconciling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reconciling
                  </>
                ) : (
                  "Preview Missing Domains"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleImportSelected}
                disabled={isImporting || selectedMissingDomains.size === 0}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing
                  </>
                ) : (
                  `Import Selected (${selectedMissingDomains.size})`
                )}
              </Button>
            </div>
          </div>

          {reconcileResult ? (
            <div className="space-y-3 rounded-lg border border-dashed p-4">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>Registrar: <strong>{reconcileResult.registrar}</strong></span>
                <span>Total registrar domains: <strong>{reconcileResult.totalDomains}</strong></span>
                <span>Already tracked locally: <strong>{reconcileResult.knownCount}</strong></span>
                <span>Missing locally: <strong>{reconcileResult.missingDomains.length}</strong></span>
              </div>

              {reconcileResult.missingDomains.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No missing registrar domains were found.
                </p>
              ) : (
                <div className="space-y-2">
                  {reconcileResult.missingDomains.map((item) => (
                    <label
                      key={item.domainName}
                      className="flex items-center justify-between rounded border p-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedMissingDomains.has(item.domainName)}
                          onCheckedChange={(checked) => {
                            setSelectedMissingDomains((current) => {
                              const next = new Set(current);
                              if (checked) {
                                next.add(item.domainName);
                              } else {
                                next.delete(item.domainName);
                              }
                              return next;
                            });
                          }}
                        />
                        <span className="font-medium">{item.domainName}</span>
                      </div>
                      {item.alreadyImported ? <Badge variant="secondary">Already imported</Badge> : null}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
