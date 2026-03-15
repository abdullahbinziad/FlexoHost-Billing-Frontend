"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, CircleOff, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatDate } from "@/utils/format";
import {
  useGetAdminAffiliateDashboardQuery,
  useReviewAffiliatePayoutMutation,
  useUpdateAffiliateDefaultSettingsMutation,
} from "@/store/api/affiliateApi";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

function humanizeStatus(value?: string) {
  return (value || "").replace(/_/g, " ");
}

export default function AdminAffiliatesPage() {
  const formatCurrency = useFormatCurrency();
  const { data, isLoading, error } = useGetAdminAffiliateDashboardQuery();
  const [reviewAffiliatePayout, { isLoading: isUpdating }] = useReviewAffiliatePayoutMutation();
  const [updateAffiliateDefaultSettings, { isLoading: isUpdatingDefaultRate }] =
    useUpdateAffiliateDefaultSettingsMutation();
  const [defaultCommissionRate, setDefaultCommissionRate] = useState("20");
  const [defaultReferralDiscountRate, setDefaultReferralDiscountRate] = useState("5");
  const [defaultPayoutThreshold, setDefaultPayoutThreshold] = useState("1000");
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutPageSize, setPayoutPageSize] = useState(20);

  useEffect(() => {
    if (data?.settings?.defaultCommissionRate != null) {
      setDefaultCommissionRate(String(data.settings.defaultCommissionRate));
    }
    if (data?.settings?.defaultReferralDiscountRate != null) {
      setDefaultReferralDiscountRate(String(data.settings.defaultReferralDiscountRate));
    }
    if (data?.settings?.defaultPayoutThreshold != null) {
      setDefaultPayoutThreshold(String(data.settings.defaultPayoutThreshold));
    }
  }, [data?.settings?.defaultCommissionRate, data?.settings?.defaultReferralDiscountRate, data?.settings?.defaultPayoutThreshold]);

  const payoutRequests = data?.payoutRequests || [];
  const paginatedPayoutRequests = payoutRequests.slice(
    (payoutPage - 1) * payoutPageSize,
    payoutPage * payoutPageSize
  );
  const payoutTotalPages = Math.ceil(payoutRequests.length / payoutPageSize) || 1;

  const handleAction = async (id: string, action: "approve" | "reject" | "mark_paid") => {
    try {
      await reviewAffiliatePayout({ id, action }).unwrap();
      toast.success("Payout request updated.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update payout request.");
    }
  };

  const handleSaveDefaultSettings = async () => {
    try {
      await updateAffiliateDefaultSettings({
        defaultCommissionRate: Number(defaultCommissionRate),
        defaultReferralDiscountRate: Number(defaultReferralDiscountRate),
        defaultPayoutThreshold: Number(defaultPayoutThreshold),
      }).unwrap();
      toast.success("Default affiliate settings updated.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update affiliate settings.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[420px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">Failed to load affiliate admin dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Affiliates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage default affiliate settings and review payout requests.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Default Affiliate Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              New affiliate profiles use these defaults. Per-client affiliate settings are managed from each client's
              `Affiliate` tab.
            </p>
          </div>
          <div className="grid w-full max-w-3xl gap-4 md:grid-cols-3">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Default commission rate (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={defaultCommissionRate}
                onChange={(e) => setDefaultCommissionRate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Default buyer discount (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={defaultReferralDiscountRate}
                onChange={(e) => setDefaultReferralDiscountRate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Default payout threshold</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={defaultPayoutThreshold}
                onChange={(e) => setDefaultPayoutThreshold(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveDefaultSettings} disabled={isUpdatingDefaultRate}>
              {isUpdatingDefaultRate ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How Client-Level Management Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Use this page to control the default commission and buyer discount for new affiliates.</p>
              <p>
                For a specific client, open the client details `Affiliate` tab to create the affiliate profile, update
                that client&apos;s rates, and review their referrals, commissions, and payout history.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payout Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                    <TableHead className="text-primary-foreground">Affiliate</TableHead>
                    <TableHead className="text-primary-foreground">Amount</TableHead>
                    <TableHead className="text-primary-foreground">Requested</TableHead>
                    <TableHead className="text-primary-foreground">Method</TableHead>
                    <TableHead className="text-primary-foreground">Status</TableHead>
                    <TableHead className="text-primary-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No payout requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayoutRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>
                          <div className="font-medium">
                            {request.affiliateClientId?.firstName || "Unknown"} {request.affiliateClientId?.lastName || ""}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {request.affiliateProfileId?.referralCode || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(request.amount, request.currency)}
                        </TableCell>
                        <TableCell>{formatDate(request.requestedAt)}</TableCell>
                        <TableCell>
                          {request.payoutDetails?.method || request.payoutDetails?.provider || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{humanizeStatus(request.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isUpdating || request.status !== "pending"}
                              onClick={() => handleAction(request._id, "approve")}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isUpdating || !["pending", "approved"].includes(request.status)}
                              onClick={() => handleAction(request._id, "reject")}
                            >
                              <CircleOff className="w-4 h-4 mr-1.5" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              disabled={isUpdating || request.status !== "approved"}
                              onClick={() => handleAction(request._id, "mark_paid")}
                            >
                              <Wallet className="w-4 h-4 mr-1.5" />
                              Mark Paid
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <DataTablePagination
            page={payoutPage}
            totalPages={payoutTotalPages}
            totalItems={payoutRequests.length}
            pageSize={payoutPageSize}
            currentCount={paginatedPayoutRequests.length}
            itemLabel="payout requests"
            onPageChange={setPayoutPage}
            onPageSizeChange={(value) => {
              setPayoutPageSize(value);
              setPayoutPage(1);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
