"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { AccessGrant } from "@/types/grant-access";
import { formatGrantee, formatScope, formatExpiry, formatPermissions, formatAccessAreas } from "../utils";

export interface GrantListItemProps {
  grant: AccessGrant;
  onEdit?: (grant: AccessGrant) => void;
  onRevoke: (grantId: string) => void;
  isRevoking?: boolean;
}

export function GrantListItem({ grant, onEdit, onRevoke, isRevoking }: GrantListItemProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border bg-card">
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-medium">{formatGrantee(grant)}</span>
        <span className="text-sm text-muted-foreground">{formatScope(grant)}</span>
        <span className="text-sm">{formatPermissions(grant)}</span>
        <span className="text-sm text-muted-foreground" title="Access areas">{formatAccessAreas(grant)}</span>
        <span className="text-sm text-muted-foreground">{formatExpiry(grant.expiresAt)}</span>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(grant)}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRevoke(grant._id)}
          disabled={isRevoking}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Revoke
        </Button>
      </div>
    </li>
  );
}
