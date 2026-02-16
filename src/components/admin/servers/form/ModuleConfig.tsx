"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ServerConfig } from "@/types/admin";
import { Database } from "lucide-react";

interface ModuleConfigProps {
    formData: Omit<ServerConfig, "id">;
    handleModuleChange: (field: string, value: any) => void;
}

export function ModuleConfig({ formData, handleModuleChange }: ModuleConfigProps) {
    return (
        <Card className="border-l-4 border-l-purple-500 overflow-hidden">
            <CardHeader className="bg-muted/10 pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Database className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Module Settings</CardTitle>
                        <CardDescription>Control panel connection details</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Control Panel Module *</Label>
                    <div className="flex items-center gap-3">
                        <Select
                            value={formData.module.type}
                            onValueChange={(value) => handleModuleChange("type", value)}
                        >
                            <SelectTrigger className="h-9 flex-1">
                                <SelectValue placeholder="Select module" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cpanel">cPanel</SelectItem>
                                <SelectItem value="directadmin">DirectAdmin</SelectItem>
                                <SelectItem value="plesk">Plesk</SelectItem>
                                <SelectItem value="virtualizor">Virtualizor</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="sm" className="h-9 px-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200">
                            Test
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Username *</Label>
                        <Input
                            value={formData.module.username}
                            onChange={(e) => handleModuleChange("username", e.target.value)}
                            placeholder="root"
                            required
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                        <Input
                            type="password"
                            value={formData.module.password}
                            onChange={(e) => handleModuleChange("password", e.target.value)}
                            placeholder="••••••••"
                            className="h-9"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Port Configuration</Label>
                        <div className="flex items-center gap-4 p-2 border rounded-md bg-muted/20 h-[60px]">
                            <div className="w-24">
                                <Input
                                    type="number"
                                    value={formData.module.port}
                                    onChange={(e) => handleModuleChange("port", Number(e.target.value))}
                                    disabled={!formData.module.isPortOverride}
                                    className="h-8 text-center font-mono text-sm"
                                />
                            </div>
                            <div className="flex items-center space-x-2 border-l pl-4">
                                <Checkbox
                                    id="isPortOverride"
                                    checked={formData.module.isPortOverride}
                                    onCheckedChange={(checked) => handleModuleChange("isPortOverride", checked)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="isPortOverride" className="font-normal cursor-pointer text-xs">
                                    Override
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">API Token (Optional)</Label>
                        <Textarea
                            value={formData.module.apiToken}
                            onChange={(e) => handleModuleChange("apiToken", e.target.value)}
                            className="h-[60px] min-h-[60px] resize-none font-mono text-xs bg-muted/30"
                            placeholder="Paste your API token here..."
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                    <Checkbox
                        id="isSecure"
                        checked={formData.module.isSecure}
                        onCheckedChange={(checked) => handleModuleChange("isSecure", checked)}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-4 w-4"
                    />
                    <Label htmlFor="isSecure" className="font-medium cursor-pointer text-xs text-green-700 dark:text-green-400">
                        Use Secure Connection (SSL/TLS)
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
}
