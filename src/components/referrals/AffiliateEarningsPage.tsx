"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Gift, Loader2, PiggyBank, RefreshCw, Share2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DashboardStatCard } from "@/components/client/dashboard/DashboardStatCard";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatDate } from "@/utils/format";
import {
  useGetMyAffiliateDashboardQuery,
  useRegenerateMyAffiliateReferralCodeMutation,
  useRedeemAffiliateCreditMutation,
  useRequestAffiliatePayoutMutation,
  useUpdateMyAffiliateReferralCodeMutation,
} from "@/store/api/affiliateApi";

function humanizeStatus(value?: string) {
  return (value || "").replace(/_/g, " ");
}

interface AffiliateEarningsPageProps {
  embedded?: boolean;
}

export function AffiliateEarningsPage({ embedded = false }: AffiliateEarningsPageProps) {
  const formatCurrency = useFormatCurrency();
  const { data, isLoading, error } = useGetMyAffiliateDashboardQuery();
  const [redeemAffiliateCredit, { isLoading: isRedeeming }] = useRedeemAffiliateCreditMutation();
  const [requestAffiliatePayout, { isLoading: isRequestingPayout }] = useRequestAffiliatePayoutMutation();
  const [updateMyAffiliateReferralCode, { isLoading: isSavingReferralCode }] = useUpdateMyAffiliateReferralCodeMutation();
  const [regenerateMyAffiliateReferralCode, { isLoading: isRegeneratingReferralCode }] =
    useRegenerateMyAffiliateReferralCodeMutation();

  const [redeemAmount, setRedeemAmount] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [referralCodeInput, setReferralCodeInput] = useState("");

  const preferredCurrency = data?.profile?.preferredCurrency || data?.clientCreditCurrency || "BDT";
  const activeSummary = useMemo(() => {
    return data?.summaryByCurrency?.[preferredCurrency]
      || (data?.summaryByCurrency ? Object.values(data.summaryByCurrency)[0] : undefined);
  }, [data?.summaryByCurrency, preferredCurrency]);

  useEffect(() => {
    if (data?.profile?.referralCode) {
      setReferralCodeInput(data.profile.referralCode);
    }
  }, [data?.profile?.referralCode]);

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const handleReferralCodeSave = async () => {
    try {
      await updateMyAffiliateReferralCode({ referralCode: referralCodeInput.trim().toUpperCase() }).unwrap();
      toast.success("Referral code updated.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update referral code.");
    }
  };

  const handleReferralCodeRegenerate = async () => {
    try {
      await regenerateMyAffiliateReferralCode().unwrap();
      toast.success("Referral code regenerated.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to regenerate referral code.");
    }
  };

  const handleRedeem = async () => {
    const amount = Number(redeemAmount);
    if (!amount) {
      toast.error("Enter an amount to redeem.");
      return;
    }
    try {
      const result = await redeemAffiliateCredit({ amount, currency: preferredCurrency }).unwrap();
      toast.success(`Converted ${formatCurrency(result.redeemedAmount, result.currency)} to account credit.`);
      setRedeemAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to redeem affiliate credit.");
    }
  };

  const handlePayoutRequest = async () => {
    const amount = Number(payoutAmount);
    if (!amount) {
      toast.error("Enter an amount to request.");
      return;
    }
    try {
      await requestAffiliatePayout({
        amount,
        currency: preferredCurrency,
        payoutDetails: {
          method: payoutMethod || undefined,
          accountName: accountName || undefined,
          accountNumber: accountNumber || undefined,
          provider: provider || undefined,
        },
      }).unwrap();
      toast.success("Payout request submitted.");
      setPayoutAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create payout request.");
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
    return <div className="p-6 text-center text-destructive">Failed to load affiliate dashboard.</div>;
  }

  if (!data || !data.profile) {
    return <div className="p-6 text-center text-muted-foreground">Preparing your referral workspace...</div>;
  }

  const referralLink = data.profile.referralLink || "";
  const payoutThreshold = data.profile.payoutThreshold ?? 0;
  const availableForPayout = activeSummary?.approved || 0;
  const thresholdProgress = payoutThreshold > 0 ? Math.min(100, (availableForPayout / payoutThreshold) * 100) : 0;

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Affiliate Program</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Earn on qualified referrals, wait through the refund window, then redeem approved balance.
            </p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-sm">
            <div className="text-muted-foreground">Current account credit</div>
            <div className="text-lg font-semibold mt-1">
              {formatCurrency(data.clientCreditBalance || 0, data.clientCreditCurrency || preferredCurrency)}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Referral Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.profile?.status === "paused" ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                Your affiliate profile is currently paused. Referral discounts and new affiliate tracking are temporarily inactive.
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Referral code</div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-xl font-semibold tracking-wide">{data.profile?.referralCode}</div>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(data.profile?.referralCode || "", "Referral code")}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Buyers can use this as a referral code or as a discount code in checkout.
                </p>
                <div className="mt-4 space-y-2">
                  <Input
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="Edit referral code"
                    maxLength={20}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReferralCodeSave}
                      disabled={isSavingReferralCode || !referralCodeInput.trim()}
                    >
                      {isSavingReferralCode ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save code
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReferralCodeRegenerate}
                      disabled={isRegeneratingReferralCode}
                    >
                      {isRegeneratingReferralCode ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Regenerate
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Referral link</div>
                <div className="mt-2 text-sm break-all">{referralLink}</div>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => handleCopy(referralLink, "Referral link")}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy link
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Payout threshold progress</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(availableForPayout, preferredCurrency)} available of {formatCurrency(payoutThreshold, preferredCurrency)} required
                  </div>
                </div>
                <Badge variant="secondary">{Math.round(thresholdProgress)}%</Badge>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${thresholdProgress}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Redeem to account credit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder={`Amount in ${preferredCurrency}`}
              />
              <Button className="w-full" onClick={handleRedeem} disabled={isRedeeming}>
                {isRedeeming ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
                Convert to credit
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Manual payout request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder={`Amount in ${preferredCurrency}`}
              />
              <Input value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} placeholder="Method e.g. Bank / bKash / PayPal" />
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Account name" />
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" />
              <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider / bank / wallet" />
              <Button className="w-full" onClick={handlePayoutRequest} disabled={isRequestingPayout}>
                {isRequestingPayout ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PiggyBank className="w-4 h-4 mr-2" />}
                Request payout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total Referrals"
          value={data.profile?.referredClientsCount || 0}
          viewAllHref="/referrals?tab=earnings"
          viewAllLabel="Review referrals"
          icon={Share2}
          hint="Tracked referred clients"
        />
        <DashboardStatCard
          title="Qualified"
          value={formatCurrency(activeSummary?.qualified || 0, preferredCurrency)}
          viewAllHref="/referrals?tab=earnings"
          viewAllLabel="Pending window"
          icon={Gift}
          hint="Inside refund window"
        />
        <DashboardStatCard
          title="Available"
          value={formatCurrency(activeSummary?.approved || 0, preferredCurrency)}
          viewAllHref="/referrals?tab=earnings"
          viewAllLabel="Ready to redeem"
          icon={Wallet}
          hint="Approved after 7 days"
        />
        <DashboardStatCard
          title="Paid / Credited"
          value={formatCurrency((activeSummary?.paidOut || 0) + (activeSummary?.credited || 0), preferredCurrency)}
          viewAllHref="/referrals?tab=earnings"
          viewAllLabel="View history"
          icon={PiggyBank}
          hint="Completed redemptions"
        />
      </div>

      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.referrals || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No referrals tracked yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data.referrals || []).map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div className="font-medium">
                            {item.referredClientId?.firstName || "Unknown"} {item.referredClientId?.lastName || ""}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Client #{item.referredClientId?.clientId || "—"} {item.referredClientId?.contactEmail ? `• ${item.referredClientId.contactEmail}` : ""}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{item.source}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{humanizeStatus(item.status)}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Base Order</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Referral Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.commissions || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No commissions yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data.commissions || []).map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{humanizeStatus(item.status)}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(item.orderNetAmount, item.currency)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.commissionAmount, item.currency)}</TableCell>
                        <TableCell>{formatDate(item.approvedAt || item.availableAt)}</TableCell>
                        <TableCell>{item.referralCode}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requested</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Review Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.payoutRequests || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No payout requests yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data.payoutRequests || []).map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{formatDate(item.requestedAt)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.amount, item.currency)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{humanizeStatus(item.status)}</Badge>
                        </TableCell>
                        <TableCell>{item.payoutDetails?.method || item.payoutDetails?.provider || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{item.reviewNotes || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
