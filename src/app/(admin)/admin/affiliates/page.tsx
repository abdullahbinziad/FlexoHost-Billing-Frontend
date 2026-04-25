"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, HelpCircle, CircleOff, Wallet } from "lucide-react";
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
  const [commissionApprovalDelayDays, setCommissionApprovalDelayDays] = useState("7");
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutPageSize, setPayoutPageSize] = useState(20);
  const [referralPage, setReferralPage] = useState(1);
  const [referralPageSize, setReferralPageSize] = useState(20);

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
    if (data?.settings?.commissionApprovalDelayDays != null) {
      setCommissionApprovalDelayDays(String(data.settings.commissionApprovalDelayDays));
    }
  }, [
    data?.settings?.defaultCommissionRate,
    data?.settings?.defaultReferralDiscountRate,
    data?.settings?.defaultPayoutThreshold,
    data?.settings?.commissionApprovalDelayDays,
  ]);

  const payoutRequests = data?.payoutRequests || [];
  const referrals = data?.referrals || [];
  const paginatedPayoutRequests = payoutRequests.slice(
    (payoutPage - 1) * payoutPageSize,
    payoutPage * payoutPageSize
  );
  const paginatedReferrals = referrals.slice(
    (referralPage - 1) * referralPageSize,
    referralPage * referralPageSize
  );
  const payoutTotalPages = Math.ceil(payoutRequests.length / payoutPageSize) || 1;
  const referralTotalPages = Math.ceil(referrals.length / referralPageSize) || 1;

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
        commissionApprovalDelayDays: Number(commissionApprovalDelayDays),
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
          <div className="grid w-full max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col">
              <label className="mb-2 min-h-10 text-sm font-medium leading-5">Default commission rate (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={defaultCommissionRate}
                onChange={(e) => setDefaultCommissionRate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 min-h-10 text-sm font-medium leading-5">Default buyer discount (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={defaultReferralDiscountRate}
                onChange={(e) => setDefaultReferralDiscountRate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 min-h-10 text-sm font-medium leading-5">Default payout threshold</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={defaultPayoutThreshold}
                onChange={(e) => setDefaultPayoutThreshold(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 min-h-10 text-sm font-medium leading-5">Commission approval delay (days)</label>
              <Input
                type="number"
                min="0"
                max="365"
                step="1"
                value={commissionApprovalDelayDays}
                onChange={(e) => setCommissionApprovalDelayDays(e.target.value)}
              />
            </div>
          </div>
          <div className="flex w-full max-w-5xl justify-end">
            <Button onClick={handleSaveDefaultSettings} disabled={isUpdatingDefaultRate}>
              {isUpdatingDefaultRate ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
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

        <TabsContent value="referrals">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Referrals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                    <TableHead className="text-primary-foreground">Invite</TableHead>
                    <TableHead className="text-primary-foreground">Affiliate</TableHead>
                    <TableHead className="text-primary-foreground">Status</TableHead>
                    <TableHead className="text-primary-foreground">Date purchased</TableHead>
                    <TableHead className="text-primary-foreground">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No referrals found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReferrals.map((item) => {
                      const normalizedStatus = String(item.commissionStatus || item.status || "").toLowerCase();
                      const isApproved = ["approved", "credited", "paid_out", "payout_requested"].includes(normalizedStatus);
                      const statusLabel = isApproved ? "Approved" : "Qualified (Pending)";
                      const inviteLabel =
                        item.referredClientId?.contactEmail ||
                        `${item.referredClientId?.firstName || "Unknown"} ${item.referredClientId?.lastName || ""}`.trim();
                      const affiliateLabel =
                        item.affiliateClientId?.contactEmail ||
                        `${item.affiliateClientId?.firstName || "Unknown"} ${item.affiliateClientId?.lastName || ""}`.trim();
                      const infoText = [
                        `Status: ${statusLabel}`,
                        isApproved ? "" : "Why pending: Waiting for commission approval delay window.",
                        `Auto approval: ${item.expectedApprovalAt ? formatDate(item.expectedApprovalAt) : "Pending order validation"}`,
                        `Bought: ${item.purchaseItems?.length ? item.purchaseItems.join(", ") : "Product details unavailable"}`,
                      ]
                        .filter(Boolean)
                        .join("\n");

                      return (
                        <TableRow key={item._id}>
                          <TableCell>
                            <div className="font-medium">{inviteLabel || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">
                              Client #{item.referredClientId?.clientId || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{affiliateLabel || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">
                              Code: {item.referralCode || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="inline-flex items-center gap-1.5">
                              <Badge variant="secondary">{statusLabel}</Badge>
                              <button
                                type="button"
                                title={infoText}
                                className="inline-flex items-center text-muted-foreground hover:text-foreground"
                                aria-label="Referral details"
                              >
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(item.qualifiedAt || item.createdAt)}</TableCell>
                          <TableCell className="font-medium">
                            {item.commissionAmount != null
                              ? formatCurrency(item.commissionAmount, item.commissionCurrency || "BDT")
                              : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <DataTablePagination
            page={referralPage}
            totalPages={referralTotalPages}
            totalItems={referrals.length}
            pageSize={referralPageSize}
            currentCount={paginatedReferrals.length}
            itemLabel="referrals"
            onPageChange={setReferralPage}
            onPageSizeChange={(value) => {
              setReferralPageSize(value);
              setReferralPage(1);
            }}
          />
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
