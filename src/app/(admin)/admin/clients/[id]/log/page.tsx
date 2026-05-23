"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetActivityLogQuery } from "@/store/api/activityLogApi";
import { formatDateTime } from "@/utils/format";
import { Loader2 } from "lucide-react";
import type { ActivityLogEntry } from "@/store/api/activityLogApi";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

function userDisplay(entry: ActivityLogEntry): string {
  const u = entry.userId;
  if (!u) return entry.actorType === "system" ? "System" : "—";
  if (typeof u === "object" && u !== null) return (u as { email?: string }).email ?? "User";
  return String(u);
}

export default function ClientLogPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetActivityLogQuery(
    { clientId, page, limit: 50 },
    { skip: !clientId }
  );

  const entries = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Activity Log</CardTitle>
          <p className="text-sm text-muted-foreground">Audit trail of actions for this client</p>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-destructive">
                        Failed to load activity log.
                      </TableCell>
                    </TableRow>
                  ) : entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No activity recorded for this client yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="whitespace-nowrap text-xs text-gray-500">
                          {formatDateTime(entry.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{entry.message}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {entry.category || "other"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-blue-600 dark:text-blue-400">{userDisplay(entry)}</span>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 capitalize">{entry.source || "system"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalResults}
            pageSize={50}
            currentCount={entries.length}
            itemLabel="entries"
            onPageChange={setPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}
