import { ReferralsHubPage } from "@/components/referrals/ReferralsHubPage";

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const initialTab = params?.tab === "earnings" ? "earnings" : "refer";

  return <ReferralsHubPage initialTab={initialTab} />;
}
