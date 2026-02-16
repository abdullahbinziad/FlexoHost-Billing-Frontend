"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    Globe,
    CreditCard,
    Calendar,
    Shield,
    Server,
    Lock,
    ExternalLink,
    RefreshCw,
    Trash2,
    Settings,
    Mail,
    Edit,
    Key
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DomainDetailsPage({ params }: { params: { id: string; domainId: string } }) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground mb-2"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Domains
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                nazrulinstitute.com
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">Dynadot</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" /> Visit Site
                    </Button>
                    <Button>
                        <RefreshCw className="w-4 h-4 mr-2" /> Renew Domain
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Main Column */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Domain Overview Card */}
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
                                    <Input defaultValue="nazrulinstitute.com" className="font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subscription ID</label>
                                    <Input placeholder="Enter Subscription ID" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registrar</label>
                                    <Select defaultValue="dynadot">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dynadot">Dynadot</SelectItem>
                                            <SelectItem value="namecheap">Namecheap</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Promotion Code</label>
                                    <Select defaultValue="none">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nameservers Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Server className="w-4 h-4 text-gray-500" />
                                Nameservers
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Switch id="default-ns" />
                                <label htmlFor="default-ns" className="text-sm text-gray-600 font-medium cursor-pointer">Use Default Nameservers</label>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((num) => (
                                    <div key={num} className="relative">
                                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">NS{num}</span>
                                        <Input className="pl-12" defaultValue={num <= 2 ? `ns${num}.flexohost.com` : ""} placeholder={`Nameserver ${num}`} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Registrar Commands */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Shield className="w-4 h-4 text-gray-500" />
                                Registrar Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <Edit className="w-4 h-4" />
                                    <span className="text-xs">Contact Info</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <Key className="w-4 h-4" />
                                    <span className="text-xs">Get EPP Code</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-xs">ID Protection</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20">
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-xs">Request Delete</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Admin Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea placeholder="Add private notes about this domain..." className="min-h-[100px]" />
                        </CardContent>
                    </Card>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">

                    {/* Dates & Billing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                Dates & Billing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Registration Date</label>
                                <Input type="date" defaultValue="2025-12-29" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Expiry Date</label>
                                <Input type="date" defaultValue="2026-12-29" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Next Due Date</label>
                                <Input type="date" defaultValue="2026-12-29" />
                            </div>
                            <Separator className="my-2" />
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Payment Method</label>
                                <Select defaultValue="sslcommerz">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sslcommerz">SSLCommerz</SelectItem>
                                        <SelectItem value="bank">Bank Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Recurring</label>
                                    <Input defaultValue="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Period (Yrs)</label>
                                    <Input type="number" defaultValue="1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features & Toggles */}
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
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Auto Renew</label>
                                    <p className="text-xs text-muted-foreground">Renew automatically on due date</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">DNS Management</label>
                                    <p className="text-xs text-muted-foreground">Manage DNS records</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Email Forwarding</label>
                                    <p className="text-xs text-muted-foreground">Forward emails to another address</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer Action Bar */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline">Cancel Changes</Button>
                <Button>Save Changes</Button>
            </div>
        </div>
    );
}
