"use client";

import { formatDate } from "@/utils/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface UsageStatisticsCardProps {
  service: HostingServiceDetails;
}

export function UsageStatisticsCard({ service }: UsageStatisticsCardProps) {
  const diskPercentage = Math.round((service.usage.disk.used / service.usage.disk.total) * 100);
  const bandwidthPercentage =
    service.usage.bandwidth.total === "unlimited"
      ? 0
      : Math.round((service.usage.bandwidth.used / service.usage.bandwidth.total) * 100);

  const formatBytes = (mb: number): string => {
    if (mb < 1024) {
      return `${mb.toFixed(2)} MB`;
    }
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const diskData = [
    { name: "Used", value: service.usage.disk.used, fill: "hsl(var(--primary))" },
    { name: "Available", value: service.usage.disk.total - service.usage.disk.used, fill: "hsl(var(--muted))" },
  ];

  const bandwidthData =
    service.usage.bandwidth.total === "unlimited"
      ? [
          { name: "Used", value: service.usage.bandwidth.used, fill: "hsl(var(--primary))" },
          { name: "Available", value: 1000, fill: "hsl(var(--muted))" },
        ]
      : [
          { name: "Used", value: service.usage.bandwidth.used, fill: "hsl(var(--primary))" },
          {
            name: "Available",
            value: service.usage.bandwidth.total - service.usage.bandwidth.used,
            fill: "hsl(var(--muted))",
          },
        ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
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


  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full flex flex-col">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">
        Usage Statistics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 flex-1">
        {/* Disk Usage Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Disk Usage</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatBytes(service.usage.disk.used)} / {formatBytes(service.usage.disk.total)}
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

        {/* Bandwidth Usage Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Bandwidth Usage</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatBytes(service.usage.bandwidth.used)} /{" "}
                {service.usage.bandwidth.total === "unlimited"
                  ? "Unlimited"
                  : formatBytes(service.usage.bandwidth.total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {service.usage.bandwidth.total === "unlimited" ? "0" : bandwidthPercentage}%
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
        Last Updated {formatDate(service.usage.disk.lastUpdated, "full")} (
        {new Date(service.usage.disk.lastUpdated).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
        )
      </p>
    </div>
  );
}
