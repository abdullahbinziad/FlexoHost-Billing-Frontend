"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ClientSidebar } from "./ClientSidebar";
import { ClientHeader } from "./ClientHeader";
import { ClientRouteGuard } from "./ClientRouteGuard";
import { useSidebar } from "@/hooks/useSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/public/PublicLayout"; // Assuming path
// You might need to move PublicLayout logic INLINE or import components from it 
// to avoid full page wrap if `ClientLayout` is just a wrapper around children.
// Actually, `PublicLayout` is a full wrapper. So we modify `ClientLayout` to choose.

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed, isMounted } = useSidebar();
  const { isAuthenticated, user, isLoading } = useAuth(); // Get auth state

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

  // Calculate margin based on collapsed state
  const contentMargin = isMounted
    ? (isCollapsed ? "lg:ml-16" : "lg:ml-64")
    : "lg:ml-64";

  return (
    <ClientRouteGuard>
      {/* If authenticated, show full dashboard layout */}
      {isAuthenticated && user ? (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <ClientSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          <div
            className={cn(
              "ml-0 print:ml-0",
              "lg:transition-[margin-left] lg:duration-300 lg:ease-in-out",
              contentMargin
            )}
          >
            <ClientHeader onMenuClick={toggleSidebar} />
            <main className="pt-16 min-h-[calc(100vh-4rem)] print:pt-0">
              <div className="p-4 sm:p-6 print:p-0">{children}</div>
            </main>
          </div>
        </div>
      ) : (
        /* If NOT authenticated (but passed guard, e.g. /checkout), show Public Layout */
        <PublicLayout>
          {children}
        </PublicLayout>
      )}
    </ClientRouteGuard>
  );
}
