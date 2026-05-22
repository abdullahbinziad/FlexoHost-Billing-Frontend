"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Trash2,
  CheckCheck,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllReadNotificationsMutation,
} from "@/store/api/notificationApi";
import { formatRelativeTime } from "@/utils/format";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "billing", label: "Billing" },
  { value: "service", label: "Service" },
  { value: "support", label: "Support" },
  { value: "security", label: "Security" },
] as const;

export default function NotificationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState<"" | "read" | "unread">("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data, isLoading } = useGetNotificationsQuery({
    page,
    limit: 15,
    read: readFilter === "read" ? true : readFilter === "unread" ? false : undefined,
    category: categoryFilter || undefined,
  });

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [deleteAllRead, { isLoading: isDeletingAll }] = useDeleteAllReadNotificationsMutation();

  const notifications = data?.results ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalResults = data?.totalResults ?? 0;
  const unreadCount = data?.unreadCount ?? 0;

  const handleNotificationClick = async (n: { _id: string; read: boolean; linkPath?: string }) => {
    if (!n.read) await markRead(n._id);
    if (
      n.linkPath &&
      typeof n.linkPath === "string" &&
      n.linkPath.startsWith("/") &&
      !n.linkPath.startsWith("//")
    ) {
      router.push(n.linkPath);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id);
    toast.success("Notification deleted");
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success("All notifications marked as read");
  };

  const handleDeleteAllRead = async () => {
    const result = await deleteAllRead().unwrap();
    toast.success(`Deleted ${(result as any)?.deletedCount ?? 0} read notifications`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
              <span className="ml-1.5">Mark all read</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteAllRead}
            disabled={isDeletingAll || unreadCount === totalResults}
            className="text-destructive hover:text-destructive"
          >
            {isDeletingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span className="ml-1.5">Clear read</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={readFilter} onValueChange={(v) => { setReadFilter(v as any); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-1.5" />
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value || "all"} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-medium text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground mt-1">
                {readFilter || categoryFilter
                  ? "Try adjusting your filters"
                  : "We'll notify you when something happens"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={cn(
                    "group flex items-start gap-4 px-4 py-4 cursor-pointer transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary/5 dark:bg-primary/10"
                  )}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded capitalize",
                            n.category === "billing" && "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
                            n.category === "service" && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
                            n.category === "support" && "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
                            n.category === "security" && "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          )}
                        >
                          {n.category}
                        </span>
                        <p className={cn("font-medium", !n.read && "text-foreground")}>
                          {n.title}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, n._id)}
                        disabled={isDeleting}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  {n.linkPath && (
                    <ChevronRight className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          )}

          {!isLoading && notifications.length > 0 && (
            <div className="border-t p-3">
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                totalItems={totalResults}
                pageSize={15}
                currentCount={notifications.length}
                itemLabel="notifications"
                onPageChange={setPage}
                variant="compact"
                showJumpToPage={false}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
