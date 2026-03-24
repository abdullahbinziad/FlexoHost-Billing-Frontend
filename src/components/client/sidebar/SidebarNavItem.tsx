"use client";

import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  hasActiveSubmenu: boolean;
  isExpanded: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

export function SidebarNavItem({
  item,
  isActive,
  hasActiveSubmenu,
  isExpanded,
  isCollapsed,
  onClick,
}: SidebarNavItemProps) {
  const Icon = item.icon;

  if (item.hasSubmenu) {
    return (
      <Button
        variant={isActive || hasActiveSubmenu ? "secondary" : "ghost"}
        onClick={onClick}
        className={cn(
          "w-full rounded-lg text-sm font-medium h-auto transition-all cursor-pointer justify-start gap-2 px-3 py-2.5",
          isCollapsed && "justify-center px-0",
          isActive || hasActiveSubmenu
            ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
            : "text-gray-700 dark:text-gray-300"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon
          className={cn(
            "w-5 h-5 flex-shrink-0 pointer-events-none",
            isActive || hasActiveSubmenu
              ? "text-gray-900 dark:text-gray-100"
              : "text-gray-600 dark:text-gray-400"
          )}
        />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left pointer-events-none">
              {item.label}
            </span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 dark:bg-primary/20 text-primary rounded pointer-events-none">
                {item.badge}
              </span>
            )}
            <div className="flex-shrink-0 transition-transform duration-200 pointer-events-none">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </>
        )}
      </Button>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-lg text-sm font-medium transition-colors relative group cursor-pointer w-full gap-2 px-3 py-2.5",
        isCollapsed && "justify-center px-0",
        isActive
          ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <Icon
        className={cn(
          "w-5 h-5 flex-shrink-0 pointer-events-none",
          isActive
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-600 dark:text-gray-400"
        )}
      />
      {!isCollapsed && (
        <>
          <span className="flex-1 pointer-events-none">{item.label}</span>
          {item.badge && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 dark:bg-primary/20 text-primary rounded pointer-events-none">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
