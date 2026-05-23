"use client";

import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DomainOverviewCardProps {
  domainName: string;
  serviceId: string;
  productName?: string;
  registrarStatus?: string;
  registrar?: string;
}

export function DomainOverviewCard({
  domainName,
  serviceId,
  productName,
  registrarStatus,
  registrar,
}: DomainOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          Domain Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain Name</label>
            <Input value={domainName} className="font-medium" readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service ID</label>
            <Input value={serviceId} className="font-mono text-sm" readOnly />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</label>
            <Input value={productName ?? "—"} readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registrar Status</label>
            <Input value={registrarStatus || "—"} readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registrar</label>
            <Input value={registrar || "—"} readOnly />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
