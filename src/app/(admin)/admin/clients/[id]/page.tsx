"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText, ShoppingCart, Server, MessageSquare, ArrowRight, Globe, HardDrive, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAllInvoicesQuery } from "@/store/api/invoiceApi";
import { useGetOrdersQuery } from "@/store/api/orderApi";
import { useGetDomainsByClientQuery } from "@/store/api/domainApi";
import { useGetClientServicesQuery } from "@/store/api/servicesApi";
import { useGetTicketsQuery } from "@/store/api/ticketApi";
import { formatDate } from "@/utils/format";
import { INVOICE_STATUS_ADMIN } from "@/constants/status";

export default function ClientSummaryPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const { data: invoicesData } = useGetAllInvoicesQuery(
    { clientId, limit: 5, page: 1 },
    { skip: !clientId }
  );
  const { data: ordersData } = useGetOrdersQuery(
    clientId ? { clientId, page: 1, limit: 1 } : undefined,
    { skip: !clientId }
  );
  const { data: servicesData } = useGetClientServicesQuery(
    { clientId, params: { limit: 100 } },
    { skip: !clientId }
  );
  const { data: domainsData } = useGetDomainsByClientQuery({ clientId, page: 1, limit: 1 }, {
    skip: !clientId,
  });
  const { data: ticketsData } = useGetTicketsQuery(
    { clientId, limit: 5, page: 1 },
    { skip: !clientId }
  );

  const orderCount = ordersData?.totalResults ?? 0;
  const invoices = invoicesData?.results ?? [];
  const serviceCounts = useMemo(
    () =>
      (servicesData?.services ?? []).reduce(
        (counts, service) => {
          if (service.productType === "hosting") counts.hosting += 1;
          if (service.productType === "vps") counts.vps += 1;
          if (service.productType === "email") counts.email += 1;
          return counts;
        },
        { hosting: 0, vps: 0, email: 0 }
      ),
    [servicesData?.services]
  );
  const domainCount = domainsData?.total ?? 0;
  const tickets = ticketsData?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoicesData?.totalResults ?? 0}</div>
            <Link
              href={`/admin/clients/${clientId}/invoices`}
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View orders <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hosting</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCounts.hosting}</div>
            <Link
              href={`/admin/clients/${clientId}/hosting`}
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View hosting <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">VPS</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCounts.vps}</div>
            <Link
              href={`/admin/clients/${clientId}/vps`}
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View VPS <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCounts.email}</div>
            <Link
              href={`/admin/clients/${clientId}/email-services`}
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View email services <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Domain</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domainCount}</div>
            <Link
              href={`/admin/clients/${clientId}/domains`}
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View domains <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsData?.totalResults ?? 0}</div>
            <Link
              href={`/admin/clients/${clientId}/tickets`}
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <li key={inv._id} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/admin/clients/${clientId}/invoices/${inv._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      #{inv.invoiceNumber}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{inv.currency} {inv.total?.toFixed(2)}</span>
                      <Badge variant={inv.status === INVOICE_STATUS_ADMIN.PAID ? "default" : "secondary"} className="text-xs">
                        {inv.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

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
                  <li key={t._id} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/admin/clients/${clientId}/tickets/${t._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      #{t.ticketNumber} – {t.subject}
                    </Link>
                    <Badge variant="outline" className="text-xs capitalize">
                      {t.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
