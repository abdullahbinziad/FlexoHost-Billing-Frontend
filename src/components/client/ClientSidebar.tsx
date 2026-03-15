"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { clientNavItems, filterClientNavByAccessAreas } from "@/config/navigation";
import { useMenuNavigation } from "@/hooks/useMenuNavigation";
import { useSidebar } from "@/hooks/useSidebar";
import { useActiveClient } from "@/hooks/useActiveClient";
import { useGetClientProfileActingAsQuery } from "@/store/api/clientApi";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavItem } from "./sidebar/SidebarNavItem";
import { SidebarSubmenu } from "./sidebar/SidebarSubmenu";
import { SidebarFooter } from "./sidebar/SidebarFooter";

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientSidebar({ isOpen, onClose }: ClientSidebarProps) {
  const { isCollapsed, toggleCollapse, isMounted } = useSidebar();
  const { isActingAs, activeClientId } = useActiveClient();
  const { data: actingAsData } = useGetClientProfileActingAsQuery(activeClientId!, {
    skip: !isActingAs || !activeClientId,
  });
  const navItems = useMemo(
    () => filterClientNavByAccessAreas(clientNavItems, actingAsData?.accessAreas),
    [actingAsData?.accessAreas]
  );
  const {
    isSubmenuExpanded,
    isItemActive,
    hasActiveSubmenu,
    isSubmenuItemActive,
    handleMenuClick,
  } = useMenuNavigation(navItems);

  const handleLinkClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  // Use default expanded state until mounted to prevent hydration mismatch
  // This ensures sidebar renders immediately, then updates from localStorage
  const displayCollapsed = isMounted ? isCollapsed : false;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-50 print:hidden",
          // Width: collapsed = 4rem (w-16), expanded = 16rem (w-64)
          // Default to expanded (w-64) until mounted to prevent layout shift
          displayCollapsed ? "w-16" : "w-64",
          // Width transitions only on desktop
          "lg:transition-[width] lg:duration-300 lg:ease-in-out",
          // Mobile: slide in/out with transition
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarHeader
          onClose={onClose}
          isCollapsed={displayCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = isItemActive(item);
              const hasActiveSub = hasActiveSubmenu(item);
              const isExpanded = isSubmenuExpanded(item.href);

              return (
                <li key={item.href}>
                  <SidebarNavItem
                    item={item}
                    isActive={isActive}
                    hasActiveSubmenu={hasActiveSub}
                    isExpanded={isExpanded}
                    isCollapsed={displayCollapsed}
                    onClick={() => handleMenuClick(item)}
                  />

                  {/* Submenu Items - hide when collapsed */}
                  {item.hasSubmenu && isExpanded && !displayCollapsed && (
                    <SidebarSubmenu
                      item={item}
                      isSubmenuItemActive={isSubmenuItemActive}
                      onLinkClick={handleLinkClick}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <SidebarFooter onLinkClick={handleLinkClick} isCollapsed={displayCollapsed} />
      </aside>
    </>
  );
}
