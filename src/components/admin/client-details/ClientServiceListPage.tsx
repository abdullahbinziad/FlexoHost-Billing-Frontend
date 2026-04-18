"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminCancelPendingServiceMutation,
  useAdminDeleteServiceMutation,
  useAdminTerminateServiceMutation,
  useGetClientServicesQuery,
} from "@/store/api/servicesApi";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { getAdminClientServicePath } from "@/components/admin/services/utils";
import { Plus, Server, HardDrive, Mail, MoreHorizontal } from "lucide-react";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { getPendingStatusLabel } from "@/utils/serviceStatusLabel";
import { SERVICE_STATUS, normalizeServiceStatus } from "@/constants/serviceStatus";

type ServicePageType = "hosting" | "vps" | "email";

const statusBadge: Record<string, string> = {
  active: "bg-green-500 text-white hover:bg-green-600",
  suspended: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  expired: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  cancelled: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  terminated: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const queryTypeMap: Record<ServicePageType, "HOSTING" | "VPS" | "EMAIL"> = {
  hosting: "HOSTING",
  vps: "VPS",
  email: "EMAIL",
};

const iconMap: Record<ServicePageType, React.ReactNode> = {
  hosting: <Server className="w-4 h-4" />,
  vps: <HardDrive className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
};

const colorMap: Record<ServicePageType, string> = {
  hosting: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  vps: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
  email: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
};

export interface ClientServiceListPageProps {
  clientId: string;
  type: ServicePageType;
  title: string;
  description: string;
  emptyMessage: string;
}

export function ClientServiceListPage({
  clientId,
  type,
  title,
  description,
  emptyMessage,
}: ClientServiceListPageProps) {
  const formatCurrency = useFormatCurrency();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [terminateService, { isLoading: isTerminating }] = useAdminTerminateServiceMutation();
  const [cancelPendingService, { isLoading: isCancellingPending }] = useAdminCancelPendingServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useAdminDeleteServiceMutation();
  const [confirmAction, setConfirmAction] = useState<{ type: "cancel" | "delete"; serviceId: string } | null>(null);
  const { data, isLoading, error } = useGetClientServicesQuery(
    { clientId, params: { type: queryTypeMap[type], page, limit: pageSize } },
    { skip: !clientId }
  );

  const services = data?.services ?? [];
  const totalResults = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;
  const icon = iconMap[type];
  const color = colorMap[type];
  const isConfirmBusy = isTerminating || isCancellingPending || isDeleting;

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "cancel") {
        const targetService = services.find((s) => s.id === confirmAction.serviceId);
        const normalizedStatus = normalizeServiceStatus(targetService?.status);
        const usePendingCancel =
          normalizedStatus === SERVICE_STATUS.PENDING ||
          normalizedStatus === SERVICE_STATUS.PROVISIONING;
        if (usePendingCancel) {
          await cancelPendingService({ serviceId: confirmAction.serviceId, clientId }).unwrap();
        } else {
          await terminateService({ serviceId: confirmAction.serviceId, clientId }).unwrap();
        }
        toast.success("Service cancelled");
      } else {
        await deleteService({ serviceId: confirmAction.serviceId, clientId }).unwrap();
        toast.success("Service deleted");
      }
      setConfirmAction(null);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || `Failed to ${confirmAction.type} service`);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
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
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>{title}</TableHead>
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
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => {
                      const detailsHref = getAdminClientServicePath(clientId, service.id, service.productType);
                      const normalizedStatus = normalizeServiceStatus(service.status);
                      const isPendingLike =
                        normalizedStatus === SERVICE_STATUS.PENDING ||
                        normalizedStatus === SERVICE_STATUS.PROVISIONING;
                      const statusLabel = isPendingLike
                        ? getPendingStatusLabel(service.status, service.pendingReason)
                        : service.status;
                      const cancelActionLabel = isPendingLike ? "Cancel Pending Service" : "Terminate Service";
                      const cancelConfirmTitle = isPendingLike ? "Cancel pending service?" : "Terminate this service?";
                      const cancelConfirmDescription = isPendingLike
                        ? "This will cancel the service before activation/provision completion and stop pending provisioning."
                        : "This action cannot be undone. It will terminate the service.";

                      return (
                        <TableRow key={service.id}>
                          <TableCell>
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${color}`}>
                              {icon}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <Link
                                href={detailsHref}
                                className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 hover:underline"
                              >
                                {service.name}
                              </Link>
                              <span className="text-xs text-gray-500">{service.identifier}</span>
                              {type === "hosting" && service.serverLocation ? (
                                <span className="text-xs text-muted-foreground mt-0.5">
                                  Hosting · {service.serverLocation}
                                </span>
                              ) : null}
                              {type === "vps" && service.serverLocation ? (
                                <span className="text-xs text-muted-foreground mt-0.5">
                                  VPS · {service.serverLocation}
                                </span>
                              ) : null}
                              {type === "email" ? (
                                <span className="text-xs text-muted-foreground mt-0.5">
                                  Email service
                                </span>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {formatCurrency(service.pricing?.amount ?? 0, service.pricing?.currency)}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {service.pricing?.billingCycle ?? "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{service.nextDueDate || "—"}</TableCell>
                          <TableCell>
                            <Badge
                              className={`capitalize ${statusBadge[service.status] || ""}`}
                              variant={statusBadge[service.status] ? "default" : "secondary"}
                            >
                              {statusLabel}
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
                                <Link href={detailsHref}>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-amber-600"
                                  disabled={isTerminating}
                                  onClick={() => setConfirmAction({ type: "cancel", serviceId: service.id })}
                                >
                                  {cancelActionLabel}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  disabled={isDeleting}
                                  onClick={() => setConfirmAction({ type: "delete", serviceId: service.id })}
                                >
                                  Delete Service
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalResults}
            pageSize={pageSize}
            currentCount={services.length}
            itemLabel="services"
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </div>
        <ConfirmActionDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={(() => {
            if (confirmAction?.type === "delete") return "Delete service permanently?";
            const targetService = services.find((s) => s.id === confirmAction?.serviceId);
            const normalizedStatus = normalizeServiceStatus(targetService?.status);
            const isPendingLike =
              normalizedStatus === SERVICE_STATUS.PENDING ||
              normalizedStatus === SERVICE_STATUS.PROVISIONING;
            return isPendingLike ? "Cancel pending service?" : "Terminate this service?";
          })()}
          description={
            (() => {
              if (confirmAction?.type === "delete") {
                return "This action cannot be undone. The service record and linked details will be removed.";
              }
              const targetService = services.find((s) => s.id === confirmAction?.serviceId);
              const normalizedStatus = normalizeServiceStatus(targetService?.status);
              const isPendingLike =
                normalizedStatus === SERVICE_STATUS.PENDING ||
                normalizedStatus === SERVICE_STATUS.PROVISIONING;
              return isPendingLike
                ? "This will cancel the service before activation/provision completion and stop pending provisioning."
                : "This action cannot be undone. It will terminate the service.";
            })()
          }
          confirmLabel={(() => {
            if (confirmAction?.type === "delete") return "Delete Service";
            const targetService = services.find((s) => s.id === confirmAction?.serviceId);
            const normalizedStatus = normalizeServiceStatus(targetService?.status);
            const isPendingLike =
              normalizedStatus === SERVICE_STATUS.PENDING ||
              normalizedStatus === SERVICE_STATUS.PROVISIONING;
            return isPendingLike ? "Cancel Pending Service" : "Terminate Service";
          })()}
          onConfirm={handleConfirmAction}
          isLoading={isConfirmBusy}
        />
      </CardContent>
    </Card>
  );
}
