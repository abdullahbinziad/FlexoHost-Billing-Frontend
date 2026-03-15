"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetClientServiceByIdQuery } from "@/store/api/servicesApi";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SharedWithMeVPSManagePage() {
  const params = useParams();
  const clientId = params?.clientId as string;
  const id = params?.id as string;

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
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">VPS not found or you don&apos;t have access.</p>
        <Button asChild variant="link">
          <Link href={`/shared-with-me/${clientId}`}>Back to services</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>VPS: {service.name || service.identifier || service.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Status: {service.status}. Full VPS management for shared access can be expanded here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
