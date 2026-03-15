"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/store/api/notificationApi";
import { cn } from "@/lib/utils";

interface NotificationsDropdownProps {
  className?: string;
}

/**
 * Reusable notifications dropdown – used in both ClientHeader and AdminHeader.
 * Fetches notifications for the current user, shows unread count, and allows
 * mark-as-read + navigation to linked items. linkPath is stored fully (e.g. /admin/tickets/xxx).
 */
export function NotificationsDropdown({ className }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useGetNotificationsQuery({ page: 1, limit: 10 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-40">
          <div className="flex items-center justify-between px-3 pb-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                className="text-[11px] text-primary hover:underline"
                onClick={() => markAllRead()}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {data?.results?.length ? (
              data.results.map((n) => (
                <button
                  key={n._id}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60",
                    !n.read && "bg-blue-50/70 dark:bg-blue-900/20"
                  )}
                  onClick={async () => {
                    setIsOpen(false);
                    if (!n.read) await markRead(n._id);
                    // Only allow relative paths to prevent open redirect
                    if (
                      n.linkPath &&
                      typeof n.linkPath === "string" &&
                      n.linkPath.startsWith("/") &&
                      !n.linkPath.startsWith("//")
                    ) {
                      window.location.href = n.linkPath;
                    }
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {n.title}
                      </div>
                      <div className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                        {n.message}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
