"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MoreHorizontal, Globe, Shield, KeyRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetDomainsByClientQuery } from "@/store/api/domainApi";
import { formatDate } from "@/utils/format";
import { DOMAIN_STATUS } from "@/constants/status";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

export default function ClientDomainsPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, error } = useGetDomainsByClientQuery(
    { clientId, page, limit: pageSize },
    { skip: !clientId }
  );

  const domains = data?.domains ?? [];
  const totalResults = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Domains</CardTitle>
          <p className="text-sm text-muted-foreground">Manage registered domains</p>
        </div>
        <Button asChild>
          <Link href="/admin/orders/new">
            <Plus className="w-4 h-4 mr-2" />
            Order Domain
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Registrar</TableHead>
                <TableHead>Nameservers</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading domains...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-destructive">
                    Failed to load domains.
                  </TableCell>
                </TableRow>
              ) : domains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No domains for this client.
                  </TableCell>
                </TableRow>
              ) : (
                domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell>
                      <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <Globe className="w-4 h-4" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/clients/${clientId}/domains/${domain.serviceId ?? domain.id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {domain.name}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {domain.serviceNumber ? `Service ${domain.serviceNumber}` : "Domain service"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{domain.registrar || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {domain.nameservers?.length ? (
                          domain.nameservers.slice(0, 2).map((ns) => (
                            <span key={ns} className="text-xs text-gray-600 dark:text-gray-300">
                              {ns}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">No nameservers saved</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{domain.expirationDate ? formatDate(domain.expirationDate, "short") : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={domain.status === DOMAIN_STATUS.ACTIVE ? "default" : "secondary"}
                          className={
                            domain.status === DOMAIN_STATUS.ACTIVE
                              ? "bg-green-500 hover:bg-green-600"
                              : domain.status === DOMAIN_STATUS.EXPIRED
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                              : ""
                          }
                        >
                          {domain.status}
                        </Badge>
                        {domain.registrarLock ? (
                          <Badge variant="outline" className="gap-1">
                            <Shield className="w-3 h-3" />
                            Locked
                          </Badge>
                        ) : null}
                        {domain.hasEppCode ? (
                          <Badge variant="outline" className="gap-1">
                            <KeyRound className="w-3 h-3" />
                            EPP
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <Link href={`/admin/clients/${clientId}/domains/${domain.serviceId ?? domain.id}`}>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalResults}
            pageSize={pageSize}
            currentCount={domains.length}
            itemLabel="domains"
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
