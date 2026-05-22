"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FileText,
  Wrench,
  CreditCard,
  Mail,
  TrendingUp,
  XCircle,
  Bell,
  RefreshCw,
  Ticket,
  Database,
  Server,
  ArrowRightLeft,
  Loader2,
  CalendarRange,
} from "lucide-react";
import {
  type DailyActionDetailType,
  useGetDailyActionsQuery,
  useLazyGetDailyActionDetailsQuery,
} from "@/store/api/dashboardApi";
import { DailyActionCard } from "./DailyActionCard";
import { DailyActionDetailsModal } from "./DailyActionDetailsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PresetKey =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "last4Months"
  | "last6Months"
  | "last12Months"
  | "custom";

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(base: Date, months: number): Date {
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next;
}

function getPresetRange(preset: Exclude<PresetKey, "custom">): { from: string; to: string } {
  const today = new Date();

  if (preset === "today") {
    const value = toDateInputValue(today);
    return { from: value, to: value };
  }

  if (preset === "yesterday") {
    const value = toDateInputValue(addDays(today, -1));
    return { from: value, to: value };
  }

  if (preset === "last7Days") {
    return { from: toDateInputValue(addDays(today, -6)), to: toDateInputValue(today) };
  }

  if (preset === "last30Days") {
    return { from: toDateInputValue(addDays(today, -29)), to: toDateInputValue(today) };
  }

  if (preset === "last4Months") {
    return { from: toDateInputValue(addMonths(today, -4)), to: toDateInputValue(today) };
  }

  if (preset === "last6Months") {
    return { from: toDateInputValue(addMonths(today, -6)), to: toDateInputValue(today) };
  }

  return { from: toDateInputValue(addMonths(today, -12)), to: toDateInputValue(today) };
}

const PRESET_OPTIONS: Array<{ key: Exclude<PresetKey, "custom">; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7Days", label: "Last week" },
  { key: "last30Days", label: "Last month" },
  { key: "last4Months", label: "Last 4 months" },
  { key: "last6Months", label: "Last 6 months" },
  { key: "last12Months", label: "1 year" },
];

