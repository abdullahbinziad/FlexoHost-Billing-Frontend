"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FileText, ShoppingCart, Server, MessageSquare, Loader2, Globe, AlertCircle } from "lucide-react";
import { useActiveClient } from "@/hooks/useActiveClient";
import { useGetClientProfileActingAsQuery } from "@/store/api/clientApi";
import { useGetClientServicesQuery } from "@/store/api/servicesApi";
import { useGetAllInvoicesQuery } from "@/store/api/invoiceApi";
import { useGetTicketsQuery } from "@/store/api/ticketApi";
import { useGetOrdersQuery } from "@/store/api/orderApi";
import { useGetDomainsQuery } from "@/store/api/domainApi";
import { DashboardStatCard } from "./DashboardStatCard";
import { DashboardRecentInvoices } from "./DashboardRecentInvoices";
import { DashboardRecentTickets } from "./DashboardRecentTickets";
import { DashboardQuickLinks } from "./DashboardQuickLinks";
import { INVOICE_STATUS_ADMIN, TICKET_STATUS } from "@/constants/status";

export function ClientDashboard() {
  const { activeClientId, isProfileLoading, isActingAs, myProfile } = useActiveClient();
  const { data: profileWhenActingAs, isLoading: actingAsProfileLoading } = useGetClientProfileActingAsQuery(
    activeClientId!,
    { skip: !isActingAs || !activeClientId }
  );
  const client = isActingAs ? profileWhenActingAs?.client : myProfile;
  const clientId = activeClientId ?? "";
  const accessAreas = profileWhenActingAs?.accessAreas;
  const loading = isProfileLoading || (isActingAs && actingAsProfileLoading);

  const allowInvoices = accessAreas?.invoices !== false;
  const allowOrders = accessAreas?.orders !== false;
  const allowTickets = accessAreas?.tickets !== false;

  const { data: invoicesData } = useGetAllInvoicesQuery(
    { clientId, limit: 5, page: 1 },
    { skip: !clientId || (isActingAs && !allowInvoices) }
  );
  const { data: ordersData } = useGetOrdersQuery(
    clientId ? { clientId, page: 1, limit: 1 } : undefined,
    { skip: !clientId || (isActingAs && !allowOrders) }
  );
  const { data: servicesData } = useGetClientServicesQuery(
    { clientId, params: { limit: 100 } },
    { skip: !clientId }
  );
  const { data: ticketsData } = useGetTicketsQuery(
    { clientId, limit: 5, page: 1 },
    { skip: !clientId || (isActingAs && !allowTickets) }
  );
  const { data: domainsData } = useGetDomainsQuery(
    { limit: 100 },
    { skip: !clientId }
  );

  const orderCount = ordersData?.totalResults ?? 0;
  const services = servicesData?.services ?? [];
  const unpaidCount = useMemo(
    () => (invoicesData?.results ?? []).filter((inv) => inv.status !== INVOICE_STATUS_ADMIN.PAID).length,
    [invoicesData?.results]
  );
  const openTicketsCount = useMemo(
    () =>
      (ticketsData?.results ?? []).filter(
        (t) => t.status !== TICKET_STATUS.CLOSED && t.status !== TICKET_STATUS.RESOLVED
      ).length,
    [ticketsData?.results]
  );
  const overdueCount = useMemo(() => {
    const invs = invoicesData?.results ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return invs.filter(
      (inv) =>
        (inv.status === INVOICE_STATUS_ADMIN.UNPAID || inv.status === INVOICE_STATUS_ADMIN.OVERDUE) &&
        inv.dueDate &&
        new Date(inv.dueDate) < today
    ).length;
  }, [invoicesData?.results]);

  const domainsCount = domainsData?.total ?? 0;

  const displayName =
    [client?.firstName, client?.lastName].filter(Boolean).join(" ") ||
    client?.companyName ||
    client?.contactEmail ||
    (client?.user as { email?: string })?.email ||
    "there";

  if (loading && !client) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 text-center">
        <p className="text-amber-800 dark:text-amber-200 font-medium">
          Complete your profile to see your dashboard.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <Link href="/complete-profile" className="text-primary hover:underline">
            Complete profile
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overdue alert */}
      {overdueCount > 0 && allowInvoices && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {overdueCount} overdue invoice{overdueCount > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
              Pay now to avoid service interruption.
            </p>
          </div>
          <Link
            href="/invoices"
            className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 transition-colors"
          >
            Pay now
          </Link>
        </div>
      )}

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here’s an overview of your account and recent activity.
        </p>
      </div>

      {/* Quick links */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Quick actions
        </h2>
        <DashboardQuickLinks />
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardStatCard
          title="Invoices"
          value={invoicesData?.totalResults ?? 0}
          viewAllHref="/invoices"
          icon={FileText}
          hint={unpaidCount > 0 ? `${unpaidCount} unpaid` : undefined}
        />
        <DashboardStatCard
          title="Orders"
          value={orderCount}
          viewAllHref="/billing"
          viewAllLabel="Billing"
          icon={ShoppingCart}
        />
        <DashboardStatCard
          title="Services"
          value={services.length}
          viewAllHref="/hosting"
          viewAllLabel="Hosting"
          icon={Server}
        />
        <DashboardStatCard
          title="Domains"
          value={domainsCount}
          viewAllHref="/domains"
          viewAllLabel="Domains"
          icon={Globe}
        />
        <DashboardStatCard
          title="Tickets"
          value={ticketsData?.totalResults ?? 0}
          viewAllHref="/tickets"
          icon={MessageSquare}
          hint={
            openTicketsCount > 0 ? `${openTicketsCount} open` : undefined
          }
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardRecentInvoices clientId={clientId} />
        <DashboardRecentTickets clientId={clientId} />
      </div>
    </div>
  );
}
