"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MoreHorizontal, Globe } from "lucide-react";
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
import { useGetClientServicesQuery } from "@/store/api/servicesApi";

export default function ClientDomainsPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const { data, isLoading, error } = useGetClientServicesQuery(
    { clientId, params: { type: "DOMAIN", limit: 100 } },
    { skip: !clientId }
  );

  const services = data?.services ?? [];

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Domains</CardTitle>
          <p className="text-sm text-muted-foreground">Manage registered domains</p>
        </div>
        <Button asChild>
          <Link href="/admin/domains/register">
            <Plus className="w-4 h-4 mr-2" />
            Register New Domain
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Domain / Identifier</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Next Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading domains...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-destructive">
                    Failed to load domains.
                  </TableCell>
                </TableRow>
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No domains for this client.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell>
                      <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <Globe className="w-4 h-4" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/clients/${clientId}/domains/${svc.id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {svc.identifier || svc.name}
                        </Link>
                        <span className="text-xs text-gray-500">Service: {svc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {svc.pricing?.currency} {svc.pricing?.amount?.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1 capitalize">
                        {svc.pricing?.billingCycle}
                      </span>
                    </TableCell>
                    <TableCell>{svc.nextDueDate || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={svc.status === "active" ? "default" : "secondary"}
                        className={
                          svc.status === "active"
                            ? "bg-green-500 hover:bg-green-600"
                            : svc.status === "expired"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                            : ""
                        }
                      >
                        {svc.status}
                      </Badge>
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
                          <Link href={`/admin/clients/${clientId}/domains/${svc.id}`}>
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
      </CardContent>
    </Card>
  );
}
