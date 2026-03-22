"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/useSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminRouteGuard } from "./AdminRouteGuard";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed, isMounted } = useSidebar();

  // Close sidebar on window resize if it becomes desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const contentMargin = isMounted
    ? (isCollapsed ? "lg:ml-16" : "lg:ml-64")
    : "lg:ml-64";

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div
          className={cn(
            "ml-0",
            "lg:transition-[margin-left] lg:duration-300 lg:ease-in-out",
            contentMargin
          )}
        >
          <AdminHeader onMenuClick={toggleSidebar} />

          {/* Main content area with top padding for fixed header */}
          <main className="pt-16 min-h-[calc(100vh-4rem)]">
            <div className="p-4 sm:p-6">{children}</div>
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
