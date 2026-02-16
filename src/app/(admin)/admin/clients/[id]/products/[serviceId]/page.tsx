"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    ExternalLink,
    Plus,
    HardDrive,
    Globe,
    Mail,
    Database,
    ArrowLeft,
    Eye,
    EyeOff,
    Server,
    Settings,
    Calendar,
    CreditCard,
    Shield,
    RefreshCw,
    Trash2,
    Lock,
    Play,
    Pause,
    StopCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductDetailsPage({ params }: { params: { id: string; serviceId: string } }) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

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
                        Back to Products
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Server className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                Bundle Plan-A
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">server1.yourdomain.com</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400">
                        <ExternalLink className="w-4 h-4 mr-2" /> Login to cPanel
                    </Button>
                    <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> New Addon
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Main Column */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Service Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Settings className="w-4 h-4 text-gray-500" />
                                Service Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product/Service</label>
                                    <Select defaultValue="bundle-plan-a">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bundle-plan-a">Bundle Plan-A</SelectItem>
                                            <SelectItem value="bundle-plan-b">Bundle Plan-B</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain</label>
                                    <div className="flex gap-2">
                                        <Input defaultValue="nazrulinstitute.com" className="font-medium" />
                                        <Button variant="ghost" size="icon" className="shrink-0 text-blue-600">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dedicated IP</label>
                                    <Input placeholder="Optional" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Server</label>
                                    <Select defaultValue="srv1">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="srv1">srv1 (71/200 Accounts)</SelectItem>
                                            <SelectItem value="srv2">srv2 (10/200 Accounts)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</label>
                                    <Input defaultValue="nazrulit" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <Input
                                            defaultValue="4Gt1Oh6+1mm-MM"
                                            type={showPassword ? "text" : "password"}
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Module Commands */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Shield className="w-4 h-4 text-gray-500" />
                                Module Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" className="gap-2">
                                    <Play className="w-4 h-4 text-green-600" /> Create
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Pause className="w-4 h-4 text-orange-500" /> Suspend
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Play className="w-4 h-4 text-green-600" /> Unsuspend
                                </Button>
                                <Button variant="outline" className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                    <StopCircle className="w-4 h-4 text-red-500" /> Terminate
                                </Button>
                                <Separator orientation="vertical" className="h-9 mx-2 hidden sm:block" />
                                <Button variant="outline" className="gap-2">Change Package</Button>
                                <Button variant="outline" className="gap-2">Change Password</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resource Usage Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-gray-500" />
                                Resource Usage
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">Last Updated: 31/01/2026 15:01</span>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <HardDrive className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase">Disk Space</span>
                                    </div>
                                    <div className="text-2xl font-bold">9 MB</div>
                                    <div className="text-xs text-muted-foreground">of 2048 MB (0%)</div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[1%]"></div>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Globe className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase">Bandwidth</span>
                                    </div>
                                    <div className="text-2xl font-bold">0 MB</div>
                                    <div className="text-xs text-muted-foreground">Unlimited</div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-green-500 w-[0%]"></div>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase">Email Accts</span>
                                    </div>
                                    <div className="text-2xl font-bold">1</div>
                                    <div className="text-xs text-muted-foreground">Active Account</div>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Database className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase">Databases</span>
                                    </div>
                                    <div className="text-2xl font-bold">0</div>
                                    <div className="text-xs text-muted-foreground">MySQL DBs</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Admin Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea placeholder="Add private notes about this service..." className="min-h-[100px]" />
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
                                Billing Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Registration Date</label>
                                <Input type="date" defaultValue="2025-12-29" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Next Due Date</label>
                                <Input type="date" defaultValue="2026-12-29" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Termination Date</label>
                                <Input type="date" />
                            </div>
                            <Separator className="my-2" />
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Billing Cycle</label>
                                <Select defaultValue="annually">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="annually">Annually</SelectItem>
                                        <SelectItem value="biennially">Biennially</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Recurring</label>
                                    <Input defaultValue="1999.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Payment</label>
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
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <Checkbox id="recalc" />
                                <label htmlFor="recalc" className="text-sm text-gray-600 font-medium">Recalculate on Save</label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Automation Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Settings className="w-4 h-4 text-gray-500" />
                                Automation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Auto-Suspend</label>
                                    <p className="text-xs text-muted-foreground">Suspend on due date</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Auto-Terminate</label>
                                    <p className="text-xs text-muted-foreground">Terminate at end of cycle</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Addons Preview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold">Active Addons</CardTitle>
                                <Button variant="ghost" size="sm" className="h-6 text-xs">View All</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-md border border-dashed">
                                No Active Addons
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
