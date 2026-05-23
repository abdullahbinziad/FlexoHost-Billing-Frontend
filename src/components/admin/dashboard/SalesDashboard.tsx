"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DollarSign,
  FileText,
  ShoppingCart,
  Users,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetClientsQuery } from "@/store/api/clientApi";
import { useGetOrdersQuery } from "@/store/api/orderApi";
import { useGetAllInvoicesQuery, useGetDashboardStatsQuery } from "@/store/api/invoiceApi";
import { useGetTicketsQuery } from "@/store/api/ticketApi";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { SalesStatCard } from "./SalesStatCard";
import { INVOICE_STATUS_ADMIN, TICKET_STATUS } from "@/constants/status";

export function SalesDashboard() {
  const formatCurrency = useFormatCurrency();
  const [displayCurrency, setDisplayCurrency] = useState<string | undefined>(undefined);

  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery();
  const { data: ordersResponse, isLoading: ordersLoading } = useGetOrdersQuery({
    page: 1,
    limit: 1,
  });
  const { data: invoicesData, isLoading: invoicesLoading } = useGetAllInvoicesQuery({
    page: 1,
    limit: 500,
  });
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery(
    displayCurrency ? { displayCurrency } : {}
  );
  const { data: ticketsData, isLoading: ticketsLoading } = useGetTicketsQuery({
    page: 1,
    limit: 200,
  });

  const clients = clientsData?.clients ?? [];
  const recentOrders = ordersResponse?.results ?? [];
  const invoices = invoicesData?.results ?? [];
  const tickets = ticketsData?.results ?? [];
  const ordersCount = ordersResponse?.totalResults ?? 0;

  const baseCurrency = statsData?.baseCurrency ?? "USD";
  const showInDisplay =
    statsData?.displayTotals && statsData?.displayCurrency;
  const totalRevenue = showInDisplay
    ? statsData!.displayTotals!.totalRevenue
    : (statsData?.totalRevenueInBase ?? 0);
  const unpaidAmount = showInDisplay
    ? statsData!.displayTotals!.unpaid
    : (statsData?.unpaidInBase ?? 0);
  const revenueUnpaidCurrency = showInDisplay
    ? statsData!.displayCurrency!
    : baseCurrency;
  const paidCount = statsData?.paidCount ?? 0;
  const unpaidCount = statsData?.unpaidCount ?? 0;
  const hasLegacyData = statsData?.hasLegacyData ?? false;

  const openTicketsCount = useMemo(
    () =>
      tickets.filter(
        (t) => t.status !== TICKET_STATUS.CLOSED && t.status !== TICKET_STATUS.RESOLVED
      ).length,
    [tickets]
  );

  const isLoading =
    clientsLoading || ordersLoading || invoicesLoading || statsLoading || ticketsLoading;

  if (isLoading && clients.length === 0 && ordersCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Sales Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Key metrics in base currency ({baseCurrency}). Totals use historical FX; switch display for current-rate conversion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Display as:</span>
          <select
            className="rounded border bg-background px-2 py-1 text-sm"
            value={displayCurrency ?? ""}
            onChange={(e) =>
              setDisplayCurrency(e.target.value ? e.target.value : undefined)
            }
          >
            <option value="">{baseCurrency} (base)</option>
            <option value="USD">USD</option>
            <option value="BDT">BDT</option>
          </select>
          {hasLegacyData && (
            <span className="text-xs text-amber-600 dark:text-amber-400" title="Some amounts use fallback rate">
              Legacy
            </span>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SalesStatCard
          title={`Total Revenue (${revenueUnpaidCurrency})`}
          value={formatCurrency(totalRevenue, revenueUnpaidCurrency)}
          viewAllHref="/admin/billing/invoices"
          viewAllLabel="Invoices"
          icon={DollarSign}
          variant="success"
          hint={paidCount > 0 ? `${paidCount} paid invoices` : undefined}
        />
        <SalesStatCard
          title={`Unpaid / Overdue (${revenueUnpaidCurrency})`}
          value={formatCurrency(unpaidAmount, revenueUnpaidCurrency)}
          viewAllHref="/admin/billing/invoices"
          viewAllLabel="Invoices"
          icon={FileText}
          variant={unpaidAmount > 0 ? "destructive" : "muted"}
          hint={unpaidCount > 0 ? `${unpaidCount} unpaid` : undefined}
        />
        <SalesStatCard
          title="Clients"
          value={clients.length}
          viewAllHref="/admin/clients"
          icon={Users}
        />
        <SalesStatCard
          title="Orders"
              value={ordersCount}
          viewAllHref="/admin/orders"
          icon={ShoppingCart}
        />
        <SalesStatCard
          title="Open Tickets"
          value={openTicketsCount}
          viewAllHref="/admin/tickets"
          icon={MessageSquare}
          variant={openTicketsCount > 0 ? "warning" : "default"}
          hint={tickets.length > 0 ? `${tickets.length} total` : undefined}
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentOrders.slice(0, 5).map((order: any) => (
                  <li
                    key={order._id ?? order.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <Link
                      href={`/admin/orders/${order._id ?? order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      #{order.orderNumber ?? order._id?.slice(-6) ?? "—"}
                    </Link>
                    <span className="text-muted-foreground">
                      {formatCurrency(order.invoice?.total ?? order.total ?? 0, order.currency ?? "USD")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              View all orders
            </Link>
          </CardContent>
        </Card>

        {/* Recent invoices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <ul className="space-y-2">
                {invoices.slice(0, 5).map((inv) => (
                  <li
                    key={inv._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <Link
                      href={`/admin/billing/invoices/${inv._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      #{inv.invoiceNumber}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatCurrency(inv.total ?? 0, inv.currency)}
                      </span>
                      <Badge
                        variant={inv.status === INVOICE_STATUS_ADMIN.PAID ? "default" : "secondary"}
                        className={
                          inv.status === INVOICE_STATUS_ADMIN.PAID
                            ? "bg-green-500 hover:bg-green-600"
                            : inv.status === INVOICE_STATUS_ADMIN.OVERDUE
                              ? "bg-amber-500 hover:bg-amber-600"
                              : ""
                        }
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/billing/invoices"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              View all invoices
            </Link>
          </CardContent>
        </Card>

        {/* Recent tickets */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets yet.</p>
            ) : (
              <ul className="space-y-2">
                {tickets.slice(0, 5).map((t) => (
                  <li
                    key={t._id}
                    className="flex items-center justify-between text-sm gap-2"
                  >
                    <Link
                      href={`/admin/tickets/${t._id}`}
                      className="font-medium text-primary hover:underline truncate min-w-0"
                    >
                      #{t.ticketNumber} – {t.subject}
                    </Link>
                    <Badge variant="outline" className="text-xs capitalize shrink-0">
                      {t.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/tickets"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              View all tickets
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/orders/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              <ShoppingCart className="w-4 h-4" />
              New order
            </Link>
            <Link
              href="/admin/clients"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Users className="w-4 h-4" />
              Clients
            </Link>
            <Link
              href="/admin/billing/invoices"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <FileText className="w-4 h-4" />
              Invoices
            </Link>
            <Link
              href="/admin/server-config"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Server config
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
