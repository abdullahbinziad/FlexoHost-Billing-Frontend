"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Trash2, CheckCheck, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
} from "@/store/api/notificationApi";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 30000; // 30 seconds when dropdown is open

interface NotificationsDropdownProps {
  className?: string;
}

/**
 * Dynamic, interactive notifications dropdown.
 * - Polls for new notifications when open
 * - Mark read, delete, navigate to link
 * - Relative timestamps, loading skeleton
 */
export function NotificationsDropdown({ className }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery(
    { page: 1, limit: 15 },
    {
      pollingInterval: isOpen ? POLL_INTERVAL_MS : 0,
      refetchOnMountOrArgChange: isOpen,
    }
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.results ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (n: { _id: string; read: boolean; linkPath?: string }) => {
    setIsOpen(false);
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
  };

  return (
    <div className={cn("relative", className)} ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          setIsOpen((o) => !o);
          if (!isOpen) refetch();
        }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-xl py-0 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Notifications</span>
              {isFetching && !isLoading && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => markAllRead()}
                  disabled={isMarkingAll}
                >
                  {isMarkingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                  <span className="ml-1.5">Mark all read</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                <Link href="/notifications" onClick={() => setIsOpen(false)}>
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-muted" />
                      <div className="h-2 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary/5 dark:bg-primary/10"
                  )}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm font-medium line-clamp-1",
                        !n.read && "text-foreground"
                      )}>
                        {n.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, n._id)}
                        disabled={isDeleting}
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  {n.linkPath && (
                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <Bell className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">We'll notify you when something happens</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
