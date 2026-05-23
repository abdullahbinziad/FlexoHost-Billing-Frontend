"use client";

import { formatDate } from "@/utils/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { useGetHostingUsageQuery, useRefreshHostingUsageMutation } from "@/store/api/servicesApi";
import { toast } from "sonner";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsageStatisticsCardProps {
  clientId: string;
  service: HostingServiceDetails;
}

export function UsageStatisticsCard({ clientId, service }: UsageStatisticsCardProps) {
  const { data: usage, isLoading, isError } = useGetHostingUsageQuery(
    { clientId, serviceId: service.id },
    { skip: !clientId || !service.id }
  );
  const [refreshUsage, { isLoading: isRefreshing }] = useRefreshHostingUsageMutation();

  const handleRefresh = async () => {
    try {
      await refreshUsage({ clientId, serviceId: service.id }).unwrap();
      toast.success("Usage refreshed");
    } catch {
      toast.error("Failed to refresh usage");
    }
  };

  const diskUsed = usage?.disk.usedMb ?? service.usage.disk.used;
  const diskTotal = usage?.disk.limitMb ?? service.usage.disk.total;
  const bwUsed = usage?.bandwidth.usedMb ?? service.usage.bandwidth.used;
  const bwTotal =
    usage?.bandwidth.limitMb !== undefined && usage.bandwidth.limitMb > 0
      ? usage.bandwidth.limitMb
      : (typeof service.usage.bandwidth.total === "number"
          ? service.usage.bandwidth.total
          : "unlimited") as number | "unlimited";

  const diskPercentage = diskTotal > 0 ? Math.round((diskUsed / diskTotal) * 100) : 0;
  const bandwidthPercentage =
    bwTotal === "unlimited" || (typeof bwTotal === "number" && bwTotal === 0)
      ? 0
      : typeof bwTotal === "number"
        ? Math.round((bwUsed / bwTotal) * 100)
        : 0;

  const formatBytes = (mb: number): string => {
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const diskData = [
    { name: "Used", value: diskUsed, fill: "hsl(var(--primary))" },
    { name: "Available", value: Math.max(0, diskTotal - diskUsed), fill: "hsl(var(--muted))" },
  ];

  const bandwidthData =
    bwTotal === "unlimited" || (typeof bwTotal === "number" && bwTotal === 0)
      ? [
          { name: "Used", value: bwUsed, fill: "hsl(var(--primary))" },
          { name: "Available", value: Math.max(1000, bwUsed), fill: "hsl(var(--muted))" },
        ]
      : [
          { name: "Used", value: bwUsed, fill: "hsl(var(--primary))" },
          {
            name: "Available",
            value: (bwTotal as number) - bwUsed,
            fill: "hsl(var(--muted))",
          },
        ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload?.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {data.name}: {formatBytes(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading && !usage) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full flex flex-col animate-pulse">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">Usage Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Loading from server...</p>
      </div>
    );
  }

  const lastUpdatedText =
    usage?.updatedAt
      ? `Last updated: ${formatDate(usage.updatedAt, "full")}`
      : usage
        ? "Last updated: — (click Reload to fetch)"
        : isError
          ? "Unable to load usage. Showing limits only."
          : "Last updated: —";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Usage Statistics
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh usage from server"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 flex-1">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Disk Usage</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatBytes(diskUsed)} / {diskTotal > 0 ? formatBytes(diskTotal) : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{diskPercentage}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Used</p>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {diskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Bandwidth Usage</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatBytes(bwUsed)} /{" "}
                {bwTotal === "unlimited" || (typeof bwTotal === "number" && bwTotal === 0)
                  ? "Unlimited"
                  : formatBytes(bwTotal as number)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {bwTotal === "unlimited" || (typeof bwTotal === "number" && bwTotal === 0) ? "—" : `${bandwidthPercentage}%`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Used</p>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bandwidthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {bandwidthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-auto">
        {lastUpdatedText}
      </p>
    </div>
  );
}
