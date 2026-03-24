"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReferHostingPage } from "@/components/referrals/ReferHostingPage";
import { AffiliateEarningsPage } from "@/components/referrals/AffiliateEarningsPage";

interface ReferralsHubPageProps {
  initialTab?: "refer" | "earnings";
}

export function ReferralsHubPage({ initialTab = "refer" }: ReferralsHubPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Refer & Earn</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share products, track referrals, and manage your earnings from one place.
        </p>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList>
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
