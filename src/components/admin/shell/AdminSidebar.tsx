"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/config/adminNavigation";
import { filterAdminNavByRole } from "@/types/navigation";
import { useMenuNavigation } from "@/hooks/useMenuNavigation";
import { useSidebar } from "@/hooks/useSidebar";
import {
    SidebarHeader,
    SidebarNavItem,
    SidebarSubmenu,
    SidebarFooter,
} from "@/components/shared/sidebar";
import type { RootState } from "@/store";
import { useGetOrdersQuery } from "@/store/api/orderApi";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const user = useSelector((s: RootState) => s.auth?.user ?? null);
    const { data: pendingOrdersData } = useGetOrdersQuery({ status: "pending", page: 1, limit: 1 });
    const pendingOrdersCount = pendingOrdersData?.totalResults ?? 0;
    const navItems = useMemo(() => {
        const filtered = filterAdminNavByRole(adminNavItems, user);
        const pendingBadge = pendingOrdersCount > 0 ? String(pendingOrdersCount) : undefined;
        return filtered.map((item) => {
            if (item.href !== "/admin/orders" || !item.submenu) return item;
            return {
                ...item,
                submenu: item.submenu.map((subItem) =>
                    subItem.href === "/admin/orders" ? { ...subItem, badge: pendingBadge } : subItem
                ),
            };
        });
    }, [user, pendingOrdersCount]);

    const { isCollapsed, toggleCollapse, isMounted } = useSidebar();
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

    const displayCollapsed = isMounted ? isCollapsed : false;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-50",
                    displayCollapsed ? "w-16" : "w-64",
                    "lg:transition-[width] lg:duration-300 lg:ease-in-out",
                    "transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* We reuse SidebarHeader but might want to customize title/logo for Admin */}
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
                                        onLinkClick={handleLinkClick}
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

                <SidebarFooter onLinkClick={handleLinkClick} isCollapsed={displayCollapsed} hideStatusAndSettings />
            </aside>
        </>
    );
}
