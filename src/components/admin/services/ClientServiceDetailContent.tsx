"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAdminUpdateStatusMutation,
  useAdminUpdateAutomationMutation,
  useAdminUpdateServiceProfileMutation,
  useAdminUpdateServiceNotesMutation,
  useGetHostingUsageQuery,
  useGetClientServiceByIdQuery,
  useLazyGetShortcutLoginUrlQuery,
  useRefreshHostingUsageMutation,
} from "@/store/api/servicesApi";
import {
  ServiceBillingCard,
  ServiceDetailHeader,
  ServiceDetailsCard,
  ServiceModuleActionsCard,
  ServiceResourceUsageCard,
  ServiceStatusTrackingCard,
} from "@/components/admin/services";
import { getAdminClientServiceListPath } from "@/components/admin/services/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { formatDateTime } from "@/utils/format";
import { toast } from "sonner";
import { useGetOrderConfigQuery } from "@/store/api/orderApi";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetServersQuery } from "@/store/api/serverApi";
import { getServerGroups } from "@/types/admin";
import { dedupeHostingProductsForSelect } from "@/utils/hostingPackageOptions";
import {
  SERVICE_STATUS,
  normalizeServiceStatus,
  type ServiceStatusValue,
} from "@/constants/serviceStatus";

export interface ClientServiceDetailContentProps {
  clientId: string;
  serviceId: string;
}

function toLocalInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function getPricingCycleKey(billingCycle: string): string {
  return billingCycle === "semiannually" ? "semiAnnually" : billingCycle;
}

