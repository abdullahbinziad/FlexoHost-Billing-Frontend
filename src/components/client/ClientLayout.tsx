"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { ClientSidebar } from "./ClientSidebar";
import { ClientHeader } from "./ClientHeader";
import { ClientRouteGuard } from "./ClientRouteGuard";
import { useSidebar } from "@/hooks/useSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveClient } from "@/hooks/useActiveClient";
import { PublicLayout } from "@/components/client/PublicLayout";
import { setActingAs, clearActingAs as clearActingAsAction } from "@/store/slices/activeClientSlice";
import { loadActingAs, clearActingAsStorage } from "@/store/slices/activeClientPersistence";
import { useGetClientProfileActingAsQuery } from "@/store/api/clientApi";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingActingAs, setPendingActingAs] = useState<{ clientId: string; ownerLabel: string } | null>(null);
  const { isCollapsed, isMounted } = useSidebar();
  const { isAuthenticated, user } = useAuth();
  const { isActingAs, ownerLabel, clearActingAs, activeClientId } = useActiveClient();
  const hasRehydrated = useRef(false);

  const { data: actingAsProfile } = useGetClientProfileActingAsQuery(activeClientId!, {
    skip: !isActingAs || !activeClientId,
  });
  const accessAreas = actingAsProfile?.accessAreas;

  // When acting as: redirect if current path requires an area the grant doesn't allow
  useEffect(() => {
    if (!isActingAs || !accessAreas) return;
    const path = pathname ?? "";
    const noInvoices = path === "/invoices" && !accessAreas.invoices;
    const noTickets = path === "/tickets" && !accessAreas.tickets;
    const noOrders = path === "/billing/history" && !accessAreas.orders;
    const noBilling = path === "/billing" && !accessAreas.invoices && !accessAreas.orders;
    if (noInvoices || noTickets || noOrders || noBilling) {
      router.replace("/");
    }
  }, [isActingAs, accessAreas, pathname, router]);

  const handleSwitchBack = () => {
    clearActingAs();
    clearActingAsStorage();
    router.push("/");
  };

  // Restore acting-as from localStorage and validate before applying
  useEffect(() => {
    if (!isAuthenticated || !user || hasRehydrated.current) return;
    hasRehydrated.current = true;
    const stored = loadActingAs();
    if (stored?.clientId && typeof stored.ownerLabel === "string") {
      setPendingActingAs({ clientId: stored.clientId, ownerLabel: stored.ownerLabel });
    }
  }, [isAuthenticated, user]);

  const { data: actingAsProfileData, isError: actingAsProfileError, isSuccess: actingAsProfileSuccess } =
    useGetClientProfileActingAsQuery(pendingActingAs?.clientId ?? "", {
      skip: !pendingActingAs?.clientId,
    });

  useEffect(() => {
    if (!pendingActingAs) return;
    if (actingAsProfileSuccess && actingAsProfileData) {
      dispatch(setActingAs({ clientId: pendingActingAs.clientId, ownerLabel: pendingActingAs.ownerLabel }));
      setPendingActingAs(null);
    }
    if (actingAsProfileError) {
      clearActingAsStorage();
      dispatch(clearActingAsAction());
      setPendingActingAs(null);
    }
  }, [pendingActingAs, actingAsProfileSuccess, actingAsProfileData, actingAsProfileError, dispatch]);

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
            <ClientHeader
              onMenuClick={toggleSidebar}
              managingAccountLabel={isActingAs && ownerLabel ? ownerLabel : undefined}
              onExitManagingAccount={
                isActingAs && ownerLabel ? handleSwitchBack : undefined
              }
            />
            <main
              className={cn(
                "print:pt-0",
                isActingAs && ownerLabel
                  ? "min-h-[calc(100vh-10.25rem)] pt-[10.25rem] sm:min-h-[calc(100vh-7.5rem)] sm:pt-[7.5rem]"
                  : "min-h-[calc(100vh-4rem)] pt-16"
              )}
            >
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
