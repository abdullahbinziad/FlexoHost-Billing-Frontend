"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { HostingManagePage } from "@/components/hosting-manage/HostingManagePage";
import { useGetClientServiceByIdQuery } from "@/store/api/servicesApi";
import { useGetGrantsSharedWithMeQuery } from "@/store/api/accessGrantsApi";
import { getGrantClientId, getClientDisplayName } from "@/types/grant-access";
import { Button } from "@/components/ui/button";

export default function SharedWithMeHostingManagePage() {
  const params = useParams();
  const clientId = params?.clientId as string;
  const id = params?.id as string;

  const { data: grants = [] } = useGetGrantsSharedWithMeQuery();
  const grant = clientId ? grants.find((g) => getGrantClientId(g) === clientId) : null;
  const clientName = grant ? getClientDisplayName(grant) : "Shared client";

  const { data: service, isLoading, isError } = useGetClientServiceByIdQuery(
    { clientId, serviceId: id },
    { skip: !clientId || !id }
  );

  if (!clientId || !id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Invalid client or service.</p>
        <Button asChild variant="link">
          <Link href="/shared-with-me">Back to Shared with me</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Loading service...</p>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Service not found or you don&apos;t have access.</p>
        <Button asChild variant="link">
          <Link href={`/shared-with-me/${clientId}`}>Back to services</Link>
        </Button>
      </div>
    );
  }

  return (
    <HostingManagePage
      clientId={clientId}
      service={service}
      sharedFor={{ clientName }}
    />
  );
}
