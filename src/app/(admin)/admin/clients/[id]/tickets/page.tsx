"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetTicketsQuery } from "@/store/api/ticketApi";
import { formatDate } from "@/utils/format";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { TICKET_STATUS } from "@/constants/status";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  answered: "Answered (waiting client)",
  customer_reply: "Customer replied",
  on_hold: "On hold",
  in_progress: "In progress",
  closed: "Closed",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "answered", label: "Answered" },
  { value: "customer_reply", label: "Customer replied" },
  { value: "on_hold", label: "On hold" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
  { value: "resolved", label: "Resolved" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const DEPARTMENT_OPTIONS = [
  { value: "all", label: "All departments" },
  { value: "technical", label: "Technical" },
  { value: "billing", label: "Billing" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
];

export default function ClientTicketsPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const { data, isLoading, error } = useGetTicketsQuery(
    {
      page,
      limit,
      clientId,
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      department: departmentFilter !== "all" ? departmentFilter : undefined,
    },
    { skip: !clientId }
  );

  const tickets = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Support Tickets</CardTitle>
          <p className="text-sm text-muted-foreground">
            Support requests and communication history for this client.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tickets">
            <Plus className="w-4 h-4 mr-2" />
            Open New Ticket
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0 space-y-3">
        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Status
              </label>
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
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Priority
              </label>
              <Select
                value={priorityFilter}
                onValueChange={(value) => {
                  setPriorityFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Department
              </label>
              <Select
                value={departmentFilter}
                onValueChange={(value) => {
                  setDepartmentFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[100px]">Ticket #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-destructive">
                    Failed to load tickets.
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No tickets for this client yet.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-medium text-blue-600">
                      <Link
                        href={`/admin/clients/${clientId}/tickets/${t._id}`}
                        className="hover:underline"
                      >
                        {t.ticketNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell className="capitalize">{t.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === TICKET_STATUS.CLOSED || t.status === TICKET_STATUS.RESOLVED
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {STATUS_LABELS[t.status] ?? t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(t.lastRepliedAt || t.updatedAt || t.createdAt)}
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
          pageSize={limit}
          currentCount={tickets.length}
          itemLabel="tickets"
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