export function ClientServiceDetailContent({
  clientId,
  serviceId,
}: ClientServiceDetailContentProps) {
  const { data: service, isLoading, error } = useGetClientServiceByIdQuery(
    { clientId, serviceId },
    { skip: !clientId || !serviceId }
  );

  const [adminNotes, setAdminNotes] = useState("");
  const [targetStatus, setTargetStatus] = useState<ServiceStatusValue>(SERVICE_STATUS.ACTIVE);
  const [trackingNextDueDate, setTrackingNextDueDate] = useState("");
  const [autoSuspendAt, setAutoSuspendAt] = useState("");
  const [autoTerminateAt, setAutoTerminateAt] = useState("");
  const [editablePackageName, setEditablePackageName] = useState("");
  const [editablePackageProductId, setEditablePackageProductId] = useState("");
  const [editableDomain, setEditableDomain] = useState("");
  const [editableServerLocation, setEditableServerLocation] = useState("");
  const [editableBillingCycle, setEditableBillingCycle] = useState("monthly");
  const [editableRegistrationDate, setEditableRegistrationDate] = useState("");
  const [editableFirstPaymentAmount, setEditableFirstPaymentAmount] = useState("");
  const [editableRecurringAmount, setEditableRecurringAmount] = useState("");
  const [editablePaymentMethod, setEditablePaymentMethod] = useState("");
  const [editableCurrency, setEditableCurrency] = useState("");
  const [isRecurringManuallyEdited, setIsRecurringManuallyEdited] = useState(false);

  useEffect(() => {
    setAdminNotes(service?.adminNotes ?? "");
    setTargetStatus(normalizeServiceStatus(service?.rawStatus || service?.status || SERVICE_STATUS.ACTIVE, {
      suspendedAt: service?.suspendedAt,
      terminatedAt: service?.terminatedAt,
      cancelledAt: service?.cancelledAt,
    }));
    setTrackingNextDueDate(toDateInputValue(service?.nextDueDate));
    setAutoSuspendAt(toLocalInputValue(service?.autoSuspendAt));
    setAutoTerminateAt(toLocalInputValue(service?.autoTerminateAt));
    setEditablePackageName(service?.packageName || "");
    setEditablePackageProductId(service?.packageProductId || "");
    setEditableDomain(
      (service?.domain && String(service.domain).trim() && service.domain !== "—"
        ? String(service.domain).trim()
        : "") ||
        (service?.identifier && service.identifier !== "—" ? String(service.identifier).trim() : "")
    );
    setEditableServerLocation(service?.serverLocation || "");
    setEditableBillingCycle(service?.pricing?.billingCycle || "monthly");
    setEditableRegistrationDate((service?.billing?.registrationDate || "").slice(0, 10));
    setEditableFirstPaymentAmount(String(service?.billing?.firstPaymentAmount ?? ""));
    setEditableRecurringAmount(String(service?.pricing?.amount ?? ""));
    setEditablePaymentMethod(service?.billing?.paymentMethod || "");
    setEditableCurrency(service?.billing?.currency || service?.pricing?.currency || "");
    setIsRecurringManuallyEdited(false);
  }, [service]);

  const [updateNotes, { isLoading: isSavingNotes }] = useAdminUpdateServiceNotesMutation();
  const [updateAutomation, { isLoading: isSavingAutomation }] = useAdminUpdateAutomationMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useAdminUpdateStatusMutation();
  const [updateServiceProfile, { isLoading: isSavingServiceProfile }] = useAdminUpdateServiceProfileMutation();
  const [refreshUsage, { isLoading: isRefreshingUsage }] = useRefreshHostingUsageMutation();
  const { data: orderConfig } = useGetOrderConfigQuery();
  const { data: hostingProductsData } = useGetProductsQuery({ type: "hosting", limit: 200 });
  const { data: servers = [] } = useGetServersQuery();

  const isHosting = service?.productType === "hosting";
  const { data: usage, isLoading: usageLoading } = useGetHostingUsageQuery(
    { clientId, serviceId },
    { skip: !clientId || !serviceId || !isHosting }
  );

  const [fetchLoginUrl, { isLoading: loginLoading }] = useLazyGetShortcutLoginUrlQuery();
  const paymentMethodOptions = (orderConfig?.paymentMethods || []).map((method) => ({
    value: String(method.id || ""),
    label: String(method.name || method.id || ""),
  }));
  const hostingPackageOptions = useMemo(() => {
    const raw = (hostingProductsData?.products || []).filter(
      (product) => String(product.type).toLowerCase() === "hosting" && !product.isHidden
    );
    return dedupeHostingProductsForSelect(raw, editablePackageProductId || undefined);
  }, [hostingProductsData?.products, editablePackageProductId]);
  const selectedPackage = useMemo(
    () => hostingPackageOptions.find((pkg) => pkg.id === editablePackageProductId),
    [hostingPackageOptions, editablePackageProductId]
  );
  const serverLocationOptions = useMemo(() => {
    if (!selectedPackage) return [] as string[];
    const productGroupsRaw =
      (selectedPackage.module && selectedPackage.module.serverGroup) || selectedPackage.group || "";
    const productGroups = String(productGroupsRaw || "")
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);
    const eligibleServers = (servers || []).filter((server) => {
      if (!server.isEnabled) return false;
      if (!productGroups.length) return true;
      const serverGroups = getServerGroups(server);
      return serverGroups.length === 0 || productGroups.some((g) => serverGroups.includes(g as any));
    });
    const locations = Array.from(
      new Set(
        eligibleServers
          .map((s) => String(s.location || "").trim())
          .filter((loc) => !!loc)
      )
    );
    return locations;
  }, [selectedPackage, servers]);

  useEffect(() => {
    if (!selectedPackage) return;
    setEditablePackageName(selectedPackage.name);
  }, [selectedPackage]);

  const handleLoginClick = async () => {
    if (!clientId || !serviceId) return;
    try {
      const result = await fetchLoginUrl({
        clientId,
        serviceId,
        shortcutKey: "cpanel-home",
      }).unwrap();
      if (result?.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Login URL failed; user can try again
    }
  };

  const lastUpdated =
    usage && usage.updatedAt
      ? formatDateTime(usage.updatedAt)
      : usage
        ? "—"
        : undefined;

  const handleRefreshUsage = async () => {
    if (!clientId || !serviceId) return;
    try {
      await refreshUsage({ clientId, serviceId }).unwrap();
      toast.success("Usage refreshed");
    } catch {
      toast.error("Failed to refresh usage");
    }
  };

  const handleSaveStatusTracking = async () => {
    try {
      if (!service) return;
      const currentStatus = normalizeServiceStatus(service.rawStatus || service.status || SERVICE_STATUS.PENDING, {
        suspendedAt: service.suspendedAt,
        terminatedAt: service.terminatedAt,
        cancelledAt: service.cancelledAt,
      });
      const desiredStatus = normalizeServiceStatus(targetStatus);
      if (desiredStatus !== currentStatus) {
        await updateStatus({ serviceId, clientId, status: desiredStatus }).unwrap();
      }
      await Promise.all([
        updateAutomation({
          serviceId,
          clientId,
          autoSuspendAt: autoSuspendAt ? new Date(autoSuspendAt).toISOString() : null,
          autoTerminateAt: autoTerminateAt ? new Date(autoTerminateAt).toISOString() : null,
        }).unwrap(),
        updateServiceProfile({
          serviceId,
          clientId,
          nextDueDate: trackingNextDueDate ? new Date(`${trackingNextDueDate}T00:00:00`).toISOString() : undefined,
        }).unwrap(),
      ]);
      toast.success("Status and tracking updated");
    } catch {
      toast.error("Failed to save status and tracking");
    }
  };

  const handleSaveServiceDetails = async () => {
    try {
      await updateServiceProfile({
        serviceId,
        clientId,
        productId: editablePackageProductId || undefined,
        packageName: editablePackageName,
        primaryDomain: editableDomain,
        serverLocation: editableServerLocation,
        billingCycle: editableBillingCycle,
      }).unwrap();
      toast.success("Service details updated");
    } catch {
      toast.error("Failed to save service details");
    }
  };

  const handleSaveBilling = async () => {
    try {
      await updateServiceProfile({
        serviceId,
        clientId,
        registrationDate: editableRegistrationDate || undefined,
        firstPaymentAmount: Number(editableFirstPaymentAmount || 0),
        recurringAmount: Number(editableRecurringAmount || 0),
        paymentMethod: editablePaymentMethod,
        currency: editableCurrency,
      }).unwrap();
      toast.success("Billing details updated");
    } catch {
      toast.error("Failed to save billing details");
    }
  };

  const handleRecurringAmountChange = (value: string) => {
    setEditableRecurringAmount(value);
    setIsRecurringManuallyEdited(true);
  };

  const handleRecalculateRecurringAmount = () => {
    const cycleKey = getPricingCycleKey(editableBillingCycle);
    const selectedCurrency = String(editableCurrency || service?.pricing?.currency || "").toUpperCase();
    const pricingRows = selectedPackage?.pricing || [];
    const preferredRow = pricingRows.find((row) => String(row.currency || "").toUpperCase() === selectedCurrency);
    const row = preferredRow || pricingRows[0];
    const cyclePricing = row ? (row as any)[cycleKey] : null;
    const autoRecurring = Number(cyclePricing?.renewPrice ?? cyclePricing?.price ?? NaN);
    if (Number.isFinite(autoRecurring) && autoRecurring >= 0) {
      setEditableRecurringAmount(String(autoRecurring));
      setIsRecurringManuallyEdited(false);
      toast.success("Recurring amount recalculated");
      return;
    }
    toast.error("Unable to recalculate recurring amount");
  };

  const handleSaveNotes = async () => {
    try {
      await updateNotes({ serviceId, clientId, adminNotes }).unwrap();
      toast.success("Admin notes updated");
    } catch {
      toast.error("Failed to save admin notes");
    }
  };
  const isSavingStatusTracking = isSavingAutomation || isUpdatingStatus;
  const initialStatus = normalizeServiceStatus(service?.rawStatus || service?.status || SERVICE_STATUS.ACTIVE, {
    suspendedAt: service?.suspendedAt,
    terminatedAt: service?.terminatedAt,
    cancelledAt: service?.cancelledAt,
  });
  const initialTrackingNextDueDate = toDateInputValue(service?.nextDueDate);
  const initialAutoSuspendAt = toLocalInputValue(service?.autoSuspendAt);
  const initialAutoTerminateAt = toLocalInputValue(service?.autoTerminateAt);
  const hasStatusTrackingChanges =
    targetStatus !== initialStatus ||
    trackingNextDueDate !== initialTrackingNextDueDate ||
    autoSuspendAt !== initialAutoSuspendAt ||
    autoTerminateAt !== initialAutoTerminateAt;
  const hasServiceDetailsChanges =
    editablePackageProductId !== (service?.packageProductId || "") ||
    editablePackageName !== (service?.packageName || "") ||
    editableDomain !== (service?.domain || "") ||
    editableServerLocation !== (service?.serverLocation || "") ||
    editableBillingCycle !== (service?.pricing?.billingCycle || "monthly");
  const hasBillingChanges =
    editableRegistrationDate !== ((service?.billing?.registrationDate || "").slice(0, 10)) ||
    editableFirstPaymentAmount !== String(service?.billing?.firstPaymentAmount ?? "") ||
    editableRecurringAmount !== String(service?.pricing?.amount ?? "") ||
    editablePaymentMethod !== (service?.billing?.paymentMethod || "") ||
    editableCurrency !== (service?.billing?.currency || service?.pricing?.currency || "");
  const recalculateDisabled = !selectedPackage || !editableBillingCycle;
  const hasNotesChanges = adminNotes !== (service?.adminNotes ?? "");
  const hasAnyUnsavedChanges =
    Boolean(service) &&
    (hasServiceDetailsChanges ||
      hasStatusTrackingChanges ||
      hasBillingChanges ||
      hasNotesChanges);

  useEffect(() => {
    if (!hasAnyUnsavedChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasAnyUnsavedChanges]);

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

  const backHref = getAdminClientServiceListPath(clientId, service.productType);
  const backLabel =
    service.productType === "vps"
      ? "Back to VPS"
      : service.productType === "email"
        ? "Back to Email Services"
        : "Back to Hosting";

  return (
    <div className="space-y-6">
      <ServiceDetailHeader
        service={service}
        backHref={backHref}
        backLabel={backLabel}
        onLoginClick={isHosting ? handleLoginClick : undefined}
        loginLoading={loginLoading}
      />
      {hasAnyUnsavedChanges ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          You have unsaved changes. Save each section to persist updates.
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ServiceDetailsCard
            service={service}
            editable
            packageProductId={editablePackageProductId}
            packageOptions={hostingPackageOptions}
            packageName={editablePackageName}
            domain={editableDomain}
            serverLocation={editableServerLocation}
            serverLocationOptions={serverLocationOptions}
            billingCycle={editableBillingCycle}
            onPackageProductIdChange={setEditablePackageProductId}
            onPackageNameChange={setEditablePackageName}
            onDomainChange={setEditableDomain}
            onServerLocationChange={setEditableServerLocation}
            onBillingCycleChange={setEditableBillingCycle}
            onSaveChanges={handleSaveServiceDetails}
            isSavingChanges={isSavingServiceProfile}
            disableSaveChanges={!hasServiceDetailsChanges}
          />
          <ServiceModuleActionsCard
            service={service}
            clientId={clientId}
            selectedProduct={selectedPackage || null}
          />
          {isHosting && (
            <ServiceResourceUsageCard
              disk={usage?.disk}
              bandwidth={usage?.bandwidth}
              isLoading={usageLoading}
              lastUpdated={lastUpdated}
              onRefresh={handleRefreshUsage}
              isRefreshing={isRefreshingUsage}
            />
          )}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Admin Notes</h3>
                <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={isSavingNotes || !hasNotesChanges}>
                  {isSavingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </div>
              <Textarea
                placeholder="Add private notes about this service…"
                className="min-h-[100px] resize-y"
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ServiceStatusTrackingCard
            service={service}
            editable
            onSaveChanges={handleSaveStatusTracking}
            isSavingChanges={isSavingStatusTracking}
            disableSaveChanges={!hasStatusTrackingChanges}
            editableStatus={targetStatus}
            editableNextDueDate={trackingNextDueDate}
            editableAutoSuspendAt={autoSuspendAt}
            editableAutoTerminateAt={autoTerminateAt}
            onEditableStatusChange={(value) => setTargetStatus(normalizeServiceStatus(value))}
            onEditableNextDueDateChange={setTrackingNextDueDate}
            onEditableAutoSuspendAtChange={setAutoSuspendAt}
            onEditableAutoTerminateAtChange={setAutoTerminateAt}
          />
          <ServiceBillingCard
            service={service}
            editable
            registrationDate={editableRegistrationDate}
            firstPaymentAmount={editableFirstPaymentAmount}
            recurringAmount={editableRecurringAmount}
            paymentMethod={editablePaymentMethod}
            currency={editableCurrency}
            paymentMethodOptions={paymentMethodOptions}
            onRegistrationDateChange={setEditableRegistrationDate}
            onFirstPaymentAmountChange={setEditableFirstPaymentAmount}
            onRecurringAmountChange={handleRecurringAmountChange}
            onRecalculateRecurring={handleRecalculateRecurringAmount}
            recalculateDisabled={recalculateDisabled}
            onPaymentMethodChange={setEditablePaymentMethod}
            onCurrencyChange={setEditableCurrency}
            onSaveChanges={handleSaveBilling}
            isSavingChanges={isSavingServiceProfile}
            disableSaveChanges={!hasBillingChanges}
          />
        </div>
      </div>
    </div>
  );
}
