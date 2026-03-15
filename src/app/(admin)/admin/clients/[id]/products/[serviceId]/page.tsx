"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetClientServiceByIdQuery } from "@/store/api/servicesApi";
import { getAdminClientServicePath } from "@/components/admin/services/utils";
import { Loader2 } from "lucide-react";

export default function ClientProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const serviceId = params?.serviceId as string;

  const { data: service, isLoading, error } = useGetClientServiceByIdQuery(
    { clientId, serviceId },
    { skip: !clientId || !serviceId }
  );

  useEffect(() => {
    if (service) {
      router.replace(getAdminClientServicePath(clientId, serviceId, service.productType));
    }
  }, [clientId, router, service, serviceId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="font-medium text-destructive">Service not found or you don’t have access.</p>
        <p className="text-sm text-muted-foreground mt-1">
          It may have been deleted or the link is incorrect.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}
