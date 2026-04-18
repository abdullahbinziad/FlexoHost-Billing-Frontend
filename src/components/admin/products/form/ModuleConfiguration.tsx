/**
 * ModuleConfiguration Component
 *
 * Handles server module configuration including module type, server group, and package name.
 * For cPanel hosting products, WHM package names are loaded from all enabled servers in the
 * selected server group (union of synced whmPackages).
 */

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, AlertTriangle, RefreshCw } from "lucide-react";
import { SERVER_GROUP_OPTIONS, getServerGroups } from "@/types/admin";
import type { ProductType, ServerConfig } from "@/types/admin";
import { useGetServersQuery } from "@/store/api/serverApi";
import { MODULE_TYPE, SELECT_SENTINEL } from "@/constants/status";

interface ModuleConfigurationProps {
    formData: {
        moduleName: string;
        serverGroup: string;
        whmPackageName: string;
        type: ProductType;
    };
    setFormData: (updater: (prev: any) => any) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** WHM package names from all enabled cPanel servers that belong to the given server group. */
function collectWhmPackagesForServerGroup(servers: ServerConfig[] | undefined, serverGroup: string): string[] {
    const g = serverGroup.trim();
    if (!g) return [];
    const eligible = (servers || []).filter((s) => {
        if (s.isEnabled === false) return false;
        if (String(s.module?.type || "").toLowerCase() !== "cpanel") return false;
        return getServerGroups(s).includes(g as (typeof SERVER_GROUP_OPTIONS)[number]);
    });
    const names = new Set<string>();
    for (const s of eligible) {
        for (const p of s.whmPackages || []) {
            const n = String(p || "").trim();
            if (n) names.add(n);
        }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export function ModuleConfiguration({ formData, setFormData, handleChange }: ModuleConfigurationProps) {
    const { data: servers = [], isLoading: serversLoading } = useGetServersQuery();

    const isCpanelHosting =
        formData.type === "hosting" && String(formData.moduleName || "").toLowerCase() === "cpanel";

    const packagesForGroup = useMemo(
        () => (isCpanelHosting ? collectWhmPackagesForServerGroup(servers, formData.serverGroup) : []),
        [isCpanelHosting, servers, formData.serverGroup]
    );

    const whmPackageSelectOptions = useMemo(() => {
        const cur = String(formData.whmPackageName || "").trim();
        if (cur && !packagesForGroup.includes(cur)) {
            return [cur, ...packagesForGroup];
        }
        return packagesForGroup;
    }, [packagesForGroup, formData.whmPackageName]);

    const handleServerGroupChange = (value: string) => {
        const nextPackages = collectWhmPackagesForServerGroup(servers, value);
        setFormData((prev: any) => {
            const cur = String(prev.whmPackageName || "").trim();
            const keep = cur && nextPackages.includes(cur) ? cur : "";
            return { ...prev, serverGroup: value, whmPackageName: keep };
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Settings className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Module Configuration</CardTitle>
                        <CardDescription>Configure automation and server settings</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Module Name</Label>
                        <Select
                            value={formData.moduleName}
                            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, moduleName: value }))}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Module" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={MODULE_TYPE.CPANEL}>cPanel</SelectItem>
                                <SelectItem value={MODULE_TYPE.DIRECTADMIN}>DirectAdmin</SelectItem>
                                <SelectItem value={MODULE_TYPE.PLESK}>Plesk</SelectItem>
                                <SelectItem value={MODULE_TYPE.VIRTUALIZOR}>Virtualizor</SelectItem>
                                <SelectItem value={MODULE_TYPE.NONE}>None / Manual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Server Group</Label>
                        <Select value={formData.serverGroup} onValueChange={handleServerGroupChange}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Server Group" />
                            </SelectTrigger>
                            <SelectContent>
                                {SERVER_GROUP_OPTIONS.map((group) => (
                                    <SelectItem key={group} value={group}>
                                        {group}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whmPackageName" className="text-sm font-medium">
                        WHM Package Name
                    </Label>
                    {isCpanelHosting ? (
                        <>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={formData.whmPackageName?.trim() ? formData.whmPackageName : SELECT_SENTINEL.NONE}
                                    onValueChange={(v) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            whmPackageName: v === SELECT_SENTINEL.NONE ? "" : v,
                                        }))
                                    }
                                    disabled={serversLoading}
                                >
                                    <SelectTrigger id="whmPackageName" className="h-10 w-full font-mono text-sm">
                                        <SelectValue
                                            placeholder={
                                                serversLoading ? "Loading servers…" : "Select WHM package"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={SELECT_SENTINEL.NONE}>— Select package —</SelectItem>
                                        {whmPackageSelectOptions.map((pkg) => (
                                            <SelectItem key={pkg} value={pkg}>
                                                {pkg}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex shrink-0 gap-1 text-muted-foreground" title="Must match WHM">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <RefreshCw className="h-5 w-5" aria-hidden />
                                </div>
                            </div>
                            {!serversLoading && packagesForGroup.length === 0 ? (
                                <p className="text-xs text-amber-800 dark:text-amber-200/90">
                                    No WHM packages found for servers in &quot;{formData.serverGroup}&quot;. Sync
                                    packages on each cPanel server in{" "}
                                    <Link href="/admin/server-config" className="underline font-medium">
                                        Server Config
                                    </Link>{" "}
                                    (Sync accounts), or add servers to this group.
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Packages are merged from all enabled cPanel servers assigned to this server group.
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="whmPackageName"
                                    name="whmPackageName"
                                    value={formData.whmPackageName}
                                    onChange={handleChange}
                                    placeholder="e.g. 2 GB BDIX"
                                    className="h-10"
                                />
                                <div className="flex gap-1 text-muted-foreground">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    <RefreshCw className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter the exact package name as configured on the control panel server
                            </p>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
