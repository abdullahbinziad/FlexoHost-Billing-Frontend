"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ServerConfig } from "@/types/admin";
import { Globe } from "lucide-react";

interface NameserversProps {
    formData: Omit<ServerConfig, "id">;
    handleNameserverChange: (key: string, value: string) => void;
}

export function Nameservers({ formData, handleNameserverChange }: NameserversProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Globe className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Nameservers</CardTitle>
                        <CardDescription>DNS configuration</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                {["Primary", "Secondary", "Third", "Fourth", "Fifth"].map((label, index) => {
                    const nsKey = `ns${index + 1}`;
                    const ipKey = `ns${index + 1}Ip`;
                    // Only show first 2 default, others if filled or tailored UI? 
                    // Keeping it simple as per original but cleaner.

                    if (index > 1 && !formData.nameservers[nsKey as keyof typeof formData.nameservers] && !formData.nameservers[ipKey as keyof typeof formData.nameservers]) {
                        // We could hide empty optional ones, but keeping them accessible is better for UX if user wants to add them.
                        // Let's keep them all for now but maybe style them as compact.
                    }

                    return (
                        <div key={nsKey} className="group">
                            <div className="grid grid-cols-12 gap-2 items-start">
                                <div className="col-span-12 md:col-span-7 space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">{label} Nameserver</Label>
                                    <Input
                                        value={formData.nameservers[nsKey as keyof typeof formData.nameservers]}
                                        onChange={(e) => handleNameserverChange(nsKey, e.target.value)}
                                        placeholder={`ns${index + 1}.example.com`}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-5 space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">IP Address</Label>
                                    <Input
                                        value={formData.nameservers[ipKey as keyof typeof formData.nameservers]}
                                        onChange={(e) => handleNameserverChange(ipKey, e.target.value)}
                                        placeholder="0.0.0.0"
                                        className="h-9 text-sm font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
