"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Globe, Activity } from "lucide-react";
import { formatDateTime as formatDt } from "@/utils/format";
import type { HostingServiceDetails } from "@/types/hosting-manage";
import { getServiceDisplayDomain } from "./utils";

export interface ServiceStatusTrackingCardProps {
  service: HostingServiceDetails;
  editable?: boolean;
  onSaveChanges?: () => void;
  isSavingChanges?: boolean;
  disableSaveChanges?: boolean;
  editableStatus?: string;
  editableNextDueDate?: string;
  editableAutoSuspendAt?: string;
  editableAutoTerminateAt?: string;
  onEditableStatusChange?: (value: string) => void;
  onEditableNextDueDateChange?: (value: string) => void;
  onEditableAutoSuspendAtChange?: (value: string) => void;
  onEditableAutoTerminateAtChange?: (value: string) => void;
}

function formatOrDash(iso?: string): string {
  return iso ? formatDt(iso) : "—";
}

export function ServiceStatusTrackingCard({
  service,
  editable = false,
  onSaveChanges,
  isSavingChanges = false,
  disableSaveChanges = false,
  editableStatus = "active",
  editableNextDueDate = "",
  editableAutoSuspendAt = "",
  editableAutoTerminateAt = "",
  onEditableStatusChange,
  onEditableNextDueDateChange,
  onEditableAutoSuspendAtChange,
  onEditableAutoTerminateAtChange,
}: ServiceStatusTrackingCardProps) {
  const domain = getServiceDisplayDomain(service);
  const status = (service.status ?? "").toString();
  const suspendedAt = service.suspendedAt;
  const terminatedAt = service.terminatedAt;
  const createdAt = service.createdAt;
  const updatedAt = service.updatedAt;
  const nextDueDate = service.nextDueDate;
  const graceUntil = service.graceUntil;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            Status & tracking
          </CardTitle>
          {editable && onSaveChanges ? (
            <button
              type="button"
              onClick={onSaveChanges}
              disabled={isSavingChanges || disableSaveChanges}
              className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSavingChanges ? "Saving..." : "Save Changes"}
            </button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Domain / identifier
          </label>
          <p className="font-medium break-all">{domain}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Created at
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(createdAt)}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Last updated
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(updatedAt)}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Next due date
          </label>
          {editable ? (
            <Input
              type="date"
              value={editableNextDueDate}
              onChange={(e) => onEditableNextDueDateChange?.(e.target.value)}
            />
          ) : (
            <p className="font-medium text-muted-foreground">
              {formatOrDash(nextDueDate)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Grace until
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(graceUntil)}
          </p>
        </div>
        {editable ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Current status
              </Label>
              <Select value={editableStatus} onValueChange={onEditableStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="provisioning">Provisioning</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Auto suspend at
              </Label>
              <Input
                type="datetime-local"
                value={editableAutoSuspendAt}
                onChange={(e) => onEditableAutoSuspendAtChange?.(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Auto terminate at
              </Label>
              <Input
                type="datetime-local"
                value={editableAutoTerminateAt}
                onChange={(e) => onEditableAutoTerminateAtChange?.(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Current status
            </label>
            <div>
              <Badge variant="secondary" className="capitalize">
                {status}
              </Badge>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Suspended at
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(suspendedAt)}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Terminated at
          </label>
          <p className="font-medium text-muted-foreground">
            {formatOrDash(terminatedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
