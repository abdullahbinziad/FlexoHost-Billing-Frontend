"use client";

import { useState, useEffect } from "react";
import {
    Check, X, Ban, Search, Filter, AlertTriangle,
    RefreshCcw, Trash2, Eye, ShieldAlert, MoreHorizontal, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/ui/back-button";
import { mockAdminOrders } from "@/data/mockAdminData";
import { formatDate } from "@/utils/format";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import type { Order } from "@/types/admin";

interface AdminOrderDetailsProps {
    orderId: string;
}

export function AdminOrderDetails({ orderId }: AdminOrderDetailsProps) {
    const formatCurrency = useFormatCurrency();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        // Simulate API fetch
        const foundOrder = mockAdminOrders.find(o => o.id === orderId);
        if (foundOrder) {
            setOrder(foundOrder);
        }
    }, [orderId]);

    if (!order) {
        return <div className="p-6">Order not found</div>;
    }

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <BackButton href="/admin/orders" label="Back to Orders" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Order #{order.orderNumber}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Created on {formatDate(order.createdAt)} • {order.paymentMethod}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-[180px]">
                            <Select value={order.status.charAt(0).toUpperCase() + order.status.slice(1)}>
                                <SelectTrigger className={`h-10 border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 ${order.status === 'pending' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                                    order.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                        'bg-gray-50 text-gray-700'
                                    }`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    <SelectItem value="Fraud">Fraud</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Order Information (2/3 width on large screens) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Items Card */}
                    <Card className="shadow-sm border-gray-200 dark:border-gray-800 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                                    Order Items
                                </CardTitle>
                                <Button variant="link" className="text-blue-600 h-auto p-0 text-sm hover:no-underline font-medium">
                                    + Add Custom Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {order.items.map((item, index) => (
                                    <div key={index} className="p-6 transition-colors hover:bg-gray-50/30 dark:hover:bg-gray-800/30">
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                                            {item.productName}
                                                        </h4>
                                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-2">
                                                            {item.productId === 'p2' ? 'Shared Hosting' : 'Product'}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                                        {formatCurrency(item.price)}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-4">
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-1">
                                                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Billing Cycle</span>
                                                        <div className="font-medium text-gray-900 dark:text-gray-200">{item.billingCycle || "One Time"}</div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-1">
                                                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Status</span>
                                                        <div className="font-medium text-gray-900 dark:text-gray-200">{item.status || "Pending"}</div>
                                                    </div>
                                                    {item.domain && (
                                                        <div className="col-span-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-1">
                                                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Domain</span>
                                                            <div className="font-medium text-gray-900 dark:text-gray-200 flex items-center justify-between">
                                                                {item.domain}
                                                                <div className="flex gap-2 text-[10px] uppercase font-bold text-gray-400">
                                                                    <a href="#" className="hover:text-blue-600 transition-colors">www</a>
                                                                    <a href="#" className="hover:text-blue-600 transition-colors">whois</a>
                                                                    <a href="#" className="hover:text-blue-600 transition-colors">dns</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expanded Config Area */}
                                                {(item.username || item.password || item.server) && (
                                                    <div className="bg-blue-600/5 rounded-lg border border-blue-600/10 p-4 mt-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {item.username && (
                                                                <div className="space-y-1.5">
                                                                    <label className="text-xs font-medium text-gray-500">Username</label>
                                                                    <Input className="h-8 bg-white" defaultValue={item.username} />
                                                                </div>
                                                            )}
                                                            {item.password && (
                                                                <div className="space-y-1.5">
                                                                    <label className="text-xs font-medium text-gray-500">Password</label>
                                                                    <Input className="h-8 bg-white" defaultValue={item.password} />
                                                                </div>
                                                            )}
                                                            {item.server && (
                                                                <div className="space-y-1.5">
                                                                    <label className="text-xs font-medium text-gray-500">Server</label>
                                                                    <Select defaultValue={item.server}>
                                                                        <SelectTrigger className="h-8 bg-white">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value={item.server}>{item.server}</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-6 mt-4 pt-3 border-t border-blue-600/10">
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox id="run-module" defaultChecked className="data-[state=checked]:bg-blue-600 border-blue-600/30" />
                                                                <label htmlFor="run-module" className="text-xs font-medium text-gray-700 dark:text-gray-300">Run Module Create</label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox id="send-email" defaultChecked className="data-[state=checked]:bg-blue-600 border-blue-600/30" />
                                                                <label htmlFor="send-email" className="text-xs font-medium text-gray-700 dark:text-gray-300">Send Welcome Email</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">Total Amount Due</span>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {formatCurrency(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Order Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all hover:shadow-md">
                                    <Check className="w-4 h-4 mr-2" /> Accept Order
                                </Button>
                                <Button variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-700">
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                                <Button variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-700">
                                    <Icons.Refund className="w-4 h-4 mr-2" /> Refund
                                </Button>
                                <Button variant="outline" className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200">
                                    <ShieldAlert className="w-4 h-4 mr-2" /> Set as Fraud
                                </Button>
                                <div className="ml-auto">
                                    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Client & Details Sidebar */}
                <div className="space-y-6">
                    {/* Client Details */}
                    <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-4">
                            <CardTitle className="text-base font-semibold">Client Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-lg">
                                    {order.userName.charAt(0)}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{order.userName}</h3>
                                    <p className="text-sm text-gray-500">{order.userEmail}</p>
                                    <div className="flex gap-2 pt-2">
                                        <Badge variant="outline" className="text-[10px] font-normal text-green-600 bg-green-50 border-green-200">Active</Badge>
                                        <Badge variant="outline" className="text-[10px] font-normal text-blue-600 bg-blue-50 border-blue-200">ID: {order.userId}</Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {order.clientDetails && (
                                <div className="space-y-3 text-sm">
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Address</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {order.clientDetails.address}<br />
                                            {order.clientDetails.city}, {order.clientDetails.state} {order.clientDetails.postcode}<br />
                                            {order.clientDetails.country}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <Button variant="outline" className="w-full text-xs h-8">View Client Profile</Button>
                        </CardContent>
                    </Card>

                    {/* Meta Information */}
                    <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-4">
                            <CardTitle className="text-base font-semibold">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Invoice</span>
                                <span className="font-medium text-blue-600 hover:underline cursor-pointer">#{order.invoiceId}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">IP Address</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs">{order.ipAddress}</span>
                                    <Button variant="ghost" size="icon" className="h-4 w-4 text-gray-400 hover:text-gray-600">
                                        <Filter className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Promotion</span>
                                <span className="text-gray-700 dark:text-gray-300 italic">{order.promotionCode || "None"}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Affiliate</span>
                                <span className="text-gray-700 dark:text-gray-300 italic">{order.affiliate || "None"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper icon component for Refund
const Icons = {
    Refund: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 9 3-3 3 3" /><path d="M13 6h-4a2 2 0 0 0-2 2v10" /><path d="M22 18h-4a2 2 0 0 1-2-2v-5" /><path d="m19 14 3 3 3-3" /></svg>
    )
}
