"use client";

import { useState, useCallback } from "react";
import { Loader2, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMyClientProfileQuery } from "@/store/api/clientApi";
import {
  useGetGrantsForClientQuery,
  useCreateGrantMutation,
  useUpdateGrantMutation,
  useRevokeGrantMutation,
} from "@/store/api/accessGrantsApi";
import { useGetClientServicesQuery } from "@/store/api/servicesApi";
import type { CreateGrantRequest, UpdateGrantRequest } from "@/types/grant-access";
import type { AccessGrant } from "@/types/grant-access";
import { GrantAccessForm, GrantList, GrantEditDialog } from "@/components/client/grant-access";

export default function GrantAccessPage() {
  const { data: client, isLoading: clientLoading } = useGetMyClientProfileQuery();
  const clientId = client?._id ?? "";

  const { data: grants = [], isLoading: grantsLoading } = useGetGrantsForClientQuery(clientId, {
    skip: !clientId,
  });
  const { data: servicesData } = useGetClientServicesQuery(
    { clientId, params: { limit: 200 } },
    { skip: !clientId }
  );
  const services = servicesData?.services ?? [];

  const [createGrant, { isLoading: creating }] = useCreateGrantMutation();
  const [updateGrant, { isLoading: updating }] = useUpdateGrantMutation();
  const [revokeGrant, { isLoading: revoking }] = useRevokeGrantMutation();

  const [editingGrant, setEditingGrant] = useState<AccessGrant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (body: CreateGrantRequest) => {
      setError(null);
      setSuccess(null);
      try {
        await createGrant({ clientId, body }).unwrap();
        setSuccess("Access granted successfully.");
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "data" in err && err.data && typeof (err.data as { message?: string }).message === "string"
            ? (err.data as { message: string }).message
            : err instanceof Error
              ? err.message
              : "Failed to create grant.";
        setError(message);
        throw err;
      }
    },
    [clientId, createGrant]
  );

  const handleEditSubmit = useCallback(
    async (body: UpdateGrantRequest) => {
      if (!editingGrant) return;
      setEditError(null);
      try {
        await updateGrant({ clientId, grantId: editingGrant._id, body }).unwrap();
        setSuccess("Access updated.");
        setEditingGrant(null);
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "data" in err && err.data && typeof (err.data as { message?: string }).message === "string"
            ? (err.data as { message: string }).message
            : err instanceof Error
              ? err.message
              : "Failed to update grant.";
        setEditError(message);
        throw err;
      }
    },
    [clientId, editingGrant, updateGrant]
  );

  const handleRevoke = useCallback(
    async (grantId: string) => {
      if (!confirm("Revoke this access?")) return;
      setError(null);
      try {
        await revokeGrant({ clientId, grantId }).unwrap();
        setSuccess("Access revoked.");
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "data" in err && err.data && typeof (err.data as { message?: string }).message === "string"
            ? (err.data as { message: string }).message
            : err instanceof Error
              ? err.message
              : "Failed to revoke.";
        setError(message);
      }
    },
    [clientId, revokeGrant]
  );

  if (clientLoading || !clientId) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          People with access
        </h1>
        <p className="text-muted-foreground mt-1">
          Grant another user (e.g. a freelancer) access to manage specific services. They will see only what you allow.
        </p>
      </header>

      <GrantAccessForm
        clientId={clientId}
        services={services}
        onSubmit={handleSubmit}
        isSubmitting={creating}
        error={error}
        success={success}
        onClearMessage={() => {
          setError(null);
          setSuccess(null);
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Current grants</CardTitle>
          <CardDescription>
            People who have access to your services. Revoke to remove access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GrantList
            grants={grants}
            isLoading={grantsLoading}
            onEdit={(grant) => setEditingGrant(grant)}
            onRevoke={handleRevoke}
            isRevoking={revoking}
          />
        </CardContent>
      </Card>

      <GrantEditDialog
        grant={editingGrant}
        clientId={clientId}
        services={services}
        onClose={() => {
          setEditingGrant(null);
          setEditError(null);
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={updating}
        error={editError}
        onClearError={() => setEditError(null)}
      />
    </div>
  );
}
