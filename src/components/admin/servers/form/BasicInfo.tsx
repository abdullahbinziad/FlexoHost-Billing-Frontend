"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServerConfig } from "@/types/admin";
import { Server } from "lucide-react";

interface BasicInfoProps {
    formData: Omit<ServerConfig, "id">;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<Omit<ServerConfig, "id">>>;
}

export function BasicInfo({ formData, handleChange, setFormData }: BasicInfoProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Server className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Server Details</CardTitle>
                        <CardDescription>Core configuration for this server</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Server Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., srv1"
                            required
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hostname" className="text-sm font-medium">Hostname *</Label>
                        <Input
                            id="hostname"
                            name="hostname"
                            value={formData.hostname}
                            onChange={handleChange}
                            placeholder="e.g., server25.flexohost.com"
                            required
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ipAddress" className="text-sm font-medium">Primary IP Address *</Label>
                        <Input
                            id="ipAddress"
                            name="ipAddress"
                            value={formData.ipAddress}
                            onChange={handleChange}
                            placeholder="e.g., 103.14.23.18"
                            required
                            className="h-10 font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="datacenter" className="text-sm font-medium">Datacenter/NOC</Label>
                        <Input
                            id="datacenter"
                            name="datacenter"
                            value={formData.datacenter}
                            onChange={handleChange}
                            placeholder="e.g., US East"
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Server Location</Label>
                        <Select
                            value={formData.location}
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, location: value }))}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USA">USA</SelectItem>
                                <SelectItem value="Malaysia">Malaysia</SelectItem>
                                <SelectItem value="Singapore">Singapore</SelectItem>
                                <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                                <SelectItem value="Germany">Germany</SelectItem>
                                <SelectItem value="Finland">Finland</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Server Group</Label>
                        <Select
                            value={formData.group}
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, group: value }))}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Web Hosting">Web Hosting</SelectItem>
                                <SelectItem value="BDIX Hosting">BDIX Hosting</SelectItem>
                                <SelectItem value="Turbo Hosting">Turbo Hosting</SelectItem>
                                <SelectItem value="Ecommerce Hosting">Ecommerce Hosting</SelectItem>
                                <SelectItem value="VPS">VPS</SelectItem>
                                <SelectItem value="BDIX Vps">BDIX Vps</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="monthlyCost" className="text-sm font-medium">Monthly Cost (USD)</Label>
                        <Input
                            id="monthlyCost"
                            name="monthlyCost"
                            type="number"
                            step="0.01"
                            value={formData.monthlyCost}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxAccounts" className="text-sm font-medium">Max Accounts</Label>
                        <Input
                            id="maxAccounts"
                            name="maxAccounts"
                            type="number"
                            value={formData.maxAccounts}
                            onChange={handleChange}
                            className="h-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="assignedIpAddresses" className="text-sm font-medium">
                        Assigned IP Addresses
                        <span className="text-xs text-muted-foreground ml-2">(One per line)</span>
                    </Label>
                    <Textarea
                        id="assignedIpAddresses"
                        name="assignedIpAddresses"
                        value={formData.assignedIpAddresses}
                        onChange={handleChange}
                        className="min-h-[100px] resize-none font-mono text-sm"
                        placeholder="103.14.23.19&#10;103.14.23.20"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="statusAddress" className="text-sm font-medium">Status Address</Label>
                    <Input
                        id="statusAddress"
                        name="statusAddress"
                        value={formData.statusAddress}
                        onChange={handleChange}
                        placeholder="https://example.com/status/"
                        className="h-10"
                    />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                    <Checkbox
                        id="isEnabled"
                        checked={!formData.isEnabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: !checked }))}
                    />
                    <Label htmlFor="isEnabled" className="text-sm font-medium cursor-pointer text-muted-foreground">
                        Disable this server temporarily
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
}