export function DailyActionsDashboard() {
  const initialRange = useMemo(() => getPresetRange("today"), []);
  const [activePreset, setActivePreset] = useState<PresetKey>("today");
  const [dateFrom, setDateFrom] = useState(initialRange.from);
  const [dateTo, setDateTo] = useState(initialRange.to);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailType, setSelectedDetailType] = useState<DailyActionDetailType | null>(null);

  const { data: stats, isLoading, isError } = useGetDailyActionsQuery({
    dateFrom,
    dateTo,
  });
  const [loadDetails, { data: detailData, isFetching: isLoadingDetails }] =
    useLazyGetDailyActionDetailsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-2 text-muted-foreground">
        <p>Failed to load daily actions. Please try again.</p>
      </div>
    );
  }

  const s = stats;

  const blocks = [
    {
      title: "Invoices",
      icon: FileText,
      primaryValue: s.invoices?.generated ?? 0,
      primaryLabel: "Generated",
      detailHref: "/admin/billing/invoices",
      detailType: "invoices" as const,
    },
    {
      title: "Late Fees",
      icon: Wrench,
      primaryValue: s.lateFees?.added ?? 0,
      primaryLabel: "Added",
      statusOverride: s.lateFees?.message,
    },
    {
      title: "Credit Card Charges",
      icon: CreditCard,
      primaryValue: s.creditCardCharges?.captured ?? 0,
      primaryLabel: "Captured",
      secondary:
        (s.creditCardCharges?.declined ?? 0) > 0
          ? `${s.creditCardCharges?.declined ?? 0} Declined`
          : undefined,
      declinedCount: s.creditCardCharges?.declined ?? 0,
      detailHref: "/admin/billing/transactions",
      detailType: "creditCardCharges" as const,
    },
    {
      title: "Invoice & Overdue Reminders",
      icon: Mail,
      primaryValue: s.invoiceReminders?.sent ?? 0,
      primaryLabel: "Sent",
    },
    {
      title: "Currency Exchange Rates",
      icon: TrendingUp,
      primaryValue: 0,
      primaryLabel: "",
      statusOverride:
        s.currencyExchangeRates?.status === "completed"
          ? "Task completed successfully."
          : s.currencyExchangeRates?.message ?? "Task has not completed.",
      detailHref: "/admin/billing/invoices",
    },
    {
      title: "Cancellation Requests",
      icon: XCircle,
      primaryValue: s.cancellationRequests?.processed ?? 0,
      primaryLabel: "Processed",
      failedCount: s.cancellationRequests?.failed ?? 0,
      statusOverride: s.cancellationRequests?.message,
    },
    {
      title: "Overdue Suspensions",
      icon: Bell,
      primaryValue: s.overdueSuspensions?.suspended ?? 0,
      primaryLabel: "Suspended",
      failedCount: s.overdueSuspensions?.failed ?? 0,
    },
    {
      title: "Domain Transfer Status Synchronisation",
      icon: ArrowRightLeft,
      primaryValue: s.domainTransferSync?.transfersChecked ?? 0,
      primaryLabel: "Transfers Checked",
    },
    {
      title: "Domain Status Synchronisation",
      icon: RefreshCw,
      primaryValue: s.domainStatusSync?.domainsSynced ?? 0,
      primaryLabel: "Domains Synced",
    },
    {
      title: "Inactive Tickets",
      icon: Ticket,
      primaryValue: s.inactiveTickets?.closed ?? 0,
      primaryLabel: "Closed",
      detailHref: "/admin/tickets",
      detailType: "inactiveTickets" as const,
    },
    {
      title: "Database Backup",
      icon: Database,
      primaryValue: 0,
      primaryLabel: "",
      statusOverride: s.databaseBackup?.message ?? "Disabled",
    },
    {
      title: "Server Usage Stats",
      icon: Server,
      primaryValue: 0,
      primaryLabel: "",
      statusOverride:
        s.serverUsageStats?.status === "completed"
          ? "Task completed successfully."
          : s.serverUsageStats?.message ?? "Pending",
    },
  ];

  const openDetails = async (type: DailyActionDetailType) => {
    setSelectedDetailType(type);
    setDetailModalOpen(true);
    await loadDetails({ type, dateFrom, dateTo });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Daily Actions
          </h1>
          <p className="text-muted-foreground mt-1">
            Operational summary for the selected date range. Use the automation monitor for scheduler health, alerts, and reruns.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/automation">Open Automation Monitor</Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 text-card-foreground">
        <div className="flex items-center gap-2 text-sm font-medium mb-3">
          <CalendarRange className="w-4 h-4 text-muted-foreground" />
          Date Range
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_OPTIONS.map((preset) => (
            <Button
              key={preset.key}
              type="button"
              size="sm"
              variant={activePreset === preset.key ? "default" : "outline"}
              onClick={() => {
                const range = getPresetRange(preset.key);
                setActivePreset(preset.key);
                setDateFrom(range.from);
                setDateTo(range.to);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              From
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setActivePreset("custom");
                setDateFrom(event.target.value);
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              To
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setActivePreset("custom");
                setDateTo(event.target.value);
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const range = getPresetRange("today");
              setActivePreset("today");
              setDateFrom(range.from);
              setDateTo(range.to);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {blocks.map((block) => (
          <DailyActionCard
            key={block.title}
            title={block.title}
            icon={block.icon}
            primaryValue={block.primaryValue ?? 0}
            primaryLabel={block.primaryLabel ?? ""}
            secondary={block.secondary}
            statusOverride={block.statusOverride}
            detailHref={block.detailHref}
            onPrimaryClick={
              block.detailType ? () => void openDetails(block.detailType) : undefined
            }
            failedCount={block.failedCount}
            declinedCount={block.declinedCount}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <span className="shrink-0" aria-hidden>
          ℹ️
        </span>
        <span>
          Click a count to open the matching records in a modal, then jump to the item you need.
        </span>
      </div>

      <DailyActionDetailsModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        isLoading={isLoadingDetails}
        data={
          selectedDetailType && detailData?.type === selectedDetailType
            ? detailData
            : undefined
        }
      />
    </div>
  );
}
