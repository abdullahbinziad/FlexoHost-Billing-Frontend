"use client";

import { Loader2 } from "lucide-react";
import type { AccessGrant } from "@/types/grant-access";
import { GrantListItem } from "./GrantListItem";

export interface GrantListProps {
  grants: AccessGrant[];
  isLoading?: boolean;
  onEdit?: (grant: AccessGrant) => void;
  onRevoke: (grantId: string) => void;
  isRevoking?: boolean;
}

export function GrantList({ grants, isLoading, onEdit, onRevoke, isRevoking }: GrantListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (grants.length === 0) {
    return (
      <p className="text-muted-foreground">No one has been granted access yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {grants.map((g) => (
        <GrantListItem
          key={g._id}
          grant={g}
          onEdit={onEdit}
          onRevoke={onRevoke}
          isRevoking={isRevoking}
        />
      ))}
    </ul>
  );
}
