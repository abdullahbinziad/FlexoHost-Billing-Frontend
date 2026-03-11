"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Server, HardDrive, MoreHorizontal, Globe } from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetClientServicesQuery } from "@/store/api/servicesApi";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

const statusBadge: Record<string, string> = {
  active: "bg-green-500 text-white hover:bg-green-600",
  suspended: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  expired: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function ClientProductsPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const formatCurrency = useFormatCurrency();

  const { data, isLoading, error } = useGetClientServicesQuery(
    { clientId, params: { limit: 100 } },
    { skip: !clientId }
  );

  const services = data?.services ?? [];

  const iconMap: Record<string, React.ReactNode> = {
    hosting: <Server className="w-4 h-4" />,
    vps: <HardDrive className="w-4 h-4" />,
    domain: <Globe className="w-4 h-4" />,
  };
  const colorMap: Record<string, string> = {
    hosting: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    vps: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    domain: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Products & Services</CardTitle>
          <p className="text-sm text-muted-foreground">Manage hosting packages and services</p>
        </div>
        <Button asChild>
          <Link href="/admin/orders/new">
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Product/Service</TableHead>
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
                    Loading services...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-destructive">
                    Failed to load services.
                  </TableCell>
                </TableRow>
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No services for this client.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell>
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center ${
                          colorMap[svc.productType] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {iconMap[svc.productType] || <Server className="w-4 h-4" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/clients/${clientId}/products/${svc.id}`}
                          className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 hover:underline"
                        >
                          {svc.name}
                        </Link>
                        <span className="text-xs text-gray-500">{svc.identifier}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatCurrency(svc.pricing?.amount ?? 0, svc.pricing?.currency)}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {svc.pricing?.billingCycle ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{svc.nextDueDate || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        className={statusBadge[svc.status] || ""}
                        variant={statusBadge[svc.status] ? "default" : "secondary"}
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
                          <Link href={`/admin/clients/${clientId}/products/${svc.id}`}>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Request Cancellation
                          </DropdownMenuItem>
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
