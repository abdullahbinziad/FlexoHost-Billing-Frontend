import { Check, X, ShieldAlert, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderSidebarProps {
    order: any;
}

export function OrderSidebar({ order }: OrderSidebarProps) {
    return (
        <div className="space-y-6">
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
                                <Badge variant="outline" className="text-[10px] font-normal text-green-600 bg-green-50 border-green-200">
                                    Active
                                </Badge>
                                <Badge variant="outline" className="text-[10px] font-normal text-blue-600 bg-blue-50 border-blue-200">
                                    ID: {order.userId}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {order.clientDetails && (
                        <div className="space-y-3 text-sm">
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Address</span>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {order.clientDetails.address}
                                    <br />
                                    {order.clientDetails.city}, {order.clientDetails.state} {order.clientDetails.postcode}
                                    <br />
                                    {order.clientDetails.country}
                                </span>
                            </div>
                        </div>
                    )}

                    <Button variant="outline" className="w-full text-xs h-8">
                        View Client Profile
                    </Button>
                </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-4">
                    <CardTitle className="text-base font-semibold">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Invoice</span>
                        <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                            {order?.invoice?.invoiceNumber}
                        </span>
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
    );
}
