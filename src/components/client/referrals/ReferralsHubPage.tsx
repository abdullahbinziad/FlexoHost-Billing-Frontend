"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReferHostingPage } from "@/components/client/referrals/ReferHostingPage";
import { AffiliateEarningsPage } from "@/components/client/referrals/AffiliateEarningsPage";

interface ReferralsHubPageProps {
  initialTab?: "refer" | "earnings";
}

export function ReferralsHubPage({ initialTab = "refer" }: ReferralsHubPageProps) {
  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">Refer & Earn</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Share products, track referrals, and manage your earnings from one place.
        </p>
      </div>

      <Tabs defaultValue={initialTab} className="w-full min-w-0 space-y-4 sm:space-y-6">
        <TabsList className="grid h-auto w-full min-w-0 grid-cols-2 gap-1 p-1 sm:inline-flex sm:h-10 sm:w-fit sm:grid-cols-none sm:justify-center">
          <TabsTrigger value="refer">Refer & earn</TabsTrigger>
          <TabsTrigger value="earnings">My earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="refer">
          <ReferHostingPage embedded />
        </TabsContent>

        <TabsContent value="earnings">
          <AffiliateEarningsPage embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
