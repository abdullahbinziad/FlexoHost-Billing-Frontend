"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";

interface SidebarSubmenuProps {
  item: NavItem;
  isSubmenuItemActive: (subItemHref: string, parentItem: NavItem) => boolean;
  onLinkClick: () => void;
}

export function SidebarSubmenu({
  item,
  isSubmenuItemActive,
  onLinkClick,
}: SidebarSubmenuProps) {
  if (!item.submenu) return null;

  return (
    <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
      {item.submenu.map((subItem) => {
        const hasNested = subItem.submenu && subItem.submenu.length > 0;
        const isSubActive = isSubmenuItemActive(subItem.href, item) || (hasNested && subItem.submenu!.some((n) => isSubmenuItemActive(n.href, item)));

        return (
          <li key={subItem.href}>
            <Link
              href={subItem.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isSubActive
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <span>{subItem.label}</span>
            </Link>
            {hasNested && (
              <ul className="mt-1 ml-2 space-y-0.5 border-l-2 border-gray-100 dark:border-gray-800 pl-3">
                {subItem.submenu!.map((nestedItem) => {
                  const isNestedActive = isSubmenuItemActive(nestedItem.href, item);
                  return (
                    <li key={nestedItem.href}>
                      <Link
                        href={nestedItem.href}
                        onClick={onLinkClick}
                        className={cn(
                          "flex items-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                          isNestedActive
                            ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                            : "text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                        )}
                      >
                        <span>{nestedItem.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
