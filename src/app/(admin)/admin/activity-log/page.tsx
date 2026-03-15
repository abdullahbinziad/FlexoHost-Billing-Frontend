"use client";

import { useState } from "react";
import {
  useGetActivityLogQuery,
  type ActivityLogEntry,
} from "@/store/api/activityLogApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

function formatDate(createdAt: string) {
  const d = new Date(createdAt);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(",", "");
}

function clientDisplay(entry: ActivityLogEntry): string {
  const c = entry.clientId;
  if (!c) return "None";
  if (typeof c === "object" && c !== null) {
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ");
    return name || c.contactEmail || (c as any)._id || "—";
  }
  return String(c);
}

function userDisplay(entry: ActivityLogEntry): string {
  const u = entry.userId;
  if (!u) return entry.actorType === "system" ? "System/Automated" : "—";
  if (typeof u === "object" && u !== null) {
    return (u as any).email ?? (u as any)._id ?? "—";
  }
  return String(u);
}

export default function ActivityLogPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState("");
  const ALL_VALUE = "__all__";
  const [actorType, setActorType] = useState<string>(ALL_VALUE);
  const [category, setCategory] = useState<string>(ALL_VALUE);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading } = useGetActivityLogQuery({
    page,
    limit: pageSize,
    search: searchSubmitted || undefined,
    actorType: actorType && actorType !== ALL_VALUE ? (actorType as "user" | "system") : undefined,
    category: category && category !== ALL_VALUE ? category : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const results = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Activity Log</h1>
        <p className="text-muted-foreground mt-1">
          Search and filter automated tasks, logins, and system events.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Search / Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground block mb-1">
                Search log message
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1);
                      setSearchSubmitted(search);
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    setPage(1);
                    setSearchSubmitted(search);
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-muted-foreground block mb-1">
                Actor
              </label>
              <Select value={actorType} onValueChange={(value) => {
                setActorType(value);
                setPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All</SelectItem>
                  <SelectItem value="system">System/Automated</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-muted-foreground block mb-1">
                Category
              </label>
              <Select value={category} onValueChange={(value) => {
                setCategory(value);
                setPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All</SelectItem>
                  <SelectItem value="cron">Cron</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-muted-foreground block mb-1">
                Date from
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-muted-foreground block mb-1">
                Date to
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="border-b px-4 py-3">
                <DataTablePagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalResults}
                  pageSize={pageSize}
                  currentCount={results.length}
                  itemLabel="records"
                  onPageChange={setPage}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(1);
                  }}
                  pageSizeOptions={[20, 50, 100]}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Log Entry</th>
                      <th className="text-left p-3 font-medium">Client</th>
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No log entries found.
                        </td>
                      </tr>
                    ) : (
                      results.map((entry) => (
                        <tr key={entry._id} className="border-b hover:bg-muted/30">
                          <td className="p-3 whitespace-nowrap text-muted-foreground">
                            {formatDate(entry.createdAt)}
                          </td>
                          <td className="p-3">{entry.message}</td>
                          <td className="p-3 text-muted-foreground">
                            {clientDisplay(entry)}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {userDisplay(entry)}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {entry.ipAddress || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
