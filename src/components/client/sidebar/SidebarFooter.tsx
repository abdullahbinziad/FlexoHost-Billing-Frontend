"use client";

import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarFooterProps {
  onLinkClick: () => void;
  isCollapsed: boolean;
}

export function SidebarFooter({
  onLinkClick,
  isCollapsed,
}: SidebarFooterProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    onLinkClick();
    logout();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-2">
      <Link
        href="/settings"
        onClick={onLinkClick}
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
          isCollapsed && "justify-center px-0"
        )}
        title={isCollapsed ? "Settings" : undefined}
      >
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {!isCollapsed && <span>Settings</span>}
      </Link>

      <button
        onClick={handleLogout}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
          isCollapsed && "justify-center px-0"
        )}
        title={isCollapsed ? "Logout" : undefined}
      >
        <LogOut className="w-5 h-5" />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </div>
  );
}
