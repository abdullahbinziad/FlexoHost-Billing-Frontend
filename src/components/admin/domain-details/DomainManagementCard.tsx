"use client";

import { Key, Loader2, Shield, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface DomainManagementCardProps {
  registrarLock: boolean;
  eppCode: string;
  isSavingLock: boolean;
  isLoadingEpp: boolean;
  onRegistrarLockChange: (value: boolean) => void;
  onSaveRegistrarLock: () => void;
  onGetEppCode: () => void;
}

export function DomainManagementCard({
  registrarLock,
  eppCode,
  isSavingLock,
  isLoadingEpp,
  onRegistrarLockChange,
  onSaveRegistrarLock,
  onGetEppCode,
}: DomainManagementCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Registrar Lock</label>
            <p className="text-xs text-muted-foreground">Prevent unauthorized transfers</p>
          </div>
          <Switch checked={registrarLock} onCheckedChange={onRegistrarLockChange} />
        </div>
        <Separator />
        <Button variant="outline" onClick={onSaveRegistrarLock} disabled={isSavingLock}>
          {isSavingLock ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
          Save Lock Setting
        </Button>
        <Separator />
        <div className="space-y-2">
          <label className="text-sm font-medium">EPP Code</label>
          <div className="flex gap-2">
            <Input value={eppCode} readOnly placeholder="Fetch EPP code when needed" />
            <Button variant="outline" onClick={onGetEppCode} disabled={isLoadingEpp}>
              {isLoadingEpp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Registrar-backed Data</label>
            <p className="text-xs text-muted-foreground">Lock, contacts, DNS, nameservers, and EPP use registrar APIs.</p>
          </div>
          <Badge variant="outline">Live</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
