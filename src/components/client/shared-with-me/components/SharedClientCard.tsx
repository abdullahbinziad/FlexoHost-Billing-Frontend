"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AccessGrant } from "@/types/grant-access";
import { getGrantClientId, getClientDisplayName } from "@/types/grant-access";
import { useActiveClient } from "@/hooks/useActiveClient";

function getOwnerLabel(grant: AccessGrant): string {
  const u = grant.createdByUserId;
  if (typeof u === "object" && u !== null && "email" in u && u.email) return u.email;
  return getClientDisplayName(grant);
}

export interface SharedClientCardProps {
  grant: AccessGrant;
}

export function SharedClientCard({ grant }: SharedClientCardProps) {
  const router = useRouter();
  const { setActingAs } = useActiveClient();
  const clientId = getGrantClientId(grant);
  const displayName = getClientDisplayName(grant);
  const permissionLabel = grant.permissions?.includes("manage") ? "View & manage" : "View only";

  const handleManageAccount = () => {
    setActingAs(clientId, getOwnerLabel(grant));
    router.push("/");
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{displayName}</CardTitle>
        <CardDescription>Access granted · {permissionLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="secondary" className="w-full sm:w-auto" onClick={handleManageAccount}>
          Manage account
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
