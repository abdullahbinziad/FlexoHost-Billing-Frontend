"use client";

import { useParams } from "next/navigation";
import { useGetGrantsSharedWithMeQuery } from "@/store/api/accessGrantsApi";
import { getGrantClientId, getClientDisplayName } from "@/types/grant-access";
import { SharedAccessBanner } from "@/components/client/shared-with-me";

export default function SharedClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const clientId = params?.clientId as string;

  const { data: grants = [] } = useGetGrantsSharedWithMeQuery();
  const grant = clientId ? grants.find((g) => getGrantClientId(g) === clientId) : null;
  const clientName = grant ? getClientDisplayName(grant) : "Shared client";
  const ownerEmail =
    grant?.createdByUserId &&
    typeof grant.createdByUserId === "object" &&
    "email" in grant.createdByUserId
      ? (grant.createdByUserId as { email?: string }).email
      : undefined;
  const accountLabel = ownerEmail ?? clientName;

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-0">
      <SharedAccessBanner
        accountLabel={accountLabel}
        clientId={clientId}
        showSharedWithMeLink
      />
      {children}
    </div>
  );
}
