"use client";

import { useMemo, useState } from "react";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { formatDateTime } from "@/utils/format";
import {
  type AutomationRunItem,
  type AutomationRunSource,
  type AutomationRunStatus,
  type AutomationTaskKey,
  type DomainRenewalJobItem,
  useGetAutomationRunsQuery,
  useGetAutomationSummaryQuery,
  useGetDomainRenewalJobsQuery,
  useMarkDomainRenewalJobRenewedMutation,
  useRetryDomainRenewalJobMutation,
  useSyncDomainRenewalJobFromRegistrarMutation,
  useTriggerAutomationTaskMutation,
} from "@/store/api/servicesApi";
import { AUTOMATION_RUN_STATUS, SELECT_SENTINEL } from "@/constants/status";

const ALL_VALUE = SELECT_SENTINEL.ALL;

function formatInterval(intervalMs: number) {
  const minutes = Math.round(intervalMs / (60 * 1000));
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} hr`;
  return `${hours.toFixed(1)} hr`;
}

function formatDuration(durationMs?: number) {
  if (!durationMs || durationMs < 1000) return durationMs ? `${durationMs} ms` : "—";
  if (durationMs < 60_000) return `${(durationMs / 1000).toFixed(1)} s`;
  return `${(durationMs / 60_000).toFixed(1)} min`;
}

function getStatusVariant(status?: AutomationRunStatus) {
  if (status === AUTOMATION_RUN_STATUS.SUCCESS) return "default" as const;
  if (status === AUTOMATION_RUN_STATUS.FAILURE) return "destructive" as const;
  return "secondary" as const;
}

function summarizeResult(run: AutomationRunItem) {
  if (run.errorMessage) return run.errorMessage;
  if (!run.result) return "—";
  const processed = run.result.processed;
  const createdInvoices = run.result.createdInvoices;
  const skippedExisting = run.result.skippedExisting;
  const failed = run.result.failed;

  const isBillableRecurringSummary =
    typeof processed === "number" &&
    typeof createdInvoices === "number" &&
    typeof skippedExisting === "number" &&
    typeof failed === "number";

  if (isBillableRecurringSummary) {
    return `Processed: ${processed} | Created: ${createdInvoices} | Skipped: ${skippedExisting} | Failed: ${failed}`;
  }

  return Object.entries(run.result)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join(" | ");
}

export default function AutomationMonitorPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [taskFilter, setTaskFilter] = useState<string>(ALL_VALUE);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_VALUE);
  const [sourceFilter, setSourceFilter] = useState<string>(ALL_VALUE);
  const [activeTrigger, setActiveTrigger] = useState<AutomationTaskKey | null>(null);
  const [selectedRenewalJob, setSelectedRenewalJob] = useState<DomainRenewalJobItem | null>(null);
  const [manualExpiryDate, setManualExpiryDate] = useState("");
  const [manualTransactionId, setManualTransactionId] = useState("");
  const [manualNote, setManualNote] = useState("");

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useGetAutomationSummaryQuery();

  const {
    data: runsResponse,
    isLoading: isRunsLoading,
    isFetching: isRunsFetching,
    refetch: refetchRuns,
  } = useGetAutomationRunsQuery({
    page,
    limit: pageSize,
    taskKey: taskFilter !== ALL_VALUE ? (taskFilter as AutomationTaskKey) : undefined,
    status: statusFilter !== ALL_VALUE ? (statusFilter as AutomationRunStatus) : undefined,
    source: sourceFilter !== ALL_VALUE ? (sourceFilter as AutomationRunSource) : undefined,
  });

  const [triggerTask] = useTriggerAutomationTaskMutation();
  const {
    data: domainRenewalJobs,
    isFetching: isDomainJobsFetching,
    refetch: refetchDomainJobs,
  } = useGetDomainRenewalJobsQuery({ status: "FAILED", limit: 10 });
  const [retryDomainRenewalJob, { isLoading: isRetryingDomainJob }] = useRetryDomainRenewalJobMutation();
  const [syncDomainRenewalJob, { isLoading: isSyncingDomainJob }] = useSyncDomainRenewalJobFromRegistrarMutation();
  const [markDomainRenewalJobRenewed, { isLoading: isMarkingDomainJob }] = useMarkDomainRenewalJobRenewedMutation();

  const tasks = summary?.tasks ?? [];
  const runs = runsResponse?.results ?? [];
  const totals = summary?.totals;

  const taskOptions = useMemo(
    () => tasks.map((task) => ({ value: task.key, label: task.label })),
    [tasks]
  );

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchRuns(), refetchDomainJobs()]);
  };

  const handleTrigger = async (taskKey: AutomationTaskKey, label: string) => {
    try {
      setActiveTrigger(taskKey);
      const result = await triggerTask({ taskKey }).unwrap();
      toast.success(result.message || `${label} started`);
      await handleRefresh();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to run ${label}`);
    } finally {
      setActiveTrigger(null);
    }
  };

  const openManualRenewalDialog = (job: DomainRenewalJobItem) => {
    setSelectedRenewalJob(job);
    setManualExpiryDate(job.renewedUntil ? new Date(job.renewedUntil).toISOString().slice(0, 10) : "");
    setManualTransactionId(job.registrarTransactionId || "");
    setManualNote(job.manualResolutionNote || "");
  };

  const handleRetryDomainJob = async (job: DomainRenewalJobItem) => {
    try {
      await retryDomainRenewalJob({ jobId: job._id }).unwrap();
      toast.success("Domain renewal job queued for retry.");
      await handleRefresh();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to retry domain renewal job.");
    }
  };

  const handleSyncDomainJob = async (job: DomainRenewalJobItem) => {
    try {
      await syncDomainRenewalJob({ jobId: job._id }).unwrap();
      toast.success("Domain renewal job synced from registrar.");
      await handleRefresh();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to sync from registrar.");
    }
  };

  const handleMarkDomainJobRenewed = async () => {
    if (!selectedRenewalJob) return;
    if (!manualExpiryDate) {
      toast.error("Expiry date is required.");
      return;
    }
    try {
      await markDomainRenewalJobRenewed({
        jobId: selectedRenewalJob._id,
        expiresAt: manualExpiryDate,
        registrarTransactionId: manualTransactionId || undefined,
        note: manualNote || undefined,
      }).unwrap();
      toast.success("Domain renewal marked as manually renewed.");
      setSelectedRenewalJob(null);
      await handleRefresh();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to mark domain renewal as complete.");
    }
  };

  const topCards = [
    { label: "Healthy Tasks", value: totals?.healthy ?? 0, helper: "Last known status success or never run" },
    { label: "Running Now", value: totals?.running ?? 0, helper: "Tasks currently in progress" },
    { label: "Failures (24h)", value: totals?.failures24h ?? 0, helper: "Recent failed automation runs" },
    { label: "Successes (24h)", value: totals?.successes24h ?? 0, helper: "Recent successful automation runs" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automation Monitor</h1>
          <p className="mt-1 text-muted-foreground">
            Track cron health, review recent runs, and manually execute automation tasks when needed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={summary?.cronEnabled ? "default" : "destructive"}>
            {summary?.cronEnabled ? "Cron enabled" : "Cron disabled"}
          </Badge>
          <Badge variant={summary?.alertsEnabled ? "secondary" : "outline"}>
            Alerts {summary?.alertsEnabled ? "enabled" : "disabled"}
          </Badge>
          <Button variant="outline" onClick={handleRefresh} disabled={isSummaryFetching || isRunsFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${(isSummaryFetching || isRunsFetching) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Health</CardTitle>
        </CardHeader>
        <CardContent>
          {isSummaryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Failure alerts trigger after <span className="font-medium text-foreground">{summary?.alertThreshold ?? 0}</span> consecutive cron failures.
                {" "}Channels:
                {" "}
                <span className="font-medium text-foreground">
                  {summary?.alertChannels.email ? "Email" : ""}
                  {summary?.alertChannels.email && summary?.alertChannels.webhook ? " + " : ""}
                  {summary?.alertChannels.webhook ? "Webhook" : ""}
                  {!summary?.alertChannels.email && !summary?.alertChannels.webhook ? "None configured" : ""}
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
              {tasks.map((task) => (
                <div key={task.key} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">{task.label}</h2>
                        <Badge variant={getStatusVariant(task.lastRun?.status)}>
                          {task.runningCount > 0 ? "running" : task.lastRun?.status ?? "idle"}
                        </Badge>
                        {task.alertOpen ? (
                          <Badge variant="destructive">alert open</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTrigger(task.key, task.label)}
                      disabled={activeTrigger === task.key}
                    >
                      {activeTrigger === task.key ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      Run now
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <div className="text-muted-foreground">Interval</div>
                      <div className="font-medium">{formatInterval(task.intervalMs)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Run on start</div>
                      <div className="font-medium">{task.runOnStart ? "Yes" : "No"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Successes (24h)</div>
                      <div className="font-medium">{task.successCount24h}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Failures (24h)</div>
                      <div className="font-medium">{task.failureCount24h}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Consecutive failures</div>
                      <div className="font-medium">{task.consecutiveFailures}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last started</div>
                      <div className="font-medium">
                        {task.lastRun?.startedAt ? formatDateTime(task.lastRun.startedAt) : "Never"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last duration</div>
                      <div className="font-medium">{formatDuration(task.lastRun?.durationMs)}</div>
                    </div>
                  </div>

                  {task.lastRun?.errorMessage ? (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                      {task.lastRun.errorMessage}
                    </div>
                  ) : null}
                </div>
              ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Recent Runs</CardTitle>
          <div className="flex flex-wrap gap-3">
            <div className="w-[220px]">
              <label className="mb-1 block text-xs text-muted-foreground">Task</label>
              <Select
                value={taskFilter}
                onValueChange={(value) => {
                  setTaskFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All tasks</SelectItem>
                  {taskOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <label className="mb-1 block text-xs text-muted-foreground">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <label className="mb-1 block text-xs text-muted-foreground">Source</label>
              <Select
                value={sourceFilter}
                onValueChange={(value) => {
                  setSourceFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All sources</SelectItem>
                  <SelectItem value="cron">Cron</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRunsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium">Started</th>
                      <th className="p-3 text-left font-medium">Task</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Source</th>
                      <th className="p-3 text-left font-medium">Duration</th>
                      <th className="p-3 text-left font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No automation runs found.
                        </td>
                      </tr>
                    ) : (
                      runs.map((run) => (
                        <tr key={run.id} className="border-b align-top">
                          <td className="p-3 whitespace-nowrap text-muted-foreground">
                            {formatDateTime(run.startedAt)}
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{run.taskLabel}</div>
                            <div className="text-xs text-muted-foreground">{run.taskKey}</div>
                          </td>
                          <td className="p-3">
                            <Badge variant={getStatusVariant(run.status)}>{run.status}</Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{run.source}</td>
                          <td className="p-3 text-muted-foreground">{formatDuration(run.durationMs)}</td>
                          <td className="p-3 text-muted-foreground">{summarizeResult(run)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <DataTablePagination
                page={page}
                totalPages={runsResponse?.totalPages ?? 1}
                totalItems={runsResponse?.totalResults ?? 0}
                pageSize={pageSize}
                currentCount={runs.length}
                itemLabel="runs"
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
                pageSizeOptions={[20, 50, 100]}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Failed Domain Renewal Jobs</CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetchDomainJobs()} disabled={isDomainJobsFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isDomainJobsFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Domain</th>
                  <th className="p-3 text-left font-medium">Registrar</th>
                  <th className="p-3 text-left font-medium">Attempts</th>
                  <th className="p-3 text-left font-medium">Target Expiry</th>
                  <th className="p-3 text-left font-medium">Error</th>
                  <th className="p-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(domainRenewalJobs?.data ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No failed domain renewal jobs.
                    </td>
                  </tr>
                ) : (
                  (domainRenewalJobs?.data ?? []).map((job) => (
                    <tr key={job._id} className="border-b align-top">
                      <td className="p-3">
                        <div className="font-medium">{job.domainName}</div>
                        <div className="text-xs text-muted-foreground">Invoice {job.invoiceId}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{job.registrar || "Default"}</td>
                      <td className="p-3">
                        <Badge variant="destructive">{job.attempts}/{job.maxAttempts}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{formatDateTime(job.renewedUntil)}</td>
                      <td className="max-w-[320px] p-3 text-muted-foreground">{job.lastError || "—"}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryDomainJob(job)}
                            disabled={isRetryingDomainJob}
                          >
                            Retry
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncDomainJob(job)}
                            disabled={isSyncingDomainJob}
                          >
                            Sync
                          </Button>
                          <Button size="sm" onClick={() => openManualRenewalDialog(job)}>
                            Mark Renewed
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
            <Button onClick={handleMarkDomainJobRenewed} disabled={isMarkingDomainJob}>
              {isMarkingDomainJob ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Mark Renewed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
