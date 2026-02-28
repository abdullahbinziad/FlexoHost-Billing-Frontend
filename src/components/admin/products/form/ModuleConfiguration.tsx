/**
 * ModuleConfiguration Component
 * 
 * Handles server module configuration including module type, server group, and package name.
 * Used for hosting products to configure automation settings.
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, AlertTriangle, RefreshCw } from "lucide-react";

interface ModuleConfigurationProps {
    formData: {
        moduleName: string;
        serverGroup: string;
        whmPackageName: string;
    };
    setFormData: (updater: (prev: any) => any) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ModuleConfiguration({ formData, setFormData, handleChange }: ModuleConfigurationProps) {
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
                            onValueChange={(value) => setFormData(prev => ({ ...prev, moduleName: value }))}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Module" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cpanel">cPanel</SelectItem>
                                <SelectItem value="directadmin">DirectAdmin</SelectItem>
                                <SelectItem value="plesk">Plesk</SelectItem>
                                <SelectItem value="virtualizor">Virtualizor</SelectItem>
                                <SelectItem value="none">None / Manual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Server Group</Label>
                        <Select
                            value={formData.serverGroup}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, serverGroup: value }))}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Server Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="BDIX-01">BDIX-01</SelectItem>
                                <SelectItem value="USA-01">USA-01</SelectItem>
                                <SelectItem value="SG-01">SG-01</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whmPackageName" className="text-sm font-medium">
                        WHM Package Name
                    </Label>
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
                        Enter the exact package name as configured in WHM/cPanel
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
