"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatDate } from "@/utils/format";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import {
  useEnrollClientAffiliateAdminMutation,
  useGetAdminClientAffiliateQuery,
  useRegenerateAffiliateClientReferralCodeMutation,
  useUpdateAffiliateClientReferralCodeMutation,
  useUpdateAffiliateClientSettingsMutation,
  useUpdateAffiliateClientStatusMutation,
} from "@/store/api/affiliateApi";

function humanizeStatus(value?: string) {
  return (value || "").replace(/_/g, " ");
}

export default function ClientAffiliateAdminPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const formatCurrency = useFormatCurrency();
  const { data, isLoading, error } = useGetAdminClientAffiliateQuery(clientId, { skip: !clientId });
  const [enrollClientAffiliate, { isLoading: isEnrolling }] = useEnrollClientAffiliateAdminMutation();
  const [updateClientAffiliateSettings, { isLoading: isSaving }] = useUpdateAffiliateClientSettingsMutation();
  const [updateAffiliateClientStatus, { isLoading: isUpdatingStatus }] = useUpdateAffiliateClientStatusMutation();
  const [updateAffiliateClientReferralCode, { isLoading: isSavingReferralCode }] =
    useUpdateAffiliateClientReferralCodeMutation();
  const [regenerateAffiliateClientReferralCode, { isLoading: isRegeneratingReferralCode }] =
    useRegenerateAffiliateClientReferralCodeMutation();
  const [commissionRate, setCommissionRate] = useState("");
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [referralDiscountRate, setReferralDiscountRate] = useState("");
  const [payoutThreshold, setPayoutThreshold] = useState("");
  const [referralsPage, setReferralsPage] = useState(1);
  const [referralsPageSize, setReferralsPageSize] = useState(10);
  const [commissionsPage, setCommissionsPage] = useState(1);
  const [commissionsPageSize, setCommissionsPageSize] = useState(10);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [payoutsPageSize, setPayoutsPageSize] = useState(10);

  useEffect(() => {
    if (!data?.profile) return;
    setCommissionRate(String(data.profile.commissionRate ?? ""));
    setReferralDiscountRate(String(data.profile.referralDiscountRate ?? ""));
    setPayoutThreshold(String(data.profile.payoutThreshold ?? ""));
    setReferralCodeInput(data.profile.referralCode ?? "");
  }, [data?.profile]);

  const summaryCurrency = useMemo(() => {
    if (!data?.summaryByCurrency) return undefined;
    return data.profile?.preferredCurrency || Object.keys(data.summaryByCurrency)[0];
  }, [data?.profile?.preferredCurrency, data?.summaryByCurrency]);

  const summary = summaryCurrency ? data?.summaryByCurrency?.[summaryCurrency] : undefined;
  const referrals = data?.referrals || [];
  const commissions = data?.commissions || [];
  const payoutRequests = data?.payoutRequests || [];
  const paginatedReferrals = referrals.slice(
    (referralsPage - 1) * referralsPageSize,
    referralsPage * referralsPageSize
  );
  const paginatedCommissions = commissions.slice(
    (commissionsPage - 1) * commissionsPageSize,
    commissionsPage * commissionsPageSize
  );
  const paginatedPayoutRequests = payoutRequests.slice(
    (payoutsPage - 1) * payoutsPageSize,
    payoutsPage * payoutsPageSize
  );

  const handleEnroll = async () => {
    if (!clientId) return;
    try {
      await enrollClientAffiliate(clientId).unwrap();
      toast.success("Affiliate profile created for this client.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create affiliate profile.");
    }
  };

  const handleSaveSettings = async () => {
    if (!clientId) return;
    try {
      await updateClientAffiliateSettings({
        clientId,
        commissionRate: Number(commissionRate),
        referralDiscountRate: Number(referralDiscountRate),
        payoutThreshold: Number(payoutThreshold),
      }).unwrap();
      toast.success("Affiliate settings updated.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update affiliate settings.");
    }
  };

  const handleStatusChange = async (status: "active" | "paused") => {
    if (!clientId) return;
    try {
      await updateAffiliateClientStatus({ clientId, status }).unwrap();
      toast.success(`Affiliate ${status === "active" ? "resumed" : "paused"}.`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update affiliate status.");
    }
  };

  const copyReferralLink = async () => {
    if (!data?.profile?.referralLink) return;
    try {
      await navigator.clipboard.writeText(data.profile.referralLink);
      toast.success("Referral link copied.");
    } catch {
      toast.error("Failed to copy referral link.");
    }
  };

  const handleSaveReferralCode = async () => {
    if (!clientId || !referralCodeInput.trim()) return;
    try {
      await updateAffiliateClientReferralCode({
        clientId,
        referralCode: referralCodeInput.trim().toUpperCase(),
      }).unwrap();
      toast.success("Referral code updated.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update referral code.");
    }
  };

  const handleRegenerateReferralCode = async () => {
    if (!clientId) return;
    try {
      await regenerateAffiliateClientReferralCode(clientId).unwrap();
      toast.success("Referral code regenerated.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to regenerate referral code.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load affiliate details for this client.
        </CardContent>
      </Card>
    );
  }

  const clientName = [data.client?.firstName, data.client?.lastName].filter(Boolean).join(" ") || "Client";

  if (!data.enrolled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{clientName} is not enrolled in the affiliate program yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create an affiliate profile for this client to generate a referral code and start tracking referrals.
            </p>
          </div>
          <Button onClick={handleEnroll} disabled={isEnrolling}>
            {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Affiliate Profile"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Affiliate Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{clientName}</p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {humanizeStatus(data.profile?.status)}
              </Badge>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdatingStatus || data.profile?.status === "active"}
                  onClick={() => handleStatusChange("active")}
                >
                  {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resume"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdatingStatus || data.profile?.status === "paused"}
                  onClick={() => handleStatusChange("paused")}
                >
                  {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pause"}
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Referral code</p>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="Referral code"
                    maxLength={20}
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveReferralCode}
                    disabled={isSavingReferralCode || !referralCodeInput.trim() || referralCodeInput === data.profile?.referralCode}
                  >
                    {isSavingReferralCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateReferralCode}
                    disabled={isRegeneratingReferralCode}
                  >
                    {isRegeneratingReferralCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">4–20 letters or numbers. Admin can edit or regenerate.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Referral link</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyReferralLink}>
                    <Copy className="mr-1.5 h-4 w-4" />
                    Copy link
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Commission rate (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Buyer discount rate (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={referralDiscountRate}
                  onChange={(e) => setReferralDiscountRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payout threshold</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={payoutThreshold}
                  onChange={(e) => setPayoutThreshold(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Affiliate Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary?.approved || 0, summaryCurrency || data.profile?.preferredCurrency || "BDT")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Qualified Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary?.qualified || 0, summaryCurrency || data.profile?.preferredCurrency || "BDT")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.profile?.referredClientsCount || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Referral Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referred Client</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No referrals recorded for this client yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReferrals.map((referral) => (
                      <TableRow key={referral._id}>
                        <TableCell>
                          <div className="font-medium">
                            {referral.referredClientId?.firstName || "Unknown"} {referral.referredClientId?.lastName || ""}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Client #{referral.referredClientId?.clientId || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{humanizeStatus(referral.source)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {humanizeStatus(referral.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(referral.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="p-4">
                <DataTablePagination
                  page={referralsPage}
                  totalPages={Math.ceil(referrals.length / referralsPageSize) || 1}
                  totalItems={referrals.length}
                  pageSize={referralsPageSize}
                  currentCount={paginatedReferrals.length}
                  itemLabel="referrals"
                  onPageChange={setReferralsPage}
                  onPageSizeChange={(value) => {
                    setReferralsPageSize(value);
                    setReferralsPage(1);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Commissions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Net Order</TableHead>
                    <TableHead>Buyer Discount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No commissions found for this client.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCommissions.map((commission) => (
                      <TableRow key={commission._id}>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {humanizeStatus(commission.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(commission.orderNetAmount, commission.currency)}</TableCell>
                        <TableCell>{formatCurrency(commission.discountAmount, commission.currency)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(commission.commissionAmount, commission.currency)}
                        </TableCell>
                        <TableCell>{formatDate(commission.availableAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="p-4">
                <DataTablePagination
                  page={commissionsPage}
                  totalPages={Math.ceil(commissions.length / commissionsPageSize) || 1}
                  totalItems={commissions.length}
                  pageSize={commissionsPageSize}
                  currentCount={paginatedCommissions.length}
                  itemLabel="commissions"
                  onPageChange={setCommissionsPage}
                  onPageSizeChange={(value) => {
                    setCommissionsPageSize(value);
                    setCommissionsPage(1);
                  }}
                />
              </div>
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
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No payout requests for this affiliate yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayoutRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell className="font-medium">
                          {formatCurrency(request.amount, request.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {humanizeStatus(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(request.requestedAt)}</TableCell>
                        <TableCell>
                          {request.payoutDetails?.method || request.payoutDetails?.provider || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="p-4">
                <DataTablePagination
                  page={payoutsPage}
                  totalPages={Math.ceil(payoutRequests.length / payoutsPageSize) || 1}
                  totalItems={payoutRequests.length}
                  pageSize={payoutsPageSize}
                  currentCount={paginatedPayoutRequests.length}
                  itemLabel="payout requests"
                  onPageChange={setPayoutsPage}
                  onPageSizeChange={(value) => {
                    setPayoutsPageSize(value);
                    setPayoutsPage(1);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
