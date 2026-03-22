"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetClientServicesQuery } from "@/store/api/servicesApi";
import { getSharedServiceManagePath } from "@/components/client/shared-with-me";
import { ActiveServicesList } from "@/components/client/hosting/ActiveServicesList";
import { Grid3x3, Server, Globe, Mail, Key, Layers } from "lucide-react";

const SERVICE_TABS: { value: string; label: string; type?: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "hosting", label: "Hosting", type: "HOSTING", icon: Grid3x3 },
  { value: "vps", label: "VPS", type: "VPS", icon: Server },
  { value: "domains", label: "Domains", type: "DOMAIN", icon: Globe },
  { value: "emails", label: "Emails", type: "EMAIL", icon: Mail },
  { value: "licenses", label: "Licenses", type: "LICENSE", icon: Key },
  { value: "all", label: "All Services", icon: Layers },
];

function SharedServiceTabContent({
  clientId,
  type,
  title,
}: {
  clientId: string;
  type?: string;
  title: string;
}) {
  const router = useRouter();
  const { data, isLoading } = useGetClientServicesQuery(
    { clientId, params: { type: type as "HOSTING" | "VPS" | "DOMAIN" | "EMAIL" | "LICENSE", limit: 100 } },
    { skip: !clientId }
  );
  const services = data?.services ?? [];

  const handleManage = (serviceId: string) => {
    const s = services.find((x) => x.id === serviceId);
    router.push(getSharedServiceManagePath(clientId, serviceId, s?.productType ?? "hosting"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ActiveServicesList
      services={services}
      onManage={handleManage}
      title={title}
    />
  );
}

export default function SharedClientServicesPage() {
  const params = useParams();
  const clientId = params?.clientId as string;

  if (!clientId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invalid client.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/shared-with-me">Back to Shared with me</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Tabs defaultValue="hosting" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
          {SERVICE_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {SERVICE_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <SharedServiceTabContent
              clientId={clientId}
              type={tab.type}
              title={tab.type ? `${tab.label} services` : "All services"}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
