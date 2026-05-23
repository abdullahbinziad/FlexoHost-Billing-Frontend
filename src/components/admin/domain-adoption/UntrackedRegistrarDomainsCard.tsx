"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type RegistrarConfig,
  useImportAdminRegistrarDomainsMutation,
  useReconcileAdminRegistrarDomainsMutation,
} from "@/store/api/domainApi";
import { DomainAdoptionDialog } from "./DomainAdoptionDialog";

interface UntrackedRegistrarDomainsCardProps {
  registrarConfigs: RegistrarConfig[];
}

export function UntrackedRegistrarDomainsCard({
  registrarConfigs,
}: UntrackedRegistrarDomainsCardProps) {
  const [selectedRegistrarKey, setSelectedRegistrarKey] = useState("");
  const [selectedMissingDomains, setSelectedMissingDomains] = useState<Set<string>>(new Set());
  const [adoptionTarget, setAdoptionTarget] = useState<{ domainName: string; registrar: string } | null>(null);

  const reconcileRegistrarOptions = useMemo(
    () => registrarConfigs.filter((item) => item.implemented && item.supportsRegistrarInventory),
    [registrarConfigs]
  );

  const [reconcileRegistrar, { data: reconcileResult, isLoading: isReconciling }] =
    useReconcileAdminRegistrarDomainsMutation();
  const [importRegistrarDomains, { isLoading: isImporting }] =
    useImportAdminRegistrarDomainsMutation();

  useEffect(() => {
    if (
      selectedRegistrarKey &&
      !reconcileRegistrarOptions.some((registrar) => registrar.key === selectedRegistrarKey)
    ) {
      setSelectedRegistrarKey("");
    }
  }, [reconcileRegistrarOptions, selectedRegistrarKey]);

  const handleReconcile = async () => {
    if (!selectedRegistrarKey) {
      toast.error("Select a registrar that supports domain listing");
      return;
    }
    try {
      const result = await reconcileRegistrar({ registrarKey: selectedRegistrarKey }).unwrap();
      setSelectedMissingDomains(new Set(result.missingDomains.map((item) => item.domainName)));
      toast.success(`Reconciled ${result.totalDomains} registrar domains`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Registrar reconciliation failed");
    }
  };

  const handleTrackSelected = async () => {
    if (!selectedRegistrarKey || selectedMissingDomains.size === 0) {
      toast.error("Select untracked domains to track");
      return;
    }
    try {
      const result = await importRegistrarDomains({
        registrarKey: selectedRegistrarKey,
        domains: Array.from(selectedMissingDomains),
      }).unwrap();
      toast.success(`Tracked ${result.importedCount} registrar domains`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to track registrar domains");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Untracked Registrar Domains</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This migration tool finds domains already present in a registrar account but not yet linked to a
            client domain service. Assigning one creates the billing service silently without sending a new
            order or registration email.
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="w-full md:max-w-xs">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Registrar
              </label>
              <Select value={selectedRegistrarKey} onValueChange={setSelectedRegistrarKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select registrar" />
                </SelectTrigger>
                <SelectContent>
                  {reconcileRegistrarOptions.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">
                      No connected registrar exposes account-wide domain listing.
                    </p>
                  ) : (
                    reconcileRegistrarOptions.map((registrar) => (
                      <SelectItem key={registrar.key} value={registrar.key}>
                        {registrar.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReconcile}
                disabled={isReconciling || !selectedRegistrarKey || reconcileRegistrarOptions.length === 0}
              >
                {isReconciling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reconciling
                  </>
                ) : (
                  "Preview Untracked Domains"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleTrackSelected}
                disabled={
                  isImporting ||
                  selectedMissingDomains.size === 0 ||
                  reconcileRegistrarOptions.length === 0
                }
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tracking
                  </>
                ) : (
                  `Track Selected (${selectedMissingDomains.size})`
                )}
              </Button>
            </div>
          </div>

          {reconcileResult ? (
            <div className="space-y-3 rounded-lg border border-dashed p-4">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>Registrar: <strong>{reconcileResult.registrar}</strong></span>
                <span>Total registrar domains: <strong>{reconcileResult.totalDomains}</strong></span>
                <span>Already tracked locally: <strong>{reconcileResult.knownCount}</strong></span>
                <span>Untracked locally: <strong>{reconcileResult.missingDomains.length}</strong></span>
              </div>

              {reconcileResult.missingDomains.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No untracked registrar domains were found.
                </p>
              ) : (
                <div className="space-y-2">
                  {reconcileResult.missingDomains.map((item) => (
                    <div
                      key={item.domainName}
                      className="flex flex-col gap-3 rounded border p-3 text-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedMissingDomains.has(item.domainName)}
                          onCheckedChange={(checked) => {
                            setSelectedMissingDomains((current) => {
                              const next = new Set(current);
                              if (checked) next.add(item.domainName);
                              else next.delete(item.domainName);
                              return next;
                            });
                          }}
                        />
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{item.domainName}</span>
                          <div className="flex flex-wrap gap-2">
                            {item.recommendedAction === "attach_to_failed_service" ? (
                              <Badge variant="secondary">Matches failed service</Badge>
                            ) : (
                              <Badge variant="outline">New silent adoption</Badge>
                            )}
                            {item.matchedFailedServices?.length ? (
                              <Badge variant="outline">{item.matchedFailedServices.length} match(es)</Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {item.alreadyImported ? <Badge variant="secondary">Already tracked</Badge> : null}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setAdoptionTarget({ domainName: item.domainName, registrar: item.registrar })}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign to Client
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
      <DomainAdoptionDialog
        open={!!adoptionTarget}
        domainName={adoptionTarget?.domainName ?? ""}
        registrar={adoptionTarget?.registrar}
        onOpenChange={(open) => {
          if (!open) setAdoptionTarget(null);
        }}
        onAdopted={() => {
          setSelectedMissingDomains(new Set());
          if (selectedRegistrarKey) void handleReconcile();
        }}
      />
    </>
  );
}
